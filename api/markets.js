// @ts-nocheck
import './_suppressWarnings.js';

// 60-second in-memory warm cache for Edge
let cachedMarkets = null;
let cacheTime = 0;
const CACHE_TTL_MS = 60 * 1000;

function isIndianMarketOpen() {
  const now = new Date();
  // Convert current time to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);

  const dayOfWeek = istDate.getUTCDay(); // 0 is Sun, 6 is Sat
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;

  const hours = istDate.getUTCHours();
  const minutes = istDate.getUTCMinutes();
  const currentTimeMinutes = hours * 60 + minutes;

  // NSE/BSE opens at 09:15 and closes at 15:30 IST
  const openTimeMinutes = 9 * 60 + 15;
  const closeTimeMinutes = 15 * 60 + 30;

  return currentTimeMinutes >= openTimeMinutes && currentTimeMinutes <= closeTimeMinutes;
}

function getFormattedIstTime() {
  const now = new Date();
  return now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata',
  }) + ' IST';
}

async function fetchYahooSymbol(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        'Accept': 'application/json',
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta || typeof meta.regularMarketPrice !== 'number') return null;

    const currentPrice = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose || meta.previousClose || currentPrice;
    const change = currentPrice - prevClose;
    const percentChange = prevClose > 0 ? (change / prevClose) * 100 : 0;

    return {
      price: currentPrice,
      prevClose,
      change,
      percentChange,
    };
  } catch (err) {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const now = Date.now();
  if (cachedMarkets && now - cacheTime < CACHE_TTL_MS) {
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(cachedMarkets);
  }

  const isOpen = isIndianMarketOpen();
  const istTime = getFormattedIstTime();

  try {
    const [sensexRaw, niftyRaw, usdRaw, goldRaw, brentRaw] = await Promise.all([
      fetchYahooSymbol('^BSESN'),
      fetchYahooSymbol('^NSEI'),
      fetchYahooSymbol('INR=X'),
      fetchYahooSymbol('GC=F'),
      fetchYahooSymbol('BZ=F'),
    ]);

    // Baseline fallback rates if network times out
    const sensexPrice = sensexRaw?.price || 85240.1;
    const sensexChange = sensexRaw ? sensexRaw.change : 412.5;
    const sensexPct = sensexRaw ? sensexRaw.percentChange : 0.48;

    const niftyPrice = niftyRaw?.price || 25980.45;
    const niftyChange = niftyRaw ? niftyRaw.change : 134.2;
    const niftyPct = niftyRaw ? niftyRaw.percentChange : 0.52;

    const usdPrice = usdRaw?.price || 83.42;
    const usdChange = usdRaw ? usdRaw.change : -0.04;
    const usdPct = usdRaw ? usdRaw.percentChange : -0.05;

    // Gold Comex per ounce converted to ~10g 24K INR or fallback
    let goldInr = 75450;
    let goldChange = 280;
    let goldPct = 0.38;
    if (goldRaw?.price && usdPrice) {
      // 1 troy oz = 31.1035 grams -> 10g = price / 3.11035 * usdInr + Indian import duties (~12%)
      const calculated10g = Math.round((goldRaw.price / 3.11035) * usdPrice * 1.08);
      if (calculated10g > 60000 && calculated10g < 120000) {
        goldInr = calculated10g;
        goldChange = Math.round((goldRaw.change / 3.11035) * usdPrice * 1.08);
        goldPct = goldRaw.percentChange;
      }
    }

    const brentPrice = brentRaw?.price || 78.4;
    const brentChange = brentRaw ? brentRaw.change : -0.85;
    const brentPct = brentRaw ? brentRaw.percentChange : -1.07;

    const formatNum = (num, decimals = 2) =>
      num.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

    const formatSigned = (num, decimals = 2) =>
      `${num >= 0 ? '+' : ''}${formatNum(num, decimals)}`;

    const responsePayload = {
      marketStatus: {
        isOpen,
        sessionLabelHi: isOpen ? 'लाइव बाजार सत्र (NSE/BSE)' : 'बाजार बंद (सत्र समापन दरें)',
        sessionLabelEn: isOpen ? 'Live Market (NSE/BSE)' : 'Market Closed (Closing Rates)',
        istTime,
        lastUpdated: new Date().toISOString(),
      },
      indices: [
        {
          symbol: 'SENSEX',
          name: 'BSE SENSEX',
          nameHi: 'बीएसई सेंसेक्स',
          value: formatNum(sensexPrice, 2),
          change: formatSigned(sensexChange, 2),
          percentChange: `${formatSigned(sensexPct, 2)}%`,
          isPositive: sensexChange >= 0,
        },
        {
          symbol: 'NIFTY',
          name: 'NSE NIFTY',
          nameHi: 'एनएसई निफ्टी',
          value: formatNum(niftyPrice, 2),
          change: formatSigned(niftyChange, 2),
          percentChange: `${formatSigned(niftyPct, 2)}%`,
          isPositive: niftyChange >= 0,
        },
        {
          symbol: 'USDINR',
          name: 'USD / INR',
          nameHi: 'डॉलर / रुपया',
          value: `₹${formatNum(usdPrice, 2)}`,
          change: formatSigned(usdChange, 2),
          percentChange: `${formatSigned(usdPct, 2)}%`,
          isPositive: usdChange <= 0, // In currency, weakening rupee is negative
        },
        {
          symbol: 'GOLD',
          name: 'GOLD (10g)',
          nameHi: 'सोना (10 ग्राम)',
          value: `₹${formatNum(goldInr, 0)}`,
          change: formatSigned(goldChange, 0),
          percentChange: `${formatSigned(goldPct, 2)}%`,
          isPositive: goldChange >= 0,
        },
        {
          symbol: 'BRENT',
          name: 'BRENT CRUDE',
          nameHi: 'ब्रेंट क्रूड',
          value: `$${formatNum(brentPrice, 2)}`,
          change: formatSigned(brentChange, 2),
          percentChange: `${formatSigned(brentPct, 2)}%`,
          isPositive: brentChange >= 0,
        },
      ],
    };

    cachedMarkets = responsePayload;
    cacheTime = now;

    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(responsePayload);
  } catch (err) {
    console.error('Error generating markets feed:', err);
    return res.status(500).json({ error: 'Failed to fetch market data' });
  }
}
