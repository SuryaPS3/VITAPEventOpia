import React, { useState } from 'react';
import './FacultyPage.css';

const FacultyPage = ({ user, onLogout, events, clubs }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const stats = {
    activeEvents: events.filter(e => e.status === 'approved').length,
    totalClubs: clubs.length,
    pendingApprovals: events.filter(e => e.status === 'pending').length,
    totalStudents: 450, // Static data for now
    monthlyEvents: 24, // Static data for now
    successRate: 94 // Static data for now
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'approved': return 'status-approved';
      case 'pending_review': return 'status-pending';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      case 'inactive': return 'status-inactive';
      default: return 'status-pending';
    }
  };

  const renderOverviewSection = () => (
    <div className="faculty-section">
      <h2>Department Overview</h2>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Active Events</h3>
            <div className="stat-number">{stats.activeEvents}</div>
            <div className="stat-trend">+3 this month</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏛️</div>
          <div className="stat-content">
            <h3>Total Clubs</h3>
            <div className="stat-number">{stats.totalClubs}</div>
            <div className="stat-trend">4 active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Approvals</h3>
            <div className="stat-number">{stats.pendingApprovals}</div>
            <div className="stat-trend">Needs review</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Students</h3>
            <div className="stat-number">{stats.totalStudents}</div>
            <div className="stat-trend">Participating</div>
          </div>
        </div>
      </div>

      <div className="overview-content">
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">✅</div>
              <div className="activity-content">
                <div className="activity-title">Heritage Festival Approved</div>
                <div className="activity-meta">Cultural Heritage Club • 2 hours ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📝</div>
              <div className="activity-content">
                <div className="activity-title">New Event Proposal Submitted</div>
                <div className="activity-meta">Innovation Club • 5 hours ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">👥</div>
              <div className="activity-content">
                <div className="activity-title">45 New Student Registrations</div>
                <div className="activity-meta">Various clubs • 1 day ago</div>
              </div>
            </div>
          </div>
        </div>
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn primary" onClick={() => setActiveSection('events')}>
              📅 Review Events
            </button>
            <button className="action-btn secondary" onClick={() => setActiveSection('clubs')}>
              🏛️ Manage Clubs
            </button>
            <button className="action-btn tertiary">
              📊 Generate Report
            </button>
            <button className="action-btn tertiary">
              📧 Send Notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEventsSection = () => (
    <div className="faculty-section">
      <h2>All Department Events</h2>
      <div className="section-controls">
        <div className="filter-controls">
          <select className="filter-select"><option value="">All Categories</option></select>
          <select className="filter-select"><option value="">All Status</option></select>
        </div>
        <div className="search-controls">
          <input type="text" placeholder="Search events..." className="search-input" />
        </div>
      </div>
      <div className="events-grid">
        {events.map(event => (
          <div key={event.id} className="faculty-event-card">
            <div className="event-header">
              <div>
                <div className="event-category">{event.category}</div>
                <div className="event-title">{event.title}</div>
              </div>
              <div className={`event-status ${getStatusColor(event.status)}`}>
                {event.status.replace('_', ' ').toUpperCase()}
              </div>
            </div>
            <div className="event-details">
              <div className="event-detail">📅<span>{new Date(event.date).toLocaleDateString()}</span></div>
              <div className="event-detail">📍<span>{event.venue}</span></div>
              <div className="event-detail">⏰<span>{event.time}</span></div>
              <div className="event-detail">💰<span>{event.fee}</span></div>
            </div>
            <div className="event-meta">
              <div className="meta-row"><strong>Club:</strong> {event.clubName}</div>
              <div className="meta-row"><strong>Organizer:</strong> {event.organizer}</div>
              <div className="meta-row"><strong>Attendees:</strong> {event.attendees}</div>
            </div>
            <div className="event-actions">
              <button className="action-btn-small primary">View Details</button>
              <button className="action-btn-small secondary">Edit</button>
              {event.status === 'pending_review' && (
                <button className="action-btn-small success">Approve</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderClubsSection = () => (
    <div className="faculty-section">
      <h2>Manage Clubs</h2>
      <div className="clubs-stats">
        <div className="clubs-stat"><span className="stat-value">4</span><span className="stat-label">Active Clubs</span></div>
        <div className="clubs-stat"><span className="stat-value">310</span><span className="stat-label">Total Members</span></div>
        <div className="clubs-stat"><span className="stat-value">6</span><span className="stat-label">Events This Month</span></div>
      </div>
      <div className="clubs-grid">
        {clubs.map(club => (
          <div key={club.id} className="club-management-card">
            <div className="club-header">
              <div className="club-name">{club.name}</div>
              <div className={`club-status ${getStatusColor(club.status)}`}>{club.status.toUpperCase()}</div>
            </div>
            <div className="club-info">
              <div className="info-grid">
                <div className="info-item"><span className="info-label">Category</span><span className="info-value">{club.category}</span></div>
                <div className="info-item"><span className="info-label">Members</span><span className="info-value">{club.members}</span></div>
                <div className="info-item"><span className="info-label">Active Events</span><span className="info-value">{club.activeEvents}</span></div>
                <div className="info-item"><span className="info-label">Established</span><span className="info-value">{club.established}</span></div>
              </div>
              <div className="coordinator-info"><strong>Coordinator:</strong> {club.coordinator}</div>
            </div>
            <div className="club-actions">
              <button className="action-btn-small primary">View Details</button>
              <button className="action-btn-small secondary">Edit Settings</button>
              <button className="action-btn-small tertiary">View Events</button>
            </div>
          </div>
        ))}
      </div>
      <div className="add-club-section">
        <button className="add-club-btn"><span>+ Add New Club</span></button>
      </div>
    </div>
  );

  return (
    <div className="faculty-dashboard">
      <div className="dashboard-header">
        <img src="/assets/Logo-removebg-preview.png" alt="VIT Logo" className="header-logo" />
        <div className="dashboard-nav">
          <button className={`nav-btn ${activeSection === 'overview' ? 'active' : ''}`} onClick={() => setActiveSection('overview')}>Overview</button>
          <button className={`nav-btn ${activeSection === 'events' ? 'active' : ''}`} onClick={() => setActiveSection('events')}>All Events ({events.length})</button>
          <button className={`nav-btn ${activeSection === 'clubs' ? 'active' : ''}`} onClick={() => setActiveSection('clubs')}>Manage Clubs ({clubs.filter(c => c.status === 'active').length})</button>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </div>
      <div className="dashboard-content">
        {activeSection === 'overview' && renderOverviewSection()}
        {activeSection === 'events' && renderEventsSection()}
        {activeSection === 'clubs' && renderClubsSection()}
      </div>
    </div>
  );
};

export default FacultyPage;
