import React, { useState } from 'react';
import './AdminPage.css';

const AdminPage = ({ user, onLogout, events, onPostEvent, loading }) => {
  const [activeSection, setActiveSection] = useState('my-events');
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    date: '',
    time: '',
    venue: '',
    description: '',
    fee: '',
    expectedAttendees: '',
    registrationLink: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    onPostEvent(formData);
    setFormData({
      title: '', category: '', date: '', time: '', venue: '', description: '', fee: '', expectedAttendees: '', registrationLink: ''
    });
    setActiveSection('requests');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'declined': return 'status-declined';
      default: return 'status-pending';
    }
  };

  const renderMyEvents = () => {
    const myEvents = events.filter(e => e.requestedBy === user.name && e.status === 'approved');
    return (
      <div className="admin-section">
        <h2>My Approved Events</h2>
        <div className="events-grid">
          {myEvents.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-header">
                <div>
                  <div className="event-category">{event.category}</div>
                  <div className="event-title">{event.title}</div>
                </div>
                <div className="event-date">{new Date(event.date).toLocaleDateString()}</div>
              </div>
              <div className="event-details">
                <div className="event-detail">📍<span>{event.venue}</span></div>
                <div className="event-detail">⏰<span>{event.time}</span></div>
                <div className="event-detail">🎫<span>{event.fee}</span></div>
                <div className="event-detail">👥<span>{event.attendees} registered</span></div>
              </div>
              <div className="event-footer">
                <span className={`event-status ${getStatusColor(event.status)}`}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
                <div className="event-actions">
                  <button className="edit-btn">Edit</button>
                  <button className="view-btn">View Details</button>
                </div>
              </div>
            </div>
          ))}
          {myEvents.length === 0 && (
            <div className="empty-state">
              <h3>No events yet</h3>
              <p>Create your first event to get started!</p>
              <button className="create-event-btn" onClick={() => setActiveSection('create')}>
                Create Event
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCreateSection = () => (
    <div className="admin-section">
      <h2>Create New Event</h2>
      <form onSubmit={handleCreateEvent} className="event-form">
        <div className="form-row">
          <div className="form-group">
            <label>Event Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="Enter event title" />
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select name="category" value={formData.category} onChange={handleInputChange} required>
              <option value="">Select Category</option>
              <option value="dance">Dance</option>
              <option value="music">Music</option>
              <option value="classical">Classical</option>
              <option value="cultural">Cultural</option>
              <option value="drama">Theatre</option>
              <option value="literary">Literary</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Date *</label>
            <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Time *</label>
            <input type="time" name="time" value={formData.time} onChange={handleInputChange} required />
          </div>
        </div>
        <div className="form-group">
          <label>Venue *</label>
          <input type="text" name="venue" value={formData.venue} onChange={handleInputChange} required placeholder="Event venue" />
        </div>
        <div className="form-group">
          <label>Description *</label>
          <textarea name="description" value={formData.description} onChange={handleInputChange} required rows="4" placeholder="Describe your event..." />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Entry Fee</label>
            <input type="text" name="fee" value={formData.fee} onChange={handleInputChange} placeholder="Free or ₹Amount" />
          </div>
          <div class="form-group">
            <label>Expected Attendees</label>
            <input type="number" name="expectedAttendees" value={formData.expectedAttendees} onChange={handleInputChange} min="1" placeholder="Number of expected attendees" />
          </div>
        </div>
        <div class="form-group">
          <label>Registration Link</label>
          <input type="text" name="registrationLink" value={formData.registrationLink} onChange={handleInputChange} placeholder="https://forms.gle/example" />
        </div>
        {/* ⭐ BACKEND INTEGRATION: Added loading state to button */}
        <button type="submit" className="submit-btn" disabled={loading}>
          <span>{loading ? 'Creating Event...' : 'Submit for Approval'}</span>
        </button>
      </form>
    </div>
  );

  const renderRequestsSection = () => {
    const myRequests = events.filter(e => e.requestedBy === user.name && e.status !== 'approved');
    const pendingCount = myRequests.filter(r => r.status === 'pending').length;
    return (
      <div className="admin-section">
        <h2>My Event Requests ({pendingCount} pending)</h2>
        <div className="requests-container">
          {myRequests.map(request => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <div className="request-title">{request.title}</div>
                <div className={`request-status ${getStatusColor(request.status)}`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </div>
              </div>
              <div className="request-details">
                <div className="request-detail">📅<span>{new Date(request.date).toLocaleDateString()}</span></div>
                <div className="request-detail">📍<span>{request.venue}</span></div>
                <div className="request-detail">🎭<span>{request.category}</span></div>
              </div>
              <p className="request-description">{request.description}</p>
              <div className="request-footer">
                <small>Requested by: {request.requestedBy}</small>
                {request.status === 'pending' && (
                  <div className="request-actions">
                    <span className="pending-badge">⏳ Awaiting Review</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {myRequests.length === 0 && (
            <div className="empty-state">
              <h3>No event requests submitted yet</h3>
              <p>Your event requests will appear here after submission.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <img src="../public/Logo-removebg-preview.png" alt="VIT Logo" className="header-logo" />
        <div className="dashboard-nav">
          <button className={`nav-btn ${activeSection === 'my-events' ? 'active' : ''}`} onClick={() => setActiveSection('my-events')}>
            My Events
          </button>
          <button className={`nav-btn ${activeSection === 'create' ? 'active' : ''}`} onClick={() => setActiveSection('create')}>
            Create Event
          </button>
          <button className={`nav-btn ${activeSection === 'requests' ? 'active' : ''}`} onClick={() => setActiveSection('requests')}>
            Requests ({events.filter(r => r.status === 'pending' && r.requestedBy === user.name).length})
          </button>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </div>
      <div className="dashboard-content">
        {activeSection === 'my-events' && renderMyEvents()}
        {activeSection === 'create' && renderCreateSection()}
        {activeSection === 'requests' && renderRequestsSection()}
      </div>
    </div>
  );
};

export default AdminPage;
