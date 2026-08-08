"use client";

import React, { useState } from "react";
import { GraduationCap, Landmark, Users, UserX, School } from "lucide-react";

const METRICS = [
  {
    id: "spendingPerPupil",
    title: "Schulausgaben pro Schüler",
    icon: Landmark,
    description: "Jährliche Ausgaben der öffentlichen Haushalte für allgemeinbildende Schulen je Schüler/in (in Euro).",
    formatVal: (val) => `${val.toLocaleString("de-DE")} €`,
    unit: "€",
    scaleMax: 15000,
    isLowerBetter: false,
  },
  {
    id: "pupilsPerTeacher",
    title: "Klassen-Betreuungsschlüssel",
    icon: Users,
    description: "Schüler/innen je vollzeitäquivalente Lehrkraft an allgemeinbildenden Schulen. Ein niedrigerer Wert bedeutet kleinere Lerngruppen.",
    formatVal: (val) => `${val.toFixed(1)}`,
    unit: "Schüler",
    scaleMax: 20,
    isLowerBetter: true,
  },
  {
    id: "graduationRate",
    title: "Abiturientenquote",
    icon: GraduationCap,
    description: "Anteil der Schulabgänger mit allgemeiner oder Fachhochschulreife an der gleichaltrigen Bevölkerung.",
    formatVal: (val) => `${val.toFixed(1)}%`,
    unit: "%",
    scaleMax: 60,
    isLowerBetter: false,
  },
  {
    id: "dropoutRate",
    title: "Schulabbrecherquote",
    icon: UserX,
    description: "Anteil der Schulabgänger ohne mindestens einen Hauptschulabschluss an allen Schulabgängern.",
    formatVal: (val) => `${val.toFixed(1)}%`,
    unit: "%",
    scaleMax: 15,
    isLowerBetter: true,
  },
  {
    id: "daycareRate",
    title: "U3-Kita-Betreuungsquote",
    icon: School,
    description: "Betreuungsquote von Kindern unter 3 Jahren in Kindertageseinrichtungen oder Kindertagespflege.",
    formatVal: (val) => `${val.toFixed(1)}%`,
    unit: "%",
    scaleMax: 65,
    isLowerBetter: false,
  }
];

export default function EducationDashboard({ data }) {
  const [stateA, setStateA] = useState("Bayern");
  const [stateB, setStateB] = useState("Berlin");

  if (!data || data.length === 0) return <div>Lade Bildungsdaten...</div>;

  const itemA = data.find((d) => d.state === stateA) || data[0];
  const itemB = data.find((d) => d.state === stateB) || data[1];

  // Calculate National Averages
  const averages = {};
  METRICS.forEach((metric) => {
    const sum = data.reduce((s, item) => s + item[metric.id], 0);
    averages[metric.id] = sum / data.length;
  });

  const statesList = data.map((d) => d.state).sort();

  return (
    <div className="trends-container">
      {/* 1. Header and State Selectors */}
      <div className="border-b border-zinc-850 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2" id="education-dashboard-title">
            <GraduationCap className="text-purple-400" size={22} />
            Föderalismus-Bildungsmonitor
          </h3>
          <p className="text-zinc-400 text-xs mt-1">
            Vergleiche Bildungsbudgets, Betreuungsschlüssel und schulische Erfolge zwischen den 16 deutschen Bundesländern.
          </p>
        </div>

        {/* State Dropdown Selectors */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-2 rounded-xl">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] text-sky-400 font-extrabold uppercase px-1">Bundesland A</span>
            <select
              value={stateA}
              onChange={(e) => setStateA(e.target.value)}
              className="bg-transparent text-white font-bold text-xs border-none outline-none cursor-pointer pr-4"
            >
              {statesList.map((st) => (
                <option key={`a-${st}`} value={st} className="bg-zinc-950 text-white font-medium">{st}</option>
              ))}
            </select>
          </div>
          
          <div className="w-[1px] h-8 bg-zinc-800 self-center mx-2" />

          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] text-amber-500 font-extrabold uppercase px-1">Bundesland B</span>
            <select
              value={stateB}
              onChange={(e) => setStateB(e.target.value)}
              className="bg-transparent text-white font-bold text-xs border-none outline-none cursor-pointer pr-4"
            >
              {statesList.map((st) => (
                // Disable selecting same state on both sides
                <option key={`b-${st}`} value={st} disabled={st === stateA} className="bg-zinc-950 text-white font-medium">{st}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Side-by-Side Comparison Cards */}
      <div className="flex flex-col gap-5">
        {METRICS.map((metric) => {
          const Icon = metric.icon;
          const valA = itemA[metric.id];
          const valB = itemB[metric.id];
          const avgVal = averages[metric.id];

          // Compute percentages of max scale for drawing comparative bars
          const pctA = (valA / metric.scaleMax) * 100;
          const pctB = (valB / metric.scaleMax) * 100;
          const pctAvg = (avgVal / metric.scaleMax) * 100;

          // Which one is better?
          const isABetter = metric.isLowerBetter ? valA < valB : valA > valB;
          const isBBetter = metric.isLowerBetter ? valB < valA : valB > valA;

          return (
            <div
              key={metric.id}
              className="info-card border border-zinc-850 bg-zinc-950/40 p-5 rounded-2xl flex flex-col md:flex-row gap-6 justify-between items-start md:items-center group hover:border-zinc-800 transition-colors"
            >
              {/* Left Column: Metric Info */}
              <div className="md:w-1/3 flex gap-3">
                <div className="p-2.5 bg-zinc-900 rounded-xl text-zinc-400 group-hover:text-zinc-200 transition-colors h-fit mt-0.5">
                  <Icon size={20} />
                </div>
                <div>
                  <h4 className="text-zinc-200 text-sm font-bold">{metric.title}</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed mt-1">
                    {metric.description}
                  </p>
                </div>
              </div>

              {/* Middle Column: Comparative Horizontal Bar Charts */}
              <div className="flex-1 w-full flex flex-col gap-2.5">
                {/* State A Bar */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-sky-400">{stateA}</span>
                    <span className="text-white">{metric.formatVal(valA)}</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pctA}%` }}
                      className="h-full bg-sky-500 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>

                {/* State B Bar */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-amber-500">{stateB}</span>
                    <span className="text-white">{metric.formatVal(valB)}</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pctB}%` }}
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>

                {/* National Average Bar */}
                <div className="flex flex-col gap-1 border-t border-zinc-900/60 pt-2.5">
                  <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                    <span>Bundesdurchschnitt</span>
                    <span>{metric.formatVal(avgVal)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pctAvg}%` }}
                      className="h-full bg-slate-500/80 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Comparative Verdict Badge */}
              <div className="w-full md:w-32 flex justify-start md:justify-center items-center h-full">
                {isABetter && (
                  <span className="px-3 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-lg text-[10px] font-bold">
                    Besser: {stateA}
                  </span>
                )}
                {isBBetter && (
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-[10px] font-bold">
                    Besser: {stateB}
                  </span>
                )}
                {!isABetter && !isBBetter && (
                  <span className="px-3 py-1 bg-zinc-900 text-zinc-500 border border-zinc-800 rounded-lg text-[10px] font-bold">
                    Gleichwertig
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-[10px] text-zinc-500 mt-4 px-2 flex justify-between items-center border-t border-zinc-900 pt-3">
        <span>Quelle: <a href="https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Bildung-Forschung-Kultur/Bildungsfinanzen-Ausbildungsfoerderung/_inhalt.html" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline font-semibold">Statistisches Bundesamt (Destatis) - Bildungsfinanzbericht</a> &amp; <a href="https://www.insm.de/bildungsmonitor-2025/downloads" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline font-semibold">INSM Bildungsmonitor</a>.</span>
        <a href="https://www.insm.de/bildungsmonitor-2025/downloads" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-semibold">insm.de (Downloads)</a>
      </div>
    </div>
  );
}
