import React, { useState } from 'react';

interface SettingsViewProps {
  onOpenAuth: () => void;
  currency: string;
  onChangeCurrency: (c: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenAuth,
  currency,
  onChangeCurrency,
}) => {
  const [refreshInterval, setRefreshInterval] = useState<string>('2s');
  const [defaultChart, setDefaultChart] = useState<string>('area');
  const [notifications, setNotifications] = useState<boolean>(true);
  const [soundEffects, setSoundEffects] = useState<boolean>(true);

  return (
    <div className="flex flex-col w-full bg-white max-w-3xl mx-auto px-4 sm:px-6 pt-5 pb-16">
      <div className="pb-4 border-b border-[#E0E3EB]">
        <h1 className="font-headline font-bold text-2xl text-[#131722]">Settings & Preferences</h1>
        <p className="text-xs text-[#6A6D78]">Customize your market data feeds, display currency, and terminal parameters</p>
      </div>

      <div className="space-y-6 pt-6">
        {/* Account Profile Card */}
        <div className="p-4 bg-[#F7F9FF] border border-[#E0E3EB] rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#0049DB] flex items-center justify-center text-white font-bold text-lg shadow-xs">
              <span className="material-symbols-outlined text-[24px]">person</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#131722]">Trader Account</h3>
              <p className="text-xs text-[#6A6D78]">Paper Trading Tier • Verified</p>
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-3 py-1.5 bg-white border border-[#E0E3EB] rounded-xl text-xs font-bold text-[#0049DB] hover:bg-[#F1F4FB] transition-colors"
          >
            Manage
          </button>
        </div>

        {/* Currency & Locale */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#6A6D78]">Display & Regional</h3>
          <div className="p-4 bg-white border border-[#E0E3EB] rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-[#131722] block">Base Display Currency</span>
                <span className="text-xs text-[#6A6D78]">All values converted to this denomination</span>
              </div>
              <select
                value={currency}
                onChange={(e) => onChangeCurrency(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold bg-[#F1F4FB] border border-[#E0E3EB] rounded-lg text-[#131722] outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="SGD">SGD (S$)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E0E3EB]/60">
              <div>
                <span className="text-sm font-semibold text-[#131722] block">Live Quote Feed Rate</span>
                <span className="text-xs text-[#6A6D78]">Frequency of synthetic tick fluctuation</span>
              </div>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold bg-[#F1F4FB] border border-[#E0E3EB] rounded-lg text-[#131722] outline-none"
              >
                <option value="1s">Ultra Fast (1s)</option>
                <option value="2s">Normal (2s)</option>
                <option value="5s">Eco Mode (5s)</option>
                <option value="0">Paused</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E0E3EB]/60">
              <div>
                <span className="text-sm font-semibold text-[#131722] block">Default Chart Style</span>
                <span className="text-xs text-[#6A6D78]">Preferred initial visualization</span>
              </div>
              <div className="flex bg-[#F1F4FB] p-0.5 rounded-lg border border-[#E0E3EB]">
                <button
                  onClick={() => setDefaultChart('area')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    defaultChart === 'area' ? 'bg-white text-[#0049DB] shadow-xs' : 'text-[#6A6D78]'
                  }`}
                >
                  Area
                </button>
                <button
                  onClick={() => setDefaultChart('candle')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    defaultChart === 'candle' ? 'bg-white text-[#0049DB] shadow-xs' : 'text-[#6A6D78]'
                  }`}
                >
                  Candlestick
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Toggles */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#6A6D78]">Alerts & Trading Feedback</h3>
          <div className="p-4 bg-white border border-[#E0E3EB] rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-[#131722] block">Market Price Alerts</span>
                <span className="text-xs text-[#6A6D78]">Toast alerts on 52-week breakout highs/lows</span>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-4 h-4 accent-[#0049DB] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E0E3EB]/60">
              <div>
                <span className="text-sm font-semibold text-[#131722] block">Order Confirmation Audio</span>
                <span className="text-xs text-[#6A6D78]">Chime feedback when order is executed</span>
              </div>
              <input
                type="checkbox"
                checked={soundEffects}
                onChange={(e) => setSoundEffects(e.target.checked)}
                className="w-4 h-4 accent-[#0049DB] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* About App */}
        <div className="p-4 bg-[#F7F9FF] border border-[#E0E3EB] rounded-xl text-xs text-[#6A6D78] space-y-1">
          <span className="font-bold text-[#131722] block">TradeScope Terminal v2.4</span>
          <p>Global financial market intelligence engine featuring real-time index computation, asset watchlists, and paper execution.</p>
        </div>
      </div>
    </div>
  );
};
