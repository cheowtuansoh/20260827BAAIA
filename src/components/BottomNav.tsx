import React from 'react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  watchlistCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  watchlistCount,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: string; badge?: number }[] = [
    { id: 'watchlist', label: 'Watchlist', icon: 'dashboard', badge: watchlistCount },
    { id: 'markets', label: 'Markets', icon: 'analytics' },
    { id: 'news', label: 'News', icon: 'newspaper' },
    { id: 'portfolio', label: 'Portfolio', icon: 'account_balance_wallet' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-40 bg-white/95 backdrop-blur-xl border-t border-[#E0E3EB] pb-safe shadow-[0_-1px_8px_rgba(0,0,0,0.03)]">
      <div className="h-16 max-w-7xl mx-auto flex items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`bottom-nav-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 relative ${
                isActive ? 'text-[#0049DB]' : 'text-[#6A6D78] hover:text-[#131722]'
              }`}
            >
              <div className="relative">
                <span className={`material-symbols-outlined text-[22px] ${isActive ? 'font-semibold' : ''}`}>
                  {tab.icon}
                </span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#0049DB] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium mt-0.5 tracking-tight ${isActive ? 'font-bold text-[#0049DB]' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
