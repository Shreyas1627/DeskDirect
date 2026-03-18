import React from 'react';

export function MiniTrendChart({ candles = [], isPositive = true }) {
  if (!candles || candles.length === 0) return null;

  const W = 300;
  const H = 60;
  
  // Find min and max close values to scale the chart
  const closes = candles.map(c => c.close);
  const minVal = Math.min(...closes);
  const maxVal = Math.max(...closes);
  const range = maxVal - minVal || 1; // prevent div by 0

  // Colors
  const strokeColor = isPositive ? 'rgba(34,197,94,1)' : 'rgba(239,68,68,1)';
  const fillStart = isPositive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)';
  const fillEnd = isPositive ? 'rgba(34,197,94,0)' : 'rgba(239,68,68,0)';

  // Generate path points
  const points = closes.map((val, i) => {
    const x = (i / (closes.length - 1)) * W;
    const y = H - ((val - minVal) / range) * H;
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${W},${H} L 0,${H} Z`;

  return (
    <div className="mini-trend-wrap" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', maxHeight: '80px' }}>
        <defs>
          <linearGradient id={`trend-grad-${isPositive ? 'up' : 'dn'}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillStart} />
            <stop offset="100%" stopColor={fillEnd} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#trend-grad-${isPositive ? 'up' : 'dn'})`} />
        <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
