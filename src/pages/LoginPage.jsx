import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './LoginPage.css';

const DEPARTMENTS = [
  'Equity Trading', 'Derivatives', 'Fixed Income', 'Research & Analytics',
  'Risk Management', 'Portfolio Management', 'Compliance', 'Technology',
  'Operations', 'Prime Brokerage',
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm] = useState({
    name: '', department: 'Equity Trading', desk_number: '', avatar_url: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // const generatedId = React.useMemo(() => crypto.randomUUID().split('-')[0].toUpperCase(), []);
  // Replace the crypto.randomUUID line with this:
  const generatedId = React.useMemo(() => Math.floor(Math.random() * 10000), []);

  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name        = 'Full name is required';
    if (!form.desk_number.trim()) e.desk_number = 'Desk number is required';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => {
      login({ ...form, user_id: generatedId });
      navigate('/dashboard');
    }, 900);
  };

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  };

  return (
    <div className="login-root">
      {/* Background grid */}
      <div className="login-bg-grid" aria-hidden="true"/>

      {/* Floating ticker strip */}
      <div className="login-ticker-strip" aria-hidden="true">
        {['NIFTY 50 ▲ 22,483 +0.38%', 'SENSEX ▲ 73,935 +0.31%', 'RELIANCE ▲ ₹2,847', 'TCS ▲ ₹3,924', 'INFY ▲ ₹1,579', 'HDFC ▲ ₹1,748', 'BHARTIARTL ▼ ₹1,621', 'SBIN ▲ ₹782', 'ITC ▲ ₹453'].join('   ·   ')}
      </div>

      <main className="login-card-wrapper">
        {/* Brand */}
        <div className="login-brand">
          <span className="login-brand-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
            </svg>
          </span>
          <span className="login-brand-name">DeskDirect</span>
          <span className="login-brand-tag">Trading Floor Intercom</span>
        </div>

        {/* Card */}
        <div className="login-card">
          <div className="login-card-header">
            <h1 className="login-title">Operator Sign-In</h1>
            <p className="login-subtitle">Authenticate to access your trading terminal</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* User ID — auto generated, read only */}
            <div className="login-field">
              <label className="login-label" htmlFor="uid">
                User ID
                <span className="login-badge-auto">AUTO</span>
              </label>
              <input
                id="uid"
                className="login-input login-input-mono"
                value={generatedId}
                readOnly
                aria-describedby="uid-desc"
              />
              <span id="uid-desc" className="login-hint">Unique identifier assigned to this session</span>
            </div>

            {/* Full Name */}
            <div className="login-field">
              <label className="login-label" htmlFor="uname">Full Name <span className="login-req">*</span></label>
              <input
                id="uname"
                className={`login-input ${errors.name ? 'error' : ''}`}
                placeholder="e.g. Arjun Mehta"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                autoComplete="name"
              />
              {errors.name && <span className="login-error">{errors.name}</span>}
            </div>

            {/* Department */}
            <div className="login-field">
              <label className="login-label" htmlFor="dept">Department</label>
              <select
                id="dept"
                className="login-input login-select"
                value={form.department}
                onChange={e => set('department', e.target.value)}
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Desk Number */}
            <div className="login-field">
              <label className="login-label" htmlFor="desk">Desk Number <span className="login-req">*</span></label>
              <input
                id="desk"
                className={`login-input login-input-mono ${errors.desk_number ? 'error' : ''}`}
                placeholder="e.g. EQ-A04"
                value={form.desk_number}
                onChange={e => set('desk_number', e.target.value.toUpperCase())}
              />
              {errors.desk_number && <span className="login-error">{errors.desk_number}</span>}
            </div>

            {/* Avatar URL */}
            <div className="login-field">
              <label className="login-label" htmlFor="avatar">Avatar URL <span className="login-optional">(optional)</span></label>
              <input
                id="avatar"
                className="login-input"
                placeholder="https://example.com/photo.jpg"
                value={form.avatar_url}
                onChange={e => set('avatar_url', e.target.value)}
                type="url"
              />
              <span className="login-hint">Leave blank to use initials avatar</span>
            </div>

            <button type="submit" className={`login-submit ${loading ? 'loading' : ''}`} disabled={loading}>
              {loading ? (
                <><span className="login-spinner"/><span>Authenticating…</span></>
              ) : (
                <><span>Access Terminal</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="login-footer">DeskDirect v2.0 · Encrypted P2P Intercom · NSE/BSE Data Feed</p>
      </main>
    </div>
  );
}
