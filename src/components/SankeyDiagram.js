"use client";

import React, { useState } from "react";

// Premium color theme mapping
const SOURCE_COLORS = {
  "Steuereinnahmen": {
    bg: "rgba(16, 185, 129, 0.85)", // Emerald
    border: "#10b981",
    gradient: "from-emerald-500/30 to-slate-400/20",
    glow: "rgba(16, 185, 129, 0.4)"
  },
  "Kredite & Schulden": {
    bg: "rgba(245, 158, 11, 0.85)", // Amber
    border: "#f59e0b",
    gradient: "from-amber-500/30 to-slate-400/20",
    glow: "rgba(245, 158, 11, 0.4)"
  },
  "Sonstige Einnahmen": {
    bg: "rgba(59, 130, 246, 0.85)", // Blue
    border: "#3b82f6",
    gradient: "from-blue-500/30 to-slate-400/20",
    glow: "rgba(59, 130, 246, 0.4)"
  }
};

const TARGET_COLORS = {
  "Arbeit und Soziales (BMAS)": "#f43f5e", // Rose
  "Verteidigung (BMVg)": "#64748b", // Slate
  "Verkehr & Digitale Infrastruktur (BMDV)": "#0284c7", // Sky
  "Finanzen (BMF) & Bundesschuld": "#8b5cf6", // Violet
  "Bildung und Forschung (BMBF)": "#a855f7", // Purple
  "Gesundheit (BMG)": "#ec4899", // Pink
  "Familie, Senioren, Frauen & Jugend (BMFSFJ)": "#f97316", // Orange
  "Inneres und Heimat (BMI)": "#06b6d4", // Cyan
  "Wirtschaft und Klimaschutz (BMWK)": "#10b981", // Emerald
  "Entwicklungszusammenarbeit (BMZ)": "#14b8a6", // Teal
  "Auswärtiges Amt (AA)": "#3b82f6", // Blue
  "Ernährung und Landwirtschaft (BMEL)": "#84cc16", // Lime
  "Wohnen, Stadtentwicklung & Bau (BMWSB)": "#d97706", // Amber dark
  "Sonstige Ausgaben": "#6b7280" // Gray
};

export default function SankeyDiagram({ data }) {
  const [hoveredNode, setHoveredNode] = useState(null); // { type: 'source'|'target', name }
  const [hoveredLink, setHoveredLink] = useState(null); // index
  const [tooltip, setTooltip] = useState(null); // { x, y, content }

  if (!data || data.length === 0) return <div>Keine Daten verfügbar</div>;

  // 1. Get unique sources and targets
  const sources = Array.from(new Set(data.map((d) => d.source))).sort((a, b) => {
    const sumA = data.filter((d) => d.source === a).reduce((sum, d) => sum + d.value, 0);
    const sumB = data.filter((d) => d.source === b).reduce((sum, d) => sum + d.value, 0);
    return sumB - sumA;
  });

  const targets = Array.from(new Set(data.map((d) => d.target))).sort((a, b) => {
    const sumA = data.filter((d) => d.target === a).reduce((sum, d) => sum + d.value, 0);
    const sumB = data.filter((d) => d.target === b).reduce((sum, d) => sum + d.value, 0);
    return sumB - sumA;
  });

  // Calculate totals
  const sourcesMap = {};
  const targetsMap = {};
  data.forEach((d) => {
    sourcesMap[d.source] = (sourcesMap[d.source] || 0) + d.value;
    targetsMap[d.target] = (targetsMap[d.target] || 0) + d.value;
  });

  const totalRevenue = Object.values(sourcesMap).reduce((a, b) => a + b, 0);

  // SVG Geometry
  const svgWidth = 1000;
  const svgHeight = 650;
  const paddingTop = 40;
  const paddingBottom = 40;
  const paddingLeft = 190;
  const paddingRight = 240;
  const nodeWidth = 20;

  const availableHeight = svgHeight - paddingTop - paddingBottom;
  const sourceGap = 35;
  const targetGap = 12;

  const totalSourceGap = (sources.length - 1) * sourceGap;
  const totalTargetGap = (targets.length - 1) * targetGap;

  const sourceScale = (availableHeight - totalSourceGap) / totalRevenue;
  const targetScale = (availableHeight - totalTargetGap) / totalRevenue;

  // Compute node layouts
  let currentSourceY = paddingTop;
  const sourceNodes = [];
  for (const name of sources) {
    const val = sourcesMap[name];
    const h = val * sourceScale;
    sourceNodes.push({ name, x: paddingLeft, y: currentSourceY, h, value: val });
    currentSourceY += h + sourceGap;
  }

  let currentTargetY = paddingTop;
  const targetNodes = [];
  for (const name of targets) {
    const val = targetsMap[name];
    const h = val * targetScale;
    targetNodes.push({ name, x: svgWidth - paddingRight - nodeWidth, y: currentTargetY, h, value: val });
    currentTargetY += h + targetGap;
  }

  const sourceNodesMap = Object.fromEntries(sourceNodes.map((n) => [n.name, n]));
  const targetNodesMap = Object.fromEntries(targetNodes.map((n) => [n.name, n]));

  // Compute link Y positions
  const sourceOffsets = Object.fromEntries(sourceNodes.map((n) => [n.name, n.y]));
  const targetOffsets = Object.fromEntries(targetNodes.map((n) => [n.name, n.y]));

  // Sort links to avoid overlaps
  const processedLinks = data
    .map((link, index) => {
      const sh = link.value * sourceScale;
      const th = link.value * targetScale;
      return {
        ...link,
        originalIndex: index,
        sh,
        th,
      };
    })
    .sort((a, b) => {
      // Sort first by source node position, then by target node position
      const sourceDiff = sources.indexOf(a.source) - sources.indexOf(b.source);
      if (sourceDiff !== 0) return sourceDiff;
      return targets.indexOf(a.target) - targets.indexOf(b.target);
    });

  // Calculate coordinates
  const links = processedLinks.map((link) => {
    const sy = sourceOffsets[link.source];
    sourceOffsets[link.source] += link.sh;

    const ty = targetOffsets[link.target];
    targetOffsets[link.target] += link.th;

    return {
      ...link,
      sy,
      ty,
    };
  });

  // Handle hover interactions
  const isLinkActive = (link, idx) => {
    if (hoveredLink !== null) return hoveredLink === idx;
    if (hoveredNode !== null) {
      if (hoveredNode.type === "source") {
        return link.source === hoveredNode.name;
      } else {
        return link.target === hoveredNode.name;
      }
    }
    return true;
  };

  const hasActiveHighlight = hoveredLink !== null || hoveredNode !== null;

  return (
    <div className="sankey-container">
      <div className="sankey-header">
        <h3 className="sankey-title" id="sankey-main-title">Einnahmen & Ausgaben des Bundes (2025)</h3>
        <p className="sankey-subtitle">
          Gesamtetat: <span className="highlight-text">{totalRevenue.toFixed(2)} Mrd. €</span>. Fahre mit der Maus über die Datenströme, um die Verbindungen zu visualisieren.
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
            {/* Create gradients for links */}
            {sources.map((src) =>
              targets.map((tgt) => {
                const srcColor = SOURCE_COLORS[src]?.border || "#cbd5e1";
                const tgtColor = TARGET_COLORS[tgt] || "#cbd5e1";
                return (
                  <linearGradient
                    key={`grad-${src}-${tgt}`}
                    id={`grad-${src.replace(/\s+/g, "-")}-${tgt.replace(/\s+/g, "-")}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor={srcColor} stopOpacity="0.75" />
                    <stop offset="100%" stopColor={tgtColor} stopOpacity="0.65" />
                  </linearGradient>
                );
              })
            )}
          </defs>

          {/* Links (Flows) */}
          <g>
            {links.map((link, idx) => {
              const active = isLinkActive(link, idx);
              const dimmed = hasActiveHighlight && !active;
              const gradId = `grad-${link.source.replace(/\s+/g, "-")}-${link.target.replace(/\s+/g, "-")}`;

              // Bezier curve points
              const x0 = paddingLeft + nodeWidth;
              const x1 = svgWidth - paddingRight - nodeWidth;
              const y0 = link.sy + link.sh / 2;
              const y1 = link.ty + link.th / 2;
              const pathStr = `M ${x0} ${y0} C ${(x0 + x1) / 2} ${y0}, ${(x0 + x1) / 2} ${y1}, ${x1} ${y1}`;

              return (
                <path
                  key={`link-${idx}`}
                  id={`link-path-${idx}`}
                  d={pathStr}
                  fill="none"
                  stroke={`url(#${gradId})`}
                  strokeWidth={Math.max(1.5, link.sh)}
                  className="sankey-flow-path"
                  style={{
                    opacity: active ? (hoveredLink === idx ? 0.95 : 0.8) : 0.1,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    setHoveredLink(idx);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({
                      x: e.clientX,
                      y: e.clientY - 10,
                      content: (
                        <div className="tooltip-inner">
                          <div className="font-semibold text-xs opacity-75 uppercase tracking-wider">Mittelherkunft & Verwendung</div>
                          <div className="my-1.5 flex flex-col gap-0.5">
                            <div><span className="font-medium text-emerald-400">{link.source}</span> &rarr;</div>
                            <div className="font-bold text-sm text-zinc-100">{link.target}</div>
                          </div>
                          <div className="border-t border-zinc-800 pt-1.5 mt-1 text-sm font-semibold flex justify-between gap-4">
                            <span>Volumen:</span>
                            <span className="text-amber-400">{link.value.toFixed(2)} Mrd. €</span>
                          </div>
                          <div className="text-[11px] opacity-75 text-right mt-0.5">
                            {((link.value / totalRevenue) * 100).toFixed(2)}% des Gesamtetats
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

          {/* Left Column Nodes (Sources) */}
          <g>
            {sourceNodes.map((node, idx) => {
              const active = hoveredNode?.type === "source" && hoveredNode?.name === node.name;
              const dimmed = hoveredNode !== null && !active;
              const colorConfig = SOURCE_COLORS[node.name] || { bg: "#94a3b8", border: "#64748b" };

              return (
                <g
                  key={`src-node-${idx}`}
                  id={`src-node-group-${idx}`}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredNode({ type: "source", name: node.name })}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Glowing background on hover */}
                  {active && (
                    <rect
                      x={node.x - 4}
                      y={node.y - 4}
                      width={nodeWidth + 8}
                      height={node.h + 8}
                      rx={4}
                      fill="transparent"
                      stroke={colorConfig.border}
                      strokeWidth={1.5}
                      style={{ opacity: 0.5 }}
                    />
                  )}

                  {/* Main Node Bar */}
                  <rect
                    x={node.x}
                    y={node.y}
                    width={nodeWidth}
                    height={node.h}
                    rx={3}
                    fill={colorConfig.bg}
                    stroke={colorConfig.border}
                    strokeWidth={1.5}
                    className="transition-all duration-300"
                    style={{
                      filter: active ? `drop-shadow(0 0 8px ${colorConfig.glow})` : "none",
                    }}
                  />

                  {/* Text Label */}
                  <text
                    x={node.x - 12}
                    y={node.y + node.h / 2}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className={`text-xs font-semibold fill-zinc-300 transition-all duration-200 ${
                      active ? "fill-white text-sm" : "opacity-85"
                    }`}
                  >
                    {node.name}
                  </text>

                  {/* Value Sublabel */}
                  <text
                    x={node.x - 12}
                    y={node.y + node.h / 2 + 14}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="text-[10px] font-bold fill-zinc-500 group-hover:fill-zinc-300 transition-colors"
                  >
                    {node.value.toFixed(1)} Mrd. € ({((node.value / totalRevenue) * 100).toFixed(0)}%)
                  </text>
                </g>
              );
            })}
          </g>

          {/* Right Column Nodes (Targets) */}
          <g>
            {targetNodes.map((node, idx) => {
              const active = hoveredNode?.type === "target" && hoveredNode?.name === node.name;
              const color = TARGET_COLORS[node.name] || "#64748b";

              // Show labels for larger values, or when hovered
              const showText = node.h > 8 || active;

              return (
                <g
                  key={`tgt-node-${idx}`}
                  id={`tgt-node-group-${idx}`}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredNode({ type: "target", name: node.name })}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Glowing Border */}
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

                  {/* Main Node Bar */}
                  <rect
                    x={node.x}
                    y={node.y}
                    width={nodeWidth}
                    height={node.h}
                    rx={3}
                    fill={color}
                    opacity={0.9}
                    className="transition-all duration-300"
                    style={{
                      filter: active ? `drop-shadow(0 0 6px ${color})` : "none",
                    }}
                  />

                  {/* Text Label */}
                  {showText && (
                    <>
                      <text
                        x={node.x + nodeWidth + 12}
                        y={node.y + node.h / 2}
                        textAnchor="start"
                        dominantBaseline="middle"
                        className={`text-xs font-semibold fill-zinc-300 transition-all duration-200 ${
                          active ? "fill-white text-sm" : "opacity-85"
                        }`}
                      >
                        {node.name.replace(/\s*\(BM.*\)/, "")} {/* strip Ministry abbreviation to save space */}
                      </text>
                      <text
                        x={node.x + nodeWidth + 12}
                        y={node.y + node.h / 2 + 14}
                        textAnchor="start"
                        dominantBaseline="middle"
                        className="text-[10px] font-bold fill-zinc-500 group-hover:fill-zinc-300 transition-colors"
                      >
                        {node.value.toFixed(1)} Mrd. € ({((node.value / totalRevenue) * 100).toFixed(1)}%)
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Live Hover Tooltip */}
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
        <span>Quelle: <a href="https://www.bundeshaushalt.de/DE/Download-Portal/download-portal.html" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-semibold">Bundesministerium der Finanzen (BMF) - Offizieller Bundeshaushaltsplan 2025</a> (Soll-Ansätze).</span>
        <a href="https://www.bundeshaushalt.de/DE/Download-Portal/download-portal.html" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">bundeshaushalt.de (Downloads)</a>
      </div>
    </div>
  );
}
