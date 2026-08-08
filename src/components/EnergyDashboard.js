"use client";

import React, { useState } from "react";
import { Sun, Wind, Flame, Zap, HelpCircle } from "lucide-react";

// Energy Source Color Themes
const ENERGY_COLORS = {
  windOnshore: "#0ea5e9", // Sky
  windOffshore: "#0284c7", // Sky dark
  solar: "#eab308", // Yellow
  biomass: "#10b981", // Emerald
  hydro: "#06b6d4", // Cyan
  coalBrown: "#78350f", // Amber dark (brownish)
  coalHard: "#451a03", // Amber darker (darker brown)
  gas: "#d97706", // Amber
  other: "#64748b" // Slate
};

const ENERGY_NAMES = {
  windOnshore: "Wind an Land",
  windOffshore: "Wind auf See",
  solar: "Photovoltaik",
  biomass: "Biomasse",
  hydro: "Wasserkraft",
  coalBrown: "Braunkohle",
  coalHard: "Steinkohle",
  gas: "Erdgas",
  other: "Sonstige"
};

export default function EnergyDashboard({ monthlyData, dailyData }) {
  const [viewMode, setViewMode] = useState("daily"); // 'daily' | 'monthly'
  const [selectedDayType, setSelectedDayType] = useState("sommer"); // 'sommer' | 'winter'
  const [hoveredHour, setHoveredHour] = useState(null); // hour data
  const [hoveredMonth, setHoveredMonth] = useState(null); // month data

  if (!monthlyData || !dailyData) return <div>Lade Energiedaten...</div>;

  // Filter daily data based on selection
  const filteredDaily = dailyData.filter((d) => d.type === selectedDayType);

  // Compute stats for selected day type
  const daySolarSum = filteredDaily.reduce((sum, d) => sum + d.solar, 0);
  const dayWindSum = filteredDaily.reduce((sum, d) => sum + d.wind, 0);
  const dayConvSum = filteredDaily.reduce((sum, d) => sum + d.conventional, 0);
  const dayConsSum = filteredDaily.reduce((sum, d) => sum + d.consumption, 0);
  
  const dayRenewablesSum = daySolarSum + dayWindSum;
  const dayTotalSum = dayRenewablesSum + dayConvSum;
  const dayRenewableShare = (dayRenewablesSum / dayTotalSum) * 100;

  // Main Geometry for Daily Grid Chart
  const svgWidth = 800;
  const svgHeight = 350;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // X Coordinate for Hour
  const getX = (hour) => padding.left + (hour / 23) * chartWidth;
  
  // Y Coordinate for GW values (Grid max value is 80 GW)
  const maxGW = 80;
  const getY = (val) => padding.top + chartHeight - (val / maxGW) * chartHeight;

  // Sparkline-like lines generator helper
  const getDailyPath = (key, accumulatedKey = null) => {
    const points = filteredDaily.map((d) => {
      const val = accumulatedKey ? d[key] + d[accumulatedKey] : d[key];
      return `${getX(d.hour).toFixed(1)},${getY(val).toFixed(1)}`;
    });
    return `M ${points.join(" L ")}`;
  };

  // Stacked Area Chart Generator for Grid:
  // Layer 1: Solar (bottom)
  // Layer 2: Wind + Solar
  // Layer 3: Conventional + Wind + Solar (which equals Total Generation)
  const solarPoints = filteredDaily.map((d) => `${getX(d.hour).toFixed(1)},${getY(d.solar).toFixed(1)}`);
  const windPoints = filteredDaily.map((d) => `${getX(d.hour).toFixed(1)},${getY(d.solar + d.wind).toFixed(1)}`);
  const totalGenPoints = filteredDaily.map((d) => `${getX(d.hour).toFixed(1)},${getY(d.solar + d.wind + d.conventional).toFixed(1)}`);

  const solarArea = `M ${getX(0)},${getY(0)} L ${solarPoints.join(" L ")} L ${getX(23)},${getY(0)} Z`;
  const windArea = `M ${getX(0)},${getY(0)} L ${windPoints.join(" L ")} L ${windPoints[windPoints.length - 1].split(",")[0]},${getY(0)} Z`;
  const totalGenArea = `M ${getX(0)},${getY(0)} L ${totalGenPoints.join(" L ")} L ${totalGenPoints[totalGenPoints.length - 1].split(",")[0]},${getY(0)} Z`;

  // Consumption Line
  const consumptionLine = `M ${filteredDaily.map((d) => `${getX(d.hour).toFixed(1)},${getY(d.consumption).toFixed(1)}`).join(" L ")}`;

  // Monthly data calculations
  // Get sums of renewables vs fossil per month
  const monthlyShares = monthlyData.map((m) => {
    const renew = m.windOnshore + m.windOffshore + m.solar + m.biomass + m.hydro;
    const fossil = m.coalBrown + m.coalHard + m.gas + m.other;
    const total = renew + fossil;
    return {
      month: m.month,
      renew,
      fossil,
      share: (renew / total) * 100,
      total,
      raw: m
    };
  });

  return (
    <div className="trends-container">
      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-850 pb-4 mb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2" id="energy-dashboard-title">
            <Zap className="text-yellow-400" size={20} />
            Die Energiewende-Uhr (Stromerzeugung in Deutschland)
          </h3>
          <p className="text-zinc-400 text-xs mt-1">
            Analysiert die Verteilung erneuerbarer Energien im Stromnetz im Jahr 2024 sowie die stündliche Netzbalancierung.
          </p>
        </div>

        {/* Mode Toggle Button */}
        <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
          <button
            onClick={() => setViewMode("daily")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              viewMode === "daily" ? "bg-zinc-800 text-white shadow" : "text-zinc-400 hover:text-zinc-300"
            }`}
          >
            Stündlicher Netz-Simulator
          </button>
          <button
            onClick={() => setViewMode("monthly")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              viewMode === "monthly" ? "bg-zinc-800 text-white shadow" : "text-zinc-400 hover:text-zinc-300"
            }`}
          >
            Monats-Mix (2024)
          </button>
        </div>
      </div>

      {/* 2. Main Render Panel */}
      {viewMode === "daily" ? (
        <div className="flex flex-col gap-6">
          {/* Daily grid info cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Renewable gauge card */}
            <div className="info-card flex items-center gap-6 py-4">
              {/* Circular Dial SVG */}
              <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                  {/* Background Track */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1f2937" strokeWidth="9" />
                  {/* Filled Arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="9"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - dayRenewableShare / 100)}
                    strokeLinecap="round"
                    transform="rotate(-90, 50, 50)"
                    style={{ transition: "stroke-dashoffset 0.4s ease" }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-lg font-extrabold text-white leading-none">{dayRenewableShare.toFixed(0)}%</span>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase mt-0.5">Erneuerbar</span>
                </div>
              </div>

              <div>
                <h4 className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Erneuerbare Energien</h4>
                <p className="text-sm font-semibold text-zinc-200 mt-1 leading-snug">
                  An diesem Tag erzeugten Wind und Solar <span className="text-emerald-400">{(dayRenewablesSum / 24).toFixed(1)} GW</span> im Schnitt.
                </p>
                <div className="mt-2 flex gap-1">
                  <button
                    onClick={() => setSelectedDayType("sommer")}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                      selectedDayType === "sommer"
                        ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                        : "bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-zinc-800"
                    }`}
                  >
                    Sommertag
                  </button>
                  <button
                    onClick={() => setSelectedDayType("winter")}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                      selectedDayType === "winter"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-zinc-800"
                    }`}
                  >
                    Wintertag
                  </button>
                </div>
              </div>
            </div>

            {/* Solar summary card */}
            <div className="info-card flex items-center gap-4 py-4">
              <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400">
                <Sun size={24} />
              </div>
              <div>
                <h4 className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Solarenergie (PV)</h4>
                <span className="text-2xl font-black text-white tracking-tight mt-1 block">
                  {(daySolarSum / 24).toFixed(1)} GW
                </span>
                <span className="text-[10px] text-zinc-500">
                  Spitzenleistung: {Math.max(...filteredDaily.map((d) => d.solar)).toFixed(0)} GW (Mittags)
                </span>
              </div>
            </div>

            {/* Wind summary card */}
            <div className="info-card flex items-center gap-4 py-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                <Wind size={24} />
              </div>
              <div>
                <h4 className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Windenergie</h4>
                <span className="text-2xl font-black text-white tracking-tight mt-1 block">
                  {(dayWindSum / 24).toFixed(1)} GW
                </span>
                <span className="text-[10px] text-zinc-500">
                  Auslastung: {selectedDayType === "winter" ? "Sehr Stark (Sturmtag)" : "Mäßig"}
                </span>
              </div>
            </div>
          </div>

          {/* Daily grid simulation chart */}
          <div className="chart-area-container border border-zinc-850 bg-zinc-950/30 rounded-2xl p-6 relative">
            <div className="chart-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h4 className="text-sm font-bold text-zinc-200">
                  Stündliche Stromerzeugung vs. Verbrauch ({selectedDayType === "sommer" ? "Sommertag" : "Wintertag"})
                </h4>
                <p className="text-zinc-500 text-xs mt-1 max-w-xl">
                  Das Flächendiagramm zeigt den Erzeugungsstack. Die <span className="text-rose-400 font-semibold">rote Linie</span> stellt den Strombedarf dar. Liegt der Bedarf über Wind/Solar, regeln konventionelle Kraftwerke hoch.
                </p>
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-bold">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <span className="w-2.5 h-2.5 bg-yellow-500/90 rounded-sm"></span> Solarenergie
                </span>
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <span className="w-2.5 h-2.5 bg-sky-500/90 rounded-sm"></span> Windenergie
                </span>
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <span className="w-2.5 h-2.5 bg-amber-700/80 rounded-sm"></span> Konventionell (Kohle/Gas)
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-3.5 h-0.5 bg-rose-500 inline-block"></span> Strombedarf (Last)
                </span>
              </div>
            </div>

            {/* Custom SVG grid balancing chart */}
            <div className="relative w-full h-[320px]">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height="100%" className="overflow-visible select-none"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const scaleX = svgWidth / rect.width;
                  const mouseX = (e.clientX - rect.left) * scaleX;
                  
                  let closest = filteredDaily[0];
                  let minDist = Math.abs(getX(0) - mouseX);
                  for(let i=1; i < filteredDaily.length; i++) {
                    const dist = Math.abs(getX(filteredDaily[i].hour) - mouseX);
                    if (dist < minDist) {
                      minDist = dist;
                      closest = filteredDaily[i];
                    }
                  }
                  setHoveredHour(closest);
                }}
                onMouseLeave={() => setHoveredHour(null)}
              >
                {/* Gridlines */}
                {[0, 20, 40, 60, 80].map((gw, idx) => (
                  <line
                    key={`gw-grid-${idx}`}
                    x1={padding.left}
                    y1={getY(gw)}
                    x2={svgWidth - padding.right}
                    y2={getY(gw)}
                    stroke="#1f2937"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Stacked Areas */}
                {/* 1. Conventional Stack (covers total gen area) */}
                <path d={totalGenArea} fill="#b45309" opacity="0.15" />
                
                {/* 2. Wind Stack (covers wind + solar area) */}
                <path d={windArea} fill="#0ea5e9" opacity="0.3" />
                
                {/* 3. Solar Stack (covers solar only area) */}
                <path d={solarArea} fill="#eab308" opacity="0.55" />

                {/* Draw upper paths outlines */}
                <path d={getDailyPath("solar")} fill="none" stroke="#eab308" strokeWidth="1" opacity="0.5" />
                <path d={getDailyPath("wind", "solar")} fill="none" stroke="#0ea5e9" strokeWidth="1" opacity="0.5" />
                <path d={getDailyPath("conventional", "wind")} fill="none" stroke="#b45309" strokeWidth="1" opacity="0.5" />

                {/* Consumption Line (Load) */}
                <path d={consumptionLine} fill="none" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />

                {/* X-Axis Hours */}
                {[0, 4, 8, 12, 16, 20, 23].map((hr, idx) => (
                  <text
                    key={`hr-lbl-${idx}`}
                    x={getX(hr)}
                    y={svgHeight - padding.bottom + 20}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-zinc-500"
                  >
                    {hr === 23 ? "24:00" : `${hr.toString().padStart(2, "0")}:00`}
                  </text>
                ))}

                {/* Y-Axis Labels */}
                {[0, 20, 40, 60, 80].map((gw, idx) => (
                  <text
                    key={`gw-lbl-${idx}`}
                    x={padding.left - 12}
                    y={getY(gw)}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="text-[10px] font-bold fill-zinc-500"
                  >
                    {gw} GW
                  </text>
                ))}

                {/* Hover line & dot markers */}
                {hoveredHour && (
                  <>
                    <line
                      x1={getX(hoveredHour.hour)}
                      y1={padding.top}
                      x2={getX(hoveredHour.hour)}
                      y2={padding.top + chartHeight}
                      stroke="#4b5563"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                    {/* Dot on consumption */}
                    <circle
                      cx={getX(hoveredHour.hour)}
                      cy={getY(hoveredHour.consumption)}
                      r="4.5"
                      fill="#f43f5e"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    {/* Dot on total generation */}
                    <circle
                      cx={getX(hoveredHour.hour)}
                      cy={getY(hoveredHour.solar + hoveredHour.wind + hoveredHour.conventional)}
                      r="4"
                      fill="#b45309"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  </>
                )}
              </svg>

              {/* Hover Tooltip display */}
              {hoveredHour && (
                <div
                  className="absolute bg-zinc-900/95 border border-zinc-800 px-3 py-2.5 rounded-xl shadow-xl shadow-black/50 pointer-events-none flex flex-col gap-1 text-[11px]"
                  style={{
                    left: getX(hoveredHour.hour) - 20,
                    top: getY(hoveredHour.consumption) - 75,
                    transform: "translate(-50%, -50%)",
                    transition: "left 0.1s ease, top 0.1s ease",
                    zIndex: 200
                  }}
                >
                  <div className="font-extrabold text-zinc-400 border-b border-zinc-800 pb-1 mb-1 flex justify-between gap-6">
                    <span>Uhrzeit: {hoveredHour.hour.toString().padStart(2, "0")}:00</span>
                    <span className="text-rose-400">Last: {hoveredHour.consumption.toFixed(1)} GW</span>
                  </div>
                  <div className="flex flex-col gap-0.5 text-zinc-300">
                    <div className="flex justify-between gap-6">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span> Solar:</span>
                      <span className="font-bold text-white">{hoveredHour.solar.toFixed(1)} GW</span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span> Wind:</span>
                      <span className="font-bold text-white">{hoveredHour.wind.toFixed(1)} GW</span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-amber-700 rounded-full"></span> Fossil/Sonst:</span>
                      <span className="font-bold text-white">{hoveredHour.conventional.toFixed(1)} GW</span>
                    </div>
                    <div className="border-t border-zinc-800/80 pt-1 mt-1 font-bold text-white flex justify-between">
                      <span>Erzeugung:</span>
                      <span>{(hoveredHour.solar + hoveredHour.wind + hoveredHour.conventional).toFixed(1)} GW</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Monthly mix panel */
        <div className="flex flex-col gap-6">
          <div className="info-card p-6">
            <h4 className="text-zinc-200 text-sm font-bold mb-4">Monatliche Nettostromerzeugung in Deutschland (2024)</h4>
            
            {/* Custom Flex Stack Bar chart */}
            <div className="flex flex-col gap-3">
              {monthlyShares.map((mShare) => {
                const totalRaw = mShare.raw;
                return (
                  <div key={mShare.month} className="flex flex-col md:flex-row items-start md:items-center gap-1.5 md:gap-4 group">
                    <div className="w-24 text-xs font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors">
                      {mShare.month}
                    </div>
                    
                    {/* The Stacked bar wrapper */}
                    <div className="flex-1 w-full h-7 bg-zinc-900 rounded-md overflow-hidden flex border border-zinc-850 group-hover:border-zinc-800 transition-all">
                      {/* Onshore Wind */}
                      <div
                        style={{ width: `${(totalRaw.windOnshore / mShare.total) * 100}%` }}
                        className="h-full bg-sky-500 cursor-pointer hover:brightness-110"
                        title={`Wind an Land: ${totalRaw.windOnshore.toFixed(1)} TWh`}
                      />
                      {/* Offshore Wind */}
                      <div
                        style={{ width: `${(totalRaw.windOffshore / mShare.total) * 100}%` }}
                        className="h-full bg-sky-700 cursor-pointer hover:brightness-110"
                        title={`Wind auf See: ${totalRaw.windOffshore.toFixed(1)} TWh`}
                      />
                      {/* Solar */}
                      <div
                        style={{ width: `${(totalRaw.solar / mShare.total) * 100}%` }}
                        className="h-full bg-yellow-500 cursor-pointer hover:brightness-110"
                        title={`Solar: ${totalRaw.solar.toFixed(1)} TWh`}
                      />
                      {/* Biomass */}
                      <div
                        style={{ width: `${(totalRaw.biomass / mShare.total) * 100}%` }}
                        className="h-full bg-emerald-500 cursor-pointer hover:brightness-110"
                        title={`Biomasse: ${totalRaw.biomass.toFixed(1)} TWh`}
                      />
                      {/* Hydro */}
                      <div
                        style={{ width: `${(totalRaw.hydro / mShare.total) * 100}%` }}
                        className="h-full bg-cyan-500 cursor-pointer hover:brightness-110"
                        title={`Wasserkraft: ${totalRaw.hydro.toFixed(1)} TWh`}
                      />
                      {/* Coal Brown */}
                      <div
                        style={{ width: `${(totalRaw.coalBrown / mShare.total) * 100}%` }}
                        className="h-full bg-amber-900/60 cursor-pointer hover:brightness-110"
                        title={`Braunkohle: ${totalRaw.coalBrown.toFixed(1)} TWh`}
                      />
                      {/* Coal Hard */}
                      <div
                        style={{ width: `${(totalRaw.coalHard / mShare.total) * 100}%` }}
                        className="h-full bg-amber-950 cursor-pointer hover:brightness-110"
                        title={`Steinkohle: ${totalRaw.coalHard.toFixed(1)} TWh`}
                      />
                      {/* Gas */}
                      <div
                        style={{ width: `${(totalRaw.gas / mShare.total) * 100}%` }}
                        className="h-full bg-amber-600 cursor-pointer hover:brightness-110"
                        title={`Erdgas: ${totalRaw.gas.toFixed(1)} TWh`}
                      />
                      {/* Other */}
                      <div
                        style={{ width: `${(totalRaw.other / mShare.total) * 100}%` }}
                        className="h-full bg-slate-500 cursor-pointer hover:brightness-110"
                        title={`Sonstige: ${totalRaw.other.toFixed(1)} TWh`}
                      />
                    </div>

                    {/* Right side labels (Total TWh & Share) */}
                    <div className="w-32 flex justify-between text-[11px] font-bold text-zinc-400">
                      <span>{mShare.total.toFixed(0)} TWh</span>
                      <span className="text-emerald-400">{mShare.share.toFixed(0)}% Erneuerbar</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Color Legend */}
            <div className="border-t border-zinc-850 pt-4 mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-bold text-zinc-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-sky-500 rounded-full"></span> Wind an Land</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-sky-700 rounded-full"></span> Wind auf See</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-yellow-500 rounded-full"></span> Photovoltaik</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Biomasse</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-cyan-500 rounded-full"></span> Wasserkraft</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-amber-900/60 rounded-full"></span> Braunkohle</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-amber-950 rounded-full"></span> Steinkohle</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-amber-600 rounded-full"></span> Erdgas</span>
            </div>
          </div>
        </div>
      )}
      <div className="text-[10px] text-zinc-500 mt-4 px-2 flex justify-between items-center border-t border-zinc-900 pt-3">
        <span>Quelle: <a href="https://www.smard.de/home/downloadcenter/download-marktdaten" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline font-semibold">Bundesnetzagentur | SMARD.de Marktdaten 2024</a> (Nettostromerzeugung &amp; Lastkurven).</span>
        <a href="https://www.smard.de/home/downloadcenter/download-marktdaten" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">smard.de (Daten-Download)</a>
      </div>
    </div>
  );
}
