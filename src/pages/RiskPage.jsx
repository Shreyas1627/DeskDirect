import React, { useMemo } from 'react';
import { useMarketData } from '../hooks/useMarketData';
import './RiskPage.css';

const fmt  = n => n.toLocaleString('en-IN', { maximumFractionDigits: 2 });

// Simulated risk metrics from portfolio
function useRiskMetrics(portfolio, summary) {
  return useMemo(() => {
    const total = summary.totalCurrent || 1;
    // Position concentration
    const positions = portfolio.map(h => ({
      symbol: h.symbol, name: h.name?.split(' ').slice(0,2).join(' '),
      pct: (h.current / total) * 100, value: h.current, pnlPct: h.pnlPct,
    })).sort((a, b) => b.pct - a.pct);

    const var95 = total * 0.018; // simplified 1-day VaR at 95%
    const var99 = total * 0.028;
    const beta  = 0.87 + Math.random() * 0.2;
    const sharpe = 1.2 + Math.random() * 0.5;
    const maxDD = -(3.8 + Math.random() * 2.5);
    const marginUsed = 62.4 + (Math.random() - 0.5) * 2;
    const marginLimit = 100;

    return { positions, var95, var99, beta, sharpe, maxDD, marginUsed, marginLimit };
  }, [portfolio, summary]);
}

// SVG ring gauge
function RingGauge({ pct, label, color }) {
  const R = 42, CX = 50, CY = 50, stroke = 10;
  const circ = 2 * Math.PI * R;
  const dashFg = (pct / 100) * circ;
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke}/>
      <circle cx={CX} cy={CY} r={R} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dashFg} ${circ - dashFg}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
        transform={`rotate(-90 ${CX} ${CY})`}
        style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
      />
      <text x={CX} y={CY - 4} textAnchor="middle" fontSize="14" fontWeight="700" fill="#e8edf4" fontFamily="JetBrains Mono,monospace">
        {pct.toFixed(1)}%
      </text>
      <text x={CX} y={CY + 12} textAnchor="middle" fontSize="8" fill="rgba(122,136,153,0.9)" fontFamily="JetBrains Mono,monospace">
        {label}
      </text>
    </svg>
  );
}

export default function RiskPage() {
  const { portfolio, summary } = useMarketData();
  const risk = useRiskMetrics(portfolio, summary);

  const varColor = risk.marginUsed > 80 ? '#ef4444' : risk.marginUsed > 60 ? '#f59e0b' : '#22c55e';

  return (
    <div className="risk-root">
      <div className="risk-page-hdr">
        <h2 className="risk-title">Risk Dashboard</h2>
        <span className="risk-sub">Portfolio risk metrics · Confidence intervals at 95% & 99%</span>
      </div>

      <div className="risk-grid">
        {/* ── VaR Cards ─────────────────────────────────────── */}
        <div className="risk-var-strip">
          {[
            { label: '1-Day VaR (95%)',  val: '₹' + fmt(risk.var95), note: 'Max expected loss' },
            { label: '1-Day VaR (99%)',  val: '₹' + fmt(risk.var99), note: 'Stress scenario' },
            { label: 'Portfolio Beta',   val: risk.beta.toFixed(2),  note: 'vs NIFTY 50' },
            { label: 'Sharpe Ratio',     val: risk.sharpe.toFixed(2),note: '12-month rolling' },
            { label: 'Max Drawdown',     val: risk.maxDD.toFixed(2) + '%', note: 'Peak-to-trough' },
          ].map(({ label, val, note }) => (
            <div key={label} className="risk-stat-card">
              <span className="risk-stat-label">{label}</span>
              <span className="risk-stat-val">{val}</span>
              <span className="risk-stat-note">{note}</span>
            </div>
          ))}
        </div>

        {/* ── Gauges ────────────────────────────────────────── */}
        <div className="risk-gauges-panel">
          <div className="risk-panel-hdr">MARGIN & UTILISATION</div>
          <div className="risk-gauges-row">
            <div className="risk-gauge-item">
              <RingGauge pct={risk.marginUsed} label="MARGIN" color={varColor}/>
              <span className="risk-gauge-label">Margin Used</span>
            </div>
            <div className="risk-gauge-item">
              <RingGauge pct={60 + Math.random() * 10} label="CAPITAL" color="#38bdf8"/>
              <span className="risk-gauge-label">Capital Deploy</span>
            </div>
            <div className="risk-gauge-item">
              <RingGauge pct={risk.positions[0]?.pct || 20} label="CONC." color="#a78bfa"/>
              <span className="risk-gauge-label">Top Concentration</span>
            </div>
          </div>
        </div>

        {/* ── Position Concentration ─────────────────────────── */}
        <div className="risk-conc-panel">
          <div className="risk-panel-hdr">POSITION CONCENTRATION</div>
          <div className="risk-conc-list">
            {risk.positions.map((p, i) => (
              <div key={p.symbol} className="risk-conc-row">
                <span className="risk-conc-rank">#{i + 1}</span>
                <span className="risk-conc-sym">{p.symbol}</span>
                <span className="risk-conc-name">{p.name}</span>
                <div className="risk-conc-bar-wrap">
                  <div
                    className="risk-conc-bar"
                    style={{
                      width: `${p.pct}%`,
                      background: i < 2 ? 'rgba(239,68,68,0.6)' : i < 4 ? 'rgba(245,158,11,0.6)' : 'rgba(56,189,248,0.5)',
                    }}
                  />
                </div>
                <span className="risk-conc-pct">{p.pct.toFixed(1)}%</span>
                <span className="risk-conc-val">₹{fmt(p.value)}</span>
                <span className={`risk-conc-pnl ${p.pnlPct >= 0 ? 'up' : 'dn'}`}>
                  {(p.pnlPct >= 0 ? '+' : '')}{p.pnlPct?.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
