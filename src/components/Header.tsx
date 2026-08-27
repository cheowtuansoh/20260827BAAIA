import React from 'react';
import { MarketCategory } from '../types';

interface HeaderProps {
  activeCategory: MarketCategory;
  onSelectCategory: (category: MarketCategory) => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
}

const CATEGORIES: MarketCategory[] = [
  'INDICES',
  'STOCKS',
  'CRYPTO',
  'FUTURES',
  'FOREX',
  'BONDS',
  'ECONOMY',
];

export const Header: React.FC<HeaderProps> = ({
  activeCategory,
  onSelectCategory,
  onOpenSearch,
  onOpenAuth,
}) => {
  return (
    <header className="fixed top-0 w-full z-40 bg-white/95 backdrop-blur-xl border-b border-[#E0E3EB] shadow-[0_1px_8px_rgba(0,0,0,0.03)] pt-safe">
      {/* Top Bar */}
      <div className="h-14 px-4 sm:px-6 flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-[#131722] flex items-center justify-center text-white shadow-xs">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6h16v3H13v9H9V9H4V6zm11 5h5v7h-5v-7z" fill="#2962FF" />
              <path d="M3 18h18v2H3z" fill="#FFFFFF" />
            </svg>
          </div>
          <span className="font-headline font-bold text-xl text-[#0049DB] tracking-tight">TradeScope</span>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {/* Search Trigger Button */}
          <button
            id="header-search-btn"
            onClick={onOpenSearch}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-[#434656] hover:bg-[#F1F4FB] hover:text-[#131722] transition-colors"
            title="Search Markets (Cmd + K)"
          >
            <span className="material-symbols-outlined text-[22px]">search</span>
          </button>

          {/* Get Started Button */}
          <button
            id="header-get-started-btn"
            onClick={onOpenAuth}
            className="bg-[#0049DB] hover:bg-[#003AB3] text-white px-3.5 sm:px-4 py-2 rounded-xl font-semibold text-[13px] active:scale-95 transition-all shadow-xs"
          >
            Get Started
          </button>

          {/* User Profile Avatar */}
          <button
            id="header-profile-btn"
            onClick={onOpenAuth}
            className="w-8 h-8 rounded-full bg-[#0049DB] hover:bg-[#003AB3] flex items-center justify-center ml-1 text-white shadow-xs transition-transform active:scale-95"
            title="Account & Settings"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </button>
        </div>
      </div>

      {/* Subnav Category Tabs */}
      <nav className="flex overflow-x-auto no-scrollbar border-t border-[#E0E3EB]/80 px-4 sm:px-6 max-w-7xl mx-auto">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              id={`nav-category-${cat.toLowerCase()}`}
              onClick={() => onSelectCategory(cat)}
              className={`whitespace-nowrap px-4 py-2.5 font-bold text-[11px] tracking-wider transition-all border-b-2 ${
                isActive
                  ? 'text-[#0049DB] border-[#0049DB]'
                  : 'text-[#6A6D78] border-transparent hover:text-[#131722]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
