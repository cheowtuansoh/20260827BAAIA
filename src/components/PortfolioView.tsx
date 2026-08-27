import React from 'react';
import { PortfolioPosition, TransactionRecord, MarketInstrument } from '../types';
import { formatCurrency } from '../utils/formatters';

interface PortfolioViewProps {
  cashBalance: number;
  positions: PortfolioPosition[];
  transactions: TransactionRecord[];
  onSelectInstrumentSymbol: (symbol: string) => void;
  onResetPortfolio: () => void;
  onOpenSearch: () => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  cashBalance,
  positions,
  transactions,
  onSelectInstrumentSymbol,
  onResetPortfolio,
  onOpenSearch,
}) => {
  const investedValue = positions.reduce((acc, pos) => acc + pos.currentValue, 0);
  const totalCost = positions.reduce((acc, pos) => acc + pos.totalCost, 0);
  const totalAccountValue = cashBalance + investedValue;
  const totalUnrealizedPnL = investedValue - totalCost;
  const totalPnLPercent = totalCost > 0 ? (totalUnrealizedPnL / totalCost) * 100 : 0;

  const isPositive = totalUnrealizedPnL >= 0;

  return (
    <div className="flex flex-col w-full bg-white max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-16">
      {/* Top Banner: Total Portfolio Equity & P&L */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E0E3EB]">
        <div>
          <h1 className="font-headline font-bold text-2xl text-[#131722]">Paper Portfolio</h1>
          <p className="text-xs text-[#6A6D78]">Risk-free market execution simulator ($100,000 USD virtual capital)</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetPortfolio}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-[#E0E3EB] text-[#6A6D78] hover:text-[#131722] hover:bg-[#F1F4FB] transition-colors"
          >
            Reset Funds
          </button>
          <button
            onClick={onOpenSearch}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#0049DB] text-white hover:bg-[#003AB3] transition-colors flex items-center gap-1 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
            Trade Markets
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 pb-6">
        {/* Net Worth */}
        <div className="p-4 bg-[#F7F9FF] border border-[#E0E3EB] rounded-2xl">
          <span className="text-xs font-semibold text-[#6A6D78] block">Total Account Value</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#131722] font-tabular mt-1">
            {formatCurrency(totalAccountValue)}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded font-tabular ${
                isPositive ? 'bg-[#089981]/10 text-[#089981]' : 'bg-[#F23645]/10 text-[#F23645]'
              }`}
            >
              {isPositive ? '+' : ''}{formatCurrency(totalUnrealizedPnL)} ({totalPnLPercent.toFixed(2)}%)
            </span>
            <span className="text-[11px] text-[#6A6D78]">All-time P&L</span>
          </div>
        </div>

        {/* Invested Equity */}
        <div className="p-4 bg-white border border-[#E0E3EB] rounded-2xl">
          <span className="text-xs font-semibold text-[#6A6D78] block">Invested Holdings</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#131722] font-tabular mt-1">
            {formatCurrency(investedValue)}
          </div>
          <span className="text-[11px] text-[#6A6D78] mt-1.5 block">
            Across {positions.length} active market position{positions.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Available Cash */}
        <div className="p-4 bg-white border border-[#E0E3EB] rounded-2xl">
          <span className="text-xs font-semibold text-[#6A6D78] block">Available Cash Balance</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0049DB] font-tabular mt-1">
            {formatCurrency(cashBalance)}
          </div>
          <span className="text-[11px] text-[#6A6D78] mt-1.5 block">Liquid purchasing power</span>
        </div>
      </div>

      {/* Active Holdings Table */}
      <div className="pb-6">
        <h2 className="font-headline font-bold text-lg text-[#131722] mb-3">Open Positions</h2>
        {positions.length === 0 ? (
          <div className="py-10 text-center bg-[#F7F9FF] rounded-xl border border-[#E0E3EB]">
            <span className="material-symbols-outlined text-3xl text-[#6A6D78] mb-1">inventory_2</span>
            <p className="text-xs font-semibold text-[#131722]">No open trading positions</p>
            <p className="text-xs text-[#6A6D78] mt-0.5 mb-3">Execute your first trade in US stocks, indices or crypto.</p>
            <button
              onClick={onOpenSearch}
              className="px-4 py-1.5 bg-[#0049DB] text-white rounded-lg text-xs font-bold"
            >
              Browse Instruments
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E0E3EB] text-[11px] font-bold text-[#6A6D78] uppercase">
                  <th className="py-3 px-2">Asset</th>
                  <th className="py-3 px-2 text-right">Shares</th>
                  <th className="py-3 px-2 text-right">Avg Cost</th>
                  <th className="py-3 px-2 text-right">Current Price</th>
                  <th className="py-3 px-2 text-right">Market Value</th>
                  <th className="py-3 px-2 text-right">Return / P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E3EB]/60">
                {positions.map((pos) => {
                  const posPositive = pos.unrealizedPnL >= 0;
                  return (
                    <tr
                      key={pos.instrumentId}
                      onClick={() => onSelectInstrumentSymbol(pos.symbol)}
                      className="hover:bg-[#F7F9FF] cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-2">
                        <div className="font-bold text-sm text-[#131722]">{pos.symbol}</div>
                        <div className="text-xs text-[#6A6D78] truncate max-w-[120px]">{pos.name}</div>
                      </td>
                      <td className="py-3 px-2 text-right text-xs font-bold font-tabular text-[#131722]">
                        {pos.shares}
                      </td>
                      <td className="py-3 px-2 text-right text-xs font-mono-num text-[#6A6D78]">
                        {formatCurrency(pos.avgBuyPrice, pos.category)}
                      </td>
                      <td className="py-3 px-2 text-right text-xs font-bold font-tabular text-[#131722]">
                        {formatCurrency(pos.currentPrice, pos.category)}
                      </td>
                      <td className="py-3 px-2 text-right text-xs font-bold font-tabular text-[#131722]">
                        {formatCurrency(pos.currentValue, pos.category)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span
                          className={`text-xs font-bold font-tabular ${
                            posPositive ? 'text-[#089981]' : 'text-[#F23645]'
                          }`}
                        >
                          {posPositive ? '+' : ''}{formatCurrency(pos.unrealizedPnL, pos.category)} ({pos.unrealizedPnLPercent.toFixed(2)}%)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction History Log */}
      <div>
        <h2 className="font-headline font-bold text-lg text-[#131722] mb-3">Order History</h2>
        {transactions.length === 0 ? (
          <p className="text-xs text-[#6A6D78]">No orders executed yet.</p>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 10).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 bg-white border border-[#E0E3EB] rounded-xl text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      tx.type === 'BUY' ? 'bg-[#089981]/10 text-[#089981]' : 'bg-[#F23645]/10 text-[#F23645]'
                    }`}
                  >
                    {tx.type}
                  </span>
                  <div>
                    <span className="font-bold text-[#131722]">{tx.symbol}</span>
                    <span className="text-[#6A6D78] ml-2 font-tabular">
                      {tx.shares} shares @ {formatCurrency(tx.price)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#131722] font-tabular block">{formatCurrency(tx.totalAmount)}</span>
                  <span className="text-[10px] text-[#6A6D78]">{tx.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
