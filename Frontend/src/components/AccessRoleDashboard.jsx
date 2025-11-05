import React from 'react';
import './AccessRoleDashboard.css';

const RoleSelection = ({ user, onSelectRole, onLogout }) => {
  const handleRoleClick = (role) => {
    onSelectRole({ ...user, selectedRole: role });
  };

  return (
    <div className="role-selection-page">
      <div className="role-selection-content">
        <h1 className="role-selection-title">Welcome, {user.name}</h1>
        <p className="role-selection-subtitle">Please select your role to continue.</p>
        <div className="role-options">
          {user.roles.map(role => (
            <button key={role} className="role-btn" onClick={() => handleRoleClick(role)}>
              {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
            </button>
          ))}
        </div>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
};

export default RoleSelection;
