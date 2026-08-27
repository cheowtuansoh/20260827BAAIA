export function formatCurrency(value: number, category?: string, currencySymbol: string = '$'): string {
  if (category === 'FOREX') {
    return value.toFixed(4);
  }
  if (category === 'BONDS' || category === 'ECONOMY') {
    return `${value.toFixed(2)}%`;
  }
  if (value >= 1000) {
    return `${currencySymbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${currencySymbol}${value.toFixed(2)}`;
}

export function formatChange(change: number, percent: number, category?: string): { text: string; percentText: string; isPositive: boolean; isNeutral: boolean } {
  const isPositive = percent > 0;
  const isNeutral = Math.abs(percent) < 0.0001;
  const sign = isPositive ? '+' : '';
  
  let formattedVal = '';
  if (category === 'FOREX') {
    formattedVal = `${sign}${change.toFixed(4)}`;
  } else if (category === 'BONDS' || category === 'ECONOMY') {
    formattedVal = `${sign}${change.toFixed(3)}%`;
  } else {
    formattedVal = `${sign}${change.toFixed(2)}`;
  }

  const percentText = `${sign}${percent.toFixed(2)}%`;
  return { text: formattedVal, percentText, isPositive, isNeutral };
}

export function generateSparklineSvgPath(data: number[], width: number = 80, height: number = 32): string {
  if (!data || data.length < 2) return '';
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return `M ${points.join(' L ')}`;
}

export function generateAreaSvgPath(data: number[], width: number = 80, height: number = 32): string {
  if (!data || data.length < 2) return '';
  const linePath = generateSparklineSvgPath(data, width, height);
  return `${linePath} L ${width},${height} L 0,${height} Z`;
}
