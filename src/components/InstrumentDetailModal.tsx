import React, { useState } from 'react';
import { MarketInstrument, PortfolioPosition } from '../types';
import { formatCurrency, formatChange } from '../utils/formatters';
import { InteractiveChart } from './InteractiveChart';

interface InstrumentDetailModalProps {
  instrument: MarketInstrument | null;
  isOpen: boolean;
  onClose: () => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (instrument: MarketInstrument) => void;
  onExecuteTrade: (instrument: MarketInstrument, type: 'BUY' | 'SELL', shares: number) => void;
  userCash: number;
  existingPosition?: PortfolioPosition;
}

export const InstrumentDetailModal: React.FC<InstrumentDetailModalProps> = ({
  instrument,
  isOpen,
  onClose,
  isWatchlisted,
  onToggleWatchlist,
  onExecuteTrade,
  userCash,
  existingPosition,
}) => {
  if (!isOpen || !instrument) return null;

  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [shares, setShares] = useState<string>('10');
  const [tradeTab, setTradeTab] = useState<'TRADE' | 'STATS' | 'ORDERBOOK'>('STATS');
  const [showTradeSuccess, setShowTradeSuccess] = useState<string | null>(null);

  const parsedShares = Math.max(0, parseFloat(shares) || 0);
  const totalTradeCost = parsedShares * instrument.price;
  const isPositive = instrument.changePercent >= 0;

  const handleTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedShares <= 0) return;
    if (tradeType === 'BUY' && totalTradeCost > userCash) {
      alert(`Insufficient funds! Available cash: ${formatCurrency(userCash)}`);
      return;
    }
    if (tradeType === 'SELL' && (!existingPosition || existingPosition.shares < parsedShares)) {
      alert(`You do not own ${parsedShares} shares to sell! You currently hold ${existingPosition?.shares || 0}.`);
      return;
    }

    onExecuteTrade(instrument, tradeType, parsedShares);
    setShowTradeSuccess(`Successfully ${tradeType === 'BUY' ? 'purchased' : 'sold'} ${parsedShares} units of ${instrument.symbol}`);
    setTimeout(() => setShowTradeSuccess(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-[#E0E3EB] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0E3EB] bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {/* Instrument Badge or Icon */}
            {instrument.badgeNumber ? (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-xs"
                style={{ backgroundColor: instrument.badgeBg || '#2962FF', color: instrument.badgeColor || '#FFFFFF' }}
              >
                {instrument.badgeNumber}
              </div>
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: instrument.iconBg || '#000000', color: instrument.iconColor || '#FFFFFF' }}
              >
                <span className="material-symbols-outlined text-[20px]">{instrument.icon || 'trending_up'}</span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-[#131722]">{instrument.symbol}</h3>
                <span className="text-xs px-2 py-0.5 font-medium rounded-full bg-[#F1F4FB] text-[#6A6D78] border border-[#E0E3EB]">
                  {instrument.exchange || instrument.category}
                </span>
              </div>
              <p className="text-xs text-[#6A6D78] truncate max-w-xs">{instrument.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Watchlist Toggle */}
            <button
              id="modal-toggle-watchlist"
              onClick={() => onToggleWatchlist(instrument)}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                isWatchlisted
                  ? 'bg-amber-50 border-amber-300 text-amber-500 shadow-xs'
                  : 'border-[#E0E3EB] text-[#6A6D78] hover:bg-[#F1F4FB]'
              }`}
              title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <span className="material-symbols-outlined text-[20px]">{isWatchlisted ? 'star' : 'star_outline'}</span>
            </button>

            {/* Close Button */}
            <button
              id="modal-close-btn"
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#6A6D78] hover:bg-[#F1F4FB] hover:text-[#131722] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Success Toast */}
          {showTradeSuccess && (
            <div className="p-3 bg-[#089981]/10 border border-[#089981]/30 rounded-xl text-xs font-semibold text-[#089981] flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              {showTradeSuccess}
            </div>
          )}

          {/* Price Banner */}
          <div className="flex flex-wrap items-end justify-between gap-4 p-4 rounded-xl bg-[#F7F9FF] border border-[#E0E3EB]">
            <div>
              <span className="text-xs text-[#6A6D78] font-medium block">Current Market Price</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl font-extrabold text-[#131722] font-tabular">
                  {formatCurrency(instrument.price, instrument.category)}
                </span>
                <span
                  className={`text-sm font-bold px-2.5 py-1 rounded-md flex items-center gap-1 font-tabular ${
                    isPositive ? 'bg-[#089981]/10 text-[#089981]' : 'bg-[#F23645]/10 text-[#F23645]'
                  }`}
                >
                  {isPositive ? '▲' : '▼'} {formatChange(instrument.change, instrument.changePercent, instrument.category).text} (
                  {formatChange(instrument.change, instrument.changePercent, instrument.category).percentText})
                </span>
              </div>
            </div>

            {/* Holding preview if owned */}
            {existingPosition && (
              <div className="text-right">
                <span className="text-xs text-[#6A6D78] font-medium block">Your Position</span>
                <span className="text-sm font-bold text-[#131722] font-tabular">
                  {existingPosition.shares} units ({formatCurrency(existingPosition.currentValue)})
                </span>
                <span
                  className={`text-xs block font-semibold ${
                    existingPosition.unrealizedPnL >= 0 ? 'text-[#089981]' : 'text-[#F23645]'
                  }`}
                >
                  {existingPosition.unrealizedPnL >= 0 ? '+' : ''}
                  {formatCurrency(existingPosition.unrealizedPnL)} ({existingPosition.unrealizedPnLPercent.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>

          {/* Interactive Chart */}
          <InteractiveChart instrument={instrument} height={240} />

          {/* Tab Subnav (Stats / Order Book / Quick Trade) */}
          <div className="flex border-b border-[#E0E3EB] gap-4">
            <button
              onClick={() => setTradeTab('STATS')}
              className={`pb-2.5 text-xs font-bold transition-colors border-b-2 ${
                tradeTab === 'STATS' ? 'border-[#2962FF] text-[#2962FF]' : 'border-transparent text-[#6A6D78] hover:text-[#131722]'
              }`}
            >
              KEY METRICS
            </button>
            <button
              onClick={() => setTradeTab('TRADE')}
              className={`pb-2.5 text-xs font-bold transition-colors border-b-2 ${
                tradeTab === 'TRADE' ? 'border-[#2962FF] text-[#2962FF]' : 'border-transparent text-[#6A6D78] hover:text-[#131722]'
              }`}
            >
              PAPER TRADING
            </button>
            <button
              onClick={() => setTradeTab('ORDERBOOK')}
              className={`pb-2.5 text-xs font-bold transition-colors border-b-2 ${
                tradeTab === 'ORDERBOOK' ? 'border-[#2962FF] text-[#2962FF]' : 'border-transparent text-[#6A6D78] hover:text-[#131722]'
              }`}
            >
              ORDER BOOK (L2)
            </button>
          </div>

          {/* Stats View */}
          {tradeTab === 'STATS' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-[#F1F4FB]/50 rounded-xl border border-[#E0E3EB]">
                <span className="text-[11px] font-medium text-[#6A6D78] block">24h High</span>
                <span className="text-sm font-bold text-[#131722] font-tabular mt-0.5 block">
                  {formatCurrency(instrument.high24h, instrument.category)}
                </span>
              </div>
              <div className="p-3 bg-[#F1F4FB]/50 rounded-xl border border-[#E0E3EB]">
                <span className="text-[11px] font-medium text-[#6A6D78] block">24h Low</span>
                <span className="text-sm font-bold text-[#131722] font-tabular mt-0.5 block">
                  {formatCurrency(instrument.low24h, instrument.category)}
                </span>
              </div>
              <div className="p-3 bg-[#F1F4FB]/50 rounded-xl border border-[#E0E3EB]">
                <span className="text-[11px] font-medium text-[#6A6D78] block">Volume</span>
                <span className="text-sm font-bold text-[#131722] font-tabular mt-0.5 block">{instrument.volume}</span>
              </div>
              <div className="p-3 bg-[#F1F4FB]/50 rounded-xl border border-[#E0E3EB]">
                <span className="text-[11px] font-medium text-[#6A6D78] block">Market Cap</span>
                <span className="text-sm font-bold text-[#131722] font-tabular mt-0.5 block">{instrument.marketCap || 'N/A'}</span>
              </div>
              <div className="p-3 bg-[#F1F4FB]/50 rounded-xl border border-[#E0E3EB]">
                <span className="text-[11px] font-medium text-[#6A6D78] block">52-Week High</span>
                <span className="text-sm font-bold text-[#131722] font-tabular mt-0.5 block">
                  {instrument.week52High ? formatCurrency(instrument.week52High, instrument.category) : 'N/A'}
                </span>
              </div>
              <div className="p-3 bg-[#F1F4FB]/50 rounded-xl border border-[#E0E3EB]">
                <span className="text-[11px] font-medium text-[#6A6D78] block">52-Week Low</span>
                <span className="text-sm font-bold text-[#131722] font-tabular mt-0.5 block">
                  {instrument.week52Low ? formatCurrency(instrument.week52Low, instrument.category) : 'N/A'}
                </span>
              </div>
              <div className="p-3 bg-[#F1F4FB]/50 rounded-xl border border-[#E0E3EB]">
                <span className="text-[11px] font-medium text-[#6A6D78] block">P/E Ratio</span>
                <span className="text-sm font-bold text-[#131722] font-tabular mt-0.5 block">
                  {instrument.peRatio ? `${instrument.peRatio}x` : '—'}
                </span>
              </div>
              <div className="p-3 bg-[#F1F4FB]/50 rounded-xl border border-[#E0E3EB]">
                <span className="text-[11px] font-medium text-[#6A6D78] block">RSI (14)</span>
                <span className="text-sm font-bold text-[#131722] font-tabular mt-0.5 block">
                  {instrument.rsi ? `${instrument.rsi.toFixed(1)}` : '54.0'}
                </span>
              </div>
            </div>
          )}

          {/* Quick Trade Widget */}
          {tradeTab === 'TRADE' && (
            <form onSubmit={handleTradeSubmit} className="p-4 bg-[#F7F9FF] rounded-xl border border-[#E0E3EB] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex bg-[#E0E3EB]/50 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setTradeType('BUY')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                      tradeType === 'BUY' ? 'bg-[#089981] text-white shadow-xs' : 'text-[#6A6D78] hover:text-[#131722]'
                    }`}
                  >
                    BUY / LONG
                  </button>
                  <button
                    type="button"
                    onClick={() => setTradeType('SELL')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                      tradeType === 'SELL' ? 'bg-[#F23645] text-white shadow-xs' : 'text-[#6A6D78] hover:text-[#131722]'
                    }`}
                  >
                    SELL / SHORT
                  </button>
                </div>
                <div className="text-xs text-[#6A6D78] font-medium">
                  Buying Power: <span className="font-bold text-[#131722] font-tabular">{formatCurrency(userCash)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#131722] block mb-1">Quantity (Units / Shares)</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      value={shares}
                      onChange={(e) => setShares(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E0E3EB] rounded-lg focus:outline-none focus:border-[#2962FF] font-tabular"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#131722] block mb-1">Estimated Total</label>
                  <div className="px-3 py-2 bg-[#E0E3EB]/40 border border-[#E0E3EB] rounded-lg text-sm font-bold text-[#131722] font-tabular">
                    {formatCurrency(totalTradeCost, instrument.category)}
                  </div>
                </div>
              </div>

              {/* Quick Size Presets */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6A6D78]">Quick amount:</span>
                {[1, 5, 10, 50, 100].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setShares(qty.toString())}
                    className="px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-[#E0E3EB] hover:bg-[#F1F4FB] text-[#131722]"
                  >
                    +{qty}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 rounded-xl font-bold text-sm text-white shadow-xs transition-transform active:scale-98 ${
                  tradeType === 'BUY' ? 'bg-[#089981] hover:bg-[#078873]' : 'bg-[#F23645] hover:bg-[#d92c3a]'
                }`}
              >
                Execute {tradeType} Order ({formatCurrency(totalTradeCost, instrument.category)})
              </button>
            </form>
          )}

          {/* Level 2 Order Book Simulation */}
          {tradeTab === 'ORDERBOOK' && (
            <div className="p-4 bg-white rounded-xl border border-[#E0E3EB] space-y-3">
              <div className="grid grid-cols-2 gap-4 text-xs font-mono-num">
                {/* Bids (Green) */}
                <div>
                  <div className="flex justify-between font-bold text-[#089981] border-b border-[#E0E3EB] pb-1 mb-1">
                    <span>BID SIZE</span>
                    <span>PRICE</span>
                  </div>
                  {[0.999, 0.997, 0.995, 0.993, 0.991].map((factor, idx) => (
                    <div key={idx} className="flex justify-between py-0.5 hover:bg-[#089981]/5 rounded px-1">
                      <span className="text-[#6A6D78]">{(350 * (5 - idx) * 1.3).toFixed(0)}</span>
                      <span className="font-semibold text-[#089981]">
                        {(instrument.price * factor).toFixed(instrument.category === 'FOREX' ? 4 : 2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Asks (Red) */}
                <div>
                  <div className="flex justify-between font-bold text-[#F23645] border-b border-[#E0E3EB] pb-1 mb-1">
                    <span>PRICE</span>
                    <span>ASK SIZE</span>
                  </div>
                  {[1.001, 1.003, 1.005, 1.007, 1.009].map((factor, idx) => (
                    <div key={idx} className="flex justify-between py-0.5 hover:bg-[#F23645]/5 rounded px-1">
                      <span className="font-semibold text-[#F23645]">
                        {(instrument.price * factor).toFixed(instrument.category === 'FOREX' ? 4 : 2)}
                      </span>
                      <span className="text-[#6A6D78]">{(420 * (idx + 1) * 1.1).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* About / Description */}
          {instrument.description && (
            <div className="p-4 bg-white rounded-xl border border-[#E0E3EB]">
              <h4 className="text-xs font-bold text-[#6A6D78] uppercase tracking-wider mb-1">About {instrument.name}</h4>
              <p className="text-xs text-[#131722] leading-relaxed">{instrument.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
