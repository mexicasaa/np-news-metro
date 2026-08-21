import React from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const MarketsTickerBar: React.FC = () => {
  const { t } = useLanguage();

  const marketData = [
    {
      symbol: 'SENSEX',
      name: t.bseSensex,
      value: '85,240.10',
      change: '+412.50',
      percentChange: '+0.48%',
      isPositive: true,
    },
    {
      symbol: 'NIFTY',
      name: t.nseNifty,
      value: '25,980.45',
      change: '+134.20',
      percentChange: '+0.52%',
      isPositive: true,
    },
    {
      symbol: 'USDINR',
      name: t.usdInr,
      value: '₹83.42',
      change: '-0.04',
      percentChange: '-0.05%',
      isPositive: false,
    },
    {
      symbol: 'BRENT',
      name: t.brentCrude,
      value: '$78.40',
      change: '-0.85',
      percentChange: '-1.07%',
      isPositive: false,
    },
    {
      symbol: 'GOLD',
      name: t.gold10g,
      value: '₹71,850',
      change: '+220.00',
      percentChange: '+0.31%',
      isPositive: true,
    },
    {
      symbol: 'GSEC',
      name: t.gsecYield,
      value: '6.88%',
      change: '0.00',
      percentChange: t.stable,
      isPositive: null,
    },
  ];

  return (
    <div
      role="region"
      aria-label="Live Financial Markets"
      className="bg-surface-lowest border-b border-border-subtle py-1.5 px-3 sm:px-4 text-[11px] font-mono select-none"
    >
      <div className="max-w-site mx-auto flex items-center justify-between gap-3 overflow-x-auto hide-scrollbar">
        {/* Left: Markets Live Header Badge */}
        <div className="flex items-center gap-1.5 font-sans font-extrabold text-primary flex-shrink-0 text-[11px] uppercase tracking-wider">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
          <span>{t.marketsLive}</span>
        </div>

        {/* Center/Right: Financial Ticker Items */}
        <div className="flex items-center gap-4 sm:gap-6 text-[11px] whitespace-nowrap">
          {marketData.map((item, idx) => (
            <React.Fragment key={item.symbol}>
              <div className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-default">
                <span className="font-bold text-ink">{item.name}</span>
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

              {idx < marketData.length - 1 && (
                <span className="text-border-strong hidden sm:inline">•</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
