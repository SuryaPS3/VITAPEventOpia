import React, { useState, useEffect } from 'react';
import './App.css';
import { authAPI, apiClient } from './api/client.js';
import Login from './components/LoginModal.jsx';
import RoleSelection from './components/AccessRoleDashboard.jsx';
import VisitorPage from './components/VisitorPage.jsx';
import AdminPage from './components/AdminPage.jsx';
import FacultyPage from './components/FacultyPage.jsx';
import HeadPage from './components/HeadPage.jsx';

// ✅ Dummy data for events and clubs (you can replace these with backend data later)
const dummyEvents = [
  {
    id: 1,
    title: 'Cultural Fest',
    category: 'Cultural',
    date: '2025-11-10',
    time: '10:00 AM',
    venue: 'Auditorium',
    fee: 'Free',
    clubName: 'Cultural Heritage Club',
    organizer: 'Dr. Meena',
    attendees: 120,
    status: 'approved'
  },
  {
    id: 2,
    title: 'Tech Symposium',
    category: 'Technical',
    date: '2025-11-12',
    time: '02:00 PM',
    venue: 'Seminar Hall 2',
    fee: '₹50',
    clubName: 'Innovation Club',
    organizer: 'Prof. Raj',
    attendees: 85,
    status: 'pending_review'
  },
  {
    id: 3,
    title: 'Sports Meet',
    category: 'Sports',
    date: '2025-11-20',
    time: '09:00 AM',
    venue: 'Ground',
    fee: 'Free',
    clubName: 'Fitness Club',
    organizer: 'Mr. Ravi',
    attendees: 150,
    status: 'approved'
  }
];

const dummyClubs = [
  {
    id: 1,
    name: 'Cultural Heritage Club',
    category: 'Cultural',
    members: 75,
    activeEvents: 3,
    established: '2018',
    coordinator: 'Dr. Meena',
    status: 'active'
  },
  {
    id: 2,
    name: 'Innovation Club',
    category: 'Technical',
    members: 120,
    activeEvents: 2,
    established: '2019',
    coordinator: 'Prof. Raj',
    status: 'active'
  },
  {
    id: 3,
    name: 'Fitness Club',
    category: 'Sports',
    members: 90,
    activeEvents: 1,
    established: '2020',
    coordinator: 'Mr. Ravi',
    status: 'inactive'
  }
];

const App = () => {
  const [user, setUser] = useState(null); // Stores logged-in user details
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [currentPage, setCurrentPage] = useState(null); // Which dashboard is shown
  const [showLogin, setShowLogin] = useState(true); // Controls login modal visibility
  const [events, setEvents] = useState([]); // Real events from backend
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
          categoryKey: getCategoryKey(event.category)
        }));
        setEvents(mappedEvents);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      // Fallback to dummy data if backend fails
      setEvents(dummyEvents);
    } finally {
      setLoading(false);
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
        club_id: 1 // Default to club 1, you can make this dynamic later
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

  // Load events when component mounts
  useEffect(() => {
    fetchApprovedEvents();
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
    setCurrentPage(null);
    setShowLogin(true);
  };

  // ✅ Render the appropriate dashboard based on the current page
  const renderDashboard = () => {
    switch (currentPage) {
      case 'visitor':
        return <VisitorPage user={user} onLogout={handleLogout} events={events} clubs={dummyClubs} loading={loading} />;
      case 'admin':
        return <AdminPage user={user} onLogout={handleLogout} events={events} onPostEvent={createEvent} loading={loading} />;
      case 'faculty':
        return <FacultyPage user={user} onLogout={handleLogout} events={dummyEvents} clubs={dummyClubs} />;
      case 'head':
        return <HeadPage user={user} onLogout={handleLogout} onEventStatusChanged={fetchApprovedEvents} />;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      {/* Show login modal if not logged in */}
      {showLogin && (
        <Login
          onLogin={handleLogin}
          onShowRoleSelection={(userData) => {
            setUser(userData);
            setShowRoleSelection(true);
            setShowLogin(false);
          }}
          onClose={() => setShowLogin(false)}
        />
      )}

      {/* Role selection screen */}
      {showRoleSelection && user && (
        <RoleSelection user={user} onSelectRole={handleSelectRole} onLogout={handleLogout} />
      )}

      {/* Dashboard based on selected role */}
      {user && currentPage && renderDashboard()}
    </div>
  );
};

export default App;