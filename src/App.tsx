/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  MarketInstrument,
  MarketCategory,
  ActiveTab,
  PortfolioPosition,
  TransactionRecord,
} from './types';
import { INITIAL_INSTRUMENTS, MOCK_NEWS } from './data/mockMarkets';
import { Header } from './components/Header';
import { MarketsView } from './components/MarketsView';
import { WatchlistView } from './components/WatchlistView';
import { NewsView } from './components/NewsView';
import { PortfolioView } from './components/PortfolioView';
import { SettingsView } from './components/SettingsView';
import { BottomNav } from './components/BottomNav';
import { InstrumentDetailModal } from './components/InstrumentDetailModal';
import { SearchModal } from './components/SearchModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [instruments, setInstruments] = useState<MarketInstrument[]>(INITIAL_INSTRUMENTS);
  const [activeTab, setActiveTab] = useState<ActiveTab>('markets');
  const [activeCategory, setActiveCategory] = useState<MarketCategory>('INDICES');
  const [watchlistIds, setWatchlistIds] = useState<string[]>([
    'sp500',
    'ndx',
    'nvda',
    'aapl',
    'btc',
    'gc',
  ]);
  const [selectedInstrument, setSelectedInstrument] = useState<MarketInstrument | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [currency, setCurrency] = useState<string>('USD');

  // Paper Trading Portfolio State
  const [cashBalance, setCashBalance] = useState<number>(85420.5);
  const [positions, setPositions] = useState<PortfolioPosition[]>([
    {
      instrumentId: 'nvda',
      symbol: 'NVDA',
      name: 'NVIDIA',
      shares: 40,
      avgBuyPrice: 132.5,
      currentPrice: 145.85,
      totalCost: 5300.0,
      currentValue: 5834.0,
      unrealizedPnL: 534.0,
      unrealizedPnLPercent: 10.07,
      category: 'STOCKS',
    },
    {
      instrumentId: 'btc',
      symbol: 'BTCUSD',
      name: 'Bitcoin',
      shares: 0.1,
      avgBuyPrice: 89000.0,
      currentPrice: 94820.0,
      totalCost: 8900.0,
      currentValue: 9482.0,
      unrealizedPnL: 582.0,
      unrealizedPnLPercent: 6.54,
      category: 'CRYPTO',
    },
  ]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([
    {
      id: 'tx-1',
      instrumentId: 'nvda',
      symbol: 'NVDA',
      type: 'BUY',
      shares: 40,
      price: 132.5,
      totalAmount: 5300.0,
      timestamp: 'Today, 10:14 AM',
    },
    {
      id: 'tx-2',
      instrumentId: 'btc',
      symbol: 'BTCUSD',
      type: 'BUY',
      shares: 0.1,
      price: 89000.0,
      totalAmount: 8900.0,
      timestamp: 'Yesterday, 02:45 PM',
    },
  ]);

  // Live Market Tick Fluctuation Simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setInstruments((prevInstruments) => {
        // Randomly pick 2 instruments to fluctuate
        const updated = [...prevInstruments];
        const numToUpdate = Math.floor(Math.random() * 2) + 1;

        for (let i = 0; i < numToUpdate; i++) {
          const randomIndex = Math.floor(Math.random() * updated.length);
          const target = updated[randomIndex];
          
          // Random delta between -0.15% and +0.15%
          const pctDelta = (Math.random() - 0.49) * 0.003;
          const priceDelta = target.price * pctDelta;
          const newPrice = Math.max(0.001, target.price + priceDelta);
          const newChange = newPrice - target.previousClose;
          const newChangePercent = (newChange / target.previousClose) * 100;

          const newSparkline = [...target.sparklineData.slice(1), newPrice];

          updated[randomIndex] = {
            ...target,
            price: Number(newPrice.toFixed(target.category === 'FOREX' ? 4 : 2)),
            change: Number(newChange.toFixed(target.category === 'FOREX' ? 4 : 2)),
            changePercent: Number(newChangePercent.toFixed(2)),
            high24h: Math.max(target.high24h, newPrice),
            low24h: Math.min(target.low24h, newPrice),
            sparklineData: newSparkline,
            lastTickDirection: priceDelta >= 0 ? 'up' : 'down',
            lastTickTime: Date.now(),
          };
        }

        return updated;
      });
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  // Update positions based on live prices
  useEffect(() => {
    setPositions((prevPositions) =>
      prevPositions.map((pos) => {
        const liveInst = instruments.find((i) => i.id === pos.instrumentId);
        if (!liveInst) return pos;
        const currentValue = pos.shares * liveInst.price;
        const unrealizedPnL = currentValue - pos.totalCost;
        const unrealizedPnLPercent = pos.totalCost > 0 ? (unrealizedPnL / pos.totalCost) * 100 : 0;
        return {
          ...pos,
          currentPrice: liveInst.price,
          currentValue,
          unrealizedPnL,
          unrealizedPnLPercent,
        };
      })
    );
  }, [instruments]);

  // Keep selected instrument in sync with live ticks
  useEffect(() => {
    if (selectedInstrument) {
      const updated = instruments.find((i) => i.id === selectedInstrument.id);
      if (updated) {
        setSelectedInstrument(updated);
      }
    }
  }, [instruments, selectedInstrument?.id]);

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleWatchlist = useCallback((inst: MarketInstrument) => {
    setWatchlistIds((prev) =>
      prev.includes(inst.id) ? prev.filter((id) => id !== inst.id) : [...prev, inst.id]
    );
  }, []);

  const handleExecuteTrade = useCallback(
    (instrument: MarketInstrument, type: 'BUY' | 'SELL', shares: number) => {
      const totalAmount = shares * instrument.price;

      if (type === 'BUY') {
        setCashBalance((prev) => prev - totalAmount);
        setPositions((prev) => {
          const existing = prev.find((p) => p.instrumentId === instrument.id);
          if (existing) {
            const newShares = existing.shares + shares;
            const newTotalCost = existing.totalCost + totalAmount;
            const newAvgPrice = newTotalCost / newShares;
            const newCurrentVal = newShares * instrument.price;
            const pnl = newCurrentVal - newTotalCost;
            return prev.map((p) =>
              p.instrumentId === instrument.id
                ? {
                    ...p,
                    shares: newShares,
                    totalCost: newTotalCost,
                    avgBuyPrice: newAvgPrice,
                    currentPrice: instrument.price,
                    currentValue: newCurrentVal,
                    unrealizedPnL: pnl,
                    unrealizedPnLPercent: (pnl / newTotalCost) * 100,
                  }
                : p
            );
          } else {
            return [
              ...prev,
              {
                instrumentId: instrument.id,
                symbol: instrument.symbol,
                name: instrument.name,
                shares,
                avgBuyPrice: instrument.price,
                currentPrice: instrument.price,
                totalCost: totalAmount,
                currentValue: totalAmount,
                unrealizedPnL: 0,
                unrealizedPnLPercent: 0,
                category: instrument.category,
              },
            ];
          }
        });
      } else {
        // SELL
        setCashBalance((prev) => prev + totalAmount);
        setPositions((prev) => {
          const existing = prev.find((p) => p.instrumentId === instrument.id);
          if (!existing) return prev;
          const newShares = Math.max(0, existing.shares - shares);
          if (newShares <= 0.0001) {
            return prev.filter((p) => p.instrumentId !== instrument.id);
          }
          const costReduction = (existing.totalCost / existing.shares) * shares;
          const newTotalCost = Math.max(0, existing.totalCost - costReduction);
          const newCurrentVal = newShares * instrument.price;
          const pnl = newCurrentVal - newTotalCost;
          return prev.map((p) =>
            p.instrumentId === instrument.id
              ? {
                  ...p,
                  shares: newShares,
                  totalCost: newTotalCost,
                  currentPrice: instrument.price,
                  currentValue: newCurrentVal,
                  unrealizedPnL: pnl,
                  unrealizedPnLPercent: newTotalCost > 0 ? (pnl / newTotalCost) * 100 : 0,
                }
              : p
          );
        });
      }

      // Log transaction
      const newTx: TransactionRecord = {
        id: `tx-${Date.now()}`,
        instrumentId: instrument.id,
        symbol: instrument.symbol,
        type,
        shares,
        price: instrument.price,
        totalAmount,
        timestamp: 'Just now',
      };
      setTransactions((prev) => [newTx, ...prev]);
    },
    []
  );

  const handleResetPortfolio = useCallback(() => {
    if (window.confirm('Reset virtual paper trading portfolio back to $100,000 USD?')) {
      setCashBalance(100000);
      setPositions([]);
      setTransactions([]);
    }
  }, []);

  const handleSelectInstrumentSymbol = useCallback(
    (symbol: string) => {
      const match = instruments.find(
        (i) => i.symbol.toLowerCase() === symbol.toLowerCase() || i.id === symbol.toLowerCase()
      );
      if (match) {
        setSelectedInstrument(match);
      }
    },
    [instruments]
  );

  const handleCategorySelection = useCallback((cat: MarketCategory) => {
    setActiveCategory(cat);
    setActiveTab('markets');
  }, []);

  const existingPositionForSelected = positions.find(
    (p) => p.instrumentId === selectedInstrument?.id
  );

  return (
    <div className="min-h-screen bg-white text-[#131722] flex flex-col font-sans select-none antialiased">
      {/* Fixed Header */}
      <Header
        activeCategory={activeCategory}
        onSelectCategory={handleCategorySelection}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main App Body */}
      <main className="flex-1 pt-[104px] pb-24 bg-white">
        {activeTab === 'markets' && (
          <MarketsView
            instruments={instruments}
            onSelectInstrument={(inst) => setSelectedInstrument(inst)}
            activeCategory={activeCategory}
            onSelectCategory={handleCategorySelection}
          />
        )}

        {activeTab === 'watchlist' && (
          <WatchlistView
            instruments={instruments}
            watchlistIds={watchlistIds}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectInstrument={(inst) => setSelectedInstrument(inst)}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        )}

        {activeTab === 'news' && (
          <NewsView
            news={MOCK_NEWS}
            instruments={instruments}
            onSelectInstrumentSymbol={handleSelectInstrumentSymbol}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioView
            cashBalance={cashBalance}
            positions={positions}
            transactions={transactions}
            onSelectInstrumentSymbol={handleSelectInstrumentSymbol}
            onResetPortfolio={handleResetPortfolio}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            onOpenAuth={() => setIsAuthOpen(true)}
            currency={currency}
            onChangeCurrency={setCurrency}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        watchlistCount={watchlistIds.length}
      />

      {/* Full Instrument Detail & Trade Modal */}
      <InstrumentDetailModal
        instrument={selectedInstrument}
        isOpen={!!selectedInstrument}
        onClose={() => setSelectedInstrument(null)}
        isWatchlisted={selectedInstrument ? watchlistIds.includes(selectedInstrument.id) : false}
        onToggleWatchlist={handleToggleWatchlist}
        onExecuteTrade={handleExecuteTrade}
        userCash={cashBalance}
        existingPosition={existingPositionForSelected}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        instruments={instruments}
        onSelectInstrument={(inst) => setSelectedInstrument(inst)}
      />

      {/* Auth / Account Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
