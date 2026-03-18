import React, { useState, useMemo } from 'react';
import { useMarketData } from '../hooks/useMarketData';
import { MiniTrendChart } from '../components/MiniTrendChart';
import './MarketsPage.css';

const fmt  = n => n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
const fmtC = n => (n >= 0 ? '+' : '') + n.toFixed(2);

// Simulated order book depths
function genDepth(price) {
  const bids = [], asks = [];
  for (let i = 0; i < 8; i++) {
    bids.push({ price: +(price - i * 0.50 - Math.random() * 0.30).toFixed(2), qty: Math.floor(100 + Math.random() * 4000) });
    asks.push({ price: +(price + i * 0.50 + Math.random() * 0.30).toFixed(2), qty: Math.floor(100 + Math.random() * 4000) });
  }
  return { bids, asks };
}

const WATCH_SYMBOLS = ['RELIANCE','TCS','HDFCBANK','INFY','ICICIBANK','SBIN','BHARTIARTL','BAJFINANCE','MARUTI','TATAMOTORS'];

export default function MarketsPage() {
  const { stocks, indices, topGainers, topLosers } = useMarketData();
  const [selected, setSelected] = useState('RELIANCE');
  const [tab, setTab] = useState('gainers');

  const stock   = stocks.find(s => s.symbol === selected) || stocks[0];
  const depth   = useMemo(() => stock ? genDepth(stock.price) : { bids: [], asks: [] }, [stock?.price]);
  const watchlist = stocks.filter(s => WATCH_SYMBOLS.includes(s.symbol));
  const movers   = tab === 'gainers' ? topGainers : topLosers;

  if (!stock) return null;

  const maxBidQty = Math.max(...depth.bids.map(b => b.qty));
  const maxAskQty = Math.max(...depth.asks.map(a => a.qty));

  return (
    <div className="markets-root">
      {/* ── Index Cards ────────────────────────────────────── */}
      <div className="markets-index-strip">
        {Object.values(indices).map(idx => (
          <div key={idx.name} className={`markets-index-card ${idx.changePct >= 0 ? 'up' : 'dn'}`}>
            <span className="markets-index-name">{idx.name}</span>
            <span className="markets-index-val">{fmt(idx.value)}</span>
            <span className="markets-index-chg">{idx.changePct >= 0 ? '▲' : '▼'} {Math.abs(idx.changePct).toFixed(2)}%</span>
          </div>
        ))}
      </div>

      {/* ── Main Grid ──────────────────────────────────────── */}
      <div className="markets-grid">
        {/* Left: Chart pane */}
        <section className="markets-chart-pane">
          {/* Stock Selector Tabs */}
          <div className="markets-stock-tabs">
            {watchlist.map(s => (
              <button
                key={s.symbol}
                className={`markets-stock-tab ${selected === s.symbol ? 'active' : ''} ${s.changePct >= 0 ? 'up' : 'dn'}`}
                onClick={() => setSelected(s.symbol)}
              >
                <span className="mst-sym">{s.symbol}</span>
                <span className="mst-price">₹{fmt(s.price)}</span>
                <span className="mst-chg">{fmtC(s.changePct)}%</span>
              </button>
            ))}
          </div>

          {/* Stock Header */}
          <div className="markets-stock-header">
            <div>
              <div className="msh-name">{stock.name}</div>
              <div className="msh-sector">{stock.sector} · NSE: {stock.symbol}</div>
            </div>
            <div className="msh-price-block">
              <span className={`msh-price ${stock.changePct >= 0 ? 'up' : 'dn'}`}>₹{fmt(stock.price)}</span>
              <span className={`msh-change ${stock.changePct >= 0 ? 'up' : 'dn'}`}>
                {stock.changePct >= 0 ? '▲' : '▼'} {Math.abs(stock.change).toFixed(2)} ({Math.abs(stock.changePct).toFixed(2)}%)
              </span>
            </div>
            <div className="msh-ohlc">
              {[['O', stock.open], ['H', stock.high], ['L', stock.low], ['PC', stock.prevClose]].map(([k, v]) => (
                <div key={k} className="msh-ohlc-item">
                  <span className="msh-ohlc-l">{k}</span>
                  <span className="msh-ohlc-v">₹{fmt(v || 0)}</span>
                </div>
              ))}
              <div className="msh-ohlc-item">
                <span className="msh-ohlc-l">VOL</span>
                <span className="msh-ohlc-v">{(stock.vol / 1e6).toFixed(2)}M</span>
              </div>
              <div className="msh-ohlc-item">
                <span className="msh-ohlc-l">MCAP</span>
                <span className="msh-ohlc-v">{stock.mktCap}</span>
              </div>
            </div>
          </div>

          {/* Mini Trend Chart */}
          <div className="markets-mini-chart-area">
            <MiniTrendChart candles={stock.candles} isPositive={stock.changePct >= 0} />
          </div>
        </section>

        {/* Right: Depth + Movers */}
        <aside className="markets-right-pane">
          {/* Order Book / Market Depth */}
          <div className="markets-panel">
            <div className="markets-panel-hdr">
              <span>MARKET DEPTH</span>
              <span className="markets-spread">Spread: {(depth.asks[0]?.price - depth.bids[0]?.price || 0).toFixed(2)}</span>
            </div>
            <div className="markets-depth-grid">
              <div className="depth-col">
                <div className="depth-head-row">
                  <span>QTY</span><span>BID</span>
                </div>
                {depth.bids.map((b, i) => (
                  <div key={i} className="depth-row bid">
                    <div className="depth-bar" style={{ width: `${(b.qty / maxBidQty) * 100}%` }}/>
                    <span className="depth-qty">{b.qty.toLocaleString()}</span>
                    <span className="depth-price">{b.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="depth-col">
                <div className="depth-head-row">
                  <span>ASK</span><span>QTY</span>
                </div>
                {depth.asks.map((a, i) => (
                  <div key={i} className="depth-row ask">
                    <span className="depth-price">{a.price.toFixed(2)}</span>
                    <span className="depth-qty">{a.qty.toLocaleString()}</span>
                    <div className="depth-bar" style={{ width: `${(a.qty / maxAskQty) * 100}%` }}/>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Movers */}
          <div className="markets-panel markets-movers">
            <div className="markets-panel-hdr">
              <button className={`movers-tab ${tab === 'gainers' ? 'active' : ''}`} onClick={() => setTab('gainers')}>TOP GAINERS</button>
              <button className={`movers-tab ${tab === 'losers'  ? 'active' : ''}`} onClick={() => setTab('losers')}>TOP LOSERS</button>
            </div>
            <ul className="movers-list">
              {movers.map(s => (
                <li key={s.symbol} className="movers-row" onClick={() => setSelected(s.symbol)}>
                  <div className="movers-info">
                    <span className="movers-sym">{s.symbol}</span>
                    <span className="movers-name">{s.name.split(' ').slice(0,2).join(' ')}</span>
                  </div>
                  <div className="movers-vals">
                    <span className="movers-price">₹{fmt(s.price)}</span>
                    <span className={`movers-chg ${s.changePct >= 0 ? 'up' : 'dn'}`}>{fmtC(s.changePct)}%</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
