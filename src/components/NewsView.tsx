import React, { useState } from 'react';
import { NewsArticle, MarketInstrument } from '../types';

interface NewsViewProps {
  news: NewsArticle[];
  instruments: MarketInstrument[];
  onSelectInstrumentSymbol: (symbol: string) => void;
}

export const NewsView: React.FC<NewsViewProps> = ({
  news,
  instruments,
  onSelectInstrumentSymbol,
}) => {
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);

  const categories = ['All', 'Markets', 'Central Banks', 'Crypto', 'Commodities', 'Global'];

  const filteredNews = selectedCat === 'All' ? news : news.filter((n) => n.category === selectedCat);

  return (
    <div className="flex flex-col w-full bg-white max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-16">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E0E3EB]">
        <div>
          <h1 className="font-headline font-bold text-2xl text-[#131722]">Market News & Insights</h1>
          <p className="text-xs text-[#6A6D78]">Curated global macroeconomic, equities, and crypto reporting</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#089981] font-semibold bg-[#089981]/10 px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#089981] animate-pulse"></span>
          Live Wire
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 py-3 border-b border-[#E0E3EB]/70 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCat === cat
                ? 'bg-[#F1F4FB] text-[#0049DB] border border-[#E0E3EB]'
                : 'text-[#6A6D78] hover:text-[#131722]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        {filteredNews.map((article) => {
          const isBull = article.sentiment === 'BULLISH';
          const isBear = article.sentiment === 'BEARISH';
          return (
            <div
              key={article.id}
              onClick={() => setActiveArticle(article)}
              className="p-4 bg-white border border-[#E0E3EB] rounded-xl hover:border-[#2962FF]/50 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#0049DB]">{article.source}</span>
                    <span className="text-[11px] text-[#6A6D78]">• {article.timeAgo}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      isBull
                        ? 'bg-[#089981]/10 text-[#089981]'
                        : isBear
                        ? 'bg-[#F23645]/10 text-[#F23645]'
                        : 'bg-[#F1F4FB] text-[#6A6D78]'
                    }`}
                  >
                    {article.sentiment}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#131722] hover:text-[#0049DB] transition-colors leading-snug mb-2">
                  {article.title}
                </h3>
                <p className="text-xs text-[#6A6D78] line-clamp-2 leading-relaxed">{article.summary}</p>
              </div>

              {/* Related Symbol Badges */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E0E3EB]/50">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-[#6A6D78]">Tickers:</span>
                  {article.relatedSymbols.map((sym) => (
                    <button
                      key={sym}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectInstrumentSymbol(sym);
                      }}
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F1F4FB] text-[#131722] hover:bg-[#0049DB] hover:text-white transition-colors"
                    >
                      {sym}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-[#6A6D78] font-medium">{article.readTime}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Article Detail Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#E0E3EB] shadow-2xl relative">
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-4 right-4 text-[#6A6D78] hover:text-[#131722]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-[#0049DB]">{activeArticle.source}</span>
              <span className="text-xs text-[#6A6D78]">• {activeArticle.timeAgo}</span>
            </div>
            <h2 className="text-lg font-bold text-[#131722] mb-3 leading-snug">{activeArticle.title}</h2>
            <p className="text-sm text-[#434656] leading-relaxed mb-4">{activeArticle.summary}</p>
            <div className="p-3 bg-[#F7F9FF] rounded-xl border border-[#E0E3EB] mb-4">
              <span className="text-xs font-bold text-[#131722] block mb-1">Key Takeaway</span>
              <p className="text-xs text-[#6A6D78]">
                Market analysts anticipate momentum to persist through the upcoming fiscal period, monitored closely by institutional desks.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6A6D78]">Impacted:</span>
                {activeArticle.relatedSymbols.map((sym) => (
                  <button
                    key={sym}
                    onClick={() => {
                      setActiveArticle(null);
                      onSelectInstrumentSymbol(sym);
                    }}
                    className="text-xs font-bold px-2 py-1 rounded bg-[#0049DB] text-white"
                  >
                    {sym}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-[#F1F4FB] text-[#131722] rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
