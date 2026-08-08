"use client";

import React, { useState } from "react";
import { Info } from "lucide-react";

// Color mappings for functions and hierarchy coloring
const COLOR_SCHEME = {
  // Column 0 - Government Levels
  levels: {
    "Sozialversicherung": "#f43f5e", // Rose
    "Bund": "#2563eb",              // Blue
    "Länder": "#06b6d4",            // Cyan
    "Kommunen": "#10b981",          // Emerald
  },
  // Column 1 - Main Functions (COFOG)
  functions: {
    "Soziale Sicherung": "#e11d48", // Rose dark
    "Gesundheit": "#ec4899",        // Pink
    "Bildung & Forschung": "#a855f7", // Purple
    "Verkehr & Infrastruktur": "#0ea5e9", // Sky
    "Verteidigung": "#64748b",      // Slate
    "Allgemeine Dienste": "#8b5cf6", // Violet
    "Sonstiges": "#f97316"          // Orange
  }
};

// Map sub-programs to their parent functions to color-code them
const PARENT_FUNCTION_MAP = {
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

export default function DetailedSankeyDiagram({ data }) {
  const [hoveredNode, setHoveredNode] = useState(null); // { column, name }
  const [hoveredLink, setHoveredLink] = useState(null); // { source, target, stage }
  const [tooltip, setTooltip] = useState(null);

  if (!data || data.length === 0) return <div>Keine Daten verfügbar</div>;

  // Group nodes by columns
  const col0Names = ["Sozialversicherung", "Bund", "Länder", "Kommunen"];
  const col1Names = [
    "Soziale Sicherung",
    "Gesundheit",
    "Allgemeine Dienste",
    "Sonstiges",
    "Bildung & Forschung",
    "Verkehr & Infrastruktur",
    "Verteidigung"
  ];
  const col2Names = Object.keys(PARENT_FUNCTION_MAP);

  // Calculate values
  const nodeValues = {};
  data.forEach((d) => {
    nodeValues[d.source] = (nodeValues[d.source] || 0) + d.value;
    nodeValues[d.target] = (nodeValues[d.target] || 0) + d.value;
  });

  // Calculate sum of column 0 (should be around 2092 Mrd)
  const totalValue = col0Names.reduce((sum, name) => {
    // For source nodes, get sum of their outgoing flows in stage1
    const nodeSum = data.filter((d) => d.source === name && d.stage === "stage1").reduce((s, d) => s + d.value, 0);
    return sum + nodeSum;
  }, 0);

  // SVG dimensions
  const svgWidth = 1200;
  const svgHeight = 850;
  const paddingTop = 40;
  const paddingBottom = 40;
  
  // X coordinates for the 3 columns
  const colX = [180, 590, 1000];
  const nodeWidth = 20;
  const graphHeight = svgHeight - paddingTop - paddingBottom;

  // Node scale calculations
  const gap0 = 35;
  const gap1 = 20;
  const gap2 = 9;

  const scale0 = (graphHeight - (col0Names.length - 1) * gap0) / totalValue;
  const scale1 = (graphHeight - (col1Names.length - 1) * gap1) / totalValue;
  const scale2 = (graphHeight - (col2Names.length - 1) * gap2) / totalValue;

  // 1. Position nodes in Column 0
  let currentY0 = paddingTop;
  const nodesCol0 = [];
  for (const name of col0Names) {
    const val = data.filter((d) => d.source === name && d.stage === "stage1").reduce((sum, d) => sum + d.value, 0);
    const h = val * scale0;
    nodesCol0.push({ name, x: colX[0], y: currentY0, h, value: val, col: 0 });
    currentY0 += h + gap0;
  }

  // 2. Position nodes in Column 1
  let currentY1 = paddingTop;
  const nodesCol1 = [];
  for (const name of col1Names) {
    const val = data.filter((d) => d.target === name && d.stage === "stage1").reduce((sum, d) => sum + d.value, 0);
    const h = val * scale1;
    nodesCol1.push({ name, x: colX[1], y: currentY1, h, value: val, col: 1 });
    currentY1 += h + gap1;
  }

  // 3. Position nodes in Column 2
  let currentY2 = paddingTop;
  const nodesCol2 = [];
  for (const name of col2Names) {
    const val = data.filter((d) => d.target === name && d.stage === "stage2").reduce((sum, d) => sum + d.value, 0);
    const h = val * scale2;
    nodesCol2.push({ name, x: colX[2], y: currentY2, h, value: val, col: 2 });
    currentY2 += h + gap2;
  }

  // Maps for quick coordinate lookups
  const nodesMap = {
    ...Object.fromEntries(nodesCol0.map((n) => [n.name, n])),
    ...Object.fromEntries(nodesCol1.map((n) => [n.name, n])),
    ...Object.fromEntries(nodesCol2.map((n) => [n.name, n])),
  };

  // 4. Compute flow paths (links)
  const linksCol0ToCol1 = data.filter((d) => d.stage === "stage1");
  const linksCol1ToCol2 = data.filter((d) => d.stage === "stage2");

  // Keep track of offsets at each node boundary
  const outgoingOffsets = Object.fromEntries(Object.values(nodesMap).map((n) => [n.name, n.y]));
  const incomingOffsets = Object.fromEntries(Object.values(nodesMap).map((n) => [n.name, n.y]));

  // Process Stage 1 Links (Col 0 -> Col 1)
  // Sort links to minimize crossings
  const stage1Links = linksCol0ToCol1
    .map((link) => ({ ...link, sh: link.value * scale0, th: link.value * scale1 }))
    .sort((a, b) => {
      const srcDiff = col0Names.indexOf(a.source) - col0Names.indexOf(b.source);
      if (srcDiff !== 0) return srcDiff;
      return col1Names.indexOf(a.target) - col1Names.indexOf(b.target);
    })
    .map((link) => {
      const sy = outgoingOffsets[link.source];
      outgoingOffsets[link.source] += link.sh;

      const ty = incomingOffsets[link.target];
      incomingOffsets[link.target] += link.th;

      return { ...link, sy, ty };
    });

  // Process Stage 2 Links (Col 1 -> Col 2)
  const stage2Links = linksCol1ToCol2
    .map((link) => ({ ...link, sh: link.value * scale1, th: link.value * scale2 }))
    .sort((a, b) => {
      const srcDiff = col1Names.indexOf(a.source) - col1Names.indexOf(b.source);
      if (srcDiff !== 0) return srcDiff;
      return col2Names.indexOf(a.target) - col2Names.indexOf(b.target);
    })
    .map((link) => {
      const sy = outgoingOffsets[link.source];
      outgoingOffsets[link.source] += link.sh;

      const ty = incomingOffsets[link.target];
      incomingOffsets[link.target] += link.th;

      return { ...link, sy, ty };
    });

  const allLinks = [...stage1Links, ...stage2Links];

  // Helper to determine link highlights
  const isLinkActive = (link) => {
    if (hoveredLink !== null) {
      return (
        hoveredLink.source === link.source &&
        hoveredLink.target === link.target &&
        hoveredLink.stage === link.stage
      );
    }
    if (hoveredNode !== null) {
      const { col, name } = hoveredNode;
      if (col === 0) {
        // Highlight entire path starting from this government level
        if (link.stage === "stage1" && link.source === name) return true;
        if (link.stage === "stage2") {
          // Trace if the middle node receives money from the hovered Col0 node
          const connectedMiddleNodes = stage1Links
            .filter((l) => l.source === name)
            .map((l) => l.target);
          return connectedMiddleNodes.includes(link.source);
        }
      } else if (col === 1) {
        // Highlight flows coming into or going out of this middle function node
        return link.source === name || link.target === name;
      } else if (col === 2) {
        // Highlight path leading to this sub-program
        if (link.stage === "stage2" && link.target === name) return true;
        if (link.stage === "stage1") {
          const parentFunction = PARENT_FUNCTION_MAP[name];
          return link.target === parentFunction;
        }
      }
      return false;
    }
    return true;
  };

  const hasActiveHighlight = hoveredLink !== null || hoveredNode !== null;

  // Color generator for nodes
  const getNodeColor = (node) => {
    if (node.col === 0) return COLOR_SCHEME.levels[node.name] || "#cbd5e1";
    if (node.col === 1) return COLOR_SCHEME.functions[node.name] || "#cbd5e1";
    
    // Column 2 colors match their parent functions
    const parent = PARENT_FUNCTION_MAP[node.name];
    return COLOR_SCHEME.functions[parent] || "#cbd5e1";
  };

  return (
    <div className="sankey-container">
      <div className="sankey-header">
        <h3 className="sankey-title flex items-center gap-2" id="sankey-detailed-title">
          <span className="w-3.5 h-3.5 bg-rose-500 rounded-full inline-block"></span>
          Öffentlicher Gesamthaushalt Deutschland &mdash; Mittelverwendung (2024)
        </h3>
        <p className="sankey-subtitle">
          Ausgabenvolumen: <span className="highlight-text">{totalValue.toFixed(0)} Milliarden Euro</span>. 
          Visualisiert den Geldfluss von den <strong>Haushaltsebenen (links)</strong> über die <strong>Aufgabenbereiche (Mitte)</strong> zu den <strong>Programmen (rechts)</strong>.
        </p>
      </div>

      <div className="sankey-wrapper relative">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="sankey-svg"
          width="100%"
          height="100%"
        >
          <defs>
            {/* Gradients for Stage 1 links */}
            {col0Names.map((src) =>
              col1Names.map((tgt) => {
                const srcColor = COLOR_SCHEME.levels[src] || "#94a3b8";
                const tgtColor = COLOR_SCHEME.functions[tgt] || "#94a3b8";
                return (
                  <linearGradient
                    key={`grad-s1-${src}-${tgt}`}
                    id={`grad-s1-${src.replace(/[^a-zA-Z0-9]/g, "")}-${tgt.replace(/[^a-zA-Z0-9]/g, "")}`}
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

            {/* Gradients for Stage 2 links */}
            {col1Names.map((src) =>
              col2Names.map((tgt) => {
                const srcColor = COLOR_SCHEME.functions[src] || "#94a3b8";
                const parentFunc = PARENT_FUNCTION_MAP[tgt];
                const tgtColor = COLOR_SCHEME.functions[parentFunc] || "#94a3b8";
                return (
                  <linearGradient
                    key={`grad-s2-${src}-${tgt}`}
                    id={`grad-s2-${src.replace(/[^a-zA-Z0-9]/g, "")}-${tgt.replace(/[^a-zA-Z0-9]/g, "")}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor={srcColor} stopOpacity="0.55" />
                    <stop offset="100%" stopColor={tgtColor} stopOpacity="0.45" />
                  </linearGradient>
                );
              })
            )}
          </defs>

          {/* Links (Flows) */}
          <g>
            {allLinks.map((link, idx) => {
              const active = isLinkActive(link);
              const dimmed = hasActiveHighlight && !active;
              
              const isS1 = link.stage === "stage1";
              const cleanSrc = link.source.replace(/[^a-zA-Z0-9]/g, "");
              const cleanTgt = link.target.replace(/[^a-zA-Z0-9]/g, "");
              const gradId = `grad-${isS1 ? "s1" : "s2"}-${cleanSrc}-${cleanTgt}`;

              // Bezier coordinates
              const x0 = isS1 ? colX[0] + nodeWidth : colX[1] + nodeWidth;
              const x1 = isS1 ? colX[1] : colX[2];
              const y0 = link.sy + link.sh / 2;
              const y1 = link.ty + link.th / 2;
              const pathStr = `M ${x0} ${y0} C ${(x0 + x1) / 2} ${y0}, ${(x0 + x1) / 2} ${y1}, ${x1} ${y1}`;

              return (
                <path
                  key={`det-link-${idx}`}
                  d={pathStr}
                  fill="none"
                  stroke={`url(#${gradId})`}
                  strokeWidth={Math.max(1.5, link.sh)}
                  className="sankey-flow-path"
                  style={{
                    opacity: active ? (hoveredLink ? 0.95 : 0.75) : 0.05,
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
                          <div className="font-bold opacity-60 uppercase tracking-wider text-[10px]">
                            {isS1 ? "Mittelverteilung" : "Detailprogramm"}
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
          {[nodesCol0, nodesCol1, nodesCol2].map((colNodes, colIdx) => (
            <g key={`col-nodes-${colIdx}`}>
              {colNodes.map((node, idx) => {
                const active = hoveredNode?.col === colIdx && hoveredNode?.name === node.name;
                const color = getNodeColor(node);
                
                // Show labels conditionally for space constraints in col2
                const isCol2 = colIdx === 2;
                const showText = !isCol2 || node.h > 4.5 || active;

                return (
                  <g
                    key={`node-${colIdx}-${idx}`}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredNode({ col: colIdx, name: node.name })}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {/* Glow box around active node */}
                    {active && (
                      <rect
                        x={node.x - 4}
                        y={node.y - 4}
                        width={nodeWidth + 8}
                        height={node.h + 8}
                        rx={4}
                        fill="transparent"
                        stroke={color}
                        strokeWidth={1.5}
                        style={{ opacity: 0.5 }}
                      />
                    )}

                    {/* Main Node Rect */}
                    <rect
                      x={node.x}
                      y={node.y}
                      width={nodeWidth}
                      height={node.h}
                      rx={3}
                      fill={color}
                      className="transition-all duration-300"
                      style={{
                        opacity: 0.95,
                        filter: active ? `drop-shadow(0 0 6px ${color})` : "none",
                      }}
                    />

                    {/* Left Node Labels (Col 0) */}
                    {colIdx === 0 && (
                      <>
                        <text
                          x={node.x - 12}
                          y={node.y + node.h / 2}
                          textAnchor="end"
                          dominantBaseline="middle"
                          className={`text-xs font-bold fill-zinc-300 transition-all duration-150 ${
                            active ? "fill-white text-[13px]" : "opacity-90"
                          }`}
                        >
                          {node.name}
                        </text>
                        <text
                          x={node.x - 12}
                          y={node.y + node.h / 2 + 13}
                          textAnchor="end"
                          dominantBaseline="middle"
                          className="text-[10px] font-bold fill-zinc-500 group-hover:fill-zinc-300"
                        >
                          {node.value.toFixed(1)} Mrd. €
                        </text>
                      </>
                    )}

                    {/* Middle Node Labels (Col 1) */}
                    {colIdx === 1 && (
                      <>
                        <text
                          x={node.x + nodeWidth / 2}
                          y={node.y - 8}
                          textAnchor="middle"
                          dominantBaseline="auto"
                          className={`text-[10px] font-extrabold fill-zinc-400 transition-colors duration-150 ${
                            active ? "fill-white" : ""
                          }`}
                        >
                          {node.name}
                        </text>
                        {node.h > 15 && (
                          <text
                            x={node.x + nodeWidth / 2}
                            y={node.y + node.h / 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-[9px] font-extrabold fill-zinc-950 opacity-90 select-none pointer-events-none"
                            transform={`rotate(-90, ${node.x + nodeWidth / 2}, ${node.y + node.h / 2})`}
                          >
                            {node.value.toFixed(0)} Mrd
                          </text>
                        )}
                      </>
                    )}

                    {/* Right Node Labels (Col 2) */}
                    {colIdx === 2 && showText && (
                      <>
                        <text
                          x={node.x + nodeWidth + 12}
                          y={node.y + node.h / 2}
                          textAnchor="start"
                          dominantBaseline="middle"
                          className={`text-[11px] font-semibold fill-zinc-300 transition-all duration-150 ${
                            active ? "fill-white text-xs font-bold" : "opacity-90"
                          }`}
                        >
                          {node.name}
                        </text>
                        <text
                          x={node.x + nodeWidth + 12}
                          y={node.y + node.h / 2 + 12}
                          textAnchor="start"
                          dominantBaseline="middle"
                          className="text-[9px] font-bold fill-zinc-500 group-hover:fill-zinc-300"
                        >
                          {node.value.toFixed(1)} Mrd. € ({((node.value / totalValue) * 100).toFixed(1)}%)
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
