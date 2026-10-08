import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface MarketItem {
  symbol: string;
  name: string;
  nameHi?: string;
  value: string;
  change: string;
  percentChange: string;
  isPositive: boolean | null;
}

interface MarketStatus {
  isOpen: boolean;
  sessionLabelHi: string;
  sessionLabelEn: string;
  istTime: string;
  lastUpdated: string;
}

const DEFAULT_MARKET_STATUS: MarketStatus = {
  isOpen: false,
  sessionLabelHi: 'बाजार बंद (सत्र समापन दरें)',
  sessionLabelEn: 'Market Closed (Closing Rates)',
  istTime: 'IST Session',
  lastUpdated: new Date().toISOString(),
};

const DEFAULT_MARKET_DATA: MarketItem[] = [
  {
    symbol: 'SENSEX',
    name: 'BSE SENSEX',
    nameHi: 'बीएसई सेंसेक्स',
    value: '85,240.10',
    change: '+412.50',
    percentChange: '+0.48%',
    isPositive: true,
  },
  {
    symbol: 'NIFTY',
    name: 'NSE NIFTY',
    nameHi: 'एनएसई निफ्टी',
    value: '25,980.45',
    change: '+134.20',
    percentChange: '+0.52%',
    isPositive: true,
  },
  {
    symbol: 'USDINR',
    name: 'USD / INR',
    nameHi: 'डॉलर / रुपया',
    value: '₹83.42',
    change: '-0.04',
    percentChange: '-0.05%',
    isPositive: false,
  },
  {
    symbol: 'GOLD',
    name: 'GOLD (10g)',
    nameHi: 'सोना (10 ग्राम)',
    value: '₹75,450',
    change: '+280.00',
    percentChange: '+0.38%',
    isPositive: true,
  },
  {
    symbol: 'BRENT',
    name: 'BRENT CRUDE',
    nameHi: 'ब्रेंट क्रूड',
    value: '$78.40',
    change: '-0.85',
    percentChange: '-1.07%',
    isPositive: false,
  },
];

export const MarketsTickerBar: React.FC = () => {
  const { isHindi } = useLanguage();
  const [marketItems, setMarketItems] = useState<MarketItem[]>(DEFAULT_MARKET_DATA);
  const [marketStatus, setMarketStatus] = useState<MarketStatus>(DEFAULT_MARKET_STATUS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchMarkets = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/markets');
        if (res.ok) {
          const json = await res.json();
          if (isMounted) {
            if (Array.isArray(json?.indices) && json.indices.length > 0) {
              setMarketItems(json.indices);
            }
            if (json?.marketStatus) {
              setMarketStatus(json.marketStatus);
            }
          }
        }
      } catch (err) {
        // Retain current or fallback data gracefully
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMarkets();

    // Refresh every 90 seconds while user is on page
    const interval = setInterval(fetchMarkets, 90 * 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      role="region"
      aria-label="Live Financial Markets"
      className="bg-surface-lowest border-b border-border-subtle py-1.5 px-3 sm:px-4 text-[11px] font-mono select-none"
    >
      <div className="max-w-site mx-auto flex items-center justify-between gap-3 overflow-x-auto hide-scrollbar">
        {/* Left: Markets Status & Live Session Badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 font-sans font-extrabold text-primary text-[11px] uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
            <span>{isHindi ? 'बाज़ार लाइव' : 'MARKETS LIVE'}</span>
          </div>

          {/* Dynamic Open / Closed Status Pill */}
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-2xs text-[10px] font-sans font-bold uppercase tracking-wider border ${
              marketStatus.isOpen
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                marketStatus.isOpen ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'
              }`}
            />
            <span>{isHindi ? marketStatus.sessionLabelHi : marketStatus.sessionLabelEn}</span>
          </span>

          {marketStatus.istTime && (
            <span className="hidden lg:inline text-ink-muted text-[10px] font-sans">
              • {marketStatus.istTime}
            </span>
          )}
        </div>

        {/* Center/Right: Live Financial Ticker Items */}
        <div className="flex items-center gap-4 sm:gap-6 text-[11px] whitespace-nowrap">
          {marketItems.map((item, idx) => {
            const displayName = isHindi && item.nameHi ? item.nameHi : item.name;

            return (
              <React.Fragment key={item.symbol}>
                <div className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-default">
                  <span className="font-bold text-ink">{displayName}</span>
                  <span className="font-semibold text-ink-secondary">{item.value}</span>

                  {item.isPositive === true ? (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded-xs border border-emerald-200 flex items-center gap-0.5 text-[10px]">
                      <ArrowUpRight className="w-2.5 h-2.5" />
                      <span>{item.change} ({item.percentChange})</span>
                    </span>
                  ) : item.isPositive === false ? (
                    <span className="text-rose-700 font-bold bg-rose-50 px-1.5 py-0.2 rounded-xs border border-rose-200 flex items-center gap-0.5 text-[10px]">
                      <ArrowDownRight className="w-2.5 h-2.5" />
                      <span>{item.change} ({item.percentChange})</span>
                    </span>
                  ) : (
                    <span className="text-slate-600 font-semibold bg-slate-100 px-1.5 py-0.2 rounded-xs border border-slate-200 text-[10px]">
                      {item.percentChange}
                    </span>
                  )}
                </div>

                {idx < marketItems.length - 1 && (
                  <span className="text-border-strong hidden sm:inline">•</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
