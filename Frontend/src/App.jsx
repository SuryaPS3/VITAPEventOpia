import React, { useState } from 'react';
import './App.css';
import { authAPI } from './api/client.js';
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
    setUser(null);
    setShowRoleSelection(false);
    setCurrentPage(null);
    setShowLogin(true);
  };

  // ✅ Render the appropriate dashboard based on the current page
  const renderDashboard = () => {
    switch (currentPage) {
      case 'visitor':
        return <VisitorPage user={user} onLogout={handleLogout} events={dummyEvents} clubs={dummyClubs} />;
      case 'admin':
        return <AdminPage user={user} onLogout={handleLogout} events={dummyEvents} clubs={dummyClubs} />;
      case 'faculty':
        return <FacultyPage user={user} onLogout={handleLogout} events={dummyEvents} clubs={dummyClubs} />;
      case 'head':
        return <HeadPage user={user} onLogout={handleLogout} events={dummyEvents} clubs={dummyClubs} />;
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