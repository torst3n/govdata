"use client";

import React, { useState } from "react";
import { Landmark, ArrowRightLeft, Sun, Users, HelpCircle, TrendingUp, Info } from "lucide-react";

export default function LocalDashboard({ municipalData, commutersData, demographicsData }) {
  const [selectedMunicipality, setSelectedMunicipality] = useState("Ummendorf");
  const [financeMetric, setFinanceMetric] = useState("hebesatzGewerbe");
  const [solarCoverage, setSolarCoverage] = useState(30); // 30% coverage slider
  const [hoveredCommuter, setHoveredCommuter] = useState(null);

  if (!municipalData || !commutersData || !demographicsData) {
    return <div className="text-zinc-400 p-4">Lade lokale Daten...</div>;
  }

  // Get active municipality data
  const mData = municipalData.find((d) => d.municipality === selectedMunicipality) || municipalData[0];
  const bwData = municipalData.find((d) => d.municipality === "Baden-Württemberg (Durchschnitt)");
  const lkData = municipalData.find((d) => d.municipality === "Landkreis Biberach (Durchschnitt)");
  const bibData = municipalData.find((d) => d.municipality === "Biberach an der Riß");

  // Municipalities list for selector (excluding averages)
  const municipalities = municipalData
    .map((d) => d.municipality)
    .filter((name) => !name.includes("Durchschnitt"));

  // 1. Finance Metric Calculations
  const getMetricLabel = () => {
    if (financeMetric === "hebesatzGewerbe") return "Gewerbesteuer-Hebesatz";
    if (financeMetric === "hebesatzGrundB") return "Grundsteuer B (Wohngebäude)";
    return "Steuereinnahmen pro Kopf";
  };

  const getMetricUnit = () => {
    return financeMetric === "taxRevenuePerCapita" ? " €" : "%";
  };

  const getMetricMax = () => {
    return financeMetric === "taxRevenuePerCapita" ? 3000 : 450;
  };

  // 2. Solar Calculations
  const totalSolarSqm = mData.solarExcellentSqm + mData.solarGoodSqm + mData.solarUnsuitableSqm;
  const pctExcellent = (mData.solarExcellentSqm / totalSolarSqm) * 100;
  const pctGood = (mData.solarGoodSqm / totalSolarSqm) * 100;
  const pctUnsuitable = (mData.solarUnsuitableSqm / totalSolarSqm) * 100;

  // PV yield: Excellent roof = 160 kWh/sqm/year, Good = 120 kWh/sqm/year
  const totalPotentialMWh = ((mData.solarExcellentSqm * 160) + (mData.solarGoodSqm * 120)) / 1000;
  const simulatedYieldMWh = totalPotentialMWh * (solarCoverage / 100);
  // Avg household consumes 3.5 MWh (3500 kWh) per year in Germany
  const simulatedHouseholds = (simulatedYieldMWh / 3.5);
  const householdPct = (simulatedHouseholds / mData.householdCount) * 100;

  // 3. Commuter Sankey Calculations
  // Width: 800, Height: 300
  const sankeyW = 800;
  const sankeyH = 300;
  const sNodeW = 20;
  const sX = [120, 390, 660];
  const sScale = 220 / 16450; // Scale Biberach total inbound (16200) + outbound (5100)

  // Compute node heights
  const hBib = 16450 * sScale; // Middle node (Biberach)
  const inbounds = commutersData.filter((d) => d.stage === "inbound");
  const outbounds = commutersData.filter((d) => d.stage === "outbound");

  // Center Y starts
  const yStartBib = (sankeyH - hBib) / 2;

  let currentYLeft = (sankeyH - inbounds.reduce((sum, d) => sum + d.value, 0) * sScale - (inbounds.length - 1) * 8) / 2;
  const leftNodes = [];
  for (const d of inbounds) {
    const h = d.value * sScale;
    leftNodes.push({ name: d.source, y: currentYLeft, h, val: d.value });
    currentYLeft += h + 8;
  }

  let currentYRight = (sankeyH - outbounds.reduce((sum, d) => sum + d.value, 0) * sScale - (outbounds.length - 1) * 12) / 2;
  const rightNodes = [];
  for (const d of outbounds) {
    const h = d.value * sScale;
    rightNodes.push({ name: d.target, y: currentYRight, h, val: d.value });
    currentYRight += h + 12;
  }

  // Flow coordinates
  let leftOffset = yStartBib;
  const leftFlows = [];
  for (const node of leftNodes) {
    const sy = node.y;
    const ty = leftOffset;
    leftOffset += node.h;
    leftFlows.push({ name: node.name, x0: sX[0] + sNodeW, x1: sX[1], y0: sy + node.h/2, y1: ty + node.h/2, w: node.h, val: node.val });
  }

  let rightOffset = yStartBib + (hBib - outbounds.reduce((sum, d) => sum + d.value, 0) * sScale) / 2;
  const rightFlows = [];
  for (const node of rightNodes) {
    const sy = rightOffset;
    const ty = node.y;
    rightOffset += node.h;
    rightFlows.push({ name: node.name, x0: sX[1] + sNodeW, x1: sX[2], y0: sy + node.h/2, y1: ty + node.h/2, w: node.h, val: node.val });
  }

  // 4. Demographics Population Pyramid
  const selectedDemographics = demographicsData.filter((d) => d.municipality === selectedMunicipality);
  const bwDemographics = demographicsData.filter((d) => d.municipality === "Baden-Württemberg (Durchschnitt)");
  const ageGroups = Array.from(new Set(demographicsData.map((d) => d.ageGroup))).reverse();

  return (
    <div className="trends-container">
      {/* Selector & Title */}
      <div className="border-b border-zinc-850 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2" id="local-dashboard-main-title">
            <Landmark size={22} className="text-blue-400" />
            Lokal-Spiegel: Landkreis Biberach & Ummendorf
          </h3>
          <p className="text-zinc-400 text-xs mt-1">
            Gemeindevergleich und detaillierte Daten für lokale Finanzen, Pendlerströme, Solarpotenzial und Bevölkerungsstruktur.
          </p>
        </div>

        {/* Selector Dropdown */}
        <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-2xl flex flex-col gap-0.5">
          <span className="text-[9px] text-blue-400 font-extrabold uppercase px-1">Ausgewählte Gemeinde</span>
          <select
            value={selectedMunicipality}
            onChange={(e) => setSelectedMunicipality(e.target.value)}
            className="bg-transparent text-white font-extrabold text-sm border-none outline-none cursor-pointer pr-4"
          >
            {municipalities.map((name) => (
              <option key={name} value={name} className="bg-zinc-950 text-white font-medium">{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Layout of the 4 Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        
        {/* CONCEPT 1: Kommunaler Finanzvergleich */}
        <div className="info-card border border-zinc-850 bg-zinc-950/40 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <Landmark size={18} className="text-emerald-400" />
              1. Kommunaler Finanzvergleich
            </h4>
            <p className="text-zinc-500 text-[11px] mt-1 mb-4 leading-relaxed">
              Vergleicht Steuersätze und die Steuereinnahmen je Einwohner mit Landes- und Kreisdurchschnitten.
            </p>

            {/* Metric Select Buttons */}
            <div className="flex bg-zinc-900/60 border border-zinc-800 p-1 rounded-xl mb-6 max-w-fit">
              <button
                onClick={() => setFinanceMetric("hebesatzGewerbe")}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  financeMetric === "hebesatzGewerbe" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Gewerbesteuer
              </button>
              <button
                onClick={() => setFinanceMetric("hebesatzGrundB")}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  financeMetric === "hebesatzGrundB" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Grundsteuer B
              </button>
              <button
                onClick={() => setFinanceMetric("taxRevenuePerCapita")}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  financeMetric === "taxRevenuePerCapita" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Einnahmen p.K.
              </button>
            </div>

            {/* Horizontal Bar Chart */}
            <div className="flex flex-col gap-4">
              {/* Selected Municipality */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-sky-400">{selectedMunicipality}</span>
                  <span className="text-white">{mData[financeMetric]}{getMetricUnit()}</span>
                </div>
                <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${(mData[financeMetric] / getMetricMax()) * 100}%` }}
                    className="h-full bg-sky-500 rounded-full"
                  />
                </div>
              </div>

              {/* Biberach (Benchmark) */}
              {selectedMunicipality !== "Biberach an der Riß" && (
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-zinc-400">Biberach an der Riß (Wirtschaftskern)</span>
                    <span className="text-zinc-300">{bibData[financeMetric]}{getMetricUnit()}</span>
                  </div>
                  <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${(bibData[financeMetric] / getMetricMax()) * 100}%` }}
                      className="h-full bg-zinc-700 rounded-full"
                    />
                  </div>
                </div>
              )}

              {/* Landkreis Biberach Average */}
              <div className="flex flex-col gap-1 border-t border-zinc-900/60 pt-3">
                <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                  <span>Landkreis Biberach (Durchschnitt)</span>
                  <span>{lkData[financeMetric].toFixed(0)}{getMetricUnit()}</span>
                </div>
                <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${(lkData[financeMetric] / getMetricMax()) * 100}%` }}
                    className="h-full bg-emerald-600/70 rounded-full"
                  />
                </div>
              </div>

              {/* Baden-Württemberg Average */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                  <span>Landesdurchschnitt Baden-Württemberg</span>
                  <span>{bwData[financeMetric].toFixed(0)}{getMetricUnit()}</span>
                </div>
                <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${(bwData[financeMetric] / getMetricMax()) * 100}%` }}
                    className="h-full bg-purple-600/60 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 border-t border-zinc-900/80 pt-3 mt-6 flex justify-between items-center">
            <span>Quelle: <a href="https://www.statistik-bw.de/SRDB/index.asp?H=Finanzen&amp;U=Realsteuer" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-semibold">Statistisches Landesamt Baden-Württemberg (Hebesatzstatistik)</a> &amp; <a href="https://www.ummendorf.de/de/leben-wohnen/bauen-gebuehren/steuern-gebuehren" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-semibold">Gemeinde Ummendorf</a>.</span>
            <a href="https://www.statistik-bw.de/presse/pressemitteilungen/pressemitteilung/ein-grossteil-der-gemeinden-in-baden-wuerttemberg-hat-im-ersten-quartal-2025-die-realsteuerhebesaetze-geaendert/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">statistik-bw.de (Hebesatzänderung)</a>
          </div>
        </div>

        {/* CONCEPT 3: Solarenergie-Dachpotenzial */}
        <div className="info-card border border-zinc-850 bg-zinc-950/40 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <Sun size={18} className="text-yellow-400" />
              2. Lokales Solar-Dachpotenzial & Ertragssimulator
            </h4>
            <p className="text-zinc-500 text-[11px] mt-1 mb-4 leading-relaxed">
              Analysiert die Eignung der Dachflächen für Photovoltaik in {selectedMunicipality} und simuliert den Ertrag.
            </p>

            {/* Suitability Doughnut Bar */}
            <div className="flex flex-col gap-1.5 mb-6">
              <span className="text-[10px] font-bold text-zinc-400">Verteilung Dachflächen-Eignung:</span>
              <div className="w-full h-7 rounded-lg overflow-hidden flex border border-zinc-900">
                <div style={{ width: `${pctExcellent}%` }} className="bg-yellow-500 hover:brightness-110" title="Hervorragend geeignet" />
                <div style={{ width: `${pctGood}%` }} className="bg-yellow-600/60 hover:brightness-110" title="Gut geeignet" />
                <div style={{ width: `${pctUnsuitable}%` }} className="bg-zinc-800 hover:brightness-110" title="Nicht geeignet" />
              </div>
              <div className="flex justify-between text-[9px] font-bold text-zinc-500">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span> Hervorragend ({pctExcellent.toFixed(0)}%)</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-yellow-600/60 rounded-full"></span> Gut ({pctGood.toFixed(0)}%)</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-zinc-800 rounded-full"></span> Ungeeignet ({pctUnsuitable.toFixed(0)}%)</span>
              </div>
            </div>

            {/* Simulator Slider */}
            <div className="bg-zinc-900/50 border border-zinc-850 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-zinc-300">Simulierte Belegung der Dachflächen:</span>
                <span className="text-xs font-black text-yellow-400">{solarCoverage}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={solarCoverage}
                onChange={(e) => setSolarCoverage(parseInt(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
              />
              <div className="border-t border-zinc-850/60 pt-3 mt-1 flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">Jährlicher Stromertrag:</span>
                  <span className="font-bold text-white">{simulatedYieldMWh.toFixed(0)} MWh</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">Versorgte Haushalte:</span>
                  <span className="font-bold text-emerald-400">ca. {simulatedHouseholds.toFixed(0)} Haushalte</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">Abdeckung der Gemeinde-Wohnungen:</span>
                  <span className="font-bold text-emerald-400">{householdPct.toFixed(0)}% aller Haushalte</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 border-t border-zinc-900/80 pt-3 mt-6 flex justify-between items-center">
            <span>Quelle: <a href="https://www.energieatlas-bw.de/sonne/gebaeude/karten" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline font-semibold">Energieatlas Baden-Württemberg (Dachflächen-Solaratlas)</a>.</span>
            <a href="https://www.energieatlas-bw.de/sonne/gebaeude/karten" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">energieatlas-bw.de (Karten)</a>
          </div>
        </div>

        {/* CONCEPT 4: Alterspyramide */}
        <div className="info-card border border-zinc-850 bg-zinc-950/40 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <Users size={18} className="text-purple-400" />
              3. Alterspyramide im Vergleich zum Landesdurchschnitt
            </h4>
            <p className="text-zinc-500 text-[11px] mt-1 mb-4 leading-relaxed">
              Die farbigen Balken zeigen {selectedMunicipality}. Die <span className="text-zinc-500 underline font-semibold">gestrichelten weißen Linien</span> stellen den Durchschnitt von Baden-Württemberg dar.
            </p>

            {/* Back-to-Back Pyramid */}
            <div className="flex flex-col gap-2 mt-4">
              {/* Header */}
              <div className="flex justify-between text-[9px] font-extrabold text-zinc-500 px-2 uppercase tracking-wider mb-2">
                <span className="w-1/3 text-right text-blue-400">Männer</span>
                <span className="w-1/3 text-center">Altersgruppe</span>
                <span className="w-1/3 text-left text-pink-400">Frauen</span>
              </div>

              {/* Rows */}
              {ageGroups.map((group) => {
                const item = selectedDemographics.find((d) => d.ageGroup === group) || { malePercent: 0, femalePercent: 0 };
                const bwItem = bwDemographics.find((d) => d.ageGroup === group) || { malePercent: 0, femalePercent: 0 };

                // Scale bar widths (max percent is around 9%)
                const maxPct = 9;
                const barWidthM = `${(item.malePercent / maxPct) * 100}%`;
                const barWidthF = `${(item.femalePercent / maxPct) * 100}%`;

                // Benchmark positioning
                const bwOffsetM = `${(1 - bwItem.malePercent / maxPct) * 100}%`;
                const bwOffsetF = `${(bwItem.femalePercent / maxPct) * 100}%`;

                return (
                  <div key={group} className="flex items-center text-[10px] font-bold h-4">
                    {/* Left (Male) */}
                    <div className="w-5/12 h-full flex justify-end items-center relative pr-2">
                      {/* State average overlay line */}
                      <div
                        style={{ right: `${(bwItem.malePercent / maxPct) * 100}%` }}
                        className="absolute h-4 w-[2px] bg-white border-l border-zinc-950 border-solid z-10 opacity-70"
                        title={`BW Durchschnitt: ${bwItem.malePercent}%`}
                      />
                      <div
                        style={{ width: barWidthM }}
                        className="h-3 bg-blue-500/80 rounded-l-sm"
                        title={`${item.malePercent}% der Bevölkerung`}
                      />
                    </div>

                    {/* Age Group */}
                    <div className="w-2/12 h-full flex justify-center items-center text-[9px] text-zinc-500 font-extrabold bg-zinc-900/60 rounded">
                      {group}
                    </div>

                    {/* Right (Female) */}
                    <div className="w-5/12 h-full flex justify-start items-center relative pl-2">
                      {/* State average overlay line */}
                      <div
                        style={{ left: `${(bwItem.femalePercent / maxPct) * 100}%` }}
                        className="absolute h-4 w-[2px] bg-white border-r border-zinc-950 border-solid z-10 opacity-70"
                        title={`BW Durchschnitt: ${bwItem.femalePercent}%`}
                      />
                      <div
                        style={{ width: barWidthF }}
                        className="h-3 bg-pink-500/80 rounded-r-sm"
                        title={`${item.femalePercent}% der Bevölkerung`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 border-t border-zinc-900/80 pt-3 mt-6 flex justify-between items-center">
            <span>Quelle: <a href="https://www.statistik-bw.de/BevoelkGebiet/Bevoelk-Zensus/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline font-semibold">Statistisches Landesamt BW (Bevölkerungsfortschreibung)</a>. Durchschnittsalter in {selectedMunicipality}: {mData.avgAge} Jahre.</span>
            <a href="https://www.statistik-bw.de/BevoelkGebiet/Bevoelk-Zensus/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">statistik-bw.de (Demografie)</a>
          </div>
        </div>

        {/* CONCEPT 2: Pendler-Sankey (Biberach) */}
        <div className="info-card border border-zinc-850 bg-zinc-950/40 p-6 rounded-2xl flex flex-col justify-between lg:col-span-2">
          <div>
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <ArrowRightLeft size={18} className="text-blue-400" />
              4. Pendler-Sankey: Biberach an der Riß (Beschäftigungs-Knotenpunkt)
            </h4>
            <p className="text-zinc-500 text-[11px] mt-1 mb-4 leading-relaxed">
              Veranschaulicht das hohe Ein- und Auspendlervolumen der Stadt Biberach (Großkonzerne Boehringer, Liebherr, Handtmann).
            </p>

            {/* Pendler Sankey SVG */}
            <div className="relative w-full h-[300px] bg-zinc-950/30 rounded-xl border border-zinc-900 p-2 overflow-x-auto">
              <svg viewBox={`0 0 ${sankeyW} ${sankeyH}`} className="overflow-visible min-w-[700px]" width="100%" height="100%">
                {/* Defs for gradients */}
                <defs>
                  {leftNodes.map((n, idx) => (
                    <linearGradient key={`p-in-${idx}`} id={`p-in-grad-${idx}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.65" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.5" />
                    </linearGradient>
                  ))}
                  {rightNodes.map((n, idx) => (
                    <linearGradient key={`p-out-${idx}`} id={`p-out-grad-${idx}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.55" />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.5" />
                    </linearGradient>
                  ))}
                </defs>

                {/* Draw flow paths */}
                <g>
                  {leftFlows.map((flow, idx) => {
                    const pathStr = `M ${flow.x0} ${flow.y0} C ${(flow.x0 + flow.x1)/2} ${flow.y0}, ${(flow.x0 + flow.x1)/2} ${flow.y1}, ${flow.x1} ${flow.y1}`;
                    return (
                      <path
                        key={`flow-in-${idx}`}
                        d={pathStr}
                        fill="none"
                        stroke={`url(#p-in-grad-${idx})`}
                        strokeWidth={flow.w}
                        style={{ opacity: hoveredCommuter === `in-${idx}` ? 0.95 : 0.65, transition: "opacity 0.2s" }}
                        onMouseEnter={() => setHoveredCommuter(`in-${idx}`)}
                        onMouseLeave={() => setHoveredCommuter(null)}
                      />
                    );
                  })}
                  
                  {rightFlows.map((flow, idx) => {
                    const pathStr = `M ${flow.x0} ${flow.y0} C ${(flow.x0 + flow.x1)/2} ${flow.y0}, ${(flow.x0 + flow.x1)/2} ${flow.y1}, ${flow.x1} ${flow.y1}`;
                    return (
                      <path
                        key={`flow-out-${idx}`}
                        d={pathStr}
                        fill="none"
                        stroke={`url(#p-out-grad-${idx})`}
                        strokeWidth={flow.w}
                        style={{ opacity: hoveredCommuter === `out-${idx}` ? 0.95 : 0.65, transition: "opacity 0.2s" }}
                        onMouseEnter={() => setHoveredCommuter(`out-${idx}`)}
                        onMouseLeave={() => setHoveredCommuter(null)}
                      />
                    );
                  })}
                </g>

                {/* Nodes rendering */}
                {/* Left Column Inbound */}
                <g>
                  {leftNodes.map((n, idx) => (
                    <g key={`n-in-${idx}`}>
                      <rect x={sX[0]} y={n.y} width={sNodeW} height={n.h} rx={2} fill="#0ea5e9" />
                      <text x={sX[0] - 8} y={n.y + n.h/2} textAnchor="end" dominantBaseline="middle" className="text-[9px] font-bold fill-zinc-400">
                        {n.name}
                      </text>
                      <text x={sX[0] - 8} y={n.y + n.h/2 + 10} textAnchor="end" dominantBaseline="middle" className="text-[8px] font-bold fill-zinc-600">
                        +{n.val} Pendler
                      </text>
                    </g>
                  ))}
                </g>

                {/* Center Node (Biberach) */}
                <g>
                  <rect x={sX[1]} y={yStartBib} width={sNodeW} height={hBib} rx={3} fill="#8b5cf6" />
                  <text x={sX[1] + sNodeW/2} y={yStartBib - 10} textAnchor="middle" className="text-[10px] font-extrabold fill-zinc-200">
                    Biberach
                  </text>
                  <text x={sX[1] + sNodeW/2} y={yStartBib + hBib/2} textAnchor="middle" dominantBaseline="middle" className="text-[9px] font-extrabold fill-zinc-950" transform={`rotate(-90, ${sX[1] + sNodeW/2}, ${yStartBib + hBib/2})`}>
                    Arbeitsplatz-Zentrum
                  </text>
                </g>

                {/* Right Column Outbound */}
                <g>
                  {rightNodes.map((n, idx) => (
                    <g key={`n-out-${idx}`}>
                      <rect x={sX[2]} y={n.y} width={sNodeW} height={n.h} rx={2} fill="#f43f5e" />
                      <text x={sX[2] + sNodeW + 8} y={n.y + n.h/2} textAnchor="start" dominantBaseline="middle" className="text-[9px] font-bold fill-zinc-400">
                        {n.name}
                      </text>
                      <text x={sX[2] + sNodeW + 8} y={n.y + n.h/2 + 10} textAnchor="start" dominantBaseline="middle" className="text-[8px] font-bold fill-zinc-600">
                        -{n.val} Pendler
                      </text>
                    </g>
                  ))}
                </g>
              </svg>
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 border-t border-zinc-900/80 pt-3 mt-6 flex justify-between items-center">
            <span>Quelle: <a href="https://statistik.arbeitsagentur.de/DE/Navigation/Statistiken/Interaktive-Statistiken/Pendlerstroeme/Pendlerstroeme-Nav.html" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold">Bundesagentur für Arbeit (Pendlerströme)</a> (Stand Juni 2024).</span>
            <a href="https://statistik.arbeitsagentur.de/DE/Navigation/Statistiken/Interaktive-Statistiken/Pendlerstroeme/Pendlerstroeme-Nav.html" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">arbeitsagentur.de (Pendler)</a>
          </div>
        </div>

      </div>
    </div>
  );
}
