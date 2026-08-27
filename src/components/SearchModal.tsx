import React, { useState, useMemo } from 'react';
import { MarketInstrument, MarketCategory } from '../types';
import { formatCurrency, formatChange } from '../utils/formatters';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  instruments: MarketInstrument[];
  onSelectInstrument: (instrument: MarketInstrument) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  instruments,
  onSelectInstrument,
}) => {
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | MarketCategory>('ALL');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return instruments.filter((inst) => {
      const matchCategory = selectedFilter === 'ALL' || inst.category === selectedFilter;
      if (!matchCategory) return false;
      if (!q) return true;
      return (
        inst.symbol.toLowerCase().includes(q) ||
        inst.name.toLowerCase().includes(q) ||
        (inst.subCategory && inst.subCategory.toLowerCase().includes(q))
      );
    });
  }, [instruments, query, selectedFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:pt-16 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E0E3EB] overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E0E3EB]">
          <span className="material-symbols-outlined text-[#6A6D78]">search</span>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbols, indices, stocks, crypto (e.g. NVDA, BTC, S&P 500)..."
            className="flex-1 text-sm bg-transparent border-none outline-none text-[#131722] placeholder:text-[#6A6D78]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#6A6D78] hover:text-[#131722] p-1 text-xs"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2.5 py-1 rounded-md bg-[#F1F4FB] text-[#6A6D78] hover:text-[#131722] font-semibold"
          >
            ESC
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-[#F7F9FF] border-b border-[#E0E3EB] overflow-x-auto no-scrollbar">
          {(['ALL', 'INDICES', 'STOCKS', 'CRYPTO', 'FUTURES', 'FOREX', 'BONDS', 'ECONOMY'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
                selectedFilter === cat
                  ? 'bg-[#2962FF] text-white shadow-xs'
                  : 'bg-white text-[#6A6D78] border border-[#E0E3EB] hover:bg-[#F1F4FB]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#E0E3EB]/60">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[#6A6D78] text-sm">
              <span className="material-symbols-outlined text-3xl mb-1 block opacity-40">search_off</span>
              No instruments found matching "{query}"
            </div>
          ) : (
            filtered.map((inst) => {
              const isPositive = inst.changePercent >= 0;
              return (
                <div
                  key={inst.id}
                  onClick={() => {
                    onSelectInstrument(inst);
                    onClose();
                  }}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[#F1F4FB] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {inst.badgeNumber ? (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0"
                        style={{ backgroundColor: inst.badgeBg || '#2962FF', color: inst.badgeColor || '#FFFFFF' }}
                      >
                        {inst.badgeNumber}
                      </div>
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: inst.iconBg || '#000000', color: inst.iconColor || '#FFFFFF' }}
                      >
                        <span className="material-symbols-outlined text-[16px]">{inst.icon || 'show_chart'}</span>
                      </div>
                    )}
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#131722]">{inst.symbol}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#E0E3EB]/50 text-[#6A6D78] font-mono-num">
                          {inst.category}
                        </span>
                      </div>
                      <span className="text-xs text-[#6A6D78] truncate block">{inst.name}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-[#131722] font-tabular block">
                      {formatCurrency(inst.price, inst.category)}
                    </span>
                    <span
                      className={`text-xs font-semibold font-tabular flex items-center justify-end gap-0.5 ${
                        isPositive ? 'text-[#089981]' : 'text-[#F23645]'
                      }`}
                    >
                      {isPositive ? '▲' : '▼'} {formatChange(inst.change, inst.changePercent, inst.category).percentText}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
