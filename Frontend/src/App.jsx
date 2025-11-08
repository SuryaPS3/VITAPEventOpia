import React, { useState, useEffect } from 'react';
import './App.css';
import { authAPI, apiClient } from './api/client.js';
import Login from './components/LoginModal.jsx';
import RoleSelection from './components/AccessRoleDashboard.jsx';
import VisitorPage from './components/VisitorPage.jsx';
import AdminPage from './components/AdminPage.jsx';
import FacultyPage from './components/FacultyPage.jsx';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import CreateAccountPage from './components/CreateAccountPage.jsx';
import HeadPage from './components/HeadPage.jsx';


const App = () => {
  const [user, setUser] = useState(null); // Stores logged-in user details
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [currentPage, setCurrentPage] = useState('visitor'); // Which dashboard is shown
  const [showLogin, setShowLogin] = useState(false); // Controls login modal visibility
  const [events, setEvents] = useState([]); // Real events from backend
  const [clubs, setClubs] = useState([]); // Real clubs from backend
  const [loading, setLoading] = useState(false);

  // Fetch approved events for student dashboard
  const fetchApprovedEvents = async () => {
    try {
      setLoading(true);
      // Fetch only approved events for students to see
      const response = await apiClient.get('/events?status=approved');
      if (response.success) {
        // Map events to match the expected format for VisitorPage
        const mappedEvents = response.events.map(event => ({
          id: event.id,
          title: event.title,
          category: event.category,
          date: new Date(event.event_date).toLocaleDateString(),
          time: event.event_time,
          venue: event.venue,
          fee: event.fee || 'Free',
          clubName: event.club_name || 'Unknown Club',
          organizer: event.created_by_name || 'Unknown',
          attendees: event.expected_attendees || 0,
          status: event.status,
          description: event.description,
          registration_form_url: event.registration_form_url, // Add this field for Google Form URLs
          categoryKey: getCategoryKey(event.category)
        }));
        setEvents(mappedEvents);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClubs = async () => {
    try {
      const response = await apiClient.get('/clubs');
      if (response.success) {
        setClubs(response.clubs);
      }
    } catch (error) {
      console.error('Failed to fetch clubs:', error);
    }
  };

  // Helper function to map category to category key for filtering
  const getCategoryKey = (category) => {
    const categoryMap = {
      'Cultural': 'cultural',
      'Dance': 'dance',
      'Music': 'western',
      'Classical': 'classical',
      'Theatre': 'drama',
      'Literary': 'literary',
      'Technical': 'technical',
      'Sports': 'sports',
      'Workshop': 'workshop'
    };
    return categoryMap[category] || 'all';
  };

  // Create event function for admin
  const createEvent = async (eventData) => {
    try {
      console.log('Creating event with data:', eventData);

      // Prepare the event data for backend
      const eventPayload = {
        title: eventData.title,
        description: eventData.description || '',
        category: eventData.category || 'General',
        event_date: eventData.date,
        event_time: eventData.time || '10:00:00',
        venue: eventData.venue,
        fee: eventData.fee || 'Free',
        expected_attendees: parseInt(eventData.expectedAttendees) || 0,
        club_id: 1, // Default to club 1, you can make this dynamic later
        registration_form_url: eventData.registrationLink || null
      };

      console.log('Sending payload to backend:', eventPayload);

      const response = await apiClient.post('/events', eventPayload);

      console.log('Backend response:', response);

      if (response.success) {
        alert('🎉 Event created successfully! It is now pending approval from the department head.');
        // Refresh events to show updated counts
        fetchApprovedEvents();
        return true;
      } else {
        throw new Error(response.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Event creation error:', error);

      // Show detailed error message
      let errorMessage = 'Failed to create event: ';
      if (error.message.includes('HTTP error')) {
        errorMessage += 'Server error. Please check your connection and try again.';
      } else {
        errorMessage += error.message;
      }

      alert(errorMessage);
      return false;
    }
  };

  // Load events and clubs when component mounts
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await authAPI.getProfile();
          if (response.success) {
            const roleMapping = {
              'admin': 'admin',
              'club_faculty': 'faculty',
              'department_head': 'head',
              'club_member': 'visitor'
            };
            const mappedRole = roleMapping[response.user.role] || 'visitor';
            const user = {
              ...response.user,
              name: `${response.user.first_name} ${response.user.last_name}`,
              roles: [mappedRole]
            };
            setUser(user);
            setCurrentPage(mappedRole);
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        }
      }
    };
    checkLoggedIn();
    fetchApprovedEvents();
    fetchClubs();
  }, []);

  // ✅ Backend-connected login logic with fallback to mock
  const handleLogin = async (credentials) => {
    const { email, password } = credentials;

    try {
      // Try backend authentication first
      const response = await authAPI.login({ email, password });

      if (response.success && response.user) {
        // Map backend role to frontend role
        const roleMapping = {
          'admin': 'admin',
          'club_faculty': 'faculty',
          'department_head': 'head',
          'club_member': 'visitor'
        };

        const mappedRole = roleMapping[response.user.role] || 'visitor';
        const user = {
          ...response.user,
          name: `${response.user.first_name} ${response.user.last_name}`,
          roles: [mappedRole]
        };

        setUser(user);
        setCurrentPage(mappedRole);
        setShowLogin(false);
        return Promise.resolve();
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (backendError) {
      console.warn('Backend login failed, trying mock users:', backendError.message);

      // Fallback to mock authentication
      const mockUsers = {
        'student@vit.ac.in': { password: 'student123', name: 'Student User', roles: ['visitor'] },
        'admin@vit.ac.in': { password: 'admin123', name: 'Club Admin', roles: ['visitor', 'admin'] },
        'faculty@vit.ac.in': { password: 'faculty123', name: 'Faculty Coordinator', roles: ['visitor', 'faculty'] },
        'head@vit.ac.in': { password: 'head123', name: 'Department Head', roles: ['visitor', 'head'] },
        // Add the actual database credentials as fallback
        'admin@vitap.ac.in': { password: 'admin123', name: 'System Admin', roles: ['admin'] },
        'faculty@vitap.ac.in': { password: 'faculty123', name: 'Club Faculty', roles: ['faculty'] },
        'student@vitap.ac.in': { password: 'student123', name: 'Student Member', roles: ['visitor'] }
      };

      const user = mockUsers[email];
      if (user && user.password === password) {
        setUser({ ...user, email });
        if (user.roles.length > 1) {
          setShowRoleSelection(true);
        } else {
          setCurrentPage(user.roles[0]);
        }
        setShowLogin(false);
        return Promise.resolve();
      } else {
        throw new Error('Invalid credentials');
      }
    }
  };

  // ✅ Handle role selection
  const handleSelectRole = (userWithRole) => {
    setUser(userWithRole);
    setCurrentPage(userWithRole.selectedRole);
    setShowRoleSelection(false);
  };

  // ✅ Handle logout
  const handleLogout = () => {
    authAPI.logout(); // Clear localStorage
    setUser(null);
    setShowRoleSelection(false);
    setCurrentPage('visitor');
    setShowLogin(false);
  };

  // Handle showing login modal for visitor page
  const handleShowLoginModal = () => {
    setShowLogin(true);
  };

  // Handle showing registration modal for visitor page
  const handleShowRegistrationModal = (event) => {
    alert(`Registration for "${event.title}"\n\nPlease contact the event organizer for registration details.\n\nEvent: ${event.title}\nVenue: ${event.venue}\nDate: ${event.date}\nTime: ${event.time}`);
  };

  // ✅ Render the appropriate dashboard based on the current page
  const renderDashboard = () => {
    switch (currentPage) {
      case 'visitor':
        return <VisitorPage 
          user={user} 
          onLogout={handleLogout} 
          onShowLoginModal={handleShowLoginModal}
          onShowRegistrationModal={handleShowRegistrationModal}
          events={events} 
          clubs={clubs} 
          loading={loading} 
        />;
      case 'admin':
        return <AdminPage user={user} onLogout={handleLogout} events={events} onPostEvent={createEvent} loading={loading} />;
      case 'faculty':
        return <FacultyPage user={user} onLogout={handleLogout} events={events} clubs={clubs} />;
      case 'head':
        return <HeadPage user={user} onLogout={handleLogout} onEventStatusChanged={fetchApprovedEvents} />;
      default:
        return null;
    }
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            <>
              {showLogin && (
                <Login
                  onLogin={handleLogin}
                  onShowRoleSelection={(userData) => {
                    setUser(userData);
                    setShowRoleSelection(true);
                    setShowLogin(false);
                  }}
                  onClose={() => setShowLogin(false)}
                >
                  <p>
                    Don't have an account? <Link to="/create-account">Create one</Link>
                  </p>
                </Login>
              )}
              {showRoleSelection && user && (
                <RoleSelection user={user} onSelectRole={handleSelectRole} onLogout={handleLogout} />
              )}
              {renderDashboard()}
            </>
          } />
          <Route path="/create-account" element={<CreateAccountPage />} />
        </Routes>
      </div>
    </Router>
  );
};
export default App;