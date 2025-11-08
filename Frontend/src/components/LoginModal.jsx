import React, { useState } from 'react';
import './LoginModal.css';

const Login = ({ onLogin, onShowRoleSelection, onClose, children }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // ⭐ NEW: Loading state

  // Keep your original mock users as fallback
  const users = {
    'student@vit.ac.in': { password: 'student123', name: 'Student User', roles: ['visitor'] },
    'admin@vit.ac.in': { password: 'admin123', name: 'Club Admin', roles: ['visitor', 'admin'] },
    'faculty@vit.ac.in': { password: 'faculty123', name: 'Faculty Coordinator', roles: ['visitor', 'faculty'] },
    'head@vit.ac.in': { password: 'head123', name: 'Department Head', roles: ['visitor', 'head'] }
  };

  const handleSubmit = async (e) => { // ⭐ Changed to async
    e.preventDefault();
    setLoading(true); // ⭐ NEW: Start loading
    setError(''); // Clear previous errors

    try {
      // ⭐ NEW: Pass credentials to parent (App component handles backend/mock logic)
      await onLogin(credentials);
      // If successful, modal will close automatically from parent
    } catch (err) {
      // ⭐ NEW: Try mock users as fallback
      const user = users[credentials.email];

      if (user && user.password === credentials.password) {
        setError('');
        if (user.roles.length > 1) {
          onShowRoleSelection(user);
        } else {
          onLogin({ ...user, email: credentials.email });
        }
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } finally {
      setLoading(false); // ⭐ NEW: Stop loading
    }
  };

  const handleInputChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <div style={{ textAlign: 'center' }}>

          <img src="../public/VIT_AP_Logo.svg" alt="VIT Logo" className="login-logo" />
          {/* alt="VIT Logo"
          className="login-logo" */}

        </div>
        <h2>Login to Eventopia</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={credentials.email}
              onChange={handleInputChange}
              required
              disabled={loading} // ⭐ NEW: Disable while loading
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleInputChange}
              required
              disabled={loading} // ⭐ NEW: Disable while loading
            />
          </div>
          {error && <div className="error-message">{error}</div>}

          {/* ⭐ NEW: Shows loading state and disables button */}
          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >
            <span>{loading ? 'Logging in...' : 'Login'}</span>
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          padding: '10px',
          background: 'rgba(0, 212, 255, 0.1)',
          borderRadius: '10px',
          fontSize: '0.85rem',
          color: '#94a3b8'
        }}>
          {children}
        </div>

        {/* ⭐ NEW: Helpful hint for testing */}
        <div style={{
          marginTop: '20px',
          padding: '10px',
          background: 'rgba(0, 212, 255, 0.1)',
          borderRadius: '10px',
          fontSize: '0.85rem',
          color: '#94a3b8'
        }}>
          <strong>Test Accounts:</strong><br />
          Database: admin@vitap.ac.in / admin123<br />
          Mock: admin@vit.ac.in / admin123
        </div>
      </div>
    </div>
  );
};

export default Login;
