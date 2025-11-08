import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client.js';
import './AdminPage.css';

const AdminPage = ({ user, onLogout, events, onPostEvent, loading }) => {
  // Debug: Check if onPostEvent function is passed
  console.log('AdminPage received onPostEvent:', typeof onPostEvent, onPostEvent);
  const [activeSection, setActiveSection] = useState('my-events');
  const [myPendingEvents, setMyPendingEvents] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
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

  // Fetch admin's pending events
  const fetchMyPendingEvents = async () => {
    try {
      setLoadingRequests(true);
      console.log('🔍 Fetching pending events for user:', user);
      console.log('🔍 User details - name:', user?.name, 'first_name:', user?.first_name, 'last_name:', user?.last_name, 'id:', user?.id);

      // Fetch all events with pending status
      const response = await apiClient.get('/events?status=pending');
      console.log('📋 All pending events response:', response);

      if (response.success) {
        console.log('📋 All pending events:', response.events);

        // Filter events created by current user
        const myEvents = response.events.filter(event => {
          console.log(`🔍 Checking event ${event.id}:`, {
            event_created_by_name: event.created_by_name,
            event_created_by: event.created_by,
            user_name: user.name,
            user_full_name: `${user.first_name} ${user.last_name}`,
            user_id: user.id
          });

          return event.created_by_name === user.name ||
            event.created_by_name === `${user.first_name} ${user.last_name}` ||
            event.created_by === user.id;
        });

        console.log('✅ My filtered pending events:', myEvents);
        setMyPendingEvents(myEvents);
      } else {
        console.error('❌ Failed to fetch pending events:', response);
      }
    } catch (error) {
      console.error('💥 Error fetching pending events:', error);
      console.error('💥 Error stack:', error.stack);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Load pending events when switching to requests tab
  useEffect(() => {
    if (activeSection === 'requests') {
      fetchMyPendingEvents();
    }
  }, [activeSection, user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [submitting, setSubmitting] = useState(false);

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    console.log('🚀 Form submission started');
    console.log('📝 Current form data:', formData);
    console.log('👤 Current user:', user);
    console.log('🔧 onPostEvent function:', typeof onPostEvent);

    // Basic validation
    if (!formData.title || !formData.category || !formData.date || !formData.time || !formData.venue) {
      console.error('❌ Validation failed - missing required fields');
      alert('Please fill in all required fields (Title, Category, Date, Time, Venue)');
      return;
    }

    console.log('✅ Validation passed');

    setSubmitting(true);

    // Switch to requests tab immediately for debugging
    console.log('🔄 Switching to requests tab...');
    setActiveSection('requests');

    try {
      console.log('📤 Calling onPostEvent with formData...');

      if (!onPostEvent) {
        throw new Error('onPostEvent function is not provided');
      }

      const success = await onPostEvent(formData);
      console.log('📥 onPostEvent returned:', success);

      if (success) {
        console.log('🎉 Event creation successful!');
        alert('✅ Event submitted successfully!');
        setFormData({
          title: '', category: '', date: '', time: '', venue: '', description: '', fee: '', expectedAttendees: '', registrationLink: ''
        });
        // Refresh the pending events list
        console.log('🔄 Refreshing pending events...');
        await fetchMyPendingEvents();
      } else {
        console.error('❌ Event creation failed - onPostEvent returned false');
        alert('❌ Event submission failed - please check console for details');
      }
    } catch (error) {
      console.error('💥 Error in form submission:', error);
      console.error('💥 Error stack:', error.stack);
      alert('❌ Error submitting event: ' + error.message);
    } finally {
      console.log('🏁 Form submission finished');
      setSubmitting(false);
    }
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
        <button type="submit" className="submit-btn" disabled={submitting}>
          <span>{submitting ? 'Creating Event...' : 'Submit for Approval'}</span>
        </button>
      </form>
    </div>
  );

  const renderRequestsSection = () => {
    const pendingCount = myPendingEvents.length;
    return (
      <div className="admin-section">
        <h2>My Event Requests ({pendingCount} pending)</h2>
        <div className="requests-container">
          {loadingRequests ? (
            <div className="loading">Loading your event requests...</div>
          ) : myPendingEvents.length === 0 ? (
            <div className="no-requests">
              <h3>No Pending Requests</h3>
              <p>All your event requests have been processed or you haven't created any yet.</p>
            </div>
          ) : (
            myPendingEvents.map(request => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <div className="request-title">{request.title}</div>
                  <div className={`request-status ${getStatusColor(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </div>
                </div>
                <div className="request-details">
                  <div className="request-detail">📅<span>{new Date(request.event_date).toLocaleDateString()}</span></div>
                  <div className="request-detail">⏰<span>{request.event_time}</span></div>
                  <div className="request-detail">📍<span>{request.venue}</span></div>
                  <div className="request-detail">🎭<span>{request.category}</span></div>
                </div>
                <p className="request-description">{request.description}</p>
                <div className="request-footer">
                  <small>Created: {new Date(request.created_at).toLocaleDateString()}</small>
                  {request.status === 'pending' && (
                    <div className="request-actions">
                      <span className="pending-badge">⏳ Awaiting Review</span>
                    </div>
                  )}
                </div>
              </div>
            )))}
        </div>
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <img src="/VIT_AP_logo.svg" alt="VIT Logo" className="header-logo" />
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
