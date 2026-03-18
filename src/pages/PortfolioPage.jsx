import React, { useMemo } from 'react';
import { useMarketData } from '../hooks/useMarketData';
import { NIFTY_STOCKS } from '../data/indianStocks';
import './PortfolioPage.css';

const fmt  = n => n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
const fmtC = (n, pct = false) => (n >= 0 ? '+' : '') + (pct ? n.toFixed(2) + '%' : '₹' + fmt(n));

// Sector allocation from portfolio
function useSectorAlloc(portfolio) {
  return useMemo(() => {
    const map = {};
    portfolio.forEach(h => {
      const sector = NIFTY_STOCKS.find(s => s.symbol === h.symbol)?.sector || 'Other';
      map[sector] = (map[sector] || 0) + h.current;
    });
    const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
    const COLORS = ['#38bdf8','#22c55e','#a78bfa','#f59e0b','#ef4444','#06b6d4','#10b981','#8b5cf6','#f97316','#ec4899'];
    return Object.entries(map).map(([k, v], i) => ({
      label: k, value: v, pct: (v / total) * 100, color: COLORS[i % COLORS.length],
    })).sort((a, b) => b.value - a.value);
  }, [portfolio]);
}

// Simple SVG donut
function DonutChart({ slices }) {
  const R = 48, CX = 60, CY = 60, stroke = 14;
  const circ = 2 * Math.PI * R;
  let offset = 0;
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke}/>
      {slices.map((s, i) => {
        const dash = (s.pct / 100) * circ;
        const el = (
          <circle key={i} cx={CX} cy={CY} r={R}
            fill="none" stroke={s.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={circ - offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${CX} ${CY})`}
          />
        );
        offset += dash;
        return el;
      })}
      <text x={CX} y={CY - 4} textAnchor="middle" fontSize="9" fill="rgba(122,136,153,0.9)" fontFamily="JetBrains Mono,monospace">ALLOC</text>
      <text x={CX} y={CY + 10} textAnchor="middle" fontSize="8" fill="rgba(122,136,153,0.7)" fontFamily="JetBrains Mono,monospace">BY SECTOR</text>
    </svg>
  );
}

export default function PortfolioPage() {
  const { portfolio, summary } = useMarketData();
  const sectors = useSectorAlloc(portfolio);

  return (
    <div className="port-root">
      {/* ── Summary Cards ─────────────────────────────────── */}
      <div className="port-summary-strip">
        {[
          { label: 'INVESTED',      val: '₹' + fmt(summary.totalInvested), clr: 'neutral' },
          { label: 'CURRENT VALUE', val: '₹' + fmt(summary.totalCurrent),  clr: 'neutral' },
          { label: 'TOTAL P&L',     val: fmtC(summary.totalPnL),           clr: summary.totalPnL >= 0 ? 'up' : 'dn' },
          { label: 'DAY P&L',       val: fmtC(summary.dayPnL),             clr: summary.dayPnL >= 0 ? 'up' : 'dn'   },
          { label: 'RETURN',        val: fmtC((summary.totalPnL / summary.totalInvested) * 100, true), clr: summary.totalPnL >= 0 ? 'up' : 'dn' },
        ].map(({ label, val, clr }) => (
          <div key={label} className="port-summary-card">
            <span className="port-summary-label">{label}</span>
            <span className={`port-summary-val ${clr}`}>{val}</span>
          </div>
        ))}
      </div>

      {/* ── Main Grid ─────────────────────────────────────── */}
      <div className="port-main">
        {/* Holdings table */}
        <section className="port-table-wrap">
          <div className="port-panel-hdr">HOLDINGS ({portfolio.length})</div>
          <div className="port-table-scroll">
            <table className="port-table">
              <thead>
                <tr>
                  {['SYMBOL','COMPANY','QTY','AVG COST','LTP','INVESTED','CURRENT','P&L','RETURN'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {portfolio.map(h => (
                  <tr key={h.symbol}>
                    <td className="td-sym">{h.symbol}</td>
                    <td className="td-name">{h.name?.split(' ').slice(0,2).join(' ')}</td>
                    <td>{h.qty}</td>
                    <td>₹{fmt(h.avgCost)}</td>
                    <td className={h.changePct >= 0 ? 'up' : 'dn'}>₹{fmt(h.ltp)}</td>
                    <td>₹{fmt(h.invested)}</td>
                    <td>₹{fmt(h.current)}</td>
                    <td className={h.pnl >= 0 ? 'up' : 'dn'}>{fmtC(h.pnl)}</td>
                    <td className={h.pnlPct >= 0 ? 'up' : 'dn'}>{fmtC(h.pnlPct, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Sector allocation */}
        <aside className="port-alloc-wrap">
          <div className="port-panel-hdr">SECTOR ALLOCATION</div>
          <div className="port-alloc-body">
            <DonutChart slices={sectors} />
            <ul className="port-alloc-legend">
              {sectors.map(s => (
                <li key={s.label} className="port-alloc-item">
                  <span className="port-alloc-dot" style={{ background: s.color }}/>
                  <span className="port-alloc-name">{s.label}</span>
                  <span className="port-alloc-pct">{s.pct.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
