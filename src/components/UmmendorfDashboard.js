"use client";

import React, { useState } from "react";
import { Landmark, Sun, Compass, Vote, Shield, Info, Droplet, TrendingUp } from "lucide-react";

// Colors for local dashboard
const ZONING_COLORS = {
  "Mischgebiet Kernort": "#3b82f6",
  "Neubaugebiet Gassäcker": "#10b981",
  "Fischbach Wohngebiet": "#f59e0b",
  "Gewerbegebiet Umlach": "#64748b"
};

const PARTY_COLORS = {
  "Freie Wähler (FW)": "#10b981", // Green
  "CDU": "#4b5563", // Dark grey
  "Unabhängige Bürger (UB)": "#f59e0b" // Amber
};

export default function UmmendorfDashboard({ budgetData, badeseeData, bodenData, councilData }) {
  const [selectedZone, setSelectedZone] = useState("Neubaugebiet Gassäcker");
  const [hoveredBudgetFlow, setHoveredBudgetFlow] = useState(null);

  if (!budgetData || !badeseeData || !bodenData || !councilData) {
    return <div className="text-zinc-400 p-4">Lade Ummendorfer Daten...</div>;
  }

  // 1. Budget Sankey calculations
  // Width 800, Height 320
  const totalBudget = budgetData.filter(d => d.category === "Einnahmen-Verwendung").reduce((s, d) => s + d.value, 0);
  const nodeWidth = 20;

  const sources = Array.from(new Set(budgetData.map((d) => d.source)));
  const targets = Array.from(new Set(budgetData.map((d) => d.target)));

  const scale = 240 / totalBudget; // 240px available height
  const sGap = 15;
  const tGap = 12;
  
  let currentY = 40;
  const sourceNodes = sources.map(name => {
    const val = budgetData.filter(d => d.source === name).reduce((s, d) => s + d.value, 0);
    const h = val * scale;
    const y = currentY;
    currentY += h + sGap;
    return { name, y, h, val };
  });

  currentY = 40;
  const targetNodes = targets.map(name => {
    const val = budgetData.filter(d => d.target === name).reduce((s, d) => s + d.value, 0);
    const h = val * scale;
    const y = currentY;
    currentY += h + tGap;
    return { name, y, h, val };
  });

  const sourceOffsets = Object.fromEntries(sourceNodes.map(n => [n.name, n.y]));
  const targetOffsets = Object.fromEntries(targetNodes.map(n => [n.name, n.y]));

  const flows = budgetData.map((flow, idx) => {
    const sy = sourceOffsets[flow.source];
    const sh = flow.value * scale;
    sourceOffsets[flow.source] += sh;

    const ty = targetOffsets[flow.target];
    const th = flow.value * scale;
    targetOffsets[flow.target] += th;

    return { ...flow, idx, sy, sh, ty, th };
  });

  // 2. Bodenrichtwerte Line Chart math
  const filteredBoden = bodenData.filter(d => d.zone === selectedZone);
  const years = filteredBoden.map(d => d.year);
  const values = filteredBoden.map(d => d.valueSqm);

  const cWidth = 500;
  const cHeight = 200;
  const cPad = { top: 15, right: 15, bottom: 25, left: 45 };
  const graphW = cWidth - cPad.left - cPad.right;
  const graphH = cHeight - cPad.top - cPad.bottom;

  const minV = 0;
  const maxV = 450;

  const getBodenX = (idx) => cPad.left + (idx / (filteredBoden.length - 1)) * graphW;
  const getBodenY = (val) => cPad.top + graphH - (val / maxV) * graphH;

  const linePath = `M ${filteredBoden.map((d, idx) => `${getBodenX(idx).toFixed(1)},${getBodenY(d.valueSqm).toFixed(1)}`).join(" L ")}`;
  const areaPath = `${linePath} L ${getBodenX(filteredBoden.length - 1).toFixed(1)},${(cPad.top + graphH).toFixed(1)} L ${getBodenX(0).toFixed(1)},${(cPad.top + graphH).toFixed(1)} Z`;

  // 3. Council Seat Semicircle Dot Map
  // Semicircle layout: 14 seats total
  // FW: 6, CDU: 5, UB: 3
  const totalSeats = 14;
  const seatColors = [
    ...Array(6).fill(PARTY_COLORS["Freie Wähler (FW)"]),
    ...Array(5).fill(PARTY_COLORS["CDU"]),
    ...Array(3).fill(PARTY_COLORS["Unabhängige Bürger (UB)"])
  ];

  const cX = 140, cY = 120, radius = 70;
  const seatsPoints = Array.from({ length: totalSeats }).map((_, idx) => {
    // Distribute angles evenly from 180deg (left) to 0deg (right)
    const angleDeg = 180 - (idx / (totalSeats - 1)) * 180;
    const rad = (angleDeg * Math.PI) / 180;
    const x = cX + radius * Math.cos(rad);
    const y = cY - radius * Math.sin(rad);
    return { x, y, color: seatColors[idx] };
  });

  return (
    <div className="trends-container">
      {/* Header */}
      <div className="border-b border-zinc-850 pb-5">
        <h3 className="text-xl font-bold text-white flex items-center gap-2" id="ummendorf-dashboard-title">
          <Landmark className="text-emerald-400" size={22} />
          Ummendorf-Spiegel (Gemeinde-Haushalt, Badesee & Wohnen)
        </h3>
        <p className="text-zinc-400 text-xs mt-1">
          Visualisierte Open-Data-Kennzahlen direkt aus Ummendorf und dem Ortsteil Fischbach.
        </p>
      </div>

      {/* CONCEPT 1: Gemeindehaushalt Sankey */}
      <div className="info-card border border-zinc-850 bg-zinc-950/40 p-6 rounded-2xl">
        <h4 className="text-white font-bold text-sm flex items-center gap-2 mb-1">
          <Landmark size={18} className="text-emerald-400" />
          1. Der Ummendorfer Gemeindehaushalt (Volumen: {totalBudget.toFixed(1)} Mio. €)
        </h4>
        <p className="text-zinc-500 text-[11px] mb-6">
          Trägt die Haupteinnahmen der Gemeinde (Gewerbesteuer, Einkommensteueranteil) zu den dörflichen Ausgabenschwerpunkten ab (2024).
        </p>

        <div className="relative w-full h-[320px] overflow-x-auto">
          <svg viewBox="0 0 800 320" className="overflow-visible min-w-[700px] mx-auto" width="100%" height="100%">
            {/* Gradients */}
            <defs>
              {flows.map((flow) => (
                <linearGradient key={`flow-g-${flow.idx}`} id={`flow-g-${flow.idx}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.5" />
                </linearGradient>
              ))}
            </defs>

            {/* Flows */}
            <g>
              {flows.map((flow) => {
                const active = hoveredBudgetFlow === null || hoveredBudgetFlow === flow.idx;
                const x0 = 180 + nodeWidth;
                const x1 = 580;
                const y0 = flow.sy + flow.sh / 2;
                const y1 = flow.ty + flow.th / 2;
                const pathStr = `M ${x0} ${y0} C ${(x0 + x1)/2} ${y0}, ${(x0 + x1)/2} ${y1}, ${x1} ${y1}`;

                return (
                  <path
                    key={`flow-p-${flow.idx}`}
                    d={pathStr}
                    fill="none"
                    stroke={`url(#flow-g-${flow.idx})`}
                    strokeWidth={flow.sh}
                    style={{ opacity: active ? 0.8 : 0.08, transition: "opacity 0.2s" }}
                    onMouseEnter={() => setHoveredBudgetFlow(flow.idx)}
                    onMouseLeave={() => setHoveredBudgetFlow(null)}
                  />
                );
              })}
            </g>

            {/* Source Nodes */}
            <g>
              {sourceNodes.map((n, idx) => (
                <g key={`src-${idx}`}>
                  <rect x="180" y={n.y} width={nodeWidth} height={n.h} rx={2} fill="#10b981" />
                  <text x="168" y={n.y + n.h/2} textAnchor="end" dominantBaseline="middle" className="text-[10px] font-bold fill-zinc-300">
                    {n.name}
                  </text>
                  <text x="168" y={n.y + n.h/2 + 10} textAnchor="end" dominantBaseline="middle" className="text-[8px] font-bold fill-zinc-500">
                    {n.val.toFixed(1)} Mio. €
                  </text>
                </g>
              ))}
            </g>

            {/* Target Nodes */}
            <g>
              {targetNodes.map((n, idx) => (
                <g key={`tgt-${idx}`}>
                  <rect x="580" y={n.y} width={nodeWidth} height={n.h} rx={2} fill="#3b82f6" />
                  <text x="612" y={n.y + n.h/2} textAnchor="start" dominantBaseline="middle" className="text-[10px] font-bold fill-zinc-300">
                    {n.name}
                  </text>
                  <text x="612" y={n.y + n.h/2 + 10} textAnchor="start" dominantBaseline="middle" className="text-[8px] font-bold fill-zinc-500">
                    {n.val.toFixed(1)} Mio. €
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>
        <div className="text-[10px] text-zinc-500 border-t border-zinc-900/80 pt-3 mt-4 flex justify-between items-center">
          <span>Quelle: <a href="https://www.ummendorf.de/de/rathaus-service/kommunalpolitik/ratsinfosystem" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-semibold">Gemeinde Ummendorf (Biberach) - Ratsinformationssystem</a>.</span>
          <a href="https://www.ummendorf.de" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">ummendorf.de</a>
        </div>
      </div>

      {/* Second Row: Badesee and Bodenrichtwerte */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CONCEPT 2: Badesee Monitor */}
        <div className="info-card border border-zinc-850 bg-zinc-950/40 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-white font-bold text-sm flex items-center gap-2 mb-1">
              <Droplet size={18} className="text-sky-400" />
              2. Der Badesee- & Umwelt-Monitor (Saison 2024)
            </h4>
            <p className="text-zinc-500 text-[11px] mb-4">
              Messdaten zur Badewasserqualität des Ummendorfer Badesees und des Pegelstands der Umlach.
            </p>

            {/* Badge Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-zinc-900/50 border border-zinc-850 p-3.5 rounded-xl flex flex-col items-center justify-center text-center">
                <Shield className="text-emerald-400 mb-1" size={24} />
                <span className="text-[9px] text-zinc-500 font-bold uppercase">EU-Hygienestatus</span>
                <span className="text-xs font-black text-white mt-0.5">AUSGEZEICHNET</span>
                <span className="text-[10px] text-zinc-400 mt-1">★★★ (LUBW-Güteklasse 1)</span>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-850 p-3.5 rounded-xl flex flex-col items-center justify-center text-center">
                <Sun className="text-amber-400 mb-1" size={24} />
                <span className="text-[9px] text-zinc-500 font-bold uppercase">Ø Wassertemperatur</span>
                <span className="text-xs font-black text-white mt-0.5">23,6 °C (August-Rekord)</span>
                <span className="text-[10px] text-zinc-400 mt-1">Badebetrieb geöffnet</span>
              </div>
            </div>

            {/* Micro table for measurements */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-zinc-400">Verlauf der Messwerte:</span>
              <div className="border border-zinc-900 rounded-lg overflow-hidden text-xs">
                <div className="grid grid-cols-4 bg-zinc-900 px-3 py-1.5 font-bold text-zinc-500 text-[10px] uppercase">
                  <span>Monat</span>
                  <span className="text-center">Temperatur</span>
                  <span className="text-center">E. coli</span>
                  <span className="text-center">Umlach Pegel</span>
                </div>
                {badeseeData.map((d) => (
                  <div key={d.month} className="grid grid-cols-4 px-3 py-2 border-t border-zinc-900/60 font-semibold text-zinc-300">
                    <span>{d.month}</span>
                    <span className="text-center text-white">{d.tempCelsius.toFixed(1)} °C</span>
                    <span className="text-center text-emerald-400">{d.ecoli} / 100ml</span>
                    <span className="text-center text-zinc-400">{d.pegelUmlach.toFixed(2)} m</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-[10px] text-zinc-500 border-t border-zinc-900/80 pt-3 mt-6 flex justify-between items-center">
            <span>Quelle: <a href="https://badegewaesserkarte.landbw.de/?data_id=dataSource_18-Gesamt_UVB_BGW_2577%3A26%2CdataSource_14-Badegewaesser_94%3A26%2CdataSource_17-Gesamt_UVB_BGW_2577%3A26&amp;dlg=Liste-der-ueberwachten-Badestellen&amp;page=Seite-1&amp;views=Legende---" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline font-semibold">Landesanstalt für Umwelt BW (LUBW Badegewässerkarte)</a>.</span>
            <a href="https://www.ummendorf.de/de/freizeit-vereine/sport-freizeit/badesee" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">ummendorf.de (Badesee)</a>
          </div>
        </div>

        {/* CONCEPT 3: Bodenrichtwerte */}
        <div className="info-card border border-zinc-850 bg-zinc-950/40 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-white font-bold text-sm flex items-center gap-2 mb-1">
              <TrendingUp size={18} className="text-emerald-400" />
              3. Bodenrichtwert-Entwicklung (BORIS-BW)
            </h4>
            <p className="text-zinc-500 text-[11px] mb-4">
              Preisentwicklung von Baugrundstücken (€/m²) in verschiedenen Zonen Ummendorfs (2014–2024).
            </p>

            {/* Zone Selector */}
            <div className="flex flex-col gap-1 mb-5">
              <span className="text-[10px] font-bold text-zinc-500">Ausgewählte Bodenrichtwertzone:</span>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="bg-zinc-900 text-white font-bold text-xs border border-zinc-800 p-2 rounded-lg outline-none cursor-pointer w-full"
              >
                {Object.keys(ZONING_COLORS).map((zone) => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
            </div>

            {/* Custom line chart */}
            <div className="relative w-full h-[200px]">
              <svg viewBox={`0 0 ${cWidth} ${cHeight}`} width="100%" height="100%" className="overflow-visible select-none">
                <defs>
                  <linearGradient id="boden-area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ZONING_COLORS[selectedZone]} stopOpacity="0.18" />
                    <stop offset="100%" stopColor={ZONING_COLORS[selectedZone]} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                {[0, 150, 300, 450].map((v, idx) => (
                  <line
                    key={`gr-${idx}`}
                    x1={cPad.left}
                    y1={getBodenY(v)}
                    x2={cWidth - cPad.right}
                    y2={getBodenY(v)}
                    stroke="#1f2937"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Area */}
                <path d={areaPath} fill="url(#boden-area-grad)" />

                {/* Line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke={ZONING_COLORS[selectedZone]}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Points */}
                {filteredBoden.map((d, idx) => (
                  <g key={`pt-${idx}`}>
                    <circle
                      cx={getBodenX(idx)}
                      cy={getBodenY(d.valueSqm)}
                      r="4"
                      fill="#09090b"
                      stroke={ZONING_COLORS[selectedZone]}
                      strokeWidth="2"
                    />
                    <text
                      x={getBodenX(idx)}
                      y={getBodenY(d.valueSqm) - 10}
                      textAnchor="middle"
                      className="text-[9px] font-bold fill-zinc-300"
                    >
                      {d.valueSqm}€
                    </text>
                  </g>
                ))}

                {/* X labels */}
                {years.map((y, idx) => (
                  <text
                    key={`yr-${idx}`}
                    x={getBodenX(idx)}
                    y={cHeight - cPad.bottom + 18}
                    textAnchor="middle"
                    className="text-[9px] font-bold fill-zinc-500"
                  >
                    {y}
                  </text>
                ))}

                {/* Y labels */}
                {[0, 150, 300, 450].map((v, idx) => (
                  <text
                    key={`v-lbl-${idx}`}
                    x={cPad.left - 10}
                    y={getBodenY(v)}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="text-[9px] font-bold fill-zinc-500"
                  >
                    {v}€
                  </text>
                ))}
              </svg>
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 border-t border-zinc-900/80 pt-3 mt-6 flex justify-between items-center">
            <span>Quelle: <a href="https://www.gutachterausschuesse-bw.de/borisbw/?app=boris_bw" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline font-semibold">Bodenrichtwert-Informationssystem BW (BORIS-BW)</a>.</span>
            <a href="https://www.gutachterausschuesse-bw.de/borisbw/?app=boris_bw" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">boris-bw.de</a>
          </div>
        </div>

      </div>

      {/* CONCEPT 4: Gemeinderat und Wahlen */}
      <div className="info-card border border-zinc-850 bg-zinc-950/40 p-6 rounded-2xl mt-6">
        <h4 className="text-white font-bold text-sm flex items-center gap-2 mb-1">
          <Vote size={18} className="text-yellow-400" />
          4. Gemeinderat & Wahlanalyse (Gemeinderatswahl 2024)
        </h4>
        <p className="text-zinc-500 text-[11px] mb-6">
          Sitzverteilung im Gemeinderat Ummendorf sowie die Verteilung der Wählerstimmen nach Ortsteilen.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Seat Semi-Circle */}
          <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-zinc-900 pb-6 md:pb-0 md:pr-8">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Sitzverteilung (14 Sitze)</span>
            <div className="relative w-[280px] h-[140px]">
              <svg viewBox="0 0 280 140" width="100%" height="100%">
                {/* Draw seat circles */}
                {seatsPoints.map((pt, idx) => (
                  <circle
                    key={`seat-${idx}`}
                    cx={pt.x}
                    cy={pt.y}
                    r="8.5"
                    fill={pt.color}
                    stroke="#09090b"
                    strokeWidth="1.5"
                  />
                ))}
                
                {/* Total Seats summary */}
                <text x="140" y="125" textAnchor="middle" className="text-lg font-black fill-white">
                  14 Sitze
                </text>
                <text x="140" y="138" textAnchor="middle" className="text-[9px] font-bold fill-zinc-500 uppercase tracking-widest">
                  Gemeinderat
                </text>
              </svg>
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-[10px] font-bold mt-4">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> FW (6 Sitze)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-zinc-650 rounded-full"></span> CDU (5 Sitze)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span> UB (3 Sitze)</span>
            </div>
          </div>

          {/* Ortsteil Vergleich */}
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Wählerstimmen nach Ortsteilen (%):</span>
            
            {councilData.map((d) => (
              <div key={d.party} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-zinc-200">{d.party}</span>
                  <div className="flex gap-4 text-[10px]">
                    <span className="text-sky-400">Kernort: {d.kernortPercent}%</span>
                    <span className="text-amber-500">Fischbach: {d.fischbachPercent}%</span>
                  </div>
                </div>
                {/* Split Bar display */}
                <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden flex">
                  {/* Kernort Share */}
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${d.kernortPercent}%`,
                      backgroundColor: PARTY_COLORS[d.party],
                      opacity: 0.95
                    }}
                    title={`Kernort: ${d.kernortPercent}%`}
                  />
                  {/* Gap or spacer */}
                  <div className="w-[2px] bg-zinc-950" />
                  {/* Fischbach Share */}
                  <div
                    style={{
                      width: `${d.fischbachPercent}%`,
                      backgroundColor: PARTY_COLORS[d.party],
                      opacity: 0.65
                    }}
                    title={`Fischbach: ${d.fischbachPercent}%`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-[10px] text-zinc-500 border-t border-zinc-900/80 pt-3 mt-6 flex justify-between items-center">
          <span>Quelle: <a href="https://wahlergebnisse.komm.one/lb/produktion/wahltermin-20240609/08426120/praesentation/ergebnis.html?wahl_id=5930&amp;stimmentyp=0&amp;id=ebene_-17882_id_27947" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline font-semibold">Komm.ONE (Wahlergebnis Gemeinderatswahl 2024)</a>.</span>
          <a href="https://wahlergebnisse.komm.one/lb/produktion/wahltermin-20240609/08426120/praesentation/ergebnis.html?wahl_id=5930&amp;stimmentyp=0&amp;id=ebene_-17882_id_27947" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">wahlergebnisse.komm.one</a>
        </div>
      </div>
    </div>
  );
}
