import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMarketData } from '../hooks/useMarketData';
import { DeskDirectWidget } from './DeskDirectWidget';
import './Dashboard.css';

function fmt(n) { return n.toLocaleString('en-IN', { maximumFractionDigits: 2 }); }
function fmtChg(n) { return (n >= 0 ? '+' : '') + n.toFixed(2); }

const NAV_ITEMS = [
  { to: '/dashboard',            label: 'Markets'   },
  { to: '/dashboard/portfolio',  label: 'Portfolio' },
  { to: '/dashboard/analytics',  label: 'Analytics' },
  { to: '/dashboard/risk',       label: 'Risk'      },
  { to: '/dashboard/alerts',     label: 'Alerts'    },
];

export function Dashboard() {
  const { user, logout, initials } = useAuth();
  const navigate = useNavigate();
  const { indices, stocks, marketOpen } = useMarketData();
  const [istTime, setIstTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date(Date.now() + 19800000); // UTC+5:30
      setIstTime(now.toISOString().substr(11, 8));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  // Ticker scrolling data
  const tickerData = [
    ...Object.values(indices).map(i => ({ label: i.name, value: fmt(i.value), chg: fmtChg(i.changePct) + '%', up: i.changePct >= 0 })),
    ...stocks.slice(0, 15).map(s => ({ label: s.symbol, value: '₹' + fmt(s.price), chg: fmtChg(s.changePct) + '%', up: s.changePct >= 0 })),
  ];

  return (
    <div className="dash-shell">
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <header className="dash-topbar">
        <NavLink to="/dashboard" className="dash-logo" style={{ textDecoration: 'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--neon-blue)' }}>
            <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
          </svg>
          <span>Desk<span className="dash-logo-accent">Direct</span></span>
        </NavLink>

        <nav className="dash-nav" aria-label="Main navigation">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) => `dash-nav-item ${isActive ? 'active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="dash-topbar-right">
          <div className="dash-clock">
            <span className="dash-clock-label">IST</span>
            <span className="dash-clock-time">{istTime}</span>
            <span className={`dash-market-status ${marketOpen ? 'open' : 'closed'}`}>
              {marketOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>
          <div className="dash-user-pill">
            <div className="dash-avatar" style={{ backgroundImage: user?.avatar_url ? `url(${user.avatar_url})` : 'none' }}>
              {!user?.avatar_url && initials}
            </div>
            <div className="dash-user-info">
              <span className="dash-user-name">{user?.name}</span>
              <span className="dash-user-desk">{user?.desk_number} · {user?.department?.split(' ')[0]}</span>
            </div>
            <button className="dash-logout-btn" onClick={handleLogout} title="Sign out" aria-label="Sign out">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Live Ticker Band ─────────────────────────────────── */}
      <div className="dash-ticker-wrap" aria-label="Live market data">
        <div className="dash-ticker-inner">
          {[...tickerData, ...tickerData].map((t, i) => (
            <span key={i} className={`dash-ticker-item ${t.up ? 'up' : 'dn'}`}>
              <span className="dash-ticker-sym">{t.label}</span>
              <span className="dash-ticker-val">{t.value}</span>
              <span className="dash-ticker-chg">{t.up ? '▲' : '▼'} {t.chg}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Page Content & Sidebar ─────────────────────────────── */}
      <div className="dash-main-wrap">
        <main className="dash-page">
          <Outlet />
        </main>

        <aside className="dash-sidebar">
          {/* ── DeskDirect Intercom Widget ───────────────────────── */}
          {user && <DeskDirectWidget currentUser={user} />}
        </aside>
      </div>
    </div>
  );
}
