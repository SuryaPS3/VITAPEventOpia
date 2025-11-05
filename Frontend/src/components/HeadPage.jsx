import React, { useState } from 'react';
import './HeadPage.css';

const HeadPage = ({ user, onLogout, events, onApprove, onDecline }) => {
  const [activeSection, setActiveSection] = useState('approvals');

  const pendingApprovals = events.filter(e => e.status === 'pending');
  const [recentDecisions, setRecentDecisions] = useState([
    {
      id: 1, eventTitle: 'Spring Dance Competition', decision: 'approved', date: '2025-03-15', budget: '₹45,000', club: 'Dance Collective'
    },
    {
      id: 2, eventTitle: 'Literary Workshop Series', decision: 'approved', date: '2025-03-14', budget: '₹25,000', club: 'Literary Circle'
    },
    {
      id: 3, eventTitle: 'Outdoor Sports Carnival', decision: 'declined', date: '2025-03-13', budget: '₹1,20,000', club: 'Sports Club', reason: 'Budget exceeds allocated limit'
    }
  ]);

  const systemStats = {
    totalEventsThisMonth: 24,
    activeUsers: 1247,
    totalBudgetAllocated: '₹8,50,000',
    eventSuccessRate: 94,
    pendingApprovals: pendingApprovals.length,
    activeClubs: 12,
    totalStudents: 2800,
    facultyMembers: 45
  };

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
        <div className="summary-card"><span className="summary-number">{pendingApprovals.length}</span><span className="summary-label">Pending Approvals</span></div>
        <div className="summary-card"><span className="summary-number">₹{pendingApprovals.reduce((sum, event) => sum + (parseInt(event.estimatedBudget?.replace(/[₹,]/g, '') || 0)), 0).toLocaleString('en-IN')}</span><span className="summary-label">Total Budget Requested</span></div>
        <div className="summary-card"><span className="summary-number">{pendingApprovals.reduce((sum, event) => sum + (event.expectedAttendees || 0), 0)}</span><span className="summary-label">Expected Total Attendees</span></div>
      </div>
      <div className="approval-requests">
        {pendingApprovals.map(request => (
          <div key={request.id} className="approval-card">
            <div className="approval-header">
              <div className="approval-title-section">
                <div className="approval-title">{request.title}</div>
                <div className="approval-meta">
                  <span className="approval-category">{request.category}</span>
                  <span className={`approval-priority ${getPriorityColor(request.priority)}`}>{request.priority.toUpperCase()} PRIORITY</span>
                </div>
              </div>
              <div className="approval-date">Submitted: {new Date(request.submittedDate).toLocaleDateString()}</div>
            </div>
            <div className="approval-details">
              <div className="detail-grid">
                <div className="detail-item"><strong>Date & Time:</strong><span>{new Date(request.date).toLocaleDateString()} • {request.time}</span></div>
                <div className="detail-item"><strong>Venue:</strong><span>{request.venue}</span></div>
                <div className="detail-item"><strong>Duration:</strong><span>{request.duration}</span></div>
                <div className="detail-item"><strong>Expected Attendees:</strong><span>{request.expectedAttendees}</span></div>
                <div className="detail-item"><strong>Estimated Budget:</strong><span>{request.estimatedBudget}</span></div>
                <div className="detail-item"><strong>Coordinator:</strong><span>{request.coordinator}</span></div>
              </div>
              <div className="description-section"><strong>Event Description:</strong><p>{request.description}</p></div>
              <div className="requirements-section"><strong>Requirements & Resources:</strong>
                <ul className="requirements-list">{request.requirements.map((req, index) => (<li key={index}>{req}</li>))}</ul>
              </div>
              <div className="documents-section"><strong>Attached Documents:</strong>
                <div className="documents-list">{request.documents.map((doc, index) => (<span key={index} className="document-tag">{doc}</span>))}</div>
              </div>
            </div>
            <div className="approval-actions">
              <button className="approve-btn" onClick={() => onApprove(request.id)}>✓ Approve Event</button>
              <button className="decline-btn" onClick={() => onDecline(request.id, 'No reason provided.')}>✗ Decline Event</button>
              <button className="review-btn">📋 Request More Info</button>
            </div>
          </div>
        ))}
        {pendingApprovals.length === 0 && (<div className="empty-approvals"><h3>No Pending Approvals</h3><p>All event requests have been reviewed.</p></div>)}
      </div>
    </div>
  );

  const renderAnalyticsSection = () => (
    <div className="head-section">
      <h2>System Analytics & Overview</h2>
      <div className="analytics-grid">
        <div className="analytics-card primary"><div className="analytics-icon">📊</div><div className="analytics-content"><h3>Events This Month</h3><div className="analytics-number">{systemStats.totalEventsThisMonth}</div><div className="analytics-trend">+15% from last month</div></div></div>
        <div className="analytics-card success"><div className="analytics-icon">👥</div><div className="analytics-content"><h3>Active Users</h3><div className="analytics-number">{systemStats.activeUsers.toLocaleString()}</div><div className="analytics-trend">+8% growth</div></div></div>
        <div className="analytics-card warning"><div className="analytics-icon">💰</div><div className="analytics-content"><h3>Budget Allocated</h3><div className="analytics-number">{systemStats.totalBudgetAllocated}</div><div className="analytics-trend">65% utilized</div></div></div>
        <div className="analytics-card info"><div className="analytics-icon">⭐</div><div className="analytics-content"><h3>Success Rate</h3><div className="analytics-number">{systemStats.eventSuccessRate}%</div><div className="analytics-trend">Excellent performance</div></div></div>
        <div className="analytics-card secondary"><div className="analytics-icon">🏛️</div><div className="analytics-content"><h3>Active Clubs</h3><div className="analytics-number">{systemStats.activeClubs}</div><div className="analytics-trend">All departments</div></div></div>
        <div className="analytics-card tertiary"><div className="analytics-icon">🎓</div><div className="analytics-content"><h3>Total Students</h3><div className="analytics-number">{systemStats.totalStudents.toLocaleString()}</div><div className="analytics-trend">Enrolled across programs</div></div></div>
      </div>
      <div className="recent-decisions-section">
        <h3>Recent Approval Decisions</h3>
        <div className="decisions-list">
          {recentDecisions.map(decision => (
            <div key={decision.id} className="decision-item">
              <div className="decision-content">
                <div className="decision-title">{decision.eventTitle}</div>
                <div className="decision-meta"><span>{decision.club}</span><span>•</span><span>{decision.budget}</span><span>•</span><span>{new Date(decision.date).toLocaleDateString()}</span></div>
                {decision.reason && (<div className="decision-reason"><strong>Reason:</strong> {decision.reason}</div>)}
              </div>
              <div className={`decision-status ${getDecisionColor(decision.decision)}`}>{decision.decision.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderManagementSection = () => (
    <div className="head-section">
      <h2>System Management</h2>
      <div className="management-overview">
        <div className="overview-grid">
          <div className="overview-card"><h4>Faculty Management</h4><p>{systemStats.facultyMembers} active faculty coordinators across all departments.</p><button className="management-action-btn">Manage Faculty</button></div>
          <div className="overview-card"><h4>Budget Oversight</h4><p>Monitor and allocate budgets for various events and activities.</p><button className="management-action-btn">Budget Dashboard</button></div>
          <div className="overview-card"><h4>System Settings</h4><p>Configure approval workflows, notification settings, and system parameters.</p><button className="management-action-btn">System Config</button></div>
          <div className="overview-card"><h4>User Reports</h4><p>Generate comprehensive reports on user activity and engagement.</p><button className="management-action-btn">View Reports</button></div>
          <div className="overview-card"><h4>Event Calendar</h4><p>Master calendar view of all approved and scheduled events.</p><button className="management-action-btn">Calendar View</button></div>
          <div className="overview-card"><h4>Communication Hub</h4><p>Send announcements and notifications to clubs and students.</p><button className="management-action-btn">Send Messages</button></div>
        </div>
      </div>
      <div className="system-health">
        <h3>System Health Status</h3>
        <div className="health-indicators">
          <div className="health-item"><div className="health-icon status-good">🟢</div><div className="health-content"><div className="health-title">Database Performance</div><div className="health-description">All systems operational</div></div></div>
          <div className="health-item"><div className="health-icon status-good">🟢</div><div className="health-content"><div className="health-title">User Authentication</div><div className="health-description">Login systems functioning normally</div></div></div>
          <div className="health-item"><div className="health-icon status-warning">🟡</div><div className="health-content"><div className="health-title">Storage Usage</div><div className="health-description">78% capacity - monitor closely</div></div></div>
          <div className="health-item"><div className="health-icon status-good">🟢</div><div className="health-content"><div className="health-title">Notification Service</div><div className="health-description">Email and SMS services active</div></div></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="head-dashboard">
      <div className="dashboard-header">
        <img src="/assets/Logo-removebg-preview.png" alt="VIT Logo" className="header-logo" />
        <h1>Head Dashboard</h1>
        <div className="dashboard-nav">
          <button className={`nav-btn ${activeSection === 'approvals' ? 'active' : ''}`} onClick={() => setActiveSection('approvals')}>Approvals ({pendingApprovals.length})</button>
          <button className={`nav-btn ${activeSection === 'analytics' ? 'active' : ''}`} onClick={() => setActiveSection('analytics')}>Analytics</button>
          <button className={`nav-btn ${activeSection === 'management' ? 'active' : ''}`} onClick={() => setActiveSection('management')}>System Management</button>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </div>
      <div className="dashboard-content">
        {activeSection === 'approvals' && renderApprovalsSection()}
        {activeSection === 'analytics' && renderAnalyticsSection()}
        {activeSection === 'management' && renderManagementSection()}
      </div>
    </div>
  );
};

export default HeadPage;
