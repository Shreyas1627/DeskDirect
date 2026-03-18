// NIFTY 50 components — realistic INR prices (March 2026)
// Used as base prices for the real-time simulation feed

export const NIFTY_STOCKS = [
  { symbol: 'RELIANCE',   name: 'Reliance Industries',   sector: 'Energy',          basePrice: 2847.50, mktCap: '₹19.2T', lot: 1   },
  { symbol: 'TCS',        name: 'Tata Consultancy Svcs', sector: 'IT',              basePrice: 3924.00, mktCap: '₹14.2T', lot: 1   },
  { symbol: 'HDFCBANK',   name: 'HDFC Bank',             sector: 'Banking',         basePrice: 1748.30, mktCap: '₹13.3T', lot: 1   },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel',         sector: 'Telecom',         basePrice: 1621.00, mktCap: '₹9.7T',  lot: 1   },
  { symbol: 'ICICIBANK',  name: 'ICICI Bank',            sector: 'Banking',         basePrice: 1283.75, mktCap: '₹9.0T',  lot: 1   },
  { symbol: 'INFY',       name: 'Infosys',               sector: 'IT',              basePrice: 1579.60, mktCap: '₹6.5T',  lot: 1   },
  { symbol: 'SBIN',       name: 'State Bank of India',   sector: 'Banking',         basePrice: 782.45,  mktCap: '₹6.9T',  lot: 3   },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever',    sector: 'FMCG',            basePrice: 2378.90, mktCap: '₹5.6T',  lot: 1   },
  { symbol: 'ITC',        name: 'ITC Ltd',               sector: 'FMCG',            basePrice: 453.20,  mktCap: '₹5.7T',  lot: 4   },
  { symbol: 'LT',         name: 'Larsen & Toubro',       sector: 'Infrastructure',  basePrice: 3541.85, mktCap: '₹4.9T',  lot: 1   },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance',         sector: 'Finance',         basePrice: 8195.00, mktCap: '₹4.9T',  lot: 1   },
  { symbol: 'HCLTECH',    name: 'HCL Technologies',      sector: 'IT',              basePrice: 1584.25, mktCap: '₹4.3T',  lot: 1   },
  { symbol: 'KOTAKBANK',  name: 'Kotak Mahindra Bank',   sector: 'Banking',         basePrice: 1892.40, mktCap: '₹3.7T',  lot: 1   },
  { symbol: 'MARUTI',     name: 'Maruti Suzuki',         sector: 'Auto',            basePrice: 11548.00,mktCap: '₹3.5T',  lot: 1   },
  { symbol: 'AXISBANK',   name: 'Axis Bank',             sector: 'Banking',         basePrice: 1156.70, mktCap: '₹3.5T',  lot: 1   },
  { symbol: 'SUNPHARMA',  name: 'Sun Pharmaceutical',    sector: 'Pharma',          basePrice: 1728.50, mktCap: '₹4.1T',  lot: 1   },
  { symbol: 'TATAMOTORS', name: 'Tata Motors',           sector: 'Auto',            basePrice: 712.30,  mktCap: '₹2.6T',  lot: 2   },
  { symbol: 'WIPRO',      name: 'Wipro',                 sector: 'IT',              basePrice: 521.40,  mktCap: '₹2.7T',  lot: 2   },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement',      sector: 'Cement',          basePrice: 9812.00, mktCap: '₹2.8T',  lot: 1   },
  { symbol: 'TITAN',      name: 'Titan Company',         sector: 'Consumer',        basePrice: 3452.15, mktCap: '₹3.0T',  lot: 1   },
  { symbol: 'MM',         name: 'Mahindra & Mahindra',   sector: 'Auto',            basePrice: 2918.60, mktCap: '₹3.6T',  lot: 1   },
  { symbol: 'ASIANPAINT', name: 'Asian Paints',          sector: 'Consumer',        basePrice: 2682.40, mktCap: '₹2.5T',  lot: 1   },
  { symbol: 'POWERGRID',  name: 'Power Grid Corp',       sector: 'Utilities',       basePrice: 317.85,  mktCap: '₹2.9T',  lot: 4   },
  { symbol: 'NESTLEIND',  name: 'Nestle India',          sector: 'FMCG',            basePrice: 2448.00, mktCap: '₹2.3T',  lot: 1   },
  { symbol: 'TATASTEEL',  name: 'Tata Steel',            sector: 'Metals',          basePrice: 163.25,  mktCap: '₹2.0T',  lot: 6   },
  { symbol: 'HINDALCO',   name: 'Hindalco Industries',   sector: 'Metals',          basePrice: 641.90,  mktCap: '₹1.4T',  lot: 2   },
  { symbol: 'NTPC',       name: 'NTPC Ltd',              sector: 'Utilities',       basePrice: 348.70,  mktCap: '₹3.3T',  lot: 3   },
  { symbol: 'JSWSTEEL',   name: 'JSW Steel',             sector: 'Metals',          basePrice: 892.15,  mktCap: '₹2.1T',  lot: 1   },
  { symbol: 'ADANIPORTS', name: 'Adani Ports & SEZ',     sector: 'Infrastructure',  basePrice: 1284.60, mktCap: '₹2.7T',  lot: 1   },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv',         sector: 'Finance',         basePrice: 1876.30, mktCap: '₹2.9T',  lot: 1   },
];

export const SECTORS = [...new Set(NIFTY_STOCKS.map(s => s.sector))];

export const INDICES = {
  NIFTY50:  { name: 'NIFTY 50',  baseValue: 22483.65 },
  SENSEX:   { name: 'SENSEX',    baseValue: 73935.40 },
  BANKNIFTY:{ name: 'BANK NIFTY',baseValue: 47821.30 },
  NIFTYMID: { name: 'NIFTY MID100', baseValue: 51234.80 },
};

// Mock portfolio holdings
export const MOCK_PORTFOLIO = [
  { symbol: 'RELIANCE',   qty: 50,  avgCost: 2640.00 },
  { symbol: 'TCS',        qty: 20,  avgCost: 3750.00 },
  { symbol: 'INFY',       qty: 80,  avgCost: 1480.00 },
  { symbol: 'HDFCBANK',   qty: 100, avgCost: 1620.00 },
  { symbol: 'ICICIBANK',  qty: 120, avgCost: 1050.00 },
  { symbol: 'TATAMOTORS', qty: 200, avgCost: 680.00  },
  { symbol: 'SBIN',       qty: 300, avgCost: 710.00  },
  { symbol: 'SUNPHARMA',  qty: 40,  avgCost: 1560.00 },
];
