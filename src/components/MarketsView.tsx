import React, { useState } from 'react';
import { MarketInstrument, MarketCategory } from '../types';
import { formatCurrency, formatChange, generateSparklineSvgPath } from '../utils/formatters';

interface MarketsViewProps {
  instruments: MarketInstrument[];
  onSelectInstrument: (instrument: MarketInstrument) => void;
  activeCategory: MarketCategory;
  onSelectCategory: (category: MarketCategory) => void;
}

export const MarketsView: React.FC<MarketsViewProps> = ({
  instruments,
  onSelectInstrument,
  activeCategory,
  onSelectCategory,
}) => {
  const [selectedSubFilter, setSelectedSubFilter] = useState<string>('All');
  const [showMarketsDropdown, setShowMarketsDropdown] = useState<boolean>(false);
  const [showLiveSparklinesInCards, setShowLiveSparklinesInCards] = useState<boolean>(true);

  // Group instruments
  const majorIndices = instruments.filter(
    (i) => i.id === 'sp500' || i.id === 'ndx' || i.id === 'dji' || i.id === 'rut'
  );

  const worldIndices = instruments.filter(
    (i) => i.category === 'INDICES' && !['sp500', 'ndx', 'dji', 'rut'].includes(i.id)
  );

  const usStocks = instruments.filter((i) => i.category === 'STOCKS');

  const cryptoInstruments = instruments.filter((i) => i.category === 'CRYPTO');
  const futuresInstruments = instruments.filter((i) => i.category === 'FUTURES');
  const forexInstruments = instruments.filter((i) => i.category === 'FOREX');
  const bondsInstruments = instruments.filter((i) => i.category === 'BONDS');

  // Top gainers and losers
  const topGainers = [...instruments].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const topLosers = [...instruments].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);

  const filterChips = [
    { label: 'All', cat: null },
    { label: 'Crypto', cat: 'CRYPTO' as MarketCategory },
    { label: 'Indices', cat: 'INDICES' as MarketCategory },
    { label: 'Futures', cat: 'FUTURES' as MarketCategory },
    { label: 'Forex', cat: 'FOREX' as MarketCategory },
    { label: 'Government bonds', cat: 'BONDS' as MarketCategory },
  ];

  return (
    <div className="flex flex-col w-full bg-white pb-10">
      {/* Header Section: "Markets, everywhere" */}
      <div className="px-4 sm:px-6 pt-5 pb-2 flex items-center justify-between relative max-w-7xl mx-auto w-full">
        <div 
          onClick={() => setShowMarketsDropdown(!showMarketsDropdown)}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <h1 className="font-headline font-bold text-2xl sm:text-[28px] text-[#131722] tracking-tight group-hover:text-[#0049DB] transition-colors">
            Markets, everywhere
          </h1>
          <span className={`material-symbols-outlined text-[#131722] text-[28px] transition-transform ${showMarketsDropdown ? 'rotate-180 text-[#0049DB]' : ''}`}>
            expand_more
          </span>
        </div>

        {/* Live Data / Empty State Switcher for visual parity with screenshot */}
        <button
          onClick={() => setShowLiveSparklinesInCards(!showLiveSparklinesInCards)}
          className="text-xs px-2.5 py-1 rounded-lg border border-[#E0E3EB] text-[#6A6D78] hover:text-[#131722] bg-[#F7F9FF] font-medium transition-colors"
          title="Toggle between Live quotes and minimalist card view"
        >
          {showLiveSparklinesInCards ? 'Card View: Live Data' : 'Card View: Minimal'}
        </button>

        {/* Dropdown Menu */}
        {showMarketsDropdown && (
          <div className="absolute top-14 left-4 z-30 w-64 bg-white rounded-xl shadow-xl border border-[#E0E3EB] py-2 animate-in fade-in">
            <div className="px-3 py-1.5 text-[11px] font-bold text-[#6A6D78] uppercase tracking-wider">
              Market Regions & Views
            </div>
            {[
              { name: 'Global Overview', desc: 'All asset classes & macro' },
              { name: 'US Markets', desc: 'S&P 500, Nasdaq, NYSE' },
              { name: 'European Markets', desc: 'DAX, FTSE, CAC' },
              { name: 'Asia-Pacific', desc: 'Nikkei, Hang Seng, Nifty' },
              { name: 'Digital Assets (24/7)', desc: 'Bitcoin, Ethereum, DeFi' },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => setShowMarketsDropdown(false)}
                className="w-full text-left px-3 py-2 hover:bg-[#F1F4FB] transition-colors flex flex-col"
              >
                <span className="text-xs font-semibold text-[#131722]">{item.name}</span>
                <span className="text-[10px] text-[#6A6D78]">{item.desc}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Horizontal Scroll Filter Categories */}
      <div className="pl-4 sm:pl-6 pr-4 py-2 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {filterChips.map((chip) => {
            const isSelected = chip.label === selectedSubFilter;
            return (
              <button
                key={chip.label}
                id={`filter-chip-${chip.label.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => {
                  setSelectedSubFilter(chip.label);
                  if (chip.cat) onSelectCategory(chip.cat);
                }}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-all ${
                  isSelected
                    ? 'bg-[#F1F4FB] text-[#131722] font-semibold border border-[#E0E3EB] shadow-xs'
                    : 'bg-white text-[#131722] border border-[#E0E3EB] hover:bg-[#F7F9FF]'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: Major Indices Cards (Horizontal Scroll) */}
      <div className="pl-4 sm:pl-6 py-4 overflow-x-auto no-scrollbar max-w-7xl mx-auto w-full">
        <div className="flex gap-4 pr-4 sm:pr-6 pb-2">
          {majorIndices.map((inst) => {
            const isPositive = inst.changePercent >= 0;
            const stroke = isPositive ? '#089981' : '#F23645';
            const sparklinePath = generateSparklineSvgPath(inst.sparklineData, 160, 48);

            return (
              <div
                key={inst.id}
                id={`major-card-${inst.id}`}
                onClick={() => onSelectInstrument(inst)}
                className="w-[280px] shrink-0 bg-white border border-[#E0E3EB] rounded-xl p-4 flex flex-col h-[160px] relative shadow-xs hover:shadow-md hover:border-[#2962FF]/50 transition-all cursor-pointer group justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-mono-num text-[10px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: inst.badgeBg || '#E53935' }}
                      >
                        {inst.badgeNumber}
                      </div>
                      <span className="font-semibold text-sm text-[#131722] group-hover:text-[#0049DB] transition-colors">
                        {inst.name}
                      </span>
                    </div>

                    {/* Change Pill */}
                    {showLiveSparklinesInCards && (
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded font-tabular ${
                          isPositive ? 'text-[#089981] bg-[#089981]/10' : 'text-[#F23645] bg-[#F23645]/10'
                        }`}
                      >
                        {isPositive ? '+' : ''}{inst.changePercent.toFixed(2)}%
                      </span>
                    )}
                  </div>

                  {showLiveSparklinesInCards && (
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-bold text-[#131722] font-tabular">
                        {formatCurrency(inst.price, inst.category)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Body Content / Sparkline or Minimal Placeholder */}
                <div className="flex-1 flex items-center justify-center">
                  {showLiveSparklinesInCards ? (
                    <div className="w-full h-12 flex items-center justify-end">
                      <svg viewBox="0 0 160 48" className="w-36 h-10 overflow-visible">
                        <path d={sparklinePath} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  ) : (
                    <span className="text-[#6A6D78] text-[13px]">No data here yet</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: World Indices Section */}
      <div className="px-4 sm:px-6 pt-6 pb-2 max-w-7xl mx-auto w-full">
        <div 
          onClick={() => onSelectCategory('INDICES')}
          className="flex items-center gap-1 cursor-pointer mb-3 hover:opacity-80 transition-opacity w-fit group"
        >
          <h2 className="font-headline font-semibold text-xl text-[#131722] group-hover:text-[#0049DB] transition-colors">
            World indices
          </h2>
          <span className="material-symbols-outlined text-[#131722] text-[24px] group-hover:translate-x-1 transition-transform">
            chevron_right
          </span>
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 pr-4 sm:pr-6">
          {worldIndices.map((inst) => {
            const isPositive = inst.changePercent >= 0;
            return (
              <div
                key={inst.id}
                id={`world-card-${inst.id}`}
                onClick={() => onSelectInstrument(inst)}
                className="w-[280px] shrink-0 bg-white border border-[#E0E3EB] rounded-xl p-4 flex flex-col h-[140px] justify-between shadow-xs hover:shadow-md hover:border-[#2962FF]/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-mono-num text-[12px] font-bold text-white shadow-xs shrink-0"
                    style={{ backgroundColor: inst.badgeBg || '#1565C0' }}
                  >
                    {inst.badgeNumber}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm text-[#131722] group-hover:text-[#0049DB] transition-colors">
                      {inst.symbol}
                    </span>
                    <span className="text-[13px] text-[#6A6D78] truncate w-40">{inst.name}</span>
                  </div>
                </div>

                <div className="flex items-end justify-between pt-2 border-t border-[#E0E3EB]/50">
                  <span className="text-base font-bold text-[#131722] font-tabular">
                    {formatCurrency(inst.price, inst.category)}
                  </span>
                  <span
                    className={`text-xs font-semibold font-tabular flex items-center gap-0.5 ${
                      isPositive ? 'text-[#089981]' : 'text-[#F23645]'
                    }`}
                  >
                    {isPositive ? '▲' : '▼'} {formatChange(inst.change, inst.changePercent, inst.category).percentText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: US Stocks Section */}
      <div className="px-4 sm:px-6 pt-6 pb-4 max-w-7xl mx-auto w-full">
        <div 
          onClick={() => onSelectCategory('STOCKS')}
          className="flex items-center gap-2 cursor-pointer mb-3 hover:opacity-80 transition-opacity w-fit group"
        >
          {/* US Flag SVG Icon */}
          <div className="w-6 h-6 rounded-full overflow-hidden border border-[#E0E3EB] flex-shrink-0 flex items-center justify-center bg-[#F0F0F0] shadow-xs">
            <svg className="w-full h-full" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0h512v512H0z" fill="#eee" />
              <path d="M0 56.9h512v45.5H0zm0 91.1h512v45.5H0zm0 91.1h512v45.5H0zm0 91.1h512v45.5H0zm0 91.1h512v45.5H0z" fill="#d80027" />
              <path d="M0 0h256v284.4H0z" fill="#0052b4" />
              <g fill="#eee">
                <circle cx="50" cy="50" r="14" />
                <circle cx="120" cy="50" r="14" />
                <circle cx="190" cy="50" r="14" />
                <circle cx="85" cy="110" r="14" />
                <circle cx="155" cy="110" r="14" />
                <circle cx="50" cy="170" r="14" />
                <circle cx="120" cy="170" r="14" />
                <circle cx="190" cy="170" r="14" />
                <circle cx="85" cy="230" r="14" />
                <circle cx="155" cy="230" r="14" />
              </g>
            </svg>
          </div>
          <h2 className="font-headline font-semibold text-xl text-[#131722] group-hover:text-[#0049DB] transition-colors">
            US stocks
          </h2>
          <span className="material-symbols-outlined text-[#131722] text-[24px] group-hover:translate-x-1 transition-transform">
            chevron_right
          </span>
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 pr-4 sm:pr-6">
          {usStocks.map((inst) => {
            const isPositive = inst.changePercent >= 0;
            return (
              <div
                key={inst.id}
                id={`stock-card-${inst.id}`}
                onClick={() => onSelectInstrument(inst)}
                className="w-[280px] shrink-0 bg-white border border-[#E0E3EB] rounded-xl p-4 flex flex-col h-[74px] justify-center shadow-xs hover:shadow-md hover:border-[#2962FF]/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-xs shrink-0"
                      style={{ backgroundColor: inst.iconBg || '#000000' }}
                    >
                      <span className="material-symbols-outlined text-[18px]" style={{ color: inst.iconColor || '#FFFFFF' }}>
                        {inst.icon || 'trending_up'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-[#131722] group-hover:text-[#0049DB] transition-colors">
                        {inst.name}
                      </span>
                      <span className="text-[11px] text-[#6A6D78] font-mono-num">{inst.symbol}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-[#131722] font-tabular block">
                      {formatCurrency(inst.price)}
                    </span>
                    <span className={`text-[11px] font-semibold font-tabular ${isPositive ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                      {isPositive ? '+' : ''}{inst.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: Crypto & Commodities Quick Section */}
      <div className="px-4 sm:px-6 pt-4 pb-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-headline font-semibold text-xl text-[#131722]">
            Digital Assets & Commodities
          </h2>
          <span className="text-xs font-semibold text-[#0049DB] cursor-pointer hover:underline" onClick={() => onSelectCategory('CRYPTO')}>
            View All
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...cryptoInstruments.slice(0, 2), ...futuresInstruments.slice(0, 2)].map((inst) => {
            const isPositive = inst.changePercent >= 0;
            return (
              <div
                key={inst.id}
                onClick={() => onSelectInstrument(inst)}
                className="p-3.5 bg-white border border-[#E0E3EB] rounded-xl hover:border-[#2962FF]/50 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs text-white"
                    style={{ backgroundColor: inst.badgeBg || '#2962FF' }}
                  >
                    {inst.badgeNumber || inst.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#131722] block">{inst.symbol}</span>
                    <span className="text-[11px] text-[#6A6D78] truncate block max-w-[110px]">{inst.name}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-[#131722] font-tabular block">
                    {formatCurrency(inst.price, inst.category)}
                  </span>
                  <span className={`text-[11px] font-semibold font-tabular ${isPositive ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                    {isPositive ? '+' : ''}{inst.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 5: Top Gainers & Losers Market Table */}
      <div className="px-4 sm:px-6 pt-4 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Gainers */}
          <div className="bg-[#F7F9FF] border border-[#E0E3EB] rounded-xl p-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E3EB]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#089981]"></span>
                <h3 className="font-bold text-sm text-[#131722]">Top Gainers</h3>
              </div>
              <span className="text-[11px] text-[#6A6D78] font-medium">24h Performance</span>
            </div>
            <div className="divide-y divide-[#E0E3EB]/60">
              {topGainers.map((inst) => (
                <div
                  key={inst.id}
                  onClick={() => onSelectInstrument(inst)}
                  className="py-2.5 flex items-center justify-between hover:bg-white/80 px-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#131722]">{inst.symbol}</span>
                    <span className="text-[11px] text-[#6A6D78] truncate max-w-[120px]">{inst.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-[#131722] font-tabular">
                      {formatCurrency(inst.price, inst.category)}
                    </span>
                    <span className="text-xs font-bold text-[#089981] bg-[#089981]/10 px-2 py-0.5 rounded font-tabular">
                      +{inst.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div className="bg-[#F7F9FF] border border-[#E0E3EB] rounded-xl p-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E3EB]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F23645]"></span>
                <h3 className="font-bold text-sm text-[#131722]">Top Declines</h3>
              </div>
              <span className="text-[11px] text-[#6A6D78] font-medium">24h Performance</span>
            </div>
            <div className="divide-y divide-[#E0E3EB]/60">
              {topLosers.map((inst) => (
                <div
                  key={inst.id}
                  onClick={() => onSelectInstrument(inst)}
                  className="py-2.5 flex items-center justify-between hover:bg-white/80 px-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#131722]">{inst.symbol}</span>
                    <span className="text-[11px] text-[#6A6D78] truncate max-w-[120px]">{inst.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-[#131722] font-tabular">
                      {formatCurrency(inst.price, inst.category)}
                    </span>
                    <span className="text-xs font-bold text-[#F23645] bg-[#F23645]/10 px-2 py-0.5 rounded font-tabular">
                      {inst.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
