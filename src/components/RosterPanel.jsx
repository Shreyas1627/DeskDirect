import React from 'react';
import '../styles/RosterPanel.css';

// Avatar color palette — deterministic per user index
const AVATAR_COLORS = [
  '#2563eb', '#7c3aed', '#0891b2', '#059669',
  '#d97706', '#dc2626', '#0284c7', '#6d28d9',
];

// ─── State 2: The Roster (Expanded Directory) ────────────────────
// roster: array from getOnlineRoster() (database team)
// onCallUser(user): placeholder binding for startCall(targetUserId)
export function RosterPanel({ roster, onClose, onCallUser, onViewProfile }) {
  return (
    <div className="roster-panel" role="dialog" aria-label="DeskDirect Intercom">
      {/* Header */}
      <div className="roster-header">
        <div className="roster-header-left">
          <span className="roster-header-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
            </svg>
          </span>
          <span className="roster-header-title">DeskDirect Intercom</span>
        </div>
      </div>

      {/* Online count strip */}
      <div className="roster-count-strip">
        <span className="roster-presence-dot" aria-hidden="true"/>
        <span className="roster-count-text">{roster.length} agents online</span>
      </div>

      {/* Scrollable user list */}
      <ul className="roster-list" role="list">
        {roster.map((user, idx) => (
          <li key={user.id} className="roster-row" onClick={() => onViewProfile(user)} style={{ cursor: 'pointer' }}>
            {/* Avatar */}
            <div
              className="roster-avatar"
              style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
              aria-hidden="true"
            >
              {user.initials}
            </div>

            {/* User info */}
            <div className="roster-user-info">
              <span className="roster-user-name">{user.name}</span>
              <span className="roster-user-desk">{user.desk}</span>
            </div>

            {/* Presence indicator */}
            <span className="roster-user-dot" title="Online" aria-label="Online"/>

            {/* CALL button — placeholder for startCall(targetUserId) */}
            <button
              className="roster-call-btn"
              onClick={(e) => { e.stopPropagation(); onCallUser(user); }}
              aria-label={`Call ${user.name}`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 5 }}>
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
              </svg>
              CALL
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
