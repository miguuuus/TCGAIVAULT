import React, { useMemo, useState, useRef } from 'react';
import type { AnalysisRecord } from '../types';

interface PortfolioValueChartProps {
  collection: AnalysisRecord[];
}

interface DataPoint {
  date: Date;
  value: number;
}

const parseMarketValue = (valueStr: string | undefined): number => {
    if (!valueStr || typeof valueStr !== 'string') {
        return 0;
    }
    let targetStr = valueStr.split('-')[0].trim();
    const isK = targetStr.toLowerCase().includes('k');
    if (isK) {
        targetStr = targetStr.toLowerCase().replace('k', '');
    }
    const cleanedStr = targetStr.replace(/[^0-9.]/g, '');
    let value = parseFloat(cleanedStr);
    if (isNaN(value)) {
        return 0;
    }
    if (isK) {
        value *= 1000;
    }
    return value;
};

const PortfolioValueChart: React.FC<PortfolioValueChartProps> = ({ collection }) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; value: string } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const data = useMemo<DataPoint[]>(() => {
    if (collection.length < 2) return [];

    const sortedRecords = [...collection].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let cumulativeValue = 0;
    return sortedRecords.map(record => {
      cumulativeValue += parseMarketValue(record.result.marketValue.psa9);
      return {
        date: new Date(record.date),
        value: cumulativeValue,
      };
    });
  }, [collection]);

  const width = 500;
  const height = 200;
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const { xMin, xMax, yMin, yMax } = useMemo(() => {
    // FIX: Changed new Date() to Date.now() to ensure xMin and xMax are always numbers,
    // preventing type errors in arithmetic operations below.
    if (data.length === 0) return { xMin: Date.now(), xMax: Date.now(), yMin: 0, yMax: 0 };
    const xValues = data.map(d => d.date.getTime());
    const yValues = data.map(d => d.value);
    return {
      xMin: Math.min(...xValues),
      xMax: Math.max(...xValues),
      yMin: 0,
      yMax: Math.max(...yValues) * 1.1, // Add 10% padding
    };
  }, [data]);
  
  const xScale = (date: number) => margin.left + ((date - xMin) / (xMax - xMin)) * innerWidth;
  const yScale = (value: number) => margin.top + innerHeight - ((value - yMin) / (yMax - yMin)) * innerHeight;

  const linePath = useMemo(() => {
    if (data.length === 0) return '';
    return data.map((d, i) => {
        const x = xScale(d.date.getTime());
        const y = yScale(d.value);
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ');
  }, [data, xScale, yScale]);
  
  const areaPath = useMemo(() => {
     if (data.length === 0) return '';
     const bottomY = margin.top + innerHeight;
     return `${linePath} L${xScale(xMax)},${bottomY} L${xScale(xMin)},${bottomY} Z`;
  }, [linePath, xMin, xMax, xScale, innerHeight, margin.top]);

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || data.length === 0) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;

    const invertedX = xMin + (mouseX - margin.left) / innerWidth * (xMax - xMin);

    const closestPoint = data.reduce((prev, curr) => 
      Math.abs(curr.date.getTime() - invertedX) < Math.abs(prev.date.getTime() - invertedX) ? curr : prev
    );

    setTooltip({
      x: xScale(closestPoint.date.getTime()),
      y: yScale(closestPoint.value),
      date: closestPoint.date.toLocaleDateString(),
      value: `$${closestPoint.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
    });
  };

  if (data.length < 2) {
    return (
        <div className="h-[200px] flex items-center justify-center text-center text-sm text-[var(--text-secondary)]">
            Añade más cartas a tu colección para ver el historial de valor.
        </div>
    );
  }

  const yAxisLabels = [yMin, yMax / 2, yMax].map(val => ({
    value: `$${Math.round(val / 1000)}k`,
    y: yScale(val),
  }));

  const xAxisLabels = [new Date(xMin), new Date(xMax)].map(val => ({
    value: val.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
    x: xScale(val.getTime()),
  }));

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Y Axis */}
        {yAxisLabels.map((label, i) => (
          <g key={i}>
            <text x={margin.left - 8} y={label.y} textAnchor="end" alignmentBaseline="middle" fontSize="10" fill="var(--text-secondary)">
              {label.value}
            </text>
            <line x1={margin.left} x2={width - margin.right} y1={label.y} y2={label.y} stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="2,2" />
          </g>
        ))}

        {/* X Axis */}
        {xAxisLabels.map((label, i) => (
            <text key={i} x={label.x} y={height - 5} textAnchor={i === 0 ? 'start' : 'end'} fontSize="10" fill="var(--text-secondary)">
                {label.value}
            </text>
        ))}

        {/* Area Gradient */}
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent-color)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaGradient)" />

        {/* Line Path */}
        <path d={linePath} fill="none" stroke="var(--accent-color)" strokeWidth="2" style={{ filter: `drop-shadow(0 0 5px var(--accent-glow))` }} />

        {/* Tooltip */}
        {tooltip && (
          <g>
            <line x1={tooltip.x} y1={margin.top} x2={tooltip.x} y2={height - margin.bottom} stroke="var(--accent-color)" strokeWidth="1" strokeDasharray="3,3" />
            <circle cx={tooltip.x} cy={tooltip.y} r="4" fill="var(--accent-color)" stroke="var(--bg-color)" strokeWidth="2" />
          </g>
        )}
      </svg>
      {tooltip && (
        <div
          className="absolute p-2 text-xs bg-[var(--sidebar-color)] border border-[var(--border-color)] rounded-md shadow-lg pointer-events-none transition-transform duration-100"
          style={{
            left: `${tooltip.x / width * 100}%`,
            top: `${tooltip.y / height * 100}%`,
            transform: `translate(-50%, -120%)`,
          }}
        >
          <p className="font-bold text-white">{tooltip.value}</p>
          <p className="text-[var(--text-secondary)]">{tooltip.date}</p>
        </div>
      )}
    </div>
  );
};

export default PortfolioValueChart;