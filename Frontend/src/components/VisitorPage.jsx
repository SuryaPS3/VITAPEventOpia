import React, { useState } from 'react';
import './VisitorPage.css';

const VisitorPage = ({ user, onShowLoginModal, onShowRegistrationModal, onLogout, events, loading }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const clubs = [
    { id: 1, name: 'Dance Collective', icon: '💃', description: 'Express your soul through movement. From contemporary to hip-hop, classical to street dance.', categoryKey: 'dance' },
    { id: 2, name: 'Western Music Society', icon: '🎸', description: 'Rock the stage with electrifying performances. From indie acoustics to heavy metal.', categoryKey: 'western' },
    { id: 3, name: 'Classical Harmony', icon: '🎻', description: 'Immerse in timeless elegance. Experience classical music from baroque to modern symphonies.', categoryKey: 'classical' },
    { id: 4, name: 'Cultural Heritage', icon: '🌍', description: 'Celebrate diverse traditions through poetry, folk arts, and cultural festivals.', categoryKey: 'cultural' },
    { id: 5, name: 'Theatre Arts', icon: '🎭', description: 'Transform stories into unforgettable experiences. From Shakespeare to contemporary drama.', categoryKey: 'drama' },
    { id: 6, name: 'Literary Circle', icon: '📚', description: 'Explore the power of words through creative writing, poetry slams, and book discussions.', categoryKey: 'literary' }
  ];

  const tabs = [
    { key: 'all', label: '🌟 All Events' },
    { key: 'dance', label: '💃 Dance' },
    { key: 'western', label: '🎸 Music' },
    { key: 'classical', label: '🎻 Classical' },
    { key: 'cultural', label: '🌍 Cultural' },
    { key: 'drama', label: '🎭 Theatre' },
    { key: 'literary', label: '📚 Literary' }
  ];

  const getFilteredEvents = () => {
    let filtered = events;
    if (activeTab !== 'all') {
      filtered = events.filter(event => event.categoryKey === activeTab);
    }
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  const handleEventClick = (event) => setSelectedEvent(event);
  const handleRegistration = (event) => {
    if (!user) {
      onShowLoginModal?.();
      return;
    }

    if (event.registrationLink && event.registrationLink.trim() !== '') {
      window.open(event.registrationLink, '_blank');
      return;
    }

    // Fallback if registrationLink not provided
    if (typeof onShowRegistrationModal === 'function') {
      onShowRegistrationModal(event);
    } else {
      console.warn('⚠️ onShowRegistrationModal is not defined, and no registration link found for this event.');
      alert('Registration link is not available for this event.');
    }
  };


  const scrollToEvents = () => {
    const eventsSection = document.querySelector('.events-section');
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleClubClick = (categoryKey) => {
    setActiveTab(categoryKey);
    scrollToEvents();
  };

  return (
    <div className="visitor-page">
      <div className="floating-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>
      <div className="container">
        <header className="header">
          <img src="../VIT_AP_logo.svg" alt="VIT Logo" className="header-logo" />
          <div className="login-button-container">
            {user ? (
              <button className="login-btn" onClick={onLogout}><span>👋 {user.name}</span></button>
            ) : (
              <button className="login-btn" onClick={onShowLoginModal}><span>🔐 Login</span></button>
            )}
          </div>
          <h1 className="logo">Eventopia</h1>
          <p className="tagline">Where Every Event Becomes an Experience</p>
        </header>
        <section className="search-section">
          <div className="search-container">
            <input type="text" className="search-input" placeholder="Search events, clubs, or activities..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button className="search-btn">🔍</button>
          </div>
        </section>
        <section className="clubs-section">
          <div className="section-header">
            <h2 className="section-title">Discover Communities</h2>
            <p className="section-subtitle">Join vibrant communities and connect with like-minded individuals who share your passions</p>
          </div>
          <div className="clubs-grid">
            {clubs.map(club => (
              <div key={club.id} className="club-card" onClick={() => handleClubClick(club.categoryKey)}>
                <span className="club-icon">{club.icon}</span>
                <h3>{club.name}</h3>
                <p>{club.description}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="events-section">
          <div className="section-header">
            <h2 className="section-title">Trending Events</h2>
            <p className="section-subtitle">Don't miss out on these incredible upcoming experiences</p>
          </div>
          <div className="tabs">
            {tabs.map(tab => (
              <button key={tab.key} className={`tab-button ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="events-grid">
            {loading ? (
              <div className="loading-events">
                <div className="loading-spinner"></div>
                <p>Loading approved events...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="no-events">
                <h3>🎉 No Events Yet</h3>
                <p>Stay tuned! Amazing events are coming soon.</p>
              </div>
            ) : getFilteredEvents().length === 0 ? (
              <div className="no-events">
                <h3>🔍 No Events Found</h3>
                <p>Try searching with different criteria or check other categories.</p>
              </div>
            ) : getFilteredEvents().map(event => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <div>
                    <div className="event-category">{event.category}</div>
                    <div className="event-title" onClick={() => handleEventClick(event)}>{event.title}</div>
                  </div>
                  <div className="event-date">{event.date}</div>
                </div>
                <div className="event-details">
                  <div className="event-detail">📍<span>{event.venue}</span></div>
                  <div className="event-detail">⏰<span>{event.time}</span></div>
                  <div className="event-detail">💰<span>{event.fee}</span></div>
                </div>
                <div className="event-footer">
                  <div className="event-attendees">
                    <div className="attendee-avatars"><div className="avatar">A</div><div className="avatar">B</div><div className="avatar">C</div><div className="avatar">+</div></div>
                    <span className="attendee-count">{event.attendees} attending</span>
                  </div>
                  <button className="register-btn" onClick={() => handleRegistration(event)}>
                    <span>Join Event</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      {selectedEvent && (
        <div className="modal" onClick={(e) => e.target.className === 'modal' && setSelectedEvent(null)}>
          <div className="modal-content">
            <span className="close" onClick={() => setSelectedEvent(null)}>&times;</span>
            <div className="event-detail-header">
              <div className="event-detail-title">{selectedEvent.title}</div>
              <div className="event-detail-category">{selectedEvent.category}</div>
            </div>
            <div className="event-detail-info">
              <div className="info-item"><div className="info-label">📅 Date</div><div className="info-value">{selectedEvent.date}, 2025</div></div>
              <div className="info-item"><div className="info-label">⏰ Time</div><div className="info-value">{selectedEvent.time}</div></div>
              <div className="info-item"><div className="info-label">📍 Venue</div><div className="info-value">{selectedEvent.venue}</div></div>
              <div className="info-item"><div className="info-label">💰 Entry</div><div className="info-value">{selectedEvent.fee}</div></div>
            </div>
            <div className="event-detail-description">
              <h3>About This Event</h3>
              <p>{selectedEvent.description}</p>
            </div>
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button className="register-btn" onClick={() => { setSelectedEvent(null); handleRegistration(selectedEvent); }}>
                <span>Register for Event</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorPage;
