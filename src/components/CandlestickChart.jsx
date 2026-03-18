import React, { useMemo } from 'react';

// ── SVG Candlestick Chart ────────────────────────────────────────
// Props:
//   candles: [{ open, high, low, close, vol }]
//   currentPrice: number

const W = 700, CH = 220, VH = 60, PAD_L = 52, PAD_R = 8, PAD_T = 12, PAD_B = 4;
const CHART_W = W - PAD_L - PAD_R;

export function CandlestickChart({ candles = [], currentPrice }) {
  const data = useMemo(() => {
    if (!candles.length) return null;

    const maxH = Math.max(...candles.map(c => c.high));
    const minL = Math.min(...candles.map(c => c.low));
    const priceRange = maxH - minL || 1;
    const maxVol  = Math.max(...candles.map(c => c.vol));

    const candleW  = CHART_W / candles.length;
    const bodyW    = Math.max(2, candleW * 0.65);

    const py = price => PAD_T + ((maxH - price) / priceRange) * CH;
    const vy = vol   => VH - (vol / maxVol) * (VH - 4);

    // Price grid lines (5 levels)
    const levels = Array.from({ length: 5 }, (_, i) => {
      const p = minL + (priceRange * (4 - i)) / 4;
      return { p, y: py(p) };
    });

    return { candles, candleW, bodyW, py, vy, levels, maxH, minL, priceRange };
  }, [candles]);

  if (!data) return <div className="chart-empty">No data</div>;

  const { candleW, bodyW, py, vy, levels } = data;
  const totalH = CH + VH + PAD_T + PAD_B + 20;

  return (
    <div className="chart-wrap">
      <svg
        viewBox={`0 0 ${W} ${totalH}`}
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        className="chart-svg"
      >
        <defs>
          <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(56,189,248,0.35)"/>
            <stop offset="100%" stopColor="rgba(56,189,248,0.02)"/>
          </linearGradient>
          <clipPath id="chartClip">
            <rect x={PAD_L} y={PAD_T} width={CHART_W} height={CH}/>
          </clipPath>
        </defs>

        {/* ── Price grid lines ─────────────────────────────── */}
        {levels.map(({ p, y }, i) => (
          <g key={i}>
            <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4,4"/>
            <text x={PAD_L - 4} y={y + 4} textAnchor="end"
              fontSize="9" fill="rgba(122,136,153,0.9)" fontFamily="JetBrains Mono,monospace">
              {p.toFixed(0)}
            </text>
          </g>
        ))}

        {/* ── Volume separator ─────────────────────────────── */}
        <line
          x1={PAD_L} y1={PAD_T + CH + 10} x2={W - PAD_R} y2={PAD_T + CH + 10}
          stroke="rgba(255,255,255,0.06)" strokeWidth="1"
        />
        <text x={PAD_L - 4} y={PAD_T + CH + 14} textAnchor="end"
          fontSize="8" fill="rgba(122,136,153,0.7)" fontFamily="JetBrains Mono,monospace">VOL</text>

        {/* ── Candles + Volume ─────────────────────────────── */}
        <g clipPath="url(#chartClip)">
          {candles.map((c, i) => {
            const x      = PAD_L + i * candleW;
            const cx     = x + candleW / 2;
            const isUp   = c.close >= c.open;
            const bodyTop = py(Math.max(c.open, c.close));
            const bodyBot = py(Math.min(c.open, c.close));
            const bodyH   = Math.max(1, bodyBot - bodyTop);
            const color   = isUp ? '#22c55e' : '#ef4444';
            const fillC   = isUp ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)';

            return (
              <g key={i}>
                {/* Wick */}
                <line x1={cx} y1={py(c.high)} x2={cx} y2={py(c.low)}
                  stroke={color} strokeWidth="1" opacity="0.7"/>
                {/* Body */}
                <rect x={cx - bodyW / 2} y={bodyTop} width={bodyW} height={bodyH}
                  fill={fillC} stroke={color} strokeWidth="1"/>
              </g>
            );
          })}
        </g>

        {/* ── Volume bars ──────────────────────────────────── */}
        {candles.map((c, i) => {
          const x    = PAD_L + i * candleW;
          const barH = vy(c.vol);
          const isUp = c.close >= c.open;
          return (
            <rect
              key={i}
              x={x + (candleW - bodyW) / 2}
              y={PAD_T + CH + 10 + VH - barH}
              width={bodyW} height={barH}
              fill={isUp ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}
              rx="1"
            />
          );
        })}

        {/* ── Current price line ───────────────────────────── */}
        {currentPrice && (() => {
          const minL = Math.min(...candles.map(c => c.low));
          const maxH = Math.max(...candles.map(c => c.high));
          const range = maxH - minL || 1;
          const y = PAD_T + ((maxH - currentPrice) / range) * CH;
          const isPos = (candles[candles.length-1]?.close || 0) >= (candles[candles.length-1]?.open || 0);
          const color = isPos ? '#22c55e' : '#ef4444';
          return (
            <g>
              <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y}
                stroke={color} strokeWidth="1" strokeDasharray="5,3" opacity="0.8"/>
              <rect x={W - PAD_R} y={y - 9} width={PAD_R + 4} height={18} fill={color} rx="2"/>
              <text x={W - PAD_R + 2} y={y + 4} fontSize="8" fill="#000" fontFamily="JetBrains Mono,monospace" fontWeight="bold">
                {currentPrice.toFixed(0)}
              </text>
            </g>
          );
        })()}

        {/* ── Time axis labels ─────────────────────────────── */}
        {candles.filter((_, i) => i % 5 === 0).map((_, rawI) => {
          const i = rawI * 5;
          const x = PAD_L + i * (CHART_W / candles.length) + (CHART_W / candles.length) / 2;
          const minutesBack = (candles.length - i) * 3;
          const time = new Date(Date.now() - minutesBack * 60000);
          const label = time.toISOString().substr(11, 5);
          return (
            <text key={i} x={x} y={PAD_T + CH + VH + 22} textAnchor="middle"
              fontSize="8.5" fill="rgba(122,136,153,0.8)" fontFamily="JetBrains Mono,monospace">
              {label}
            </text>
          );
        })}
      </svg>
      <div className="chart-legend">
        <span className="chart-up-legend">■ Bullish</span>
        <span className="chart-dn-legend">■ Bearish</span>
        <span className="chart-time-label">3-min candles · NSE live simulation</span>
      </div>
    </div>
  );
}
