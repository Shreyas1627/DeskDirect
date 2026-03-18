import React, { useState, useEffect } from 'react';
import { useMarketData } from '../hooks/useMarketData';
import { NIFTY_STOCKS } from '../data/indianStocks';
import './AlertsPage.css';

const CONDITIONS = ['Above', 'Below'];
let alertIdCounter = 100;

export default function AlertsPage() {
  const { stocks } = useMarketData();
  const [alerts, setAlerts] = useState([
    { id: 1, symbol: 'RELIANCE',  condition: 'Above', target: 2900, triggered: false, createdAt: '09:15', note: 'Breakout level' },
    { id: 2, symbol: 'TCS',       condition: 'Below', target: 3850, triggered: false, createdAt: '09:22', note: 'Support check'  },
    { id: 3, symbol: 'HDFCBANK',  condition: 'Above', target: 1780, triggered: false, createdAt: '10:01', note: ''              },
  ]);
  const [history, setHistory] = useState([]);

  // Form state
  const [form, setForm] = useState({ symbol: 'RELIANCE', condition: 'Above', target: '', note: '' });
  const [formErr, setFormErr] = useState('');

  // Check alerts against live prices
  useEffect(() => {
    if (!stocks.length) return;
    setAlerts(prev => {
      const updated = [];
      const triggered = [];
      prev.forEach(a => {
        const stock = stocks.find(s => s.symbol === a.symbol);
        if (!stock || a.triggered) { updated.push(a); return; }
        const isTriggered = (a.condition === 'Above' && stock.price >= a.target)
                         || (a.condition === 'Below' && stock.price <= a.target);
        if (isTriggered) {
          triggered.push({ ...a, triggeredAt: new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' }), actualPrice: stock.price, triggered: true });
        } else {
          updated.push(a);
        }
      });
      if (triggered.length) setHistory(h => [...triggered, ...h].slice(0, 20));
      return updated;
    });
  }, [stocks]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.target || isNaN(+form.target)) { setFormErr('Enter a valid target price'); return; }
    setAlerts(prev => [
      { id: ++alertIdCounter, ...form, target: +form.target, triggered: false,
        createdAt: new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' }) },
      ...prev,
    ]);
    setForm(f => ({ ...f, target: '', note: '' }));
    setFormErr('');
  };

  const handleDelete = (id) => setAlerts(prev => prev.filter(a => a.id !== id));

  const fmt = n => n?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) ?? '—';

  return (
    <div className="alerts-root">
      {/* ── Create Alert ─────────────────────────────────── */}
      <section className="alerts-create-panel">
        <div className="alerts-panel-hdr">CREATE PRICE ALERT</div>
        <form className="alerts-form" onSubmit={handleCreate}>
          <div className="alerts-form-row">
            <div className="alerts-field">
              <label className="alerts-label">STOCK</label>
              <select className="alerts-input" value={form.symbol} onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))}>
                {NIFTY_STOCKS.map(s => <option key={s.symbol} value={s.symbol}>{s.symbol} — {s.name}</option>)}
              </select>
            </div>
            <div className="alerts-field">
              <label className="alerts-label">CONDITION</label>
              <select className="alerts-input" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}>
                {CONDITIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="alerts-field">
              <label className="alerts-label">TARGET PRICE (₹) <span className="alerts-req">*</span></label>
              <input className={`alerts-input alerts-input-mono ${formErr ? 'err' : ''}`}
                placeholder="e.g. 2950.00" type="number" step="0.05"
                value={form.target} onChange={e => { setForm(f => ({ ...f, target: e.target.value })); setFormErr(''); }}/>
              {formErr && <span className="alerts-err">{formErr}</span>}
            </div>
            <div className="alerts-field">
              <label className="alerts-label">NOTE (optional)</label>
              <input className="alerts-input" placeholder="Breakout, support..."
                value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} maxLength={50}/>
            </div>
            <button type="submit" className="alerts-create-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              SET ALERT
            </button>
          </div>
        </form>
      </section>

      <div className="alerts-main">
        {/* ── Active Alerts ──────────────────────────────────── */}
        <section className="alerts-panel">
          <div className="alerts-panel-hdr">
            ACTIVE ALERTS
            <span className="alerts-count-badge">{alerts.length}</span>
          </div>
          {alerts.length === 0 ? (
            <div className="alerts-empty">No active alerts. Create one above.</div>
          ) : (
            <ul className="alerts-list">
              {alerts.map(a => {
                const stock = stocks.find(s => s.symbol === a.symbol);
                const ltp   = stock?.price || null;
                const dist  = ltp ? a.condition === 'Above'
                  ? a.target - ltp
                  : ltp - a.target : null;
                const close = dist !== null && Math.abs(dist) < a.target * 0.01;
                return (
                  <li key={a.id} className={`alerts-row ${close ? 'close' : ''}`}>
                    <div className="alerts-row-left">
                      <span className="arow-sym">{a.symbol}</span>
                      <span className={`arow-cond ${a.condition === 'Above' ? 'up' : 'dn'}`}>
                        {a.condition === 'Above' ? '▲' : '▼'} {a.condition} ₹{fmt(a.target)}
                      </span>
                      {a.note && <span className="arow-note">{a.note}</span>}
                    </div>
                    <div className="alerts-row-right">
                      <div className="arow-ltp">
                        LTP: <span className={stock?.changePct >= 0 ? 'up' : 'dn'}>₹{ltp ? fmt(ltp) : '—'}</span>
                      </div>
                      {dist !== null && (
                        <div className={`arow-dist ${close ? 'close-dist' : ''}`}>
                          {Math.abs(dist) < 0.01 ? '⚡ AT TARGET' : `${Math.abs(dist).toFixed(2)} away`}
                        </div>
                      )}
                      <span className="arow-time">{a.createdAt}</span>
                      <button className="arow-del-btn" onClick={() => handleDelete(a.id)} aria-label="Delete alert">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                          <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ── Alert History ──────────────────────────────────── */}
        <section className="alerts-panel alerts-history-panel">
          <div className="alerts-panel-hdr">
            TRIGGERED HISTORY
            <span className="alerts-count-badge">{history.length}</span>
          </div>
          {history.length === 0 ? (
            <div className="alerts-empty">No triggers yet.</div>
          ) : (
            <ul className="alerts-list">
              {history.map((a, i) => (
                <li key={i} className="alerts-row triggered">
                  <div className="alerts-row-left">
                    <span className="arow-sym">{a.symbol}</span>
                    <span className={`arow-cond ${a.condition === 'Above' ? 'up' : 'dn'}`}>
                      {a.condition === 'Above' ? '▲' : '▼'} {a.condition} ₹{fmt(a.target)}
                    </span>
                  </div>
                  <div className="alerts-row-right">
                    <span className="arow-triggered-badge">✓ TRIGGERED</span>
                    <span className="arow-actual">@₹{fmt(a.actualPrice)}</span>
                    <span className="arow-time">{a.triggeredAt}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
