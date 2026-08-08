"use client";

import React, { useState } from "react";
import { Landmark, ArrowLeftRight } from "lucide-react";

// Color mappings
const REVENUE_COLORS = {
  // Column 0
  "Lohn- & Einkommensteuer": "#0ea5e9", // Sky
  "Umsatzsteuer (Mehrwertsteuer)": "#38bdf8", // Sky light
  "Körperschaftsteuer": "#0284c7", // Sky dark
  "Energiesteuer": "#06b6d4", // Cyan
  "Sonstige Bundessteuern": "#22d3ee", // Cyan light
  "Gewerbesteuer": "#10b981", // Emerald
  "Grundsteuer": "#34d399", // Emerald light
  "Grunderwerb- & Erbschaftsteuer": "#059669", // Emerald dark
  "Sonstige Länder/Gemeindesteuern": "#a7f3d0", // Emerald lighter
  "Sozialbeiträge": "#f43f5e", // Rose
  "Gebühren & sonstige Einnahmen": "#64748b", // Slate
  
  // Column 1
  "Gemeinschaftsteuern": "#0284c7",
  "Bundessteuern": "#0891b2",
  "Länder- & Gemeindesteuern": "#0d9488",
  "Sozialabgaben": "#e11d48",
  "Sonstige Einnahmen": "#475569"
};

const SPENDING_COLORS = {
  // Column 4
  "Soziale Sicherung": "#e11d48", // Rose dark
  "Gesundheit": "#ec4899",        // Pink
  "Bildung & Forschung": "#a855f7", // Purple
  "Verkehr & Infrastruktur": "#0ea5e9", // Sky
  "Verteidigung": "#4b5563",      // Grey/Slate
  "Allgemeine Dienste": "#8b5cf6", // Violet
  "Sonstiges": "#f97316"          // Orange
};

const SPENDING_PARENTS = {
  "Gesetzliche Rente": "Soziale Sicherung",
  "Bürgergeld & Sozialhilfe": "Soziale Sicherung",
  "Beamtenpensionen": "Soziale Sicherung",
  "Sonstiges (Kindergeld / Pflege)": "Soziale Sicherung",
  "Gesetzliche Krankenversicherung (GKV)": "Gesundheit",
  "Krankenhäuser & Kliniken": "Gesundheit",
  "Schulen & Kitas": "Bildung & Forschung",
  "Hochschulen & Universitäten": "Bildung & Forschung",
  "Wissenschaft & Forschung": "Bildung & Forschung",
  "Schienen & ÖPNV": "Verkehr & Infrastruktur",
  "Straßen & Autobahnen": "Verkehr & Infrastruktur",
  "Digitale Infrastruktur": "Verkehr & Infrastruktur",
  "Bundeswehr Ausrüstung": "Verteidigung",
  "Personal & Betrieb": "Verteidigung",
  "Zinsen für Staatsschulden": "Allgemeine Dienste",
  "Verwaltung & Justiz": "Allgemeine Dienste",
  "Entwicklungszusammenarbeit & EU": "Allgemeine Dienste",
  "Polizei & Katastrophenschutz": "Sonstiges",
  "Umweltschutz & Klima": "Sonstiges",
  "Freizeit / Kultur / Sport": "Sonstiges",
  "Wohnungswesen & Kommunales": "Sonstiges"
};

export default function DoubleSankeyDiagram({ data }) {
  const [hoveredNode, setHoveredNode] = useState(null); // { name, col }
  const [hoveredLink, setHoveredLink] = useState(null); // link
  const [tooltip, setTooltip] = useState(null);

  if (!data || data.length === 0) return <div>Keine Daten verfügbar</div>;

  // Define column groups
  const col0Names = [
    "Sozialbeiträge",
    "Lohn- & Einkommensteuer",
    "Umsatzsteuer (Mehrwertsteuer)",
    "Gewerbesteuer",
    "Körperschaftsteuer",
    "Energiesteuer",
    "Grunderwerb- & Erbschaftsteuer",
    "Grundsteuer",
    "Sonstige Bundessteuern",
    "Sonstige Länder/Gemeindesteuern",
    "Gebühren & sonstige Einnahmen"
  ];
  const col1Names = [
    "Sozialabgaben",
    "Gemeinschaftsteuern",
    "Länder- & Gemeindesteuern",
    "Bundessteuern",
    "Sonstige Einnahmen"
  ];
  const col2Names = ["Gesamteinnahmen", "Defizit (Neue Kredite)"];
  const col3Names = ["Gesamtausgaben"];
  const col4Names = [
    "Soziale Sicherung",
    "Gesundheit",
    "Allgemeine Dienste",
    "Sonstiges",
    "Bildung & Forschung",
    "Verkehr & Infrastruktur",
    "Verteidigung"
  ];
  const col5Names = Object.keys(SPENDING_PARENTS);

  // SVG parameters
  const svgWidth = 1400;
  const svgHeight = 880;
  const paddingTop = 40;
  const paddingBottom = 40;
  const graphHeight = svgHeight - paddingTop - paddingBottom;
  const nodeWidth = 20;

  // X Positions for the 6 columns
  const colX = [190, 420, 620, 780, 985, 1195];

  // Define Gaps per column
  const colGaps = [9, 32, 90, 0, 20, 9];

  // Calculate Node values
  const getOutboundSum = (name, stage) => {
    return data.filter((d) => d.source === name && d.stage === stage).reduce((s, d) => s + d.value, 0);
  };
  const getInboundSum = (name, stage) => {
    return data.filter((d) => d.target === name && d.stage === stage).reduce((s, d) => s + d.value, 0);
  };

  // Node Value calculations based on connections
  const nodeVals = {};
  col0Names.forEach((n) => nodeVals[n] = getOutboundSum(n, "rev_stage1"));
  col1Names.forEach((n) => nodeVals[n] = getInboundSum(n, "rev_stage1"));
  nodeVals["Gesamteinnahmen"] = 1960;
  nodeVals["Defizit (Neue Kredite)"] = 132;
  nodeVals["Gesamtausgaben"] = 2092;
  col4Names.forEach((n) => nodeVals[n] = getInboundSum(n, "exp_stage1"));
  col5Names.forEach((n) => nodeVals[n] = getInboundSum(n, "exp_stage2"));

  // Global Scale (Mrd € to pixels)
  // Total spending is 2092 Mrd €, which fits in the centered Gesamtausgaben bar (570px height)
  const globalScale = 570 / 2092;

  // Build Node positions per column, centered vertically
  const layoutColumn = (names, colIdx, gap) => {
    const totalNodeVal = names.reduce((sum, n) => sum + nodeVals[n], 0);
    const totalHeight = totalNodeVal * globalScale + (names.length - 1) * gap;
    const yStart = paddingTop + (graphHeight - totalHeight) / 2;

    let currentY = yStart;
    const res = [];
    for (const name of names) {
      const h = nodeVals[name] * globalScale;
      res.push({ name, x: colX[colIdx], y: currentY, h, value: nodeVals[name], col: colIdx });
      currentY += h + gap;
    }
    return res;
  };

  const nodesCol0 = layoutColumn(col0Names, 0, colGaps[0]);
  const nodesCol1 = layoutColumn(col1Names, 1, colGaps[1]);
  const nodesCol2 = layoutColumn(col2Names, 2, colGaps[2]);
  const nodesCol3 = layoutColumn(col3Names, 3, colGaps[3]);
  const nodesCol4 = layoutColumn(col4Names, 4, colGaps[4]);
  const nodesCol5 = layoutColumn(col5Names, 5, colGaps[5]);

  const allNodesMap = {
    ...Object.fromEntries(nodesCol0.map((n) => [n.name, n])),
    ...Object.fromEntries(nodesCol1.map((n) => [n.name, n])),
    ...Object.fromEntries(nodesCol2.map((n) => [n.name, n])),
    ...Object.fromEntries(nodesCol3.map((n) => [n.name, n])),
    ...Object.fromEntries(nodesCol4.map((n) => [n.name, n])),
    ...Object.fromEntries(nodesCol5.map((n) => [n.name, n])),
  };

  // Build links offsets
  const incomingOffsets = Object.fromEntries(Object.values(allNodesMap).map((n) => [n.name, n.y]));
  const outgoingOffsets = Object.fromEntries(Object.values(allNodesMap).map((n) => [n.name, n.y]));

  const processStageLinks = (links, stageKey, sortFn) => {
    return links
      .filter((d) => d.stage === stageKey)
      .map((l) => ({ ...l, sh: l.value * globalScale, th: l.value * globalScale }))
      .sort(sortFn)
      .map((link) => {
        const sy = outgoingOffsets[link.source];
        outgoingOffsets[link.source] += link.sh;

        const ty = incomingOffsets[link.target];
        incomingOffsets[link.target] += link.th;

        return { ...link, sy, ty };
      });
  };

  // 1. rev_stage1 (Col 0 -> Col 1)
  const l0to1 = processStageLinks(data, "rev_stage1", (a, b) => {
    const srcDiff = col0Names.indexOf(a.source) - col0Names.indexOf(b.source);
    if (srcDiff !== 0) return srcDiff;
    return col1Names.indexOf(a.target) - col1Names.indexOf(b.target);
  });

  // 2. rev_stage2 (Col 1 -> Col 2)
  const l1to2 = processStageLinks(data, "rev_stage2", (a, b) => {
    const srcDiff = col1Names.indexOf(a.source) - col1Names.indexOf(b.source);
    if (srcDiff !== 0) return srcDiff;
    return col2Names.indexOf(a.target) - col2Names.indexOf(b.target);
  });

  // 3. mid_stage (Col 2 -> Col 3)
  const l2to3 = processStageLinks(data, "mid_stage", (a, b) => {
    return col2Names.indexOf(a.source) - col2Names.indexOf(b.source);
  });

  // 4. exp_stage1 (Col 3 -> Col 4)
  const l3to4 = processStageLinks(data, "exp_stage1", (a, b) => {
    return col4Names.indexOf(a.target) - col4Names.indexOf(b.target);
  });

  // 5. exp_stage2 (Col 4 -> Col 5)
  const l4to5 = processStageLinks(data, "exp_stage2", (a, b) => {
    const srcDiff = col4Names.indexOf(a.source) - col4Names.indexOf(b.source);
    if (srcDiff !== 0) return srcDiff;
    return col5Names.indexOf(a.target) - col5Names.indexOf(b.target);
  });

  const allLinks = [...l0to1, ...l1to2, ...l2to3, ...l3to4, ...l4to5];

  // Trace connectivity on hover
  const isLinkActive = (link) => {
    if (hoveredLink !== null) {
      return hoveredLink.source === link.source && hoveredLink.target === link.target && hoveredLink.stage === link.stage;
    }
    if (hoveredNode !== null) {
      const { name, col } = hoveredNode;
      
      // Left side hover trace (Revenue)
      if (col === 0) {
        if (link.stage === "rev_stage1" && link.source === name) return true;
        if (link.stage === "rev_stage2") {
          const middleNode = l0to1.find((l) => l.source === name)?.target;
          return link.source === middleNode;
        }
        if (link.stage === "mid_stage") {
          return link.source === "Gesamteinnahmen";
        }
      }
      else if (col === 1) {
        return link.source === name || link.target === name;
      }
      else if (col === 2) {
        if (name === "Gesamteinnahmen") {
          return link.stage === "rev_stage2" || (link.stage === "mid_stage" && link.source === "Gesamteinnahmen");
        } else { // Defizit
          return link.stage === "mid_stage" && link.source === "Defizit (Neue Kredite)";
        }
      }
      // Center flow hover trace
      else if (col === 3) {
        return link.stage === "mid_stage" || link.stage === "exp_stage1";
      }
      // Right side hover trace (Spending)
      else if (col === 4) {
        return link.source === name || link.target === name;
      }
      else if (col === 5) {
        if (link.stage === "exp_stage2" && link.target === name) return true;
        if (link.stage === "exp_stage1") {
          const parent = SPENDING_PARENTS[name];
          return link.target === parent;
        }
        if (link.stage === "mid_stage") return true; // highlight center since it feeds spending
      }
      return false;
    }
    return true;
  };

  const hasActiveHighlight = hoveredLink !== null || hoveredNode !== null;

  // Node Color Generator
  const getNodeColor = (node) => {
    if (node.col === 0 || node.col === 1) {
      return REVENUE_COLORS[node.name] || "#3b82f6";
    }
    if (node.name === "Gesamteinnahmen") return "#2563eb"; // Strong blue
    if (node.name === "Defizit (Neue Kredite)") return "#4b5563"; // Dark grey
    if (node.name === "Gesamtausgaben") return "#8b5cf6"; // Strong purple
    if (node.col === 4) {
      return SPENDING_COLORS[node.name] || "#a855f7";
    }
    if (node.col === 5) {
      const parent = SPENDING_PARENTS[node.name];
      return SPENDING_COLORS[parent] || "#a855f7";
    }
    return "#cbd5e1";
  };

  return (
    <div className="sankey-container">
      <div className="sankey-header">
        <h3 className="sankey-title flex items-center gap-2" id="double-sankey-title">
          <ArrowLeftRight className="text-blue-400" size={20} />
          Bürger-Haushalt: Einnahmen, Defizit & Ausgaben (2024)
        </h3>
        <p className="sankey-subtitle">
          Ausgabenvolumen: <span className="text-purple-400 font-extrabold">2.092 Mrd. €</span> &mdash; 
          Einnahmen: <span className="text-sky-400 font-extrabold">1.960 Mrd. €</span> &mdash; 
          Finanzierungsdefizit: <span className="text-amber-500 font-extrabold">132 Mrd. €</span>.
        </p>
      </div>

      <div className="sankey-wrapper relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="sankey-svg min-w-[1200px]"
          width="100%"
          height="100%"
        >
          {/* Defs for gradients & patterns */}
          <defs>
            {/* Deficit Hatched Pattern */}
            <pattern id="deficit-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="4" height="8" fill="rgba(245, 158, 11, 0.15)" />
              <line x1="0" y1="0" x2="0" y2="8" stroke="#f59e0b" strokeWidth="1.5" />
            </pattern>

            {/* Stage 1 Revenue Gradients */}
            {col0Names.map((src) =>
              col1Names.map((tgt) => {
                const srcColor = REVENUE_COLORS[src] || "#94a3b8";
                const tgtColor = REVENUE_COLORS[tgt] || "#94a3b8";
                return (
                  <linearGradient
                    key={`grad-r1-${src}-${tgt}`}
                    id={`grad-r1-${src.replace(/[^a-zA-Z0-9]/g, "")}-${tgt.replace(/[^a-zA-Z0-9]/g, "")}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor={srcColor} stopOpacity="0.7" />
                    <stop offset="100%" stopColor={tgtColor} stopOpacity="0.55" />
                  </linearGradient>
                );
              })
            )}

            {/* Stage 2 Revenue Gradients */}
            {col1Names.map((src) => (
              <linearGradient
                key={`grad-r2-${src}`}
                id={`grad-r2-${src.replace(/[^a-zA-Z0-9]/g, "")}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor={REVENUE_COLORS[src] || "#cbd5e1"} stopOpacity="0.65" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.5" />
              </linearGradient>
            ))}

            {/* Mid Stage Gradients */}
            <linearGradient id="grad-mid-rev" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.55" />
            </linearGradient>
            
            <linearGradient id="grad-mid-def" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.55" />
            </linearGradient>

            {/* Exp Stage 1 Gradients */}
            {col4Names.map((tgt) => {
              const tgtColor = SPENDING_COLORS[tgt] || "#cbd5e1";
              return (
                <linearGradient
                  key={`grad-e1-${tgt}`}
                  id={`grad-e1-${tgt.replace(/[^a-zA-Z0-9]/g, "")}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.55" />
                  <stop offset="100%" stopColor={tgtColor} stopOpacity="0.6" />
                </linearGradient>
              );
            })}

            {/* Exp Stage 2 Gradients */}
            {col4Names.map((src) =>
              col5Names.map((tgt) => {
                const srcColor = SPENDING_COLORS[src] || "#cbd5e1";
                const parent = SPENDING_PARENTS[tgt];
                const tgtColor = SPENDING_COLORS[parent] || "#cbd5e1";
                return (
                  <linearGradient
                    key={`grad-e2-${src}-${tgt}`}
                    id={`grad-e2-${src.replace(/[^a-zA-Z0-9]/g, "")}-${tgt.replace(/[^a-zA-Z0-9]/g, "")}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor={srcColor} stopOpacity="0.6" />
                    <stop offset="100%" stopColor={tgtColor} stopOpacity="0.5" />
                  </linearGradient>
                );
              })
            )}
          </defs>

          {/* Links (Flows) */}
          <g>
            {allLinks.map((link, idx) => {
              const active = isLinkActive(link);
              
              let gradId = "";
              const srcClean = link.source.replace(/[^a-zA-Z0-9]/g, "");
              const tgtClean = link.target.replace(/[^a-zA-Z0-9]/g, "");

              if (link.stage === "rev_stage1") {
                gradId = `grad-r1-${srcClean}-${tgtClean}`;
              } else if (link.stage === "rev_stage2") {
                gradId = `grad-r2-${srcClean}`;
              } else if (link.stage === "mid_stage") {
                gradId = link.source === "Gesamteinnahmen" ? "grad-mid-rev" : "grad-mid-def";
              } else if (link.stage === "exp_stage1") {
                gradId = `grad-e1-${tgtClean}`;
              } else if (link.stage === "exp_stage2") {
                gradId = `grad-e2-${srcClean}-${tgtClean}`;
              }

              // Bezier coordinates mapping based on columns
              let isLeft = link.stage.startsWith("rev") || (link.stage === "mid_stage" && link.source === "Gesamteinnahmen");
              
              let x0 = 0, x1 = 0;
              if (link.stage === "rev_stage1") {
                x0 = colX[0] + nodeWidth; x1 = colX[1];
              } else if (link.stage === "rev_stage2") {
                x0 = colX[1] + nodeWidth; x1 = colX[2];
              } else if (link.stage === "mid_stage") {
                x0 = colX[2] + nodeWidth; x1 = colX[3];
              } else if (link.stage === "exp_stage1") {
                x0 = colX[3] + nodeWidth; x1 = colX[4];
              } else if (link.stage === "exp_stage2") {
                x0 = colX[4] + nodeWidth; x1 = colX[5];
              }

              const y0 = link.sy + link.sh / 2;
              const y1 = link.ty + link.th / 2;
              const pathStr = `M ${x0} ${y0} C ${(x0 + x1) / 2} ${y0}, ${(x0 + x1) / 2} ${y1}, ${x1} ${y1}`;

              return (
                <path
                  key={`dbl-link-${idx}`}
                  d={pathStr}
                  fill="none"
                  stroke={`url(#${gradId})`}
                  strokeWidth={Math.max(1.5, link.sh)}
                  className="sankey-flow-path"
                  style={{
                    opacity: active ? (hoveredLink ? 0.95 : 0.75) : 0.04,
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    setHoveredLink(link);
                    setTooltip({
                      x: e.clientX,
                      y: e.clientY - 10,
                      content: (
                        <div className="tooltip-inner text-xs">
                          <div className="font-bold opacity-60 uppercase tracking-wider text-[9px]">
                            {link.stage.startsWith("rev") ? "Mittelherkunft (Einnahmen)" : link.stage === "mid_stage" ? "Haushaltsausgleich" : "Mittelverwendung (Ausgaben)"}
                          </div>
                          <div className="my-1">
                            <span className="font-semibold text-zinc-300">{link.source}</span> &rarr;
                            <div className="font-bold text-zinc-100 text-sm mt-0.5">{link.target}</div>
                          </div>
                          <div className="border-t border-zinc-800/80 pt-1 mt-1 text-sm font-semibold flex justify-between gap-4">
                            <span>Volumen:</span>
                            <span className="text-amber-400">{link.value.toFixed(1)} Mrd. €</span>
                          </div>
                        </div>
                      ),
                    });
                  }}
                  onMouseMove={(e) => {
                    setTooltip((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY - 10 } : null);
                  }}
                  onMouseLeave={() => {
                    setHoveredLink(null);
                    setTooltip(null);
                  }}
                />
              );
            })}
          </g>

          {/* Node columns */}
          {[nodesCol0, nodesCol1, nodesCol2, nodesCol3, nodesCol4, nodesCol5].map((colNodes, colIdx) => (
            <g key={`dbl-col-${colIdx}`}>
              {colNodes.map((node, idx) => {
                const active = hoveredNode?.col === colIdx && hoveredNode?.name === node.name;
                const color = getNodeColor(node);

                const isLeftLabel = colIdx <= 1;
                const isRightLabel = colIdx >= 4;
                const isCenter = colIdx === 2 || colIdx === 3;
                
                // Set hatched background for deficit
                const isDeficit = node.name === "Defizit (Neue Kredite)";

                return (
                  <g
                    key={`dbl-node-${colIdx}-${idx}`}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredNode({ col: colIdx, name: node.name })}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {/* Glowing highlight ring */}
                    {active && (
                      <rect
                        x={node.x - 3}
                        y={node.y - 3}
                        width={nodeWidth + 6}
                        height={node.h + 6}
                        rx={4}
                        fill="transparent"
                        stroke={isDeficit ? "#f59e0b" : color}
                        strokeWidth={1.5}
                        style={{ opacity: 0.6 }}
                      />
                    )}

                    {/* Main Node Bar */}
                    <rect
                      x={node.x}
                      y={node.y}
                      width={nodeWidth}
                      height={node.h}
                      rx={3}
                      fill={isDeficit ? "url(#deficit-hatch)" : color}
                      stroke={isDeficit ? "#f59e0b" : "transparent"}
                      strokeWidth={isDeficit ? 1.5 : 0}
                      className="transition-all duration-300"
                      style={{
                        opacity: 0.95,
                        filter: active ? `drop-shadow(0 0 6px ${isDeficit ? "#f59e0b" : color})` : "none",
                      }}
                    />

                    {/* Labels Left side (Col 0 and Col 1) */}
                    {isLeftLabel && (
                      <>
                        <text
                          x={node.x - 12}
                          y={node.y + node.h / 2}
                          textAnchor="end"
                          dominantBaseline="middle"
                          className={`text-[10px] font-bold fill-zinc-400 transition-all duration-150 ${
                            active ? "fill-white text-xs" : "opacity-90"
                          }`}
                        >
                          {node.name}
                        </text>
                        <text
                          x={node.x - 12}
                          y={node.y + node.h / 2 + 12}
                          textAnchor="end"
                          dominantBaseline="middle"
                          className="text-[9px] font-bold fill-zinc-500 group-hover:fill-zinc-400"
                        >
                          {node.value.toFixed(1)} Mrd. €
                        </text>
                      </>
                    )}

                    {/* Center node labels (Col 2 and Col 3) */}
                    {isCenter && (
                      <>
                        <text
                          x={node.x + nodeWidth / 2}
                          y={node.y - 8}
                          textAnchor="middle"
                          dominantBaseline="auto"
                          className={`text-[11px] font-extrabold fill-zinc-300 transition-all ${
                            active ? "fill-white text-xs" : ""
                          }`}
                        >
                          {node.name}
                        </text>
                        {node.h > 24 && (
                          <text
                            x={node.x + nodeWidth / 2}
                            y={node.y + node.h / 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className={`text-[10px] font-extrabold ${isDeficit ? 'fill-amber-400' : 'fill-zinc-950'} select-none pointer-events-none`}
                            transform={`rotate(-90, ${node.x + nodeWidth / 2}, ${node.y + node.h / 2})`}
                          >
                            {node.value.toFixed(0)} Mrd €
                          </text>
                        )}
                      </>
                    )}

                    {/* Labels Right side (Col 4 and Col 5) */}
                    {isRightLabel && (
                      <>
                        <text
                          x={node.x + nodeWidth + 12}
                          y={node.y + node.h / 2}
                          textAnchor="start"
                          dominantBaseline="middle"
                          className={`text-[10px] font-bold fill-zinc-400 transition-all duration-150 ${
                            active ? "fill-white text-xs" : "opacity-90"
                          }`}
                        >
                          {node.name.replace(/\s*\(BM.*\)/, "")}
                        </text>
                        <text
                          x={node.x + nodeWidth + 12}
                          y={node.y + node.h / 2 + 12}
                          textAnchor="start"
                          dominantBaseline="middle"
                          className="text-[9px] font-bold fill-zinc-500 group-hover:fill-zinc-400"
                        >
                          {node.value.toFixed(1)} Mrd. €
                        </text>
                      </>
                    )}
                  </g>
                );
              })}
            </g>
          ))}
        </svg>

        {/* Live Tooltip */}
        {tooltip && (
          <div
            className="sankey-tooltip"
            style={{
              position: "fixed",
              left: tooltip.x + 15,
              top: tooltip.y + 15,
              pointerEvents: "none",
              zIndex: 9999,
            }}
          >
            {tooltip.content}
          </div>
        )}
      </div>
      <div className="text-[10px] text-zinc-500 mt-2 px-2 flex justify-between items-center border-t border-zinc-900 pt-3">
        <span>Quelle: <a href="https://www.destatis.de/DE/Themen/Staat/Oeffentliche-Finanzen/Ausgaben-Einnahmen/Publikationen/Downloads-Ausgaben-und-Einnahmen/statistischer-bericht-kassenergebnis-gesamthaushalt-2140200253215.html" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold">Statistisches Bundesamt (Destatis) - Kassenergebnisse der öffentlichen Haushalte</a> &amp; BMF Finanzbericht 2024.</span>
        <a href="https://www.destatis.de/DE/Themen/Staat/Oeffentliche-Finanzen/Ausgaben-Einnahmen/Publikationen/Downloads-Ausgaben-und-Einnahmen/statistischer-bericht-kassenergebnis-gesamthaushalt-2140200253215.html" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">destatis.de (Kassenergebnisse)</a>
      </div>
    </div>
  );
}
