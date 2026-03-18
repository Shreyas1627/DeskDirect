import React from 'react';
import { useCallTimer } from '../hooks/useCallTimer';
import '../styles/ActiveSession.css';

// ─── State 3: The Active Session (In-Call Interface) ──────────────

const WAVEFORM_BARS = [30, 50, 70, 90, 65, 100, 75, 55, 85, 45, 35];

export function ActiveSession({ 
  activeUser, 
  callState,
  isIncoming,     // NEW PROP: Determines if we are calling or being called
  isMuted, 
  onToggleMute, 
  onEndCall,
  onAcceptCall   
}) {
  // Only start the timer if the call is actually connected!
  const elapsed = useCallTimer(callState === 'connected');

  return (
    // Added fallback for aria-label in case activeUser is null during render
    <div className="active-session" role="dialog" aria-label={`Active call with ${activeUser?.name || 'Unknown'}`}>

      {/* ── Header (Always Visible) ──────────────────────────────── */}
      <div className="active-header">
        <div className="active-secure-badge">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
          </svg>
          {callState === 'connected' ? 'SECURE LINE' : 'CONNECTING...'}
        </div>
        
        {/* FIXED: Optional chaining (?.) prevents crashes if activeUser is delayed */}
        <div className="active-user-name">{activeUser?.name || 'Unknown Operator'}</div>
        <div className="active-desk-tag">{activeUser?.department || activeUser?.desk || 'Connecting'}</div>
      </div>

      {/* ── Ringing State (Split Caller vs Receiver UI) ────────── */}
      {callState === 'ringing' && (
        <div className="active-ringing-container" style={{ textAlign: 'center', margin: '2rem 0' }}>
          
          {/* Dynamically change text based on who initiated the call */}
          <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>
            {isIncoming ? 'Incoming Call...' : `Calling ${activeUser?.name || 'Operator'}...`}
          </h3>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            {/* ONLY show the green Accept button if you are the one receiving the call! */}
            {isIncoming && (
              <button 
                className="active-accept-btn" 
                onClick={onAcceptCall}
                style={{ backgroundColor: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ACCEPT CALL
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Connected State ─────────────────────────────────────── */}
      {callState === 'connected' && (
        <>
          {/* Timer */}
          <div className="active-timer" aria-label="Call duration" aria-live="polite">
            <span className="active-timer-dot" aria-hidden="true"/>
            <span className="active-timer-display">{elapsed}</span>
          </div>

          {/* Audio Waveform Visualizer */}
          <div className="active-waveform" aria-hidden="true" role="presentation">
            {WAVEFORM_BARS.map((h, i) => (
              <div
                key={i}
                className="waveform-bar"
                style={{
                  '--bar-height': `${h}%`,
                  '--bar-delay': `${i * 0.07}s`,
                }}
              />
            ))}
          </div>
          <p className="active-waveform-label">Live Audio Stream · P2P Encrypted</p>

          {/* Controls (Mute Only visible when connected) */}
          <div className="active-controls">
            <div className="active-mute-group">
              <button
                className={`active-mute-btn ${isMuted ? 'muted' : 'unmuted'}`}
                onClick={onToggleMute}
                aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                aria-pressed={isMuted}
              >
                {isMuted ? (
                  /* Mic-off icon (slashed) */
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="1" y1="1" x2="23" y2="23"/>
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
                    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                ) : (
                  /* Mic-on icon */
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                )}
              </button>
              <span className="active-mute-label">{isMuted ? 'MUTED' : 'MIC ON'}</span>
            </div>

            {/* End Call Button (Moved inside controls block) */}
            <button
              className="active-end-call-btn"
              onClick={onEndCall}
              aria-label="End call"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
              </svg>
              END CALL
            </button>
          </div>
        </>
      )}

      {/* Show End Call button during Ringing state too, so they can cancel the call */}
      {callState === 'ringing' && (
         <div className="active-controls" style={{ justifyContent: 'center', marginTop: '1rem' }}>
            <button className="active-end-call-btn" onClick={onEndCall} aria-label="End call">
              {/* Dynamically change text depending on if we are calling or receiving */}
              {isIncoming ? 'DECLINE' : 'CANCEL'}
            </button>
         </div>
      )}
    </div>
  );
}