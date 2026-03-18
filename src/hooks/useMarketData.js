import { useState, useEffect, useRef, useCallback } from 'react';
import { NIFTY_STOCKS, INDICES, MOCK_PORTFOLIO } from '../data/indianStocks';

// ── Market hours helpers ─────────────────────────────────────────
const IST_OPEN  = 9 * 60 + 15;   // 09:15
const IST_CLOSE = 15 * 60 + 30;  // 15:30

function getISTMinutes() {
  const now = new Date();
  return now.getUTCHours() * 60 + now.getUTCMinutes() + 330; // UTC+5:30
}

function isMarketOpen() {
  const m = getISTMinutes() % (24 * 60);
  return m >= IST_OPEN && m <= IST_CLOSE;
}

// ── Seeded price walk ────────────────────────────────────────────
function walk(price, volatility = 0.003) {
  const change = (Math.random() - 0.488) * volatility * price;
  return Math.max(price * 0.5, price + change);
}

// ── Generate OHLC candles for a stock ───────────────────────────
function generateCandles(basePrice, count = 35) {
  const candles = [];
  let price = basePrice * (0.94 + Math.random() * 0.04);

  for (let i = 0; i < count; i++) {
    const open  = price;
    const close = walk(price, 0.006);
    const high  = Math.max(open, close) * (1 + Math.random() * 0.004);
    const low   = Math.min(open, close) * (1 - Math.random() * 0.004);
    const vol   = Math.floor(500000 + Math.random() * 2000000);
    candles.push({ open, high, low, close, vol });
    price = close;
  }
  return candles;
}

// ── Build initial state ──────────────────────────────────────────
function buildInitialStocks() {
  return NIFTY_STOCKS.map(s => {
    const price   = s.basePrice * (0.97 + Math.random() * 0.06);
    const prevClose = s.basePrice;
    const change  = price - prevClose;
    const changePct = (change / prevClose) * 100;
    return {
      ...s,
      price: +price.toFixed(2),
      prevClose,
      change:    +change.toFixed(2),
      changePct: +changePct.toFixed(2),
      open:  +(prevClose * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2),
      high:  +(price * (1 + Math.random() * 0.005)).toFixed(2),
      low:   +(price * (1 - Math.random() * 0.005)).toFixed(2),
      vol:   Math.floor(1e6 + Math.random() * 9e6),
      candles: generateCandles(s.basePrice, 35),
    };
  });
}

function buildInitialIndices() {
  return Object.fromEntries(
    Object.entries(INDICES).map(([key, meta]) => {
      const value = meta.baseValue * (0.98 + Math.random() * 0.04);
      const prev  = meta.baseValue;
      return [key, {
        ...meta,
        value:     +value.toFixed(2),
        change:    +(value - prev).toFixed(2),
        changePct: +((value - prev) / prev * 100).toFixed(2),
      }];
    })
  );
}

// ── Main hook ───────────────────────────────────────────────────
export function useMarketData() {
  const [stocks,  setStocks]  = useState(() => buildInitialStocks());
  const [indices, setIndices] = useState(() => buildInitialIndices());
  const [marketOpen, setMarketOpen] = useState(isMarketOpen());
  const tickRef = useRef(0);

  const tick = useCallback(() => {
    tickRef.current += 1;
    setStocks(prev => prev.map(s => {
      // Slower drift when market is closed
      const vol = marketOpen ? 0.0025 : 0.0005;
      const newPrice  = +walk(s.price, vol).toFixed(2);
      const change    = +(newPrice - s.prevClose).toFixed(2);
      const changePct = +(change / s.prevClose * 100).toFixed(2);
      const newHigh   = Math.max(s.high, newPrice);
      const newLow    = Math.min(s.low,  newPrice);
      // Update last candle close
      const candles = [...s.candles];
      candles[candles.length - 1] = {
        ...candles[candles.length - 1],
        close: newPrice,
        high:  Math.max(candles[candles.length - 1].high, newPrice),
        low:   Math.min(candles[candles.length - 1].low,  newPrice),
      };
      return { ...s, price: newPrice, change, changePct, high: +newHigh.toFixed(2), low: +newLow.toFixed(2), candles };
    }));
    setIndices(prev => Object.fromEntries(
      Object.entries(prev).map(([key, idx]) => {
        const newVal = +walk(idx.value, 0.0015).toFixed(2);
        return [key, {
          ...idx, value: newVal,
          change:    +(newVal - INDICES[key].baseValue).toFixed(2),
          changePct: +((newVal - INDICES[key].baseValue) / INDICES[key].baseValue * 100).toFixed(2),
        }];
      })
    ));
    // New candle every 12 ticks (~36s)
    if (tickRef.current % 12 === 0) {
      setStocks(prev => prev.map(s => {
        const lastClose = s.candles[s.candles.length - 1].close;
        const newCandle = {
          open:  lastClose,
          close: s.price,
          high:  Math.max(lastClose, s.price) * (1 + Math.random() * 0.003),
          low:   Math.min(lastClose, s.price) * (1 - Math.random() * 0.003),
          vol:   Math.floor(500000 + Math.random() * 2000000),
        };
        const candles = [...s.candles.slice(-34), newCandle];
        return { ...s, candles };
      }));
    }
  }, [marketOpen]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMarketOpen(isMarketOpen());
      tick();
    }, 3000);
    return () => clearInterval(interval);
  }, [tick]);

  // Derived data
  const sorted   = [...stocks].sort((a, b) => b.changePct - a.changePct);
  const topGainers = sorted.slice(0, 5);
  const topLosers  = sorted.slice(-5).reverse();

  // Portfolio with live prices
  const portfolio = MOCK_PORTFOLIO.map(h => {
    const stock = stocks.find(s => s.symbol === h.symbol) || {};
    const ltp   = stock.price || h.avgCost;
    const invested = h.qty * h.avgCost;
    const current  = h.qty * ltp;
    const pnl      = current - invested;
    const pnlPct   = (pnl / invested) * 100;
    return { ...h, ...stock, ltp, invested, current, pnl, pnlPct };
  });

  const totalInvested = portfolio.reduce((a, p) => a + p.invested, 0);
  const totalCurrent  = portfolio.reduce((a, p) => a + p.current,  0);
  const totalPnL      = totalCurrent - totalInvested;
  const dayPnL        = portfolio.reduce((a, p) => a + p.qty * (p.price - p.prevClose || 0), 0);

  return {
    stocks,
    indices,
    marketOpen,
    topGainers,
    topLosers,
    portfolio,
    summary: { totalInvested, totalCurrent, totalPnL, dayPnL },
  };
}
