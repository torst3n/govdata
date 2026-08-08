"use client";

import React, { useState } from "react";
import { Users, TrendingUp, Percent, UserCheck } from "lucide-react";

const INDICATORS = [
  {
    id: "population",
    title: "Bevölkerungszahl",
    unit: "Mio.",
    icon: Users,
    color: "#3b82f6", // Blue
    gradient: "from-blue-500/10 to-transparent",
    description: "Gesamtbevölkerung in Deutschland am Jahresende. Der Anstieg ab 2015 und 2022 spiegelt globale Migrationsbewegungen wider.",
    formatVal: (val) => `${val.toFixed(1)} Mio.`,
    axisMin: 78,
    axisMax: 86,
  },
  {
    id: "inflation",
    title: "Inflationsrate",
    unit: "%",
    icon: Percent,
    color: "#f59e0b", // Amber
    gradient: "from-amber-500/10 to-transparent",
    description: "Veränderung des Verbraucherpreisindex zum Vorjahr. Die Jahre 2022 und 2023 zeigen die Auswirkungen der globalen Energie- und Lieferkrisen.",
    formatVal: (val) => `${val.toFixed(1)}%`,
    axisMin: -1,
    axisMax: 8,
  },
  {
    id: "gdpGrowth",
    title: "Wirtschaftswachstum (BIP)",
    unit: "%",
    icon: TrendingUp,
    color: "#10b981", // Emerald
    gradient: "from-emerald-500/10 to-transparent",
    description: "Reales Wachstum des Bruttoinlandsprodukts gegenüber dem Vorjahr. Deutlich erkennbar sind der Corona-Einbruch 2020 und die Stagnationsphase ab 2023.",
    formatVal: (val) => `${val.toFixed(1)}%`,
    axisMin: -5,
    axisMax: 6,
  },
  {
    id: "unemployment",
    title: "Arbeitslosenquote",
    unit: "%",
    icon: UserCheck,
    color: "#a855f7", // Purple
    gradient: "from-purple-500/10 to-transparent",
    description: "Registrierte Arbeitslose im Verhältnis zu allen zivilen Erwerbspersonen. Zeigt einen langfristigen Abwärtstrend, unterbrochen durch die Pandemie 2020.",
    formatVal: (val) => `${val.toFixed(1)}%`,
    axisMin: 3,
    axisMax: 9,
  }
];

export default function TrendsDashboard({ data }) {
  const [selectedId, setSelectedId] = useState("inflation");
  const [hoveredData, setHoveredData] = useState(null); // { year, value, x, y }

  if (!data || data.length === 0) return <div>Keine Daten verfügbar</div>;

  const currentYearData = data[data.length - 1];
  const selectedIndicator = INDICATORS.find((ind) => ind.id === selectedId);

  // Helper to generate sparkline path
  const getSparklinePath = (id, width = 120, height = 30) => {
    const values = data.map((d) => d[id]);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;

    const points = values.map((val, idx) => {
      const x = (idx / (values.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return `M ${points.join(" L ")}`;
  };

  // Math for main detailed SVG chart
  const svgWidth = 800;
  const svgHeight = 350;
  const padding = { top: 30, right: 30, bottom: 40, left: 50 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  const years = data.map((d) => d.year);
  const values = data.map((d) => d[selectedId]);

  // Adjust Y-axis scale
  const minVal = selectedIndicator.axisMin !== undefined ? selectedIndicator.axisMin : Math.min(...values);
  const maxVal = selectedIndicator.axisMax !== undefined ? selectedIndicator.axisMax : Math.max(...values);
  const valRange = maxVal - minVal || 1;

  // Convert data points to SVG coordinates
  const points = data.map((d, idx) => {
    const x = padding.left + (idx / (data.length - 1)) * graphWidth;
    const y = padding.top + graphHeight - ((d[selectedId] - minVal) / valRange) * graphHeight;
    return { year: d.year, val: d[selectedId], x, y };
  });

  const linePath = `M ${points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ")}`;
  
  // Area path (under the line)
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)},${(padding.top + graphHeight).toFixed(1)} L ${points[0].x.toFixed(1)},${(padding.top + graphHeight).toFixed(1)} Z`;

  // Baseline at Y = 0 (for GDP and Inflation)
  const zeroY = minVal < 0 && maxVal > 0 
    ? padding.top + graphHeight - ((0 - minVal) / valRange) * graphHeight
    : null;

  // X axis labels
  const xTicks = points.filter((_, idx) => idx % 2 === 0 || idx === points.length - 1);

  // Y axis ticks (5 levels)
  const yTicksCount = 5;
  const yTicks = Array.from({ length: yTicksCount }).map((_, idx) => {
    const val = minVal + (idx / (yTicksCount - 1)) * valRange;
    const y = padding.top + graphHeight - (idx / (yTicksCount - 1)) * graphHeight;
    return { val, y };
  });

  return (
    <div className="trends-container">
      {/* 1. Metric Selection Cards */}
      <div className="trends-grid">
        {INDICATORS.map((indicator) => {
          const Icon = indicator.icon;
          const currVal = currentYearData[indicator.id];
          const prevVal = data[data.length - 2][indicator.id];
          const diff = currVal - prevVal;
          const isSelected = selectedId === indicator.id;

          return (
            <button
              key={indicator.id}
              id={`trend-card-${indicator.id}`}
              onClick={() => setSelectedId(indicator.id)}
              className={`trend-card transition-all duration-300 text-left relative overflow-hidden ${
                isSelected 
                  ? "selected-card border border-zinc-700 bg-zinc-900/50 shadow-lg shadow-black/30" 
                  : "border border-zinc-850 bg-zinc-950/40 hover:bg-zinc-900/20 hover:border-zinc-800"
              }`}
            >
              {/* Highlight Top Bar */}
              {isSelected && (
                <div 
                  className="absolute top-0 left-0 right-0 h-1" 
                  style={{ backgroundColor: indicator.color }}
                />
              )}

              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-zinc-800/80 text-white' : 'bg-zinc-900/60 text-zinc-400'}`}>
                  <Icon size={18} style={{ color: isSelected ? indicator.color : undefined }} />
                </div>
                {/* Sparkline trend preview */}
                <svg width="90" height="24" className="sparkline-svg opacity-70">
                  <path
                    d={getSparklinePath(indicator.id, 90, 24)}
                    fill="none"
                    stroke={indicator.color}
                    strokeWidth="1.5"
                  />
                </svg>
              </div>

              <div>
                <h4 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">{indicator.title}</h4>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-2xl font-bold text-white tracking-tight">
                    {indicator.formatVal(currVal)}
                  </span>
                  <span className={`text-xs font-bold ${diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500 mt-1">Stand: 2025 (Datenquellen: Destatis)</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Detailed Chart Area */}
      <div className="chart-area-container mt-6 border border-zinc-850 bg-zinc-950/30 rounded-2xl p-6 relative">
        <div className="chart-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedIndicator.color }} />
              {selectedIndicator.title} &mdash; Langzeittrend
            </h3>
            <p className="text-zinc-400 text-xs mt-1 max-w-2xl leading-relaxed">
              {selectedIndicator.description}
            </p>
          </div>
          <div className="text-[11px] text-zinc-500 font-medium bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800/60">
            Zeithorizont: 2010 &ndash; 2025
          </div>
        </div>

        {/* Detailed SVG Line Chart */}
        <div className="relative w-full h-[350px]">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            width="100%"
            height="100%"
            className="overflow-visible select-none"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const scaleX = svgWidth / rect.width;
              const mouseX = (e.clientX - rect.left) * scaleX;

              // Find closest point by X coordinate
              let closest = points[0];
              let minDist = Math.abs(points[0].x - mouseX);
              for (let i = 1; i < points.length; i++) {
                const dist = Math.abs(points[i].x - mouseX);
                if (dist < minDist) {
                  minDist = dist;
                  closest = points[i];
                }
              }

              setHoveredData(closest);
            }}
            onMouseLeave={() => setHoveredData(null)}
          >
            {/* Gradients */}
            <defs>
              <linearGradient id={`area-grad-${selectedId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={selectedIndicator.color} stopOpacity="0.15" />
                <stop offset="100%" stopColor={selectedIndicator.color} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {yTicks.map((tick, idx) => (
              <line
                key={`grid-${idx}`}
                x1={padding.left}
                y1={tick.y}
                x2={svgWidth - padding.right}
                y2={tick.y}
                stroke="#1f2937"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}

            {/* Zero Baseline (if applicable) */}
            {zeroY !== null && (
              <line
                x1={padding.left}
                y1={zeroY}
                x2={svgWidth - padding.right}
                y2={zeroY}
                stroke="#4b5563"
                strokeWidth="1.5"
              />
            )}

            {/* Area under the line */}
            <path d={areaPath} fill={`url(#area-grad-${selectedId})`} />

            {/* Main Trend Line */}
            <path
              d={linePath}
              fill="none"
              stroke={selectedIndicator.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points / Circles */}
            {points.map((pt, idx) => (
              <circle
                key={`dot-${idx}`}
                cx={pt.x}
                cy={pt.y}
                r={hoveredData?.year === pt.year ? 5.5 : 3.5}
                fill={hoveredData?.year === pt.year ? selectedIndicator.color : "#09090b"}
                stroke={selectedIndicator.color}
                strokeWidth="2"
                style={{
                  transition: "all 0.15s ease",
                  cursor: "pointer",
                }}
              />
            ))}

            {/* Y Axis Labels */}
            {yTicks.map((tick, idx) => (
              <text
                key={`y-lbl-${idx}`}
                x={padding.left - 12}
                y={tick.y}
                textAnchor="end"
                dominantBaseline="middle"
                className="text-[10px] font-bold fill-zinc-500"
              >
                {tick.val.toFixed(0)}{selectedIndicator.unit}
              </text>
            ))}

            {/* X Axis Labels */}
            {xTicks.map((pt, idx) => (
              <text
                key={`x-lbl-${idx}`}
                x={pt.x}
                y={svgHeight - padding.bottom + 20}
                textAnchor="middle"
                className="text-[10px] font-bold fill-zinc-500"
              >
                {pt.year}
              </text>
            ))}

            {/* Hover Guideline */}
            {hoveredData && (
              <line
                x1={hoveredData.x}
                y1={padding.top}
                x2={hoveredData.x}
                y2={padding.top + graphHeight}
                stroke={selectedIndicator.color}
                strokeWidth="1.5"
                strokeDasharray="2 2"
                pointerEvents="none"
              />
            )}
          </svg>

          {/* Interactive Hover Tooltip */}
          {hoveredData && (
            <div
              className="absolute bg-zinc-900 border border-zinc-800/80 px-3 py-2 rounded-xl shadow-xl shadow-black/40 pointer-events-none flex flex-col gap-0.5"
              style={{
                left: hoveredData.x - 20,
                top: hoveredData.y - 65,
                transform: "translate(-50%, -50%)",
                transition: "left 0.1s ease, top 0.1s ease",
              }}
            >
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{hoveredData.year}</div>
              <div className="text-sm font-extrabold text-zinc-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedIndicator.color }} />
                {selectedIndicator.formatVal(hoveredData.val)}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="text-[10px] text-zinc-500 mt-4 px-2 flex justify-between items-center border-t border-zinc-900 pt-3">
        <span>Quellen: <a href="https://www-genesis.destatis.de/genesis/online" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold">Statistisches Bundesamt (GENESIS-Online)</a> &amp; <a href="https://statistik.arbeitsagentur.de/DE/Navigation/Statistiken/Statistiken-nach-Themen/Arbeitsmarkt-im-Ueberblick/Arbeitsmarkt-im-Ueberblick-Nav.html" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline font-semibold">Bundesagentur für Arbeit</a>.</span>
        <a href="https://www-genesis.destatis.de/genesis/online" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">destatis.de (GENESIS)</a>
      </div>
    </div>
  );
}
