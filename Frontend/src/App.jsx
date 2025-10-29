import React, { useState, useEffect } from 'react';
import { authAPI, eventsAPI } from './api/client';

// ===============================================
// YOUR COMPLETE ORIGINAL CSS (ALL OF IT)
// ===============================================
const styles = `
.admin-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #16213e 30%, #1a1a2e 70%, #0f3460 100%);
  color: #e0e6ed;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.dashboard-header {
  background: rgba(30, 41, 59, 0.9);
  padding: 20px 40px;
  border-bottom: 2px solid rgba(157, 80, 187, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  backdrop-filter: blur(20px);
}

.dashboard-header h1 {
  color: #f8fafc;
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(45deg, #00d4ff, #9d50bb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dashboard-nav {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
}

.nav-btn {
  background: rgba(51, 65, 85, 0.6);
  color: #e2e8f0;
  border: 2px solid rgba(157, 80, 187, 0.2);
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.nav-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #9d50bb, #6f42c1);
  transition: left 0.3s ease;
  z-index: -1;
}

.nav-btn.active::before,
.nav-btn:hover::before {
  left: 0;
}

.nav-btn.active,
.nav-btn:hover {
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(157, 80, 187, 0.4);
}

.logout-btn {
  background: linear-gradient(45deg, #dc2626, #b91c1c);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: linear-gradient(45deg, #b91c1c, #991b1b);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
}

.dashboard-content {
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.admin-section h2 {
  color: #f8fafc;
  margin-bottom: 30px;
  font-size: 2.2rem;
  font-weight: 700;
}

/* Events Grid */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 30px;
}

.event-card {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(157, 80, 187, 0.3);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.event-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #9d50bb, #00d4ff);
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(157, 80, 187, 0.3);
  border-color: rgba(157, 80, 187, 0.5);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.event-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 8px;
}

.event-category {
  background: linear-gradient(45deg, #9d50bb, #6f42c1);
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.event-date {
  color: #00d4ff;
  font-weight: 600;
  font-size: 0.9rem;
}

.event-details {
  margin-bottom: 25px;
}

.event-detail {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: #94a3b8;
  font-weight: 500;
}

.event-detail span {
  margin-left: 10px;
}

.event-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.event-status {
  padding: 6px 15px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-approved {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-pending {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.status-declined {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.event-actions {
  display: flex;
  gap: 10px;
}

.edit-btn,
.view-btn {
  background: rgba(51, 65, 85, 0.6);
  color: #e2e8f0;
  border: 1px solid rgba(157, 80, 187, 0.3);
  padding: 8px 16px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.edit-btn:hover,
.view-btn:hover {
  background: linear-gradient(45deg, #9d50bb, #6f42c1);
  border-color: transparent;
  transform: translateY(-2px);
}

/* Event Form */
.event-form {
  background: rgba(30, 41, 59, 0.8);
  padding: 40px;
  border-radius: 25px;
  border: 1px solid rgba(157, 80, 187, 0.2);
  max-width: 800px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  color: #e2e8f0;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 1rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 15px 20px;
  background: rgba(51, 65, 85, 0.6);
  border: 2px solid rgba(157, 80, 187, 0.3);
  border-radius: 15px;
  color: #e0e6ed;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: rgba(157, 80, 187, 0.6);
  box-shadow: 0 0 20px rgba(157, 80, 187, 0.3);
  transform: translateY(-2px);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #94a3b8;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.submit-btn {
  background: linear-gradient(45deg, #9d50bb, #6f42c1);
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  width: 100%;
  margin-top: 20px;
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #6f42c1, #00d4ff);
  transition: left 0.3s ease;
  z-index: -1;
}

.submit-btn:hover::before {
  left: 0;
}

.submit-btn span {
  position: relative;
  z-index: 1;
}

.submit-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(157, 80, 187, 0.5);
}

/* Requests Section */
.requests-container {
  display: grid;
  gap: 25px;
}

.request-card {
  background: rgba(30, 41, 59, 0.8);
  padding: 30px;
  border-radius: 20px;
  border: 1px solid rgba(157, 80, 187, 0.2);
  transition: all 0.3s ease;
}

.request-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border-color: rgba(157, 80, 187, 0.4);
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.request-title {
  color: #f8fafc;
  font-size: 1.4rem;
  font-weight: 600;
}

.request-status {
  padding: 6px 15px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.request-details {
  display: flex;
  gap: 25px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.request-detail {
  display: flex;
  align-items: center;
  color: #94a3b8;
  font-size: 0.9rem;
}

.request-detail span {
  margin-left: 8px;
}

.request-description {
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 20px;
  font-size: 1rem;
}

.request-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.request-footer small {
  color: #64748b;
  font-size: 0.9rem;
}

.pending-badge {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

/* Empty States */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
}

.empty-state h3 {
  color: #e2e8f0;
  margin-bottom: 15px;
  font-size: 1.5rem;
}

.empty-state p {
  margin-bottom: 30px;
  font-size: 1.1rem;
}

.create-event-btn {
  background: linear-gradient(45deg, #9d50bb, #6f42c1);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.create-event-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(157, 80, 187, 0.5);
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    padding: 20px;
  }
  
  .dashboard-header h1 {
    font-size: 1.8rem;
  }
  
  .dashboard-nav {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  
  .nav-btn {
    flex: 1;
    min-width: 120px;
    text-align: center;
  }
  
  .dashboard-content {
    padding: 20px;
  }
  
  .events-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .event-form {
    padding: 25px;
  }
  
  .request-details {
    flex-direction: column;
    gap: 10px;
  }
  
  .request-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .request-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .dashboard-header h1 {
    font-size: 1.5rem;
  }
  
  .nav-btn {
    font-size: 0.9rem;
    padding: 10px 15px;
  }
  
  .admin-section h2 {
    font-size: 1.8rem;
  }
  
  .event-card,
  .request-card {
    padding: 20px;
  }
  
  .event-form {
    padding: 20px;
  }
}
.faculty-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #16213e 30%, #1a1a2e 70%, #0f3460 100%);
  color: #e0e6ed;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.faculty-dashboard .dashboard-header {
  background: rgba(30, 41, 59, 0.9);
  padding: 20px 40px;
  border-bottom: 2px solid rgba(157, 80, 187, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  backdrop-filter: blur(20px);
}

.faculty-dashboard .dashboard-header h1 {
  color: #f8fafc;
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(45deg, #00d4ff, #9d50bb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.faculty-dashboard .dashboard-nav {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
}

.faculty-dashboard .nav-btn {
  background: rgba(51, 65, 85, 0.6);
  color: #e2e8f0;
  border: 2px solid rgba(157, 80, 187, 0.2);
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.faculty-dashboard .nav-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #9d50bb, #6f42c1);
  transition: left 0.3s ease;
  z-index: -1;
}

.faculty-dashboard .nav-btn.active::before,
.faculty-dashboard .nav-btn:hover::before {
  left: 0;
}

.faculty-dashboard .nav-btn.active,
.faculty-dashboard .nav-btn:hover {
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(157, 80, 187, 0.4);
}

.faculty-dashboard .logout-btn {
  background: linear-gradient(45deg, #dc2626, #b91c1c);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.faculty-dashboard .logout-btn:hover {
  background: linear-gradient(45deg, #b91c1c, #991b1b);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
}

.faculty-dashboard .dashboard-content {
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.faculty-section h2 {
  color: #f8fafc;
  margin-bottom: 30px;
  font-size: 2.2rem;
  font-weight: 700;
}

/* Stats Overview */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.stat-card {
  background: rgba(30, 41, 59, 0.8);
  padding: 30px;
  border-radius: 20px;
  border: 1px solid rgba(157, 80, 187, 0.2);
  transition: all 0.4s ease;
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(157, 80, 187, 0.3);
  border-color: rgba(157, 80, 187, 0.4);
}

.stat-icon {
  font-size: 2.5rem;
  background: linear-gradient(45deg, #9d50bb, #6f42c1);
  width: 70px;
  height: 70px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content h3 {
  color: #94a3b8;
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-number {
  color: #00d4ff;
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-trend {
  color: #22c55e;
  font-size: 0.85rem;
  font-weight: 500;
}

/* Overview Content */
.overview-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.recent-activity,
.quick-actions {
  background: rgba(30, 41, 59, 0.8);
  padding: 30px;
  border-radius: 20px;
  border: 1px solid rgba(157, 80, 187, 0.2);
}

.recent-activity h3,
.quick-actions h3 {
  color: #f8fafc;
  margin-bottom: 25px;
  font-size: 1.4rem;
  font-weight: 600;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(51, 65, 85, 0.4);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: rgba(51, 65, 85, 0.6);
  transform: translateX(5px);
}

.activity-icon {
  font-size: 1.2rem;
  width: 35px;
  height: 35px;
  background: linear-gradient(45deg, #9d50bb, #6f42c1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-title {
  color: #f8fafc;
  font-weight: 600;
  margin-bottom: 3px;
}

.activity-meta {
  color: #94a3b8;
  font-size: 0.85rem;
}

/* Quick Actions */
.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.action-btn {
  padding: 15px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.95rem;
}

.action-btn.primary {
  background: linear-gradient(45deg, #9d50bb, #6f42c1);
  color: white;
}

.action-btn.secondary {
  background: rgba(51, 65, 85, 0.6);
  color: #e2e8f0;
  border: 1px solid rgba(157, 80, 187, 0.3);
}

.action-btn.tertiary {
  background: transparent;
  color: #94a3b8;
  border: 1px solid rgba(94, 163, 184, 0.3);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.action-btn.primary:hover {
  box-shadow: 0 8px 25px rgba(157, 80, 187, 0.4);
}

/* Section Controls */
.section-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.filter-controls {
  display: flex;
  gap: 15px;
}

.filter-select,
.search-input {
  padding: 12px 18px;
  background: rgba(51, 65, 85, 0.6);
  border: 2px solid rgba(157, 80, 187, 0.3);
  border-radius: 15px;
  color: #e0e6ed;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.filter-select:focus,
.search-input:focus {
  outline: none;
  border-color: rgba(157, 80, 187, 0.6);
  box-shadow: 0 0 20px rgba(157, 80, 187, 0.3);
}

.search-input {
  min-width: 250px;
}

.search-input::placeholder {
  color: #94a3b8;
}

/* Events Grid */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 25px;
}

.faculty-event-card {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 20px;
  padding: 25px;
  border: 1px solid rgba(157, 80, 187, 0.2);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.faculty-event-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #9d50bb, #00d4ff);
}

.faculty-event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(157, 80, 187, 0.3);
  border-color: rgba(157, 80, 187, 0.5);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.event-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 8px;
}

.event-category {
  background: linear-gradient(45deg, #9d50bb, #6f42c1);
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.event-status {
  padding: 6px 15px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status-active {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-approved {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.status-pending {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.status-completed {
  background: rgba(148, 163, 184, 0.2);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.status-cancelled {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.event-details {
  margin-bottom: 20px;
}

.event-detail {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  color: #94a3b8;
  font-size: 0.9rem;
}

.event-detail span {
  margin-left: 8px;
}

.event-meta {
  background: rgba(51, 65, 85, 0.4);
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #e2e8f0;
  font-size: 0.9rem;
}

.meta-row:last-child {
  margin-bottom: 0;
}

.meta-row strong {
  color: #94a3b8;
  font-weight: 600;
}

.event-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-btn-small {
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  border: none;
}

.action-btn-small.primary {
  background: linear-gradient(45deg, #9d50bb, #6f42c1);
  color: white;
}

.action-btn-small.secondary {
  background: rgba(51, 65, 85, 0.6);
  color: #e2e8f0;
  border: 1px solid rgba(157, 80, 187, 0.3);
}

.action-btn-small.success {
  background: linear-gradient(45deg, #22c55e, #16a34a);
  color: white;
}

.action-btn-small.tertiary {
  background: transparent;
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.action-btn-small:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* Clubs Section */
.clubs-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 40px;
  background: rgba(30, 41, 59, 0.8);
  padding: 30px;
  border-radius: 20px;
  border: 1px solid rgba(157, 80, 187, 0.2);
}

.clubs-stat {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #00d4ff;
}

.stat-label {
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.clubs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.club-management-card {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 20px;
  padding: 25px;
  border: 1px solid rgba(157, 80, 187, 0.2);
  transition: all 0.4s ease;
}

.club-management-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(157, 80, 187, 0.3);
  border-color: rgba(157, 80, 187, 0.5);
}

.club-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.club-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: #f8fafc;
}

.club-status {
  padding: 6px 15px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status-inactive {
  background: rgba(148, 163, 184, 0.2);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.club-info {
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.info-item {
  background: rgba(51, 65, 85, 0.4);
  padding: 12px;
  border-radius: 10px;
  text-align: center;
}

.info-label {
  color: #94a3b8;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 5px;
}

.info-value {
  color: #f8fafc;
  font-size: 1.1rem;
  font-weight: 600;
}

.coordinator-info {
  color: #e2e8f0;
  font-size: 0.9rem;
  padding: 15px;
  background: rgba(51, 65, 85, 0.4);
  border-radius: 10px;
}

.club-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.add-club-section {
  text-align: center;
  padding: 20px;
}

.add-club-btn {
  background: linear-gradient(45deg, #22c55e, #16a34a);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.add-club-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(34, 197, 94, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    padding: 20px;
  }
  
  .dashboard-nav {
    width: 100%;
    justify-content: flex-start;
  }
  
  .nav-btn {
    flex: 1;
    min-width: 100px;
    text-align: center;
  }
  
  .dashboard-content {
    padding: 20px;
  }
  
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .overview-content {
    grid-template-columns: 1fr;
    gap: 25px;
  }
  
  .section-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-controls {
    justify-content: stretch;
  }
  
  .filter-select {
    flex: 1;
  }
  
  .search-input {
    min-width: auto;
  }
  
  .events-grid,
  .clubs-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
  }
  
  .clubs-stats {
    flex-direction: column;
    gap: 20px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
.head-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #16213e 30%, #1a1a2e 70%, #0f3460 100%);
  color: #e0e6ed;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.head-dashboard .dashboard-header {
  background: rgba(30, 41, 59, 0.9);
  padding: 20px 40px;
  border-bottom: 2px solid rgba(157, 80, 187, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  backdrop-filter: blur(20px);
}

.head-dashboard .dashboard-header h1 {
  color: #f8fafc;
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(45deg, #ffd700, #ff6b35);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.head-dashboard .dashboard-nav {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
}

.head-dashboard .nav-btn {
  background: rgba(51, 65, 85, 0.6);
  color: #e2e8f0;
  border: 2px solid rgba(255, 215, 0, 0.2);
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.head-dashboard .nav-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #ffd700, #ff6b35);
  transition: left 0.3s ease;
  z-index: -1;
}

.head-dashboard .nav-btn.active::before,
.head-dashboard .nav-btn:hover::before {
  left: 0;
}

.head-dashboard .nav-btn.active,
.head-dashboard .nav-btn:hover {
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
}

.head-dashboard .logout-btn {
  background: linear-gradient(45deg, #dc2626, #b91c1c);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.head-dashboard .logout-btn:hover {
  background: linear-gradient(45deg, #b91c1c, #991b1b);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
}

.head-dashboard .dashboard-content {
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.head-section h2 {
  color: #f8fafc;
  margin-bottom: 30px;
  font-size: 2.2rem;
  font-weight: 700;
}

/* Approvals Summary */
.approvals-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.summary-card {
  background: rgba(30, 41, 59, 0.8);
  padding: 25px;
  border-radius: 20px;
  border: 1px solid rgba(255, 215, 0, 0.2);
  text-align: center;
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.4);
}

.summary-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 8px;
}

.summary-label {
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Approval Requests */
.approval-requests {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.approval-card {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 25px;
  padding: 35px;
  border: 1px solid rgba(255, 215, 0, 0.2);
  transition: all 0.4s ease;
  position: relative;
}

.approval-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, #ffd700, #ff6b35);
  border-radius: 25px 25px 0 0;
}

.approval-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.4);
}

.approval-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
}

.approval-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 10px;
}

.approval-meta {
  display: flex;
  gap: 15px;
  align-items: center;
}

.approval-category {
  background: linear-gradient(45deg, #9d50bb, #6f42c1);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.approval-priority {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.priority-high {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.priority-medium {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.4);
}

.priority-low {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.approval-date {
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 500;
}

.approval-details {
  margin-bottom: 30px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.detail-item {
  background: rgba(51, 65, 85, 0.4);
  padding: 15px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-item strong {
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 600;
}

.detail-item span {
  color: #f8fafc;
  font-weight: 500;
  text-align: right;
}

.description-section,
.requirements-section,
.documents-section {
  margin-bottom: 25px;
}

.description-section strong,
.requirements-section strong,
.documents-section strong {
  color: #e2e8f0;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 10px;
  display: block;
}

.description-section p {
  color: #94a3b8;
  line-height: 1.7;
  margin-top: 10px;
}

.requirements-list {
  list-style: none;
  margin-top: 10px;
}

.requirements-list li {
  color: #94a3b8;
  margin-bottom: 8px;
  padding-left: 20px;
  position: relative;
}

.requirements-list li::before {
  content: '•';
  color: #ffd700;
  font-weight: bold;
  position: absolute;
  left: 0;
}

.documents-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.document-tag {
  background: rgba(255, 215, 0, 0.1);
  color: #ffd700;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.approval-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.approve-btn,
.decline-btn,
.review-btn {
  padding: 15px 30px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  border: none;
  position: relative;
  overflow: hidden;
}

.approve-btn {
  background: linear-gradient(45deg, #22c55e, #16a34a);
  color: white;
}

.decline-btn {
  background: linear-gradient(45deg, #ef4444, #dc2626);
  color: white;
}

.review-btn {
  background: rgba(51, 65, 85, 0.6);
  color: #e2e8f0;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.approve-btn:hover,
.decline-btn:hover,
.review-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.empty-approvals {
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
}

.empty-approvals h3 {
  color: #e2e8f0;
  margin-bottom: 15px;
  font-size: 1.8rem;
}

/* Analytics Section */
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  margin-bottom: 50px;
}

.analytics-card {
  background: rgba(30, 41, 59, 0.8);
  padding: 30px;
  border-radius: 20px;
  border: 1px solid rgba(255, 215, 0, 0.2);
  transition: all 0.4s ease;
  display: flex;
  align-items: center;
  gap: 20px;
}

.analytics-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
}

.analytics-card.primary { border-color: rgba(59, 130, 246, 0.3); }
.analytics-card.success { border-color: rgba(34, 197, 94, 0.3); }
.analytics-card.warning { border-color: rgba(251, 191, 36, 0.3); }
.analytics-card.info { border-color: rgba(6, 182, 212, 0.3); }
.analytics-card.secondary { border-color: rgba(139, 92, 246, 0.3); }
.analytics-card.tertiary { border-color: rgba(236, 72, 153, 0.3); }

.analytics-icon {
  font-size: 2.5rem;
  width: 70px;
  height: 70px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #ffd700, #ff6b35);
}

.analytics-content h3 {
  color: #94a3b8;
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.analytics-number {
  color: #ffd700;
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.analytics-trend {
  color: #22c55e;
  font-size: 0.85rem;
  font-weight: 500;
}

/* Recent Decisions */
.recent-decisions-section {
  background: rgba(30, 41, 59, 0.8);
  padding: 30px;
  border-radius: 20px;
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.recent-decisions-section h3 {
  color: #f8fafc;
  margin-bottom: 25px;
  font-size: 1.4rem;
  font-weight: 600;
}

.decisions-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.decision-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(51, 65, 85, 0.4);
  border-radius: 15px;
  transition: all 0.3s ease;
}

.decision-item:hover {
  background: rgba(51, 65, 85, 0.6);
  transform: translateX(5px);
}

.decision-title {
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 5px;
}

.decision-meta {
  color: #94a3b8;
  font-size: 0.9rem;
}

.decision-reason {
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 8px;
  font-style: italic;
}

.decision-status {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.decision-approved {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.decision-declined {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* Management Section */
.management-overview {
  margin-bottom: 40px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.overview-card {
  background: rgba(30, 41, 59, 0.8);
  padding: 25px;
  border-radius: 20px;
  border: 1px solid rgba(255, 215, 0, 0.2);
  transition: all 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.4);
}

.overview-card h4 {
  color: #f8fafc;
  margin-bottom: 15px;
  font-size: 1.2rem;
  font-weight: 600;
}

.overview-card p {
  color: #94a3b8;
  margin-bottom: 20px;
  line-height: 1.6;
}

.management-action-btn {
  background: linear-gradient(45deg, #ffd700, #ff6b35);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  width: 100%;
}

.management-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
}

/* System Health */
.system-health {
  background: rgba(30, 41, 59, 0.8);
  padding: 30px;
  border-radius: 20px;
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.system-health h3 {
  color: #f8fafc;
  margin-bottom: 25px;
  font-size: 1.4rem;
  font-weight: 600;
}

.health-indicators {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.health-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: rgba(51, 65, 85, 0.4);
  border-radius: 15px;
  transition: all 0.3s ease;
}

.health-item:hover {
  background: rgba(51, 65, 85, 0.6);
  transform: translateX(5px);
}

.health-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.health-title {
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 3px;
}

.health-description {
  color: #94a3b8;
  font-size: 0.9rem;
}

.status-good {
  background: rgba(34, 197, 94, 0.2);
}

.status-warning {
  background: rgba(251, 191, 36, 0.2);
}

.status-error {
  background: rgba(239, 68, 68, 0.2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    padding: 20px;
  }
  
  .dashboard-header h1 {
    font-size: 1.8rem;
  }
  
  .dashboard-nav {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  
  .nav-btn {
    flex: 1;
    min-width: 120px;
    text-align: center;
    font-size: 0.9rem;
  }
  
  .dashboard-content {
    padding: 20px;
  }
  
  .approvals-summary {
    grid-template-columns: 1fr;
  }
  
  .approval-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .approval-meta {
    flex-wrap: wrap;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .approval-actions {
    flex-direction: column;
  }
  
  .analytics-grid,
  .overview-grid {
    grid-template-columns: 1fr;
  }
  
  .analytics-card {
    flex-direction: column;
    text-align: center;
  }
  
  .decision-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .health-indicators {
    grid-template-columns: 1fr;
  }
  
  .documents-list {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .dashboard-header h1 {
    font-size: 1.5rem;
  }
  
  .nav-btn {
    font-size: 0.8rem;
    padding: 10px 15px;
  }
  
  .head-section h2 {
    font-size: 1.8rem;
  }
  
  .approval-card {
    padding: 25px;
  }
  
  .approval-title {
    font-size: 1.3rem;
  }
  
  .analytics-number {
    font-size: 1.8rem;
  }
  
  .summary-number {
    font-size: 1.6rem;
  }
}
.login-btn {
  background: linear-gradient(45deg, #9d50bb, #6f42c1);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #6f42c1, #00d4ff);
  transition: left 0.3s ease;
  z-index: -1;
}

.login-btn:hover::before {
  left: 0;
}

.login-btn span {
  position: relative;
  z-index: 1;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(157, 80, 187, 0.5);
}

.modal {
  display: flex;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(10px);
  animation: fadeIn 0.3s ease;
  align-items: center;
  justify-content: center;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: rgba(30, 41, 59, 0.95);
  padding: 50px;
  border-radius: 30px;
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 25px 80px rgba(0,0,0,0.5);
  animation: slideIn 0.3s ease;
  border: 1px solid rgba(157, 80, 187, 0.3);
  color: #e0e6ed;
}

@keyframes slideIn {
  from { transform: translateY(-50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.close {
  position: absolute;
  right: 25px;
  top: 20px;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  color: #64748b;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close:hover {
  color: #f8fafc;
  background: rgba(157, 80, 187, 0.2);
}

.vit-logo {
  text-align: center;
  margin-bottom: 20px;
}

.logo-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(45deg, #dc2626, #b91c1c);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border: 3px solid white;
}

.logo-text {
  color: white;
  font-size: 24px;
  font-weight: bold;
}

.modal h2 {
  margin-bottom: 30px;
  color: #f8fafc;
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
}

.form-group {
  margin-bottom: 20px;
}

.form-group input {
  width: 100%;
  padding: 15px 20px;
  background: rgba(51, 65, 85, 0.6);
  border: 2px solid rgba(157, 80, 187, 0.3);
  border-radius: 15px;
  color: #e0e6ed;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: rgba(157, 80, 187, 0.6);
  box-shadow: 0 0 20px rgba(157, 80, 187, 0.3);
}

.form-group input::placeholder {
  color: #94a3b8;
}

.error-message {
  color: #f87171;
  text-align: center;
  margin: 15px 0;
  padding: 10px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  font-size: 0.9rem;
}

.login-submit-btn {
  width: 100%;
  background: linear-gradient(45deg, #9d50bb, #6f42c1);
  color: white;
  border: none;
  padding: 15px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin-top: 10px;
}

.login-submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #6f42c1, #00d4ff);
  transition: left 0.3s ease;
  z-index: -1;
}

.login-submit-btn:hover::before {
  left: 0;
}

.login-submit-btn span {
  position: relative;
  z-index: 1;
}

.login-submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(157, 80, 187, 0.5);
}
.role-selection-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f0f23 0%, #16213e 30%, #1a1a2e 70%, #0f3460 100%);
  color: #e0e6ed;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  text-align: center;
}

.role-selection-content {
  background: rgba(30, 41, 59, 0.95);
  padding: 50px;
  border-radius: 30px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 25px 80px rgba(0,0,0,0.5);
  border: 1px solid rgba(157, 80, 187, 0.3);
}

.role-selection-title {
  font-size: 2.5rem;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #00d4ff, #9d50bb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.role-selection-subtitle {
  font-size: 1.2rem;
  color: #94a3b8;
  margin-bottom: 30px;
}

.role-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.role-btn {
  padding: 20px;
  background: rgba(51, 65, 85, 0.6);
  color: #e2e8f0;
  border: 2px solid rgba(157, 80, 187, 0.3);
  border-radius: 20px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.role-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #9d50bb, #6f42c1);
  transition: left 0.3s ease;
  z-index: -1;
}

.role-btn:hover::before {
  left: 0;
}

.role-btn:hover {
  color: white;
  border-color: transparent;
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(157, 80, 187, 0.5);
}

.logout-btn {
  background: transparent;
  color: #94a3b8;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.logout-btn:hover {
  color: #fff;
}
@media (max-width: 480px) {
  .role-selection-content {
    padding: 30px;
  }

  .role-selection-title {
    font-size: 2rem;
  }

  .role-selection-subtitle {
    font-size: 1rem;
  }

  .role-btn {
    font-size: 1rem;
    padding: 15px;
  }
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.visitor-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #0f0f23 0%, #16213e 30%, #1a1a2e 70%, #0f3460 100%);
  min-height: 100vh;
  color: #e0e6ed;
  overflow-x: hidden;
}

.floating-shapes {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}

.shape {
  position: absolute;
  background: rgba(100, 150, 255, 0.1);
  border-radius: 50%;
  animation: float 8s ease-in-out infinite;
  box-shadow: 0 0 20px rgba(100, 150, 255, 0.2);
}

.shape:nth-child(1) { 
  width: 100px; 
  height: 100px; 
  top: 15%; 
  left: 8%; 
  animation-delay: 0s;
  background: rgba(138, 43, 226, 0.15);
}

.shape:nth-child(2) { 
  width: 150px; 
  height: 150px; 
  top: 65%; 
  left: 75%; 
  animation-delay: 3s;
  background: rgba(75, 0, 130, 0.12);
}

.shape:nth-child(3) { 
  width: 80px; 
  height: 80px; 
  top: 85%; 
  left: 15%; 
  animation-delay: 6s;
  background: rgba(72, 61, 139, 0.18);
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
  33% { transform: translateY(-30px) rotate(120deg); opacity: 0.6; }
  66% { transform: translateY(15px) rotate(240deg); opacity: 0.4; }
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 60px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-button-container {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
}

.login-btn {
  background: linear-gradient(45deg, #9d50bb, #6f42c1);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #6f42c1, #00d4ff);
  transition: left 0.3s ease;
  z-index: -1;
}

.login-btn:hover::before {
  left: 0;
}

.login-btn span {
  position: relative;
  z-index: 1;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(157, 80, 187, 0.5);
}

.logo {
  font-size: 4rem;
  font-weight: 900;
  background: linear-gradient(45deg, #00d4ff, #9d50bb, #6f42c1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 15px;
  text-shadow: 0 8px 32px rgba(157, 80, 187, 0.4);
  letter-spacing: -2px;
}

.tagline {
  font-size: 1.4rem;
  color: #b8c5d1;
  font-weight: 300;
  margin-bottom: 30px;
}

.search-section {
  text-align: center;
  margin-bottom: 50px;
}

.search-container {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.search-input {
  width: 100%;
  padding: 20px 60px 20px 25px;
  border: 2px solid rgba(157, 80, 187, 0.3);
  border-radius: 50px;
  font-size: 1.1rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  backdrop-filter: blur(20px);
  background: rgba(30, 41, 59, 0.8);
  color: #e0e6ed;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  transform: translateY(-2px);
  box-shadow: 0 15px 50px rgba(157, 80, 187, 0.4);
  border-color: rgba(157, 80, 187, 0.6);
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(45deg, #9d50bb, #6f42c1);
  border: none;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn:hover {
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 5px 20px rgba(157, 80, 187, 0.6);
}

.clubs-section {
  margin-bottom: 60px;
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-title {
  font-size: 2.8rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 15px;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #b8c5d1;
  max-width: 600px;
  margin: 0 auto;
}

.clubs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.club-card {
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  padding: 35px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0,0,0,0.4);
  transition: all 0.4s ease;
  cursor: pointer;
  border: 1px solid rgba(157, 80, 187, 0.2);
  position: relative;
  overflow: hidden;
}

.club-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(157, 80, 187, 0.2), transparent);
  transition: left 0.5s;
}

.club-card:hover::before {
  left: 100%;
}

.club-card:hover {
  transform: translateY(-15px) scale(1.02);
  box-shadow: 0 20px 60px rgba(157, 80, 187, 0.3);
  border-color: rgba(157, 80, 187, 0.4);
}

.club-icon {
  font-size: 3.5rem;
  margin-bottom: 20px;
  display: block;
  position: relative;
  z-index: 2;
}

.club-card h3 {
  font-size: 1.6rem;
  margin-bottom: 15px;
  color: #f8fafc;
  font-weight: 600;
}

.club-card p {
  color: #94a3b8;
  line-height: 1.7;
  margin-bottom: 20px;
}

.events-section {
  background: rgba(30, 41, 59, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 30px;
  padding: 50px;
  box-shadow: 0 15px 50px rgba(0,0,0,0.3);
  position: relative;
  border: 1px solid rgba(157, 80, 187, 0.2);
}

.events-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, #9d50bb, #6f42c1, #00d4ff);
  border-radius: 30px 30px 0 0;
}

.events-section .section-title {
  color: #f8fafc;
}

.events-section .section-subtitle {
  color: #94a3b8;
}

.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 15px;
}

.tab-button {
  padding: 15px 30px;
  background: rgba(51, 65, 85, 0.6);
  border: 2px solid transparent;
  border-radius: 30px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  color: #e2e8f0;
  position: relative;
  overflow: hidden;
}

.tab-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #9d50bb, #6f42c1);
  transition: left 0.3s ease;
  z-index: -1;
}

.tab-button.active::before,
.tab-button:hover::before {
  left: 0;
}

.tab-button.active,
.tab-button:hover {
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(157, 80, 187, 0.4);
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 30px;
}

.event-card {
  background: rgba(51, 65, 85, 0.6);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.3);
  transition: all 0.4s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.event-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #9d50bb, #00d4ff);
}

.event-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 40px rgba(157, 80, 187, 0.3);
  border-color: rgba(157, 80, 187, 0.3);
  background: rgba(51, 65, 85, 0.8);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.event-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 8px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.event-title:hover {
  color: #00d4ff;
}

.event-category {
  background: linear-gradient(45deg, #9d50bb, #6f42c1);
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.event-date {
  background: linear-gradient(45deg, #ec4899, #8b5cf6);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
}

.event-details {
  margin-bottom: 25px;
}

.event-detail {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: #94a3b8;
  font-weight: 500;
}

.event-detail span {
  margin-left: 10px;
}

.event-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.event-attendees {
  display: flex;
  align-items: center;
  gap: 10px;
}

.attendee-avatars {
  display: flex;
  margin-right: 10px;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(45deg, #9d50bb, #6f42c1);
  border: 2px solid rgba(30, 41, 59, 0.8);
  margin-left: -8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
}

.attendee-count {
  color: #64748b;
  font-size: 0.9rem;
}

.register-btn {
  background: linear-gradient(45deg, #9d50bb, #6f42c1);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.register-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #6f42c1, #00d4ff);
  transition: left 0.3s ease;
  z-index: -1;
}

.register-btn:hover::before {
  left: 0;
}

.register-btn span {
  position: relative;
  z-index: 1;
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(157, 80, 187, 0.5);
}

.modal {
  display: flex;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(10px);
  animation: fadeIn 0.3s ease;
  align-items: center;
  justify-content: center;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: rgba(30, 41, 59, 0.95);
  padding: 50px;
  border-radius: 30px;
  width: 90%;
  max-width: 700px;
  position: relative;
  box-shadow: 0 25px 80px rgba(0,0,0,0.5);
  animation: slideIn 0.3s ease;
  border: 1px solid rgba(157, 80, 187, 0.3);
  color: #e0e6ed;
}

@keyframes slideIn {
  from { transform: translateY(-50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.close {
  position: absolute;
  right: 25px;
  top: 20px;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  color: #64748b;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close:hover {
  color: #f8fafc;
  background: rgba(157, 80, 187, 0.2);
}

.modal h2 {
  margin-bottom: 30px;
  color: #f8fafc;
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
}

.event-detail-header {
  text-align: center;
  margin-bottom: 30px;
}

.event-detail-title {
  font-size: 2.2rem;
  color: #f8fafc;
  margin-bottom: 10px;
}

.event-detail-category {
  background: linear-gradient(45deg, #9d50bb, #6f42c1);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 600;
  display: inline-block;
}

.event-detail-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.info-item {
  background: rgba(51, 65, 85, 0.4);
  padding: 20px;
  border-radius: 15px;
  text-align: center;
}

.info-label {
  color: #94a3b8;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.info-value {
  color: #f8fafc;
  font-size: 1.2rem;
  font-weight: 600;
}

.event-detail-description {
  background: rgba(30, 41, 59, 0.6);
  padding: 25px;
  border-radius: 15px;
  margin: 30px 0;
  border: 1px solid rgba(157, 80, 187, 0.2);
}

.event-detail-description h3 {
  color: #f8fafc;
  margin-bottom: 15px;
}

.event-detail-description p {
  color: #94a3b8;
  line-height: 1.7;
}

.registration-options {
  display: grid;
  gap: 20px;
}

.option-btn {
  padding: 25px;
  background: rgba(51, 65, 85, 0.4);
  border: 2px solid rgba(157, 80, 187, 0.3);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  font-size: 1rem;
  position: relative;
  overflow: hidden;
  color: #e2e8f0;
}

.option-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #9d50bb, #6f42c1);
  transition: left 0.3s ease;
  z-index: -1;
}

.option-btn:hover::before {
  left: 0;
}

.option-btn:hover {
  color: white;
  transform: translateX(10px);
  border-color: transparent;
}

.option-btn strong {
  display: block;
  margin-bottom: 8px;
  font-size: 1.1rem;
}

.option-btn small {
  opacity: 0.8;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .logo {
    font-size: 2.5rem;
  }
  
  .login-button-container {
    position: relative;
    margin-bottom: 20px;
  }
  
  .clubs-grid,
  .events-grid {
    grid-template-columns: 1fr;
  }
  
  .tabs {
    flex-direction: column;
    align-items: center;
  }
  
  .tab-button {
    width: 250px;
  }
  
  .event-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .modal-content {
    margin: 10% auto;
    padding: 30px;
  }
  
  .event-detail-info {
    grid-template-columns: 1fr;
  }
}
.header-logo {
  height: 60px;
  margin-bottom: 20px;
}
.login-logo {
  height: 100px;
  margin-bottom: 20px;
}
`;

// ===============================================
// MAIN APP COMPONENT WITH BACKEND INTEGRATION
// ===============================================


const App = () => {
  // ========== BACKEND STATE ==========
  const [backendEvents, setBackendEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // ========== YOUR ORIGINAL STATE ==========
  const [user, setUser] = useState(null);
  
  // Your original mock events (complete list)
  const [activeEvents, setActiveEvents] = useState([
    { id: 1, title: 'Ultimate Dance Championship', category: 'Dance', categoryKey: 'dance', date: 'Aug 15', venue: 'Grand Auditorium', time: '6:00 PM - 10:00 PM', fee: 'Free Entry', attendees: 234, description: 'The Ultimate Dance Championship brings together the most talented dancers from across the campus.', status: 'approved', requestedBy: 'Dance Collective' },
    { id: 2, title: 'Battle of the Bands', category: 'Music', categoryKey: 'western', date: 'Aug 20', venue: 'Open Air Arena', time: '7:00 PM - 11:00 PM', fee: '₹75 Premium', attendees: 156, description: 'Rock the stage with electrifying performances from campus bands.', status: 'approved', requestedBy: 'Western Music Society' },
    { id: 3, title: 'Symphony Under Stars', category: 'Classical', categoryKey: 'classical', date: 'Aug 25', venue: 'Symphony Hall', time: '6:30 PM - 9:00 PM', fee: 'Free Entry', attendees: 89, description: 'Experience the profound beauty of classical music performances.', status: 'approved', requestedBy: 'Classical Harmony' },
    { id: 4, title: 'Heritage Festival', category: 'Cultural', categoryKey: 'cultural', date: 'Sep 1', venue: 'Cultural Center', time: '5:00 PM - 10:00 PM', fee: 'Free Entry', attendees: 312, description: 'Celebrate diverse cultural traditions through performances, food, and art.', status: 'approved', requestedBy: 'Cultural Heritage' },
    { id: 5, title: 'Shakespeare Night', category: 'Theatre', categoryKey: 'drama', date: 'Sep 5', venue: 'Black Box Theatre', time: '7:00 PM - 9:30 PM', fee: '₹50', attendees: 67, description: 'An evening of timeless Shakespearean drama performed by talented students.', status: 'approved', requestedBy: 'Theatre Arts' },
    { id: 6, title: 'Poetry Slam', category: 'Literary', categoryKey: 'literary', date: 'Sep 10', venue: 'Literary Hall', time: '6:00 PM - 8:00 PM', fee: 'Free Entry', attendees: 45, description: 'Express yourself through powerful spoken word poetry.', status: 'approved', requestedBy: 'Literary Circle' }
  ]);
  
  const [pendingEvents, setPendingEvents] = useState([]);
  
  const [clubs, setClubs] = useState([
    { id: 1, name: 'Dance Collective', category: 'Performing Arts', members: 120, activeEvents: 3, coordinator: 'Prof. Meena Patel', established: '2020', status: 'active' },
    { id: 2, name: 'Innovation Club', category: 'Technology', members: 85, activeEvents: 2, coordinator: 'Prof. Rajesh Kumar', established: '2019', status: 'active' },
    { id: 3, name: 'Classical Harmony', category: 'Music', members: 60, activeEvents: 1, coordinator: 'Dr. Sunita Singh', established: '2021', status: 'active' },
    { id: 4, name: 'Drama Society', category: 'Theatre', members: 45, activeEvents: 0, coordinator: 'Prof. Amit Verma', established: '2022', status: 'inactive' }
  ]);
  
  const [combinedEvents, setCombinedEvents] = useState([]);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPleaseLoginModal, setShowPleaseLoginModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [currentEventToRegister, setCurrentEventToRegister] = useState(null);
  const [tempUser, setTempUser] = useState(null);

  // ========== BACKEND INTEGRATION - LOAD USER & EVENTS ON MOUNT ==========
  useEffect(() => {
    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      loadBackendEvents();
    }
  }, []);

  // ========== BACKEND INTEGRATION - LOAD EVENTS FROM DATABASE ==========
  const loadBackendEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getAll();
      
      if (response.events && response.events.length > 0) {
        // Map backend events to your frontend format
        const mappedEvents = response.events.map(e => ({
          id: e.id,
          title: e.title,
          category: e.category,
          categoryKey: e.category.toLowerCase(),
          date: new Date(e.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          venue: e.venue,
          time: e.event_time,
          fee: e.fee || 'Free Entry',
          attendees: e.registration_count || 0,
          description: e.description,
          status: e.status,
          requestedBy: e.club_name || 'Unknown',
          created_by: e.created_by_name
        }));
        
        // Merge backend events with mock events
        const approved = mappedEvents.filter(e => e.status === 'approved');
        const pending = mappedEvents.filter(e => e.status === 'pending');
        
        setBackendEvents(mappedEvents);
        setActiveEvents(prev => [...approved, ...prev]); // Add backend events to mock
        setPendingEvents(prev => [...pending, ...prev]);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load backend events:', err);
      // Don't show error, just use mock data
    } finally {
      setLoading(false);
    }
  };

  // Combine active and pending events
  useEffect(() => {
    setCombinedEvents([...activeEvents, ...pendingEvents]);
  }, [activeEvents, pendingEvents]);

  // ========== BACKEND INTEGRATION - LOGIN ==========
  const handleLogin = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      // Try backend login first
      try {
        const response = await authAPI.login(credentials);
        
        const userData = {
          name: response.user.first_name + ' ' + response.user.last_name,
          email: response.user.email,
          role: response.user.role,
          roles: [response.user.role, 'visitor'], // Add visitor role
          id: response.user.id,
          selectedRole: response.user.role
        };
        
        setUser(userData);
        localStorage.setItem('userData', JSON.stringify(userData));
        setShowLoginModal(false);
        
        // Load events after login
        await loadBackendEvents();
        
        return;
      } catch (backendError) {
        console.log('Backend login failed, trying mock users:', backendError);
        throw backendError; // Throw to be caught by outer catch
      }
    } catch (err) {
      // Fall back to your original mock users
      const users = {
        'student@vit.ac.in': { password: 'student123', name: 'Student User', roles: ['visitor'] },
        'admin@vit.ac.in': { password: 'admin123', name: 'Club Admin', roles: ['visitor', 'admin'] },
        'faculty@vit.ac.in': { password: 'faculty123', name: 'Faculty Coordinator', roles: ['visitor', 'faculty'] },
        'head@vit.ac.in': { password: 'head123', name: 'Department Head', roles: ['visitor', 'head'] }
      };

      const userInfo = users[credentials.email];
      if (userInfo && userInfo.password === credentials.password) {
        if (userInfo.roles.length === 1) {
          setUser({ ...userInfo, email: credentials.email, selectedRole: userInfo.roles[0] });
          setShowLoginModal(false);
        } else {
          setTempUser({ ...userInfo, email: credentials.email });
          setShowRoleSelection(true);
          setShowLoginModal(false);
        }
      } else {
        setError('Invalid credentials. Please try again.');
        throw new Error('Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  // ========== BACKEND INTEGRATION - CREATE EVENT ==========
  const handlePostEvent = async (eventData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Try backend creation first if user is logged in with token
      if (localStorage.getItem('authToken')) {
        try {
          const backendEventData = {
            title: eventData.title,
            description: eventData.description,
            category: eventData.category,
            event_date: eventData.date,
            event_time: eventData.time,
            venue: eventData.venue,
            fee: eventData.fee || 'Free',
            expected_attendees: parseInt(eventData.expectedAttendees) || 0
          };
          
          await eventsAPI.create(backendEventData);
          
          // Reload events to show the new one
          await loadBackendEvents();
          
          alert('Event created successfully in database! Waiting for approval.');
          return;
        } catch (backendError) {
          console.log('Backend create failed, using mock:', backendError);
        }
      }
      
      // Fall back to your original mock creation
      const newEvent = {
        ...eventData,
        id: Date.now(),
        status: 'pending',
        requestedBy: user.name,
        estimatedBudget: eventData.fee.includes('₹') ? parseInt(eventData.fee.replace(/[^\d]/g, '')) : 0,
        attendees: 0,
        categoryKey: eventData.category.toLowerCase()
      };
      
      setPendingEvents([...pendingEvents, newEvent]);
      alert('Event request submitted!');
    } catch (err) {
      setError('Failed to create event: ' + err.message);
      alert('Error creating event: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== YOUR ORIGINAL HANDLERS ==========
  const handleSelectRole = (userWithSelectedRole) => {
    setUser(userWithSelectedRole);
    setShowRoleSelection(false);
  };

  const handleLogout = () => {
    authAPI.logout(); // Backend logout
    setUser(null);
    setShowLoginModal(false);
    setShowPleaseLoginModal(false);
    setShowRegistrationModal(false);
    setBackendEvents([]);
    localStorage.removeItem('userData');
  };

  const handleApprove = (eventId, reason) => {
    // Your original mock approval logic
    const eventToApprove = pendingEvents.find(e => e.id === eventId);
    if (eventToApprove) {
      setActiveEvents([...activeEvents, { ...eventToApprove, status: 'approved' }]);
      setPendingEvents(pendingEvents.filter(e => e.id !== eventId));
      alert(`Event Approved! Reason: ${reason}`);
    }
  };

  const handleDecline = (eventId, reason) => {
    // Your original mock decline logic
    setPendingEvents(pendingEvents.filter(e => e.id !== eventId));
    alert(`Event Declined. Reason: ${reason}`);
  };

  const handleShowLoginModal = () => setShowLoginModal(true);
  const handleCloseLoginModal = () => setShowLoginModal(false);
  
  const handleShowRegistrationModal = (event) => {
    if (!user) {
      setShowPleaseLoginModal(true);
      setCurrentEventToRegister(event);
    } else {
      setCurrentEventToRegister(event);
      setShowRegistrationModal(true);
    }
  };

  const handleCloseRegistrationModal = () => {
    setShowRegistrationModal(false);
    setCurrentEventToRegister(null);
  };

  const handleClosePleaseLoginModal = () => setShowPleaseLoginModal(false);
  
  const handleRegistration = (message) => {
    console.log(message);
    handleCloseRegistrationModal();
  };

  const renderContent = () => {
    if (showRoleSelection) {
      return <RoleSelection user={tempUser} onSelectRole={handleSelectRole} onLogout={handleLogout} />;
    }

    if (user) {
      if (user.selectedRole === 'head') {
        return <HeadPage user={user} onLogout={handleLogout} events={combinedEvents} onApprove={handleApprove} onDecline={handleDecline} />;
      }
      if (user.selectedRole === 'faculty') {
        return <FacultyPage user={user} onLogout={handleLogout} events={combinedEvents} clubs={clubs} />;
      }
      if (user.selectedRole === 'admin' || user.selectedRole === 'club_admin') {
        return <AdminPage user={user} onLogout={handleLogout} events={combinedEvents} onPostEvent={handlePostEvent} loading={loading} />;
      }
    }

    // Default to VisitorPage
    return (
      <>
        <VisitorPage
          user={user}
          onShowLoginModal={handleShowLoginModal}
          onShowRegistrationModal={handleShowRegistrationModal}
          onLogout={handleLogout}
          events={activeEvents}
        />
        {showLoginModal && (
          <Login 
            onLogin={handleLogin} 
            onShowRoleSelection={user => { setTempUser(user); setShowRoleSelection(true); }} 
            onClose={handleCloseLoginModal}
          />
        )}
        {showPleaseLoginModal && (
          <PleaseLoginModal 
            onLogin={() => { handleClosePleaseLoginModal(); handleShowLoginModal(); }} 
            onClose={handleClosePleaseLoginModal} 
          />
        )}
        {showRegistrationModal && currentEventToRegister && (
          <RegistrationModal
            event={currentEventToRegister}
            onRegister={handleRegistration}
            onClose={handleCloseRegistrationModal}
          />
        )}
      </>
    );
  };

  return (
    <>
      <style>{styles}</style>
      
      {/* Error notification */}
      {error && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'rgba(239, 68, 68, 0.9)',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '10px',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          maxWidth: '400px'
        }}>
          {error}
          <button 
            onClick={() => setError(null)}
            style={{
              marginLeft: '15px',
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            ×
          </button>
        </div>
      )}
      
      {/* Loading overlay (optional - you can remove this if you don't want it) */}
      {loading && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(157, 80, 187, 0.9)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '25px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid white',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}></div>
          Syncing...
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      {renderContent()}
    </>
  );
};



// ===============================================
// Component Definitions
// ===============================================

// AdminPage Component - WITH BACKEND INTEGRATION
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
    expectedAttendees: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    onPostEvent(formData);
    setFormData({
      title: '', category: '', date: '', time: '', venue: '', description: '', fee: '', expectedAttendees: ''
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
        <div className="form-row">
          <div className="form-group">
            <label>Entry Fee</label>
            <input type="text" name="fee" value={formData.fee} onChange={handleInputChange} placeholder="Free or ₹Amount" />
          </div>
          <div className="form-group">
            <label>Expected Attendees</label>
            <input type="number" name="expectedAttendees" value={formData.expectedAttendees} onChange={handleInputChange} min="1" placeholder="Number of expected attendees" />
          </div>
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
        <img src="https://cdn.glitch.global/e9b89736-2317-48f5-93ec-e866f7f722cb/image_999098.jpg?v=1725330366624" alt="VIT Logo" className="header-logo" />
        <h1>Club Admin Dashboard</h1>
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

// FacultyPage Component
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
        <img src="https://cdn.glitch.global/e9b89736-2317-48f5-93ec-e866f7f722cb/image_999098.jpg?v=1725330366624" alt="VIT Logo" className="header-logo" />
        <h1>Faculty Coordinator Dashboard</h1>
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

// HeadPage Component
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
        <img src="https://cdn.glitch.global/e9b89736-2317-48f5-93ec-e866f7f722cb/image_999098.jpg?v=1725330366624" alt="VIT Logo" className="header-logo" />
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

// Login Component
// Login Component - WITH BACKEND INTEGRATION
const Login = ({ onLogin, onShowRoleSelection, onClose }) => {
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
          <img 
            src="https://cdn.glitch.global/e9b89736-2317-48f5-93ec-e866f7f722cb/image_999098.jpg?v=1725330366624" 
            alt="VIT Logo" 
            className="login-logo" 
          />
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
        
        {/* ⭐ NEW: Helpful hint for testing */}
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          background: 'rgba(0, 212, 255, 0.1)', 
          borderRadius: '10px',
          fontSize: '0.85rem',
          color: '#94a3b8'
        }}>
          <strong>Test Accounts:</strong><br/>
          Database: admin@vitap.ac.in / admin123<br/>
          Mock: admin@vit.ac.in / admin123
        </div>
      </div>
    </div>
  );
};

// RoleSelection Component
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

// PleaseLoginModal Component
const PleaseLoginModal = ({ onLogin, onClose }) => (
  <div className="modal">
    <div className="modal-content">
      <span className="close" onClick={onClose}>&times;</span>
      <h2>You are not logged in!</h2>
      <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '20px' }}>
        Please log in to register for this event.
      </p>
      <button className="login-submit-btn" onClick={onLogin}>
        <span>Go to Login</span>
      </button>
    </div>
  </div>
);

// VisitorPage Component
const VisitorPage = ({ user, onShowLoginModal, onShowRegistrationModal, onLogout, events }) => {
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
      onShowLoginModal();
    } else {
      onShowRegistrationModal(event);
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
          <img src="https://cdn.glitch.global/e9b89736-2317-48f5-93ec-e866f7f722cb/image_999098.jpg?v=1725330366624" alt="VIT Logo" className="header-logo" />
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
            {getFilteredEvents().map(event => (
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

// RegistrationModal Component
const RegistrationModal = ({ event, onRegister, onClose }) => {
  const handleRegistrationType = (type) => {
    const messages = {
      organizer: '🎯 Welcome to the organizing team! Check your email for details.',
      volunteer: '🤝 Thank you for volunteering! You will receive guidelines shortly.',
      performer: '🎭 Exciting! Performance details will be sent within 24 hours.',
      vip: '⭐ VIP registration confirmed! Exclusive access details coming soon.',
      general: '🎪 You are in! Event updates will be shared soon.'
    };
    onRegister(messages[type] || 'Registration successful!');
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Join {event.title}</h2>
        <div className="registration-options">
          <div className="option-btn" onClick={() => handleRegistrationType('organizer')}><strong>🎯 Event Organizer</strong><small>Lead the event planning and coordinate teams</small></div>
          <div className="option-btn" onClick={() => handleRegistrationType('volunteer')}><strong>🤝 Community Volunteer</strong><small>Support the event and be part of the magic</small></div>
          <div className="option-btn" onClick={() => handleRegistrationType('performer')}><strong>🎭 Featured Performer</strong><small>Showcase your talent to an enthusiastic audience</small></div>
          <div className="option-btn" onClick={() => handleRegistrationType('vip')}><strong>⭐ VIP Experience</strong><small>Enjoy premium seating and exclusive access</small></div>
          <div className="option-btn" onClick={() => handleRegistrationType('general')}><strong>🎪 General Admission</strong><small>Join as part of our amazing audience</small></div>
        </div>
      </div>
    </div>
  );
};

// ===============================================
// ALL YOUR ORIGINAL COMPONENTS (UNCHANGED)
// Copy ALL your components here: AdminPage, FacultyPage, HeadPage, Login, RoleSelection, VisitorPage, RegistrationModal, PleaseLoginModal
// The ONLY change is AdminPage gets a "loading" prop
// ===============================================



// Copy ALL your other components here EXACTLY as they were:
// - FacultyPage
// - HeadPage  
// - Login (add loading prop)
// - RoleSelection
// - VisitorPage
// - RegistrationModal
// - PleaseLoginModal


// PASTE ALL YOUR OTHER COMPONENTS HERE (RoleSelection, PleaseLoginModal, VisitorPage, RegistrationModal, FacultyPage, HeadPage)

export default App;