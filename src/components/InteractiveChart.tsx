import React, { useState, useMemo, useRef } from 'react';
import { MarketInstrument, CandlestickPoint } from '../types';
import { formatCurrency, formatChange } from '../utils/formatters';

interface InteractiveChartProps {
  instrument: MarketInstrument;
  height?: number;
}

type Timeframe = '1D' | '5D' | '1M' | '6M' | '1Y' | '5Y' | 'ALL';
type ChartType = 'area' | 'candle';

export const InteractiveChart: React.FC<InteractiveChartProps> = ({ instrument, height = 300 }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [showSMA, setShowSMA] = useState<boolean>(true);
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Generate synthetic points based on timeframe to allow dynamic switching
  const chartData = useMemo(() => {
    const base = instrument.price;
    const isUp = instrument.changePercent >= 0;
    const factor = isUp ? 1 : -1;
    
    let count = 24;
    let labelPrefix = 'h';
    if (timeframe === '5D') { count = 30; labelPrefix = 'd'; }
    else if (timeframe === '1M') { count = 30; labelPrefix = 'd'; }
    else if (timeframe === '6M') { count = 40; labelPrefix = 'w'; }
    else if (timeframe === '1Y') { count = 52; labelPrefix = 'w'; }
    else if (timeframe === '5Y') { count = 60; labelPrefix = 'm'; }
    else if (timeframe === 'ALL') { count = 80; labelPrefix = 'm'; }

    const points: { time: string; price: number; open: number; high: number; low: number; close: number; volume: number }[] = [];
    
    // Seed pseudo-random walk that ends precisely at current instrument.price
    let current = base * (1 - (instrument.changePercent / 100) * 0.9);
    for (let i = 0; i < count; i++) {
      const progress = i / (count - 1);
      const trend = (base - current) * (progress * 0.7);
      const volatility = base * 0.006 * (Math.sin(i * 0.8) + (Math.random() - 0.48));
      
      const open = i === 0 ? current : points[i - 1].close;
      const close = i === count - 1 ? base : Math.max(base * 0.5, open + trend / (count - i) + volatility);
      const high = Math.max(open, close) + Math.abs(volatility) * 1.4;
      const low = Math.min(open, close) - Math.abs(volatility) * 1.4;
      const volume = Math.floor(50000 + Math.abs(volatility * 1000000));

      let timeLabel = '';
      if (timeframe === '1D') {
        const hour = 9 + Math.floor((i / count) * 7);
        const min = Math.floor(((i / count) * 420) % 60);
        timeLabel = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      } else {
        timeLabel = `P${i + 1}`;
      }

      points.push({
        time: timeLabel,
        price: close,
        open,
        high,
        low,
        close,
        volume
      });
      current = close;
    }
    return points;
  }, [instrument.price, instrument.changePercent, timeframe]);

  // Calculations for SVG coordinates
  const prices = chartData.map(d => d.close);
  const highs = chartData.map(d => d.high);
  const lows = chartData.map(d => d.low);
  const volumes = chartData.map(d => d.volume);

  const minPrice = Math.min(...lows) * 0.998;
  const maxPrice = Math.max(...highs) * 1.002;
  const priceRange = maxPrice - minPrice || 1;
  const maxVolume = Math.max(...volumes) || 1;

  const svgWidth = 600;
  const chartHeight = height - 60; // bottom space for volume / axes
  const volumeHeight = 40;

  const activePoint = hoverIndex !== null ? chartData[hoverIndex] : chartData[chartData.length - 1];
  const isPositive = instrument.changePercent >= 0;
  const strokeColor = isPositive ? '#089981' : '#F23645';
  const fillColor = isPositive ? 'rgba(8, 153, 129, 0.08)' : 'rgba(242, 54, 69, 0.08)';

  // Generate SVG paths
  const linePoints = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1)) * svgWidth;
    const y = chartHeight - ((d.close - minPrice) / priceRange) * (chartHeight - 20) - 10;
    return { x, y, ...d };
  });

  const pathD = `M ${linePoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`;
  const areaD = `${pathD} L ${svgWidth},${chartHeight} L 0,${chartHeight} Z`;

  // Calculate 10-period SMA
  const smaPoints = useMemo(() => {
    const period = 7;
    const res: { x: number; y: number }[] = [];
    for (let i = period - 1; i < chartData.length; i++) {
      const slice = chartData.slice(i - period + 1, i + 1);
      const avg = slice.reduce((acc, curr) => acc + curr.close, 0) / period;
      const x = (i / (chartData.length - 1)) * svgWidth;
      const y = chartHeight - ((avg - minPrice) / priceRange) * (chartHeight - 20) - 10;
      res.push({ x, y });
    }
    return res;
  }, [chartData, minPrice, priceRange, chartHeight, svgWidth]);

  const smaPathD = smaPoints.length > 1 ? `M ${smaPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}` : '';

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const index = Math.round(ratio * (chartData.length - 1));
    setHoverIndex(index);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  return (
    <div className="flex flex-col w-full bg-white rounded-xl border border-[#E0E3EB] overflow-hidden p-4 shadow-sm">
      {/* Chart Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E0E3EB]">
        {/* Active Price Info */}
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold font-tabular text-[#131722]">
            {formatCurrency(activePoint?.close ?? instrument.price, instrument.category)}
          </span>
          <span className={`text-sm font-semibold font-tabular flex items-center gap-0.5 ${isPositive ? 'text-[#089981]' : 'text-[#F23645]'}`}>
            {isPositive ? '▲' : '▼'} {formatChange(instrument.change, instrument.changePercent, instrument.category).percentText}
          </span>
          {hoverIndex !== null && (
            <span className="text-xs text-[#6A6D78] font-mono-num ml-2">
              Time: {activePoint?.time} | Vol: {(activePoint?.volume / 1000).toFixed(0)}k
            </span>
          )}
        </div>

        {/* View toggles & indicators */}
        <div className="flex items-center gap-2">
          {/* Chart Type Toggle */}
          <div className="flex items-center bg-[#F1F4FB] rounded-lg p-0.5 border border-[#E0E3EB]">
            <button
              id="chart-type-area"
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                chartType === 'area' ? 'bg-white text-[#2962FF] shadow-xs' : 'text-[#6A6D78] hover:text-[#131722]'
              }`}
            >
              Line
            </button>
            <button
              id="chart-type-candle"
              onClick={() => setChartType('candle')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                chartType === 'candle' ? 'bg-white text-[#2962FF] shadow-xs' : 'text-[#6A6D78] hover:text-[#131722]'
              }`}
            >
              Candles
            </button>
          </div>

          {/* Indicators toggle */}
          <button
            id="toggle-sma"
            onClick={() => setShowSMA(!showSMA)}
            className={`px-2 py-1 text-xs font-medium rounded-lg border transition-colors ${
              showSMA ? 'border-[#2962FF] bg-[#2962FF]/10 text-[#2962FF]' : 'border-[#E0E3EB] text-[#6A6D78]'
            }`}
          >
            SMA 7
          </button>
          <button
            id="toggle-volume"
            onClick={() => setShowVolume(!showVolume)}
            className={`px-2 py-1 text-xs font-medium rounded-lg border transition-colors ${
              showVolume ? 'border-[#2962FF] bg-[#2962FF]/10 text-[#2962FF]' : 'border-[#E0E3EB] text-[#6A6D78]'
            }`}
          >
            Volume
          </button>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <div className="relative w-full my-2" style={{ height: `${height}px` }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${height}`}
          className="w-full h-full cursor-crosshair overflow-visible select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
            const y = chartHeight * ratio;
            const priceVal = maxPrice - ratio * priceRange;
            return (
              <g key={ratio}>
                <line x1="0" y1={y} x2={svgWidth} y2={y} stroke="#F1F4FB" strokeDasharray="3,3" strokeWidth="1" />
                <text x={svgWidth - 4} y={y - 4} textAnchor="end" fill="#6A6D78" fontSize="10" fontFamily="JetBrains Mono">
                  {priceVal.toFixed(instrument.category === 'FOREX' ? 4 : 2)}
                </text>
              </g>
            );
          })}

          {/* Volume Bars */}
          {showVolume &&
            chartData.map((d, i) => {
              const x = (i / (chartData.length - 1)) * svgWidth;
              const barWidth = Math.max(2, (svgWidth / chartData.length) * 0.6);
              const vHeight = (d.volume / maxVolume) * volumeHeight;
              const y = height - vHeight;
              const isBarUp = d.close >= d.open;
              return (
                <rect
                  key={`vol-${i}`}
                  x={x - barWidth / 2}
                  y={y}
                  width={barWidth}
                  height={vHeight}
                  fill={isBarUp ? 'rgba(8, 153, 129, 0.2)' : 'rgba(242, 54, 69, 0.2)'}
                />
              );
            })}

          {/* Area Chart Mode */}
          {chartType === 'area' && (
            <>
              <path d={areaD} fill="url(#chartGradient)" />
              <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" />
            </>
          )}

          {/* Candlestick Chart Mode */}
          {chartType === 'candle' &&
            chartData.map((d, i) => {
              const x = (i / (chartData.length - 1)) * svgWidth;
              const candleW = Math.max(3, (svgWidth / chartData.length) * 0.65);
              const yOpen = chartHeight - ((d.open - minPrice) / priceRange) * (chartHeight - 20) - 10;
              const yClose = chartHeight - ((d.close - minPrice) / priceRange) * (chartHeight - 20) - 10;
              const yHigh = chartHeight - ((d.high - minPrice) / priceRange) * (chartHeight - 20) - 10;
              const yLow = chartHeight - ((d.low - minPrice) / priceRange) * (chartHeight - 20) - 10;
              const isBullish = d.close >= d.open;
              const cColor = isBullish ? '#089981' : '#F23645';

              return (
                <g key={`candle-${i}`}>
                  {/* Wick */}
                  <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={cColor} strokeWidth="1.2" />
                  {/* Body */}
                  <rect
                    x={x - candleW / 2}
                    y={Math.min(yOpen, yClose)}
                    width={candleW}
                    height={Math.max(2, Math.abs(yClose - yOpen))}
                    fill={isBullish ? '#089981' : '#F23645'}
                    rx="0.5"
                  />
                </g>
              );
            })}

          {/* Moving Average Line */}
          {showSMA && smaPathD && (
            <path d={smaPathD} fill="none" stroke="#FF9800" strokeWidth="1.5" strokeDasharray="4,2" />
          )}

          {/* Hover Crosshairs & Indicator Dot */}
          {hoverIndex !== null && linePoints[hoverIndex] && (
            <g>
              {/* Vertical crosshair */}
              <line
                x1={linePoints[hoverIndex].x}
                y1={0}
                x2={linePoints[hoverIndex].x}
                y2={height}
                stroke="#2962FF"
                strokeWidth="1"
                strokeDasharray="3,3"
                opacity="0.7"
              />
              {/* Horizontal crosshair */}
              <line
                x1={0}
                y1={linePoints[hoverIndex].y}
                x2={svgWidth}
                y2={linePoints[hoverIndex].y}
                stroke="#2962FF"
                strokeWidth="1"
                strokeDasharray="3,3"
                opacity="0.7"
              />
              {/* Dot */}
              <circle
                cx={linePoints[hoverIndex].x}
                cy={linePoints[hoverIndex].y}
                r="4.5"
                fill="#2962FF"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Timeframe Selector Pills */}
      <div className="flex items-center justify-between pt-2 border-t border-[#E0E3EB] overflow-x-auto no-scrollbar gap-1">
        {(['1D', '5D', '1M', '6M', '1Y', '5Y', 'ALL'] as Timeframe[]).map((tf) => (
          <button
            key={tf}
            id={`tf-${tf.toLowerCase()}`}
            onClick={() => setTimeframe(tf)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              timeframe === tf
                ? 'bg-[#2962FF] text-white shadow-xs'
                : 'text-[#6A6D78] hover:text-[#131722] hover:bg-[#F1F4FB]'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>
    </div>
  );
};
