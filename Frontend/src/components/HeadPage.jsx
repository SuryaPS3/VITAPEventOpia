import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client.js';
import './HeadPage.css';
import Footer from './Footer.jsx';

const HeadPage = ({ user, onLogout, onEventStatusChanged }) => {
  // Tab management
  const [activeSection, setActiveSection] = useState('approvals');

  // Approval system state
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [approvalComments, setApprovalComments] = useState('');
  const [processing, setProcessing] = useState(false);

  const [pendingUsers, setPendingUsers] = useState([]);
  const [recentDecisions, setRecentDecisions] = useState([]);
  const [systemStats, setSystemStats] = useState({});

  useEffect(() => {
    if (activeSection === 'approvals') {
      fetchPendingEvents();
    }
    if (activeSection === 'userManagement') {
      fetchPendingUsers();
    }
    fetchSystemStats();
    fetchRecentDecisions();
  }, [activeSection]);

  const fetchSystemStats = async () => {
    try {
      const response = await apiClient.get('/stats');
      if (response.success) {
        setSystemStats(response.stats);
      }
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
    }
  };

  const fetchRecentDecisions = async () => {
    try {
      const response = await apiClient.get('/stats/recent-decisions');
      if (response.success) {
        setRecentDecisions(response.decisions);
      }
    } catch (error) {
      console.error('Failed to fetch recent decisions:', error);
    }
  };

  const fetchPendingEvents = async () => {
    try {
      setLoading(true);
      console.log('Fetching pending events...');
      console.log('Auth token:', localStorage.getItem('authToken'));
      const response = await apiClient.get('/events/pending');
      console.log('API Response:', response);
      setPendingEvents(response.events || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching pending events:', err);

      // If it's a 403 error, the token might be invalid or expired
      if (err.message.includes('403')) {
        setError(`Access denied. Your session may have expired. Please logout and login again.`);
      } else {
        setError(`Failed to fetch pending events: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId) => {
    if (!approvalComments.trim()) {
      alert('Please provide comments for approval');
      return;
    }

    try {
      setProcessing(true);
      const response = await apiClient.put(`/events/${eventId}/approve`, {
        comments: approvalComments.trim()
      });

      if (response.success) {
        alert('Event approved successfully!');
        setPendingEvents(prev => prev.filter(event => event.id !== eventId));
        setSelectedEvent(null);
        setApprovalComments('');

        // Refresh the approved events for student dashboard
        if (onEventStatusChanged) {
          onEventStatusChanged();
        }
      }
    } catch (err) {
      alert('Failed to approve event: ' + (err.message || 'Unknown error'));
      console.error('Error approving event:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (eventId) => {
    if (!approvalComments.trim()) {
      alert('Please provide comments for rejection');
      return;
    }

    try {
      setProcessing(true);
      const response = await apiClient.put(`/events/${eventId}/reject`, {
        reason: approvalComments.trim()
      });

      if (response.success) {
        alert('Event rejected successfully!');
        setPendingEvents(prev => prev.filter(event => event.id !== eventId));
        setSelectedEvent(null);
        setApprovalComments('');

        // Refresh the student dashboard (rejected events won't show anyway)
        if (onEventStatusChanged) {
          onEventStatusChanged();
        }
      }
    } catch (err) {
      alert('Failed to reject event: ' + (err.message || 'Unknown error'));
      console.error('Error rejecting event:', err);
    } finally {
      setProcessing(false);
    }
  };

  const viewEventDetails = (event) => {
    setSelectedEvent(event);
    setApprovalComments('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper functions for rendering different sections
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getDecisionColor = (decision) => {
    switch (decision) {
      case 'approved': return 'decision-approved';
      case 'declined': return 'decision-declined';
      default: return 'decision-pending';
    }
  };

  const renderApprovalsSection = () => (
    <div className="head-section">
      <h2>Event Approval Requests</h2>
      <div className="approvals-summary">
        <div className="summary-card">
          <span className="summary-number">{pendingEvents.length}</span>
          <span className="summary-label">Pending Approvals</span>
        </div>
        <div className="summary-card">
          <span className="summary-number">{pendingEvents.reduce((sum, event) => sum + (event.expected_attendees || 0), 0)}</span>
          <span className="summary-label">Expected Total Attendees</span>
        </div>
        <div className="summary-card">
          <span className="summary-number">{recentDecisions.length}</span>
          <span className="summary-label">Recent Decisions</span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading pending events...</div>
      ) : error ? (
        <div className="error">
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={fetchPendingEvents} className="retry-btn">Retry</button>
            {error.includes('403') && (
              <button onClick={onLogout} className="relogin-btn">Clear Session & Re-login</button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="approval-requests">
            {pendingEvents.length === 0 ? (
              <div className="empty-approvals">
                <h3>No Pending Approvals</h3>
                <p>All event requests have been reviewed.</p>
              </div>
            ) : (
              pendingEvents.map(event => (
                <div key={event.id} className="approval-card">
                  <div className="approval-header">
                    <div className="approval-title-section">
                      <div className="approval-title">{event.title}</div>
                      <div className="approval-meta">
                        <span className="approval-category">{event.category}</span>
                        <span className="approval-priority priority-medium">PENDING APPROVAL</span>
                      </div>
                    </div>
                    <div className="approval-date">
                      Submitted: {formatDate(event.created_at)}
                    </div>
                  </div>
                  <div className="approval-details">
                    <div className="detail-grid">
                      <div className="detail-item">
                        <strong>Date & Time:</strong>
                        <span>{formatDate(event.event_date)} • {formatTime(event.event_time)}</span>
                      </div>
                      <div className="detail-item">
                        <strong>Venue:</strong>
                        <span>{event.venue}</span>
                      </div>
                      <div className="detail-item">
                        <strong>Expected Attendees:</strong>
                        <span>{event.expected_attendees}</span>
                      </div>
                      <div className="detail-item">
                        <strong>Fee:</strong>
                        <span>{event.fee}</span>
                      </div>
                      <div className="detail-item">
                        <strong>Club:</strong>
                        <span>{event.club_name}</span>
                      </div>
                      <div className="detail-item">
                        <strong>Coordinator:</strong>
                        <span>{event.created_by_name}</span>
                      </div>
                    </div>
                    <div className="description-section">
                      <strong>Event Description:</strong>
                      <p>{event.description}</p>
                    </div>
                  </div>
                  <div className="approval-actions">
                    <button
                      className="approve-btn"
                      onClick={() => viewEventDetails(event)}
                    >
                      ✓ Review & Decide
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedEvent && (
            <div className="approval-modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Review Event: {selectedEvent.title}</h3>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="close-btn"
                  >
                    ×
                  </button>
                </div>

                <div className="modal-body">
                  <div className="event-full-details">
                    <div className="detail-row">
                      <label>Title:</label>
                      <span>{selectedEvent.title}</span>
                    </div>
                    <div className="detail-row">
                      <label>Club:</label>
                      <span>{selectedEvent.club_name} ({selectedEvent.club_email})</span>
                    </div>
                    <div className="detail-row">
                      <label>Category:</label>
                      <span>{selectedEvent.category}</span>
                    </div>
                    <div className="detail-row">
                      <label>Date & Time:</label>
                      <span>{formatDate(selectedEvent.event_date)} at {formatTime(selectedEvent.event_time)}</span>
                    </div>
                    <div className="detail-row">
                      <label>Venue:</label>
                      <span>{selectedEvent.venue}</span>
                    </div>
                    <div className="detail-row">
                      <label>Fee:</label>
                      <span>{selectedEvent.fee}</span>
                    </div>
                    <div className="detail-row">
                      <label>Expected Attendees:</label>
                      <span>{selectedEvent.expected_attendees}</span>
                    </div>
                    <div className="detail-row">
                      <label>Created by:</label>
                      <span>{selectedEvent.created_by_name} ({selectedEvent.created_by_email})</span>
                    </div>
                    <div className="detail-row">
                      <label>Description:</label>
                      <span>{selectedEvent.description}</span>
                    </div>
                  </div>

                  <div className="approval-form">
                    <label htmlFor="comments">Comments:</label>
                    <textarea
                      id="comments"
                      value={approvalComments}
                      onChange={(e) => setApprovalComments(e.target.value)}
                      placeholder="Please provide your comments for this decision..."
                      rows={4}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    onClick={() => handleApprove(selectedEvent.id)}
                    className="approve-btn"
                    disabled={processing || !approvalComments.trim()}
                  >
                    {processing ? 'Processing...' : 'Approve Event'}
                  </button>
                  <button
                    onClick={() => handleReject(selectedEvent.id)}
                    className="reject-btn"
                    disabled={processing || !approvalComments.trim()}
                  >
                    {processing ? 'Processing...' : 'Reject Event'}
                  </button>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="cancel-btn"
                    disabled={processing}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderAnalyticsSection = () => (
    <div className="head-section">
      <h2>System Analytics & Overview</h2>
      <div className="analytics-grid">
        <div className="analytics-card primary">
          <div className="analytics-icon">📊</div>
          <div className="analytics-content">
            <h3>Events This Month</h3>
            <div className="analytics-number">{systemStats.totalEventsThisMonth}</div>
            <div className="analytics-trend">+15% from last month</div>
          </div>
        </div>
        <div className="analytics-card success">
          <div className="analytics-icon">👥</div>
          <div className="analytics-content">
            <h3>Active Users</h3>
            <div className="analytics-number">{systemStats.activeUsers.toLocaleString()}</div>
            <div className="analytics-trend">+8% growth</div>
          </div>
        </div>
        <div className="analytics-card warning">
          <div className="analytics-icon">💰</div>
          <div className="analytics-content">
            <h3>Budget Allocated</h3>
            <div className="analytics-number">{systemStats.totalBudgetAllocated}</div>
            <div className="analytics-trend">65% utilized</div>
          </div>
        </div>
        <div className="analytics-card info">
          <div className="analytics-icon">⭐</div>
          <div className="analytics-content">
            <h3>Success Rate</h3>
            <div className="analytics-number">{systemStats.eventSuccessRate}%</div>
            <div className="analytics-trend">Excellent performance</div>
          </div>
        </div>
        <div className="analytics-card secondary">
          <div className="analytics-icon">🏛️</div>
          <div className="analytics-content">
            <h3>Active Clubs</h3>
            <div className="analytics-number">{systemStats.activeClubs}</div>
            <div className="analytics-trend">All departments</div>
          </div>
        </div>
        <div className="analytics-card tertiary">
          <div className="analytics-icon">🎓</div>
          <div className="analytics-content">
            <h3>Total Students</h3>
            <div className="analytics-number">{systemStats.totalStudents.toLocaleString()}</div>
            <div className="analytics-trend">Enrolled across programs</div>
          </div>
        </div>
      </div>

      <div className="recent-decisions-section">
        <h3>Recent Approval Decisions</h3>
        <div className="decisions-list">
          {recentDecisions.map(decision => (
            <div key={decision.id} className="decision-item">
              <div className="decision-content">
                <div className="decision-title">{decision.eventTitle}</div>
                <div className="decision-meta">
                  <span>{decision.club}</span><span>•</span>
                  <span>{decision.budget}</span><span>•</span>
                  <span>{new Date(decision.date).toLocaleDateString()}</span>
                </div>
                {decision.reason && (
                  <div className="decision-reason">
                    <strong>Reason:</strong> {decision.reason}
                  </div>
                )}
              </div>
              <div className={`decision-status ${getDecisionColor(decision.decision)}`}>
                {decision.decision.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const fetchPendingUsers = async () => {
    try {
      const response = await apiClient.get('/users/promotion-requests');
      if (response.success) {
        setPendingUsers(response.users);
      }
    } catch (error) {
      console.error('Failed to fetch pending users:', error);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      const response = await apiClient.put(`/users/${userId}/approve-promotion`);
      if (response.success) {
        alert('User promotion approved successfully!');
        setPendingUsers(prev => prev.filter(user => user.id !== userId));
      }
    } catch (err) {
      alert('Failed to approve user promotion: ' + (err.message || 'Unknown error'));
      console.error('Error approving user:', err);
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      const response = await apiClient.put(`/users/${userId}/reject-promotion`);
      if (response.success) {
        alert('User promotion rejected successfully!');
        setPendingUsers(prev => prev.filter(user => user.id !== userId));
      }
    } catch (err) {
      alert('Failed to reject user promotion: ' + (err.message || 'Unknown error'));
      console.error('Error rejecting user:', err);
    }
  };

  const renderUserManagementSection = () => (
    <div className="head-section">
      <h2>User Promotion Requests</h2>
      <div className="user-requests">
        {pendingUsers.length === 0 ? (
          <div className="empty-requests">
            <h3>No Pending Requests</h3>
            <p>All user promotion requests have been reviewed.</p>
          </div>
        ) : (
          pendingUsers.map(user => (
            <div key={user.id} className="user-card">
              <div className="user-details">
                <div className="user-name">{user.first_name} {user.last_name}</div>
                <div className="user-email">{user.email}</div>
                <div className="user-role">Requested Role: {user.promotion_request}</div>
              </div>
              <div className="user-actions">
                <button className="approve-btn" onClick={() => handleApproveUser(user.id)}>Approve</button>
                <button className="reject-btn" onClick={() => handleRejectUser(user.id)}>Reject</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderManagementSection = () => (
    <div className="head-section">
      <h2>System Management</h2>
      <div className="management-overview">
        <div className="overview-grid">
          <div className="overview-card">
            <h4>Faculty Management</h4>
            <p>{systemStats.facultyMembers} active faculty coordinators across all departments.</p>
            <button className="management-action-btn">Manage Faculty</button>
          </div>
          <div className="overview-card">
            <h4>Budget Oversight</h4>
            <p>Monitor and allocate budgets for various events and activities.</p>
            <button className="management-action-btn">Budget Dashboard</button>
          </div>
          <div className="overview-card">
            <h4>System Settings</h4>
            <p>Configure approval workflows, notification settings, and system parameters.</p>
            <button className="management-action-btn">System Config</button>
          </div>
          <div className="overview-card">
            <h4>User Reports</h4>
            <p>Generate comprehensive reports on user activity and engagement.</p>
            <button className="management-action-btn">View Reports</button>
          </div>
          <div className="overview-card">
            <h4>Event Calendar</h4>
            <p>Master calendar view of all approved and scheduled events.</p>
            <button className="management-action-btn">Calendar View</button>
          </div>
          <div className="overview-card">
            <h4>Communication Hub</h4>
            <p>Send announcements and notifications to clubs and students.</p>
            <button className="management-action-btn">Send Messages</button>
          </div>
        </div>
      </div>

      <div className="system-health">
        <h3>System Health Status</h3>
        <div className="health-indicators">
          <div className="health-item">
            <div className="health-icon status-good">🟢</div>
            <div className="health-content">
              <div className="health-title">Database Performance</div>
              <div className="health-description">All systems operational</div>
            </div>
          </div>
          <div className="health-item">
            <div className="health-icon status-good">🟢</div>
            <div className="health-content">
              <div className="health-title">User Authentication</div>
              <div className="health-description">Login systems functioning normally</div>
            </div>
          </div>
          <div className="health-item">
            <div className="health-icon status-warning">🟡</div>
            <div className="health-content">
              <div className="health-title">Storage Usage</div>
              <div className="health-description">78% capacity - monitor closely</div>
            </div>
          </div>
          <div className="health-item">
            <div className="health-icon status-good">🟢</div>
            <div className="health-content">
              <div className="health-title">Notification Service</div>
              <div className="health-description">Email and SMS services active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="head-dashboard">
      <div className="dashboard-header">
        <img src="/VIT_AP_logo.svg" alt="VIT Logo" className="header-logo" />
        <h1>Assistant Director Dashboard</h1>
        <div className="dashboard-nav">
          <button
            className={`nav-btn ${activeSection === 'approvals' ? 'active' : ''}`}
            onClick={() => setActiveSection('approvals')}
          >
            Approvals ({pendingEvents.length})
          </button>
          <button
            className={`nav-btn ${activeSection === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveSection('analytics')}
          >
            Analytics
          </button>
          <button
            className={`nav-btn ${activeSection === 'management' ? 'active' : ''}`}
            onClick={() => setActiveSection('management')}
          >
            System Management
          </button>
          <button
            className={`nav-btn ${activeSection === 'userManagement' ? 'active' : ''}`}
            onClick={() => setActiveSection('userManagement')}
          >
            User Management ({pendingUsers.length})
          </button>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </div>
      <div className="dashboard-content">
        {activeSection === 'approvals' && renderApprovalsSection()}
        {activeSection === 'analytics' && renderAnalyticsSection()}
        {activeSection === 'management' && renderManagementSection()}
        {activeSection === 'userManagement' && renderUserManagementSection()}
      </div>
      <Footer />
    </div>
  );
};

export default HeadPage;
