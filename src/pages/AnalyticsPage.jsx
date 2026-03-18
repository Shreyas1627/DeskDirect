import React, { useState, useMemo } from 'react';
import { useMarketData } from '../hooks/useMarketData';
import './AnalyticsPage.css';

const fmt = n => n.toLocaleString('en-IN', { maximumFractionDigits: 2 });

// Sector heatmap data from stocks
const SECTOR_COLORS = {
  positive: ['rgba(34,197,94,0.12)', 'rgba(34,197,94,0.22)', 'rgba(34,197,94,0.35)', 'rgba(34,197,94,0.5)'],
  negative: ['rgba(239,68,68,0.12)', 'rgba(239,68,68,0.22)', 'rgba(239,68,68,0.35)', 'rgba(239,68,68,0.5)'],
};

function heatColor(pct) {
  const idx = Math.min(3, Math.floor(Math.abs(pct) / 0.5));
  return pct >= 0 ? SECTOR_COLORS.positive[idx] : SECTOR_COLORS.negative[idx];
}

// Mini multi-line comparison chart (normalized to 100)
function ComparisonChart({ stocks, symbols }) {
  const series = useMemo(() => {
    return symbols.map(sym => {
      const s = stocks.find(x => x.symbol === sym);
      if (!s) return null;
      const candles = s.candles || [];
      const base = candles[0]?.close || s.prevClose || 1;
      const points = candles.map((c, i) => ({
        x: i / (candles.length - 1),
        y: ((c.close - base) / base) * 100,
      }));
      return { sym, points, color: s.changePct >= 0 ? '#22c55e' : '#ef4444', last: s.changePct };
    }).filter(Boolean);
  }, [stocks, symbols]);

  const W = 500, H = 140, PAD = 30;
  const chartW = W - PAD * 2, chartH = H - PAD * 2;

  const minY = Math.min(...series.flatMap(s => s.points.map(p => p.y)), -1);
  const maxY = Math.max(...series.flatMap(s => s.points.map(p => p.y)), 1);
  const rangeY = maxY - minY || 1;

  const px = x => PAD + x * chartW;
  const py = y => PAD + chartH - ((y - minY) / rangeY) * chartH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" className="comp-chart-svg">
      {/* Baseline */}
      <line x1={PAD} y1={py(0)} x2={W - PAD} y2={py(0)} stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4,4"/>
      <text x={PAD - 2} y={py(0) + 4} textAnchor="end" fontSize="8" fill="rgba(122,136,153,0.8)" fontFamily="JetBrains Mono,monospace">0%</text>
      {series.map((s, si) => {
        const d = s.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${px(p.x).toFixed(1)},${py(p.y).toFixed(1)}`).join(' ');
        return (
          <g key={s.sym}>
            <path d={d} fill="none" stroke={s.color} strokeWidth="1.8" strokeLinejoin="round" opacity="0.85"/>
          </g>
        );
      })}
      {/* Legend */}
      {series.map((s, i) => (
        <g key={s.sym} transform={`translate(${PAD + i * 90}, ${H - 10})`}>
          <line x1="0" y1="0" x2="14" y2="0" stroke={s.color} strokeWidth="2"/>
          <text x="18" y="4" fontSize="8.5" fill="rgba(200,210,220,0.8)" fontFamily="JetBrains Mono,monospace">
            {s.sym} {(s.last >= 0 ? '+' : '')}{s.last?.toFixed(2)}%
          </text>
        </g>
      ))}
    </svg>
  );
}

const COMPARE_SETS = [
  { label: 'IT Sector',    symbols: ['TCS','INFY','HCLTECH','WIPRO'] },
  { label: 'Banking',      symbols: ['HDFCBANK','ICICIBANK','SBIN','AXISBANK','KOTAKBANK'] },
  { label: 'Auto Sector',  symbols: ['TATAMOTORS','MARUTI','MM'] },
  { label: 'FMCG',         symbols: ['HINDUNILVR','ITC','NESTLEIND'] },
];

export default function AnalyticsPage() {
  const { stocks } = useMarketData();
  const [compareSet, setCompareSet] = useState(0);

  // Sector heatmap
  const sectorMap = useMemo(() => {
    const map = {};
    stocks.forEach(s => {
      if (!map[s.sector]) map[s.sector] = [];
      map[s.sector].push(s);
    });
    return map;
  }, [stocks]);

  const set = COMPARE_SETS[compareSet];

  return (
    <div className="analytics-root">
      {/* ── Title bar ──────────────────────────────────────── */}
      <div className="analytics-hdr">
        <h2 className="analytics-title">Market Analytics</h2>
        <span className="analytics-sub">Real-time NIFTY 50 performance · NSE data simulation</span>
      </div>

      <div className="analytics-grid">
        {/* Left: Comparison Chart */}
        <section className="analytics-panel analytics-chart-panel">
          <div className="analytics-panel-hdr">
            <span>PERFORMANCE COMPARISON</span>
            <div className="analytics-tabs">
              {COMPARE_SETS.map((s, i) => (
                <button key={s.label}
                  className={`analytics-tab ${compareSet === i ? 'active' : ''}`}
                  onClick={() => setCompareSet(i)}
                >{s.label}</button>
              ))}
            </div>
          </div>
          <div className="analytics-chart-area">
            <ComparisonChart stocks={stocks} symbols={set.symbols} />
          </div>
          <div className="analytics-comparison-table">
            {set.symbols.map(sym => {
              const s = stocks.find(x => x.symbol === sym);
              if (!s) return null;
              return (
                <div key={sym} className="act-row">
                  <span className="act-sym">{sym}</span>
                  <span className="act-name">{s.name?.split(' ').slice(0,2).join(' ')}</span>
                  <span className="act-price">₹{fmt(s.price)}</span>
                  <span className={`act-chg ${s.changePct >= 0 ? 'up' : 'dn'}`}>{(s.changePct >= 0 ? '+' : '')}{s.changePct?.toFixed(2)}%</span>
                  <span className="act-vol">{(s.vol / 1e6).toFixed(1)}M vol</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right: Sector Heatmap */}
        <section className="analytics-panel analytics-heatmap-panel">
          <div className="analytics-panel-hdr">SECTOR HEATMAP</div>
          <div className="heatmap-scroll">
            {Object.entries(sectorMap).map(([sector, sectorStocks]) => {
              const avgChg = sectorStocks.reduce((a, s) => a + s.changePct, 0) / sectorStocks.length;
              return (
                <div key={sector} className="heatmap-sector">
                  <div className="heatmap-sector-hdr">
                    <span className="heatmap-sector-name">{sector}</span>
                    <span className={`heatmap-sector-avg ${avgChg >= 0 ? 'up' : 'dn'}`}>
                      {(avgChg >= 0 ? '+' : '')}{avgChg.toFixed(2)}%
                    </span>
                  </div>
                  <div className="heatmap-cells">
                    {sectorStocks.map(s => (
                      <div
                        key={s.symbol}
                        className="heatmap-cell"
                        style={{ background: heatColor(s.changePct), borderColor: s.changePct >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)' }}
                      >
                        <span className="hm-sym">{s.symbol}</span>
                        <span className={`hm-chg ${s.changePct >= 0 ? 'up' : 'dn'}`}>{(s.changePct >= 0 ? '+' : '')}{s.changePct?.toFixed(2)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
