import React from 'react';
import '../styles/AnchorPill.css';

// ─── State 1: The Anchor (Minimized) ────────────────────────────
// Badge count rendered from roster.length, which maps to getOnlineRoster().length
export function AnchorPill({ onlineCount, onClick }) {
  return (
    <button className="anchor-pill" onClick={onClick} aria-label="Open DeskDirect Intercom">
      <span className="anchor-icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
        </svg>
      </span>
      <span className="anchor-label">DeskDirect</span>
      <span className="anchor-badge" aria-label={`${onlineCount} users online`}>
        {onlineCount} Online
      </span>
    </button>
  );
}
