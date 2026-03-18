import React from 'react';
import '../styles/UserProfile.css';

export function UserProfile({ user, onBack, onCallUser }) {
  if (!user) return null;

  // Use the same avatar color logic from RosterPanel, or a default
  const avatarId = user.id ? user.id.charCodeAt(0) : 0;
  const AVATAR_COLORS = [
    '#2563eb', '#7c3aed', '#0891b2', '#059669',
    '#d97706', '#dc2626', '#0284c7', '#6d28d9',
  ];
  const bgColor = AVATAR_COLORS[avatarId % AVATAR_COLORS.length];

  return (
    <div className="user-profile-panel" role="dialog" aria-label={`Profile of ${user.name}`}>
      
      {/* ── Header with Back Button ────────────────── */}
      <div className="profile-header">
        <button className="profile-back-btn" onClick={onBack} aria-label="Back to directory">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <span className="profile-header-title">Agent Profile</span>
      </div>

      {/* ── Profile Content ────────────────────────── */}
      <div className="profile-content">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar" style={{ background: bgColor }} aria-hidden="true">
            {user.initials}
          </div>
          <span className="profile-status-dot" title="Online" />
        </div>

        <h2 className="profile-name">{user.name}</h2>
        <p className="profile-role">{user.department || 'Equities Trading'} · {user.desk}</p>

        <div className="profile-details">
          <div className="pd-row">
            <span className="pd-label">ID</span>
            <span className="pd-val">{user.id}</span>
          </div>
          <div className="pd-row">
            <span className="pd-label">Status</span>
            <span className="pd-val text-neon-green">Online</span>
          </div>
          <div className="pd-row">
            <span className="pd-label">Local Time</span>
            <span className="pd-val">IST (UTC+5:30)</span>
          </div>
        </div>
      </div>

      {/* ── Actions ────────────────────────────────── */}
      <div className="profile-actions">
        <button className="profile-call-btn" onClick={() => onCallUser(user)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
          </svg>
          START SECURE CALL
        </button>
      </div>

    </div>
  );
}
