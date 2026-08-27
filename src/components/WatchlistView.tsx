import React, { useState } from 'react';
import { MarketInstrument } from '../types';
import { formatCurrency, formatChange, generateSparklineSvgPath } from '../utils/formatters';

interface WatchlistViewProps {
  instruments: MarketInstrument[];
  watchlistIds: string[];
  onToggleWatchlist: (instrument: MarketInstrument) => void;
  onSelectInstrument: (instrument: MarketInstrument) => void;
  onOpenSearch: () => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  instruments,
  watchlistIds,
  onToggleWatchlist,
  onSelectInstrument,
  onOpenSearch,
}) => {
  const [activeList, setActiveList] = useState<string>('My Watchlist');

  const watchlistedInstruments = instruments.filter((i) => watchlistIds.includes(i.id));

  return (
    <div className="flex flex-col w-full bg-white max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-16">
      {/* Title & Watchlist Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E0E3EB]">
        <div>
          <h1 className="font-headline font-bold text-2xl text-[#131722]">Watchlist</h1>
          <p className="text-xs text-[#6A6D78]">Real-time tracking for your pinned financial instruments</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0049DB] text-white text-xs font-semibold hover:bg-[#003AB3] shadow-xs active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add Symbol
          </button>
        </div>
      </div>

      {/* Watchlist Filter Tabs */}
      <div className="flex items-center gap-2 py-3 border-b border-[#E0E3EB]/70 overflow-x-auto no-scrollbar">
        {['My Watchlist', 'Tech Leaders', 'Macro & FX', 'Crypto Trends'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveList(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeList === tab
                ? 'bg-[#F1F4FB] text-[#0049DB] border border-[#E0E3EB]'
                : 'text-[#6A6D78] hover:text-[#131722]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Table or Empty State */}
      {watchlistedInstruments.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#F1F4FB] flex items-center justify-center text-[#6A6D78] mb-3">
            <span className="material-symbols-outlined text-3xl">star_outline</span>
          </div>
          <h3 className="text-base font-bold text-[#131722]">Your Watchlist is empty</h3>
          <p className="text-xs text-[#6A6D78] max-w-sm mt-1 mb-4">
            Search for your favorite stocks, indices, crypto, or commodities to monitor live price action.
          </p>
          <button
            onClick={onOpenSearch}
            className="px-4 py-2 bg-[#0049DB] text-white rounded-xl text-xs font-bold hover:bg-[#003AB3] transition-colors"
          >
            Explore Markets
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E0E3EB] text-[11px] font-bold text-[#6A6D78] uppercase">
                <th className="py-3 px-2">Symbol / Asset</th>
                <th className="py-3 px-2 text-right">Price</th>
                <th className="py-3 px-2 text-right">24h Change</th>
                <th className="py-3 px-2 text-center hidden sm:table-cell">Trend (24h)</th>
                <th className="py-3 px-2 text-right hidden md:table-cell">Volume</th>
                <th className="py-3 px-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E3EB]/60">
              {watchlistedInstruments.map((inst) => {
                const isPositive = inst.changePercent >= 0;
                const sparklinePath = generateSparklineSvgPath(inst.sparklineData, 80, 24);
                const stroke = isPositive ? '#089981' : '#F23645';

                return (
                  <tr
                    key={inst.id}
                    onClick={() => onSelectInstrument(inst)}
                    className="hover:bg-[#F7F9FF] cursor-pointer transition-colors group"
                  >
                    {/* Symbol & Name */}
                    <td className="py-3.5 px-2">
                      <div className="flex items-center gap-3">
                        {inst.badgeNumber ? (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] text-white shadow-xs shrink-0"
                            style={{ backgroundColor: inst.badgeBg || '#2962FF' }}
                          >
                            {inst.badgeNumber}
                          </div>
                        ) : (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-xs shrink-0"
                            style={{ backgroundColor: inst.iconBg || '#000000' }}
                          >
                            <span className="material-symbols-outlined text-[16px]">{inst.icon || 'show_chart'}</span>
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-sm text-[#131722] group-hover:text-[#0049DB] transition-colors">
                            {inst.symbol}
                          </div>
                          <div className="text-xs text-[#6A6D78] truncate max-w-[140px] sm:max-w-xs">{inst.name}</div>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-2 text-right">
                      <span className="font-bold text-sm text-[#131722] font-tabular">
                        {formatCurrency(inst.price, inst.category)}
                      </span>
                    </td>

                    {/* 24h Change */}
                    <td className="py-3.5 px-2 text-right">
                      <span
                        className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded font-tabular ${
                          isPositive ? 'text-[#089981] bg-[#089981]/10' : 'text-[#F23645] bg-[#F23645]/10'
                        }`}
                      >
                        {isPositive ? '+' : ''}{inst.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    {/* Sparkline mini-chart */}
                    <td className="py-3.5 px-2 text-center hidden sm:table-cell">
                      <div className="w-20 h-6 mx-auto flex items-center justify-center">
                        <svg viewBox="0 0 80 24" className="w-full h-full overflow-visible">
                          <path d={sparklinePath} fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                      </div>
                    </td>

                    {/* Volume */}
                    <td className="py-3.5 px-2 text-right text-xs font-mono-num text-[#6A6D78] hidden md:table-cell">
                      {inst.volume}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-2 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatchlist(inst);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-500 hover:bg-amber-50 transition-colors mx-auto"
                        title="Remove from Watchlist"
                      >
                        <span className="material-symbols-outlined text-[18px]">star</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
