"use client";

import React, { useState } from "react";
import { DollarSign, BarChart3, Database, Info, GitCompare, Landmark, Zap, GraduationCap, ArrowLeftRight, MapPin, Compass } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SankeyDiagram from "./SankeyDiagram";
import DetailedSankeyDiagram from "./DetailedSankeyDiagram";
import DoubleSankeyDiagram from "./DoubleSankeyDiagram";
import TrendsDashboard from "./TrendsDashboard";
import EnergyDashboard from "./EnergyDashboard";
import EducationDashboard from "./EducationDashboard";
import LocalDashboard from "./LocalDashboard";
import UmmendorfDashboard from "./UmmendorfDashboard";

export default function DashboardShell({ 
  budgetData, 
  trendData, 
  detailedSpendingData,
  energyMonthlyData,
  energyDailyData,
  educationStateData,
  nationalFinancesData,
  municipalData,
  commutersData,
  demographicsData,
  ummendorfBudgetData,
  ummendorfBadeseeData,
  ummendorfBodenData,
  ummendorfCouncilData
}) {
  const governmentLevels = [
    { id: "bund", label: "Bund (Bundesebene)", badge: "5 Ansichten", icon: <Landmark size={18} /> },
    { id: "laender", label: "Bundesländer", badge: "1 Ansicht", icon: <GraduationCap size={18} /> },
    { id: "lokal", label: "Lokal & Kommunen", badge: "Ummendorf & Biberach", icon: <Compass size={18} /> },
    { id: "info", label: "Methodik & Quellen", badge: "Transparenz", icon: <Database size={18} /> },
  ];

  const tabsConfig = [
    // Bund (Federal Level)
    { id: "gesamtfinanzen", level: "bund", label: "Gesamtfinanzen (Einnahmen & Ausgaben)", icon: <ArrowLeftRight size={15} /> },
    { id: "gesamtausgaben", level: "bund", label: "Ausgabenstruktur (Staat)", icon: <Landmark size={15} /> },
    { id: "haushalt", level: "bund", label: "Bundeshaushalt 2025", icon: <GitCompare size={15} /> },
    { id: "energie", level: "bund", label: "Strom & Energiewende", icon: <Zap size={15} /> },
    { id: "trends", level: "bund", label: "Entwicklungstrends", icon: <BarChart3 size={15} /> },
    // Bundesländer (State Level)
    { id: "bildung", level: "laender", label: "Bildungsvergleich (16 Bundesländer)", icon: <GraduationCap size={15} /> },
    // Lokal (Local Level)
    { id: "ummendorf", level: "lokal", label: "Ummendorf-Spiegel", icon: <Compass size={15} /> },
    { id: "local", level: "lokal", label: "Lokal-Spiegel (Biberach)", icon: <MapPin size={15} /> },
    // Info / Meta
    { id: "methodik", level: "info", label: "Datenquellen & Methodik", icon: <Database size={15} /> }
  ];

  const [activeTab, setActiveTab] = useState("gesamtfinanzen");
  const activeTabItem = tabsConfig.find((t) => t.id === activeTab) || tabsConfig[0];
  const activeLevel = activeTabItem.level;

  const handleLevelChange = (levelId) => {
    const firstTab = tabsConfig.find((t) => t.level === levelId);
    if (firstTab) {
      setActiveTab(firstTab.id);
    }
  };

  const currentLevelTabs = tabsConfig.filter((t) => t.level === activeLevel);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Structured Hierarchical Navigation */}
      <nav aria-label="Staatsebenen Navigation" className="w-full flex flex-col gap-3 z-10">
        {/* Tier 1: Government Level Switcher */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 p-2 bg-zinc-950/90 border border-zinc-800 rounded-2xl shadow-xl">
          {governmentLevels.map((lvl) => {
            const isActive = activeLevel === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => handleLevelChange(lvl.id)}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 lg:p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-zinc-900 border-blue-500/60 shadow-md shadow-blue-500/10 text-white"
                    : "bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? "text-blue-400" : "text-zinc-400"}>{lvl.icon}</span>
                  <span className="text-xs sm:text-sm font-extrabold tracking-tight">{lvl.label}</span>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                    isActive ? "bg-blue-500/20 text-blue-300 border border-blue-500/40" : "bg-zinc-800/80 text-zinc-400"
                  }`}
                >
                  {lvl.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tier 2: Sub-Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex flex-wrap md:flex-nowrap gap-2 p-2 bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-x-auto no-scrollbar scrollbar-none shadow-lg">
            {currentLevelTabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                id={`tab-btn-${tab.id}`}
                className="flex items-center gap-2.5 px-4 py-2.5 flex-1 min-w-[160px] justify-center text-xs lg:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                {tab.icon}
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </nav>

      {/* Render selected view with 100% main content width */}
      <main className="w-full min-w-0">
        {activeTab === "gesamtfinanzen" && (
          <section id="section-gesamtfinanzen">
            <DoubleSankeyDiagram data={nationalFinancesData} />
            
            <div className="info-section mt-12">
              <div className="info-card">
                <h4>
                  <ArrowLeftRight size={18} className="text-blue-400" />
                  Einnahmen- & Ausgabenbilanz des Gesamtstaates
                </h4>
                <p>
                  Dieses doppelseitige Diagramm visualisiert die vollständigen Finanzen des deutschen Staates (Konsolidierter Haushalt aus Bund, Ländern, Kommunen und Sozialkassen). Es zeigt links die **Einnahmenquellen** (Gemeinschaftsteuern, Sozialbeiträge etc.), die in den Gesamteinnahmen münden, und rechts wie diese Gelder über Aufgabenbereiche hinweg in **spezifische Programme** fließen.
                </p>
              </div>
              
              <div className="info-card">
                <h4>
                  <Info size={18} className="text-amber-500" />
                  Finanzierungsdefizit & Kreditaufnahme
                </h4>
                <p>
                  Das gestreifte Band in der Mitte visualisiert das **Finanzierungsdefizit** von rund 132 Milliarden Euro in 2024. Es veranschaulicht, wie die Differenz zwischen den Gesamteinnahmen (1.960 Mrd. €) und den Gesamtausgaben (2.092 Mrd. €) durch Nettokreditaufnahme auf den Finanzmärkten ausgeglichen wird, um die Ausgaben zu decken.
                </p>
              </div>
            </div>
          </section>
        )}

        {activeTab === "gesamtausgaben" && (
          <section id="section-gesamtausgaben">
            <DetailedSankeyDiagram data={detailedSpendingData} />
            
            <div className="info-section mt-12">
              <div className="info-card">
                <h4>
                  <Landmark size={18} className="text-rose-400" />
                  Der Öffentliche Gesamthaushalt (ÖGH)
                </h4>
                <p>
                  Im Gegensatz zum reinen Bundeshaushalt bildet der Öffentliche Gesamthaushalt alle Ausgaben von <strong>Bund, Ländern, Kommunen</strong> und den <strong>Sozialversicherungen</strong> ab (konsolidiert auf ca. 2,09 Billionen Euro in 2024). Das zeigt das tatsächliche Gesamtvolumen staatlicher Aktivität in Deutschland.
                </p>
              </div>
              
              <div className="info-card">
                <h4>
                  <Info size={18} className="text-purple-400" />
                  Zuweisungen nach COFOG
                </h4>
                <p>
                  Das dreistufige Diagramm ordnet die Ausgaben den zehn internationalen Standard-Aufgabenbereichen (COFOG) zu. Hierdurch wird ersichtlich, dass die Ausgaben für <strong>Soziale Sicherung</strong> und <strong>Gesundheit</strong> (zusammen ca. 1,27 Billionen €) den mit Abstand größten Anteil ausmachen, weit vor Bildung, Infrastruktur und Verteidigung.
                </p>
              </div>
            </div>
          </section>
        )}

        {activeTab === "ummendorf" && (
          <section id="section-ummendorf">
            <UmmendorfDashboard 
              budgetData={ummendorfBudgetData} 
              badeseeData={ummendorfBadeseeData} 
              bodenData={ummendorfBodenData} 
              councilData={ummendorfCouncilData} 
            />
            
            <div className="info-section mt-12">
              <div className="info-card">
                <h4>
                  <Compass size={18} className="text-emerald-400" />
                  Ummendorfs Dorf-Infrastruktur & Budget
                </h4>
                <p>
                  Als eigenständige Oberschwäbische Gemeinde mit rund 4.400 Einwohnern verfügt Ummendorf über einen sehr gut strukturierten Gemeindehaushalt. Ein Großteil der Steuereinnahmen fließt direkt in die Kindergärten (Kita Schloß und Umlachspatz) und die Schulinfrastruktur, gefolgt von Modernisierungen der Straßen und der Umlach-Renaturierung.
                </p>
              </div>
              <div className="info-card">
                <h4>
                  <Info size={18} className="text-sky-400" />
                  Der Badesee Ummendorf als Naturwert
                </h4>
                <p>
                  Der Ummendorfer Badesee ist ein biologisch intaktes Moor- und Badegewässer von regionaler Bedeutung. Die LUBW-Messungen bestätigen eine hervorragende Wasserqualität. Der See profitiert von dem sauberen Zufluss der Umlach, deren Pegelstand im Sommer sorgfältig überwacht wird, um das ökologische Gleichgewicht zu sichern.
                </p>
              </div>
            </div>
          </section>
        )}

        {activeTab === "local" && (
          <section id="section-local">
            <LocalDashboard 
              municipalData={municipalData} 
              commutersData={commutersData} 
              demographicsData={demographicsData} 
            />
            
            <div className="info-section mt-12">
              <div className="info-card">
                <h4>
                  <MapPin size={18} className="text-blue-400" />
                  Regionale Datenanalyse Landkreis Biberach
                </h4>
                <p>
                  Der Landkreis Biberach ist eine der wirtschaftsstärksten Regionen Baden-Württembergs mit extrem niedriger Arbeitslosigkeit und hoher Industriedichte. Dies zeigt sich auch in den überdurchschnittlichen Pro-Kopf-Steuereinnahmen der Stadt Biberach (ca. 2.600 € pro Einwohner), die weit über dem Landesschnitt von ca. 1.650 € liegen.
                </p>
              </div>
              <div className="info-card">
                <h4>
                  <Info size={18} className="text-amber-500" />
                  Ummendorf im Fokus
                </h4>
                <p>
                  Als Nachbargemeinde profitiert Ummendorf vom wirtschaftlichen Erfolg Biberachs. Mit einem Gewerbesteuerhebesatz von 340% liegt Ummendorf unter dem baden-württembergischen Durchschnitt (358%), was es für Gewerbetreibende attraktiv macht, und verzeichnet mit 1.450 € pro Kopf eine solide Steuerkraft.
                </p>
              </div>
            </div>
          </section>
        )}

        {activeTab === "haushalt" && (
          <section id="section-haushalt">
            <SankeyDiagram data={budgetData} />
            
            <div className="info-section mt-12">
              <div className="info-card">
                <h4>
                  <DollarSign size={18} className="text-emerald-400" />
                  Einnahmen (Mittelherkunft)
                </h4>
                <p>
                  Der größte Teil des Bundeshaushalts wird durch <strong>Steuern</strong> (Mehrwertsteuer, Einkommensteuer etc.) finanziert. Im Jahr 2025 sind hierfür rund 386,8 Milliarden Euro eingeplant. Um das Budget auszugleichen, sind zudem rund 70,7 Milliarden Euro an <strong>neuen Krediten</strong> (Nettokreditaufnahme) vorgesehen, ergänzt durch sonstige Bundeseinnahmen.
                </p>
              </div>
              
              <div className="info-card">
                <h4>
                  <Info size={18} className="text-blue-400" />
                  Ausgaben (Mittelverwendung)
                </h4>
                <p>
                  Soziale Sicherung bildet den Kern des Haushalts: Über 37% fließen in das <strong>Bundesministerium für Arbeit und Soziales (BMAS)</strong>, vor allem für Zuschüsse zur Rentenversicherung und das Bürgergeld. Weitere große Einzelpläne entfallen auf die Verteidigung (BMVg), Verkehr (BMDV) sowie den Zinsdienst der Bundesschuld (BMF).
                </p>
              </div>
            </div>
          </section>
        )}

        {activeTab === "energie" && (
          <section id="section-energie">
            <EnergyDashboard 
              monthlyData={energyMonthlyData} 
              dailyData={energyDailyData} 
            />
            
            <div className="info-section mt-12">
              <div className="info-card">
                <h4>
                  <Zap size={18} className="text-yellow-400" />
                  Systemherausforderung Fluktuation
                </h4>
                <p>
                  Erneuerbare Energien (Solar und Wind) sind wetterabhängig und schwanken stündlich. Dies erfordert flexible Stromnetze und Ausgleichskapazitäten. Während an stürmischen Wintertagen oder sonnigen Sommertagen über 80% des Stroms regenerativ erzeugt wird, sinkt dieser Anteil bei Windstille und Dunkelheit (Dunkelflaute) drastisch, sodass konventionelle Gaskraftwerke einspringen müssen.
                </p>
              </div>
              <div className="info-card">
                <h4>
                  <Info size={18} className="text-emerald-400" />
                  Erfolgsbilanz 2024
                </h4>
                <p>
                  Im Jahresdurchschnitt stammten 2024 bereits rund 60% der deutschen Nettostromerzeugung aus erneuerbaren Energiequellen &mdash; mit Windenergie an Land als wichtigster Säule, gefolgt von Photovoltaik und Biomasse. Kernenergie wurde nach dem Ausstieg 2023 komplett durch andere Träger substituiert.
                </p>
              </div>
            </div>
          </section>
        )}

        {activeTab === "bildung" && (
          <section id="section-bildung">
            <EducationDashboard data={educationStateData} />
            
            <div className="info-section mt-12">
              <div className="info-card">
                <h4>
                  <GraduationCap size={18} className="text-purple-400" />
                  Föderale Unterschiede im Bildungssystem
                </h4>
                <p>
                  Da Schule und Kita in Deutschland Ländersache sind, unterscheiden sich Budgets, Betreuungsschlüssel und Abschlussquoten teils drastisch. Stadtstaaten wie Berlin und Hamburg verzeichnen die höchsten Pro-Kopf-Ausgaben je Schüler, kämpfen jedoch teilweise mit überdurchschnittlich hohen Schulabbrecherquoten.
                </p>
              </div>
              <div className="info-card">
                <h4>
                  <Info size={18} className="text-sky-400" />
                  U3-Kinderbetreuung Ost vs. West
                </h4>
                <p>
                  Ein historisches Erbe bleibt die Verteilung der Kinderbetreuung: In ostdeutschen Bundesländern wie Thüringen, Mecklenburg-Vorpommern und Sachsen liegt die Betreuungsquote bei den unter 3-Jährigen (U3) durchgehend über 50%. In westdeutschen Ländern wie Nordrhein-Westfalen oder Baden-Württemberg bewegt sie sich dagegen meist unter 30%.
                </p>
              </div>
            </div>
          </section>
        )}

        {activeTab === "trends" && (
          <section id="section-trends">
            <TrendsDashboard data={trendData} />
            
            <div className="info-section mt-12">
              <div className="info-card">
                <h4>
                  <BarChart3 size={18} className="text-amber-400" />
                  Bedeutung von Langzeitdaten
                </h4>
                <p>
                  Ein isolierter Datenpunkt ist selten aussagekräftig. Erst der Verlauf über 15 Jahre verdeutlicht Kriseneffekte (wie die COVID-19-Pandemie in 2020 mit negativem Wirtschaftswachstum und steigender Arbeitslosigkeit oder die hohe Inflation 2022 nach Beginn des Ukraine-Krieges) und langfristige demografische Trends.
                </p>
              </div>
              <div className="info-card">
                <h4>
                  <Info size={18} className="text-purple-400" />
                  Konjunktur & Demografie
                </h4>
                <p>
                  Die Zahlen belegen eine kontinuierlich alternde Gesellschaft bei gleichzeitigem Bevölkerungswachstum durch Nettozuwanderung. Ökonomisch befindet sich Deutschland in einer Stagnationsphase mit schwachem BIP-Wachstum bei gleichzeitigem Abklingen der Inflationsspitze (Rückgang auf unter 2%).
                </p>
              </div>
            </div>
          </section>
        )}

        {activeTab === "methodik" && (
          <section id="section-methodik" className="info-card p-8 flex flex-col gap-6">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Database size={22} className="text-blue-400" />
              Datenquellen & Methodik
            </h3>
            
            <div className="flex flex-col gap-4 text-zinc-300 text-sm leading-relaxed">
              <p>
                Dieses Projekt zeigt, wie staatliche Daten aus Deutschland transparent, verständlich und nachvollziehbar visualisiert werden können. 
              </p>
              
              <h4 className="text-white font-semibold text-base mt-2">Genutzte Datensätze & offizielle Quellen:</h4>
              <ul className="list-disc pl-5 flex flex-col gap-2">
                <li>
                  <strong>Öffentlicher Gesamthaushalt (Einnahmen & Ausgaben):</strong> Konsolidierte Rechnung aus den vierteljährlichen Kassenstatistiken des Statistischen Bundesamtes (Kern- und Extrahaushalte für Bund, Länder, Kommunen und Sozialversicherung). Einnahmen- und Defizitwerte basieren auf den Daten der Steuereinnahmen sowie Kreditaufnahmen des Statistischen Bundesamtes für 2024.
                </li>
                <li>
                  <strong>Bundeshaushalt (2025):</strong> Die Einnahmen- und Ausgabensätze entstammen dem offiziellen Haushaltsgesetz des Bundesministeriums der Finanzen (Soll-Ansatz). Verfügbar über <a href="https://www.bundeshaushalt.de/DE/Download-Portal/download-portal.html" target="_blank" className="text-blue-400 underline">bundeshaushalt.de (Download-Portal)</a>.
                </li>
                <li>
                  <strong>Lokale Daten (Landkreis Biberach & Ummendorf):</strong> Steuerhebesätze und Pro-Kopf-Einnahmen aus den Hebesatzstatistiken des Statistischen Landesamtes BW (2024). Solardaten basieren auf den Einstrahlungsmodellen des Solaratlas Baden-Württemberg. Pendlerströme erhoben durch die Bundesagentur für Arbeit (Stand Juni 2024). Demografie-Alterspyramide extrahiert aus der Fortschreibung des Bevölkerungsstandes des Statistischen Landesamtes BW (Tabelle 12411).
                </li>
                <li>
                  <strong>Stromerzeugung & Netzstabilität (2024):</strong> Nettostromerzeugung der Kraftwerke der öffentlichen Versorgung sowie Lastdaten aus der Netztransparenzdatenbank SMARD der Bundesnetzagentur (<a href="https://www.smard.de/home/downloadcenter/download-marktdaten" target="_blank" className="text-blue-400 underline">smard.de (Marktdaten)</a>).
                </li>
                <li>
                  <strong>Bildungsmonitor (Bundesländer):</strong> Bildungsstatistische Kennzahlen für das Schuljahr 2023/2024 bezogen aus den Fachserien des Statistischen Bundesamtes (Schulausgaben, Personal, Kita-Fortschreibung).
                </li>
                <li>
                  <strong>Demografie (Einwohnerzahl):</strong> Daten basieren auf der amtlichen Bevölkerungsfortschreibung des Statistischen Bundesamtes (Destatis), Tabelle 12411.
                </li>
                <li>
                  <strong>Inflationsrate (Verbraucherpreisindex):</strong> Jahresdurchschnittliche Veränderung des VPI zum Vorjahr, bereitgestellt von Destatis, Tabelle 61111.
                </li>
                <li>
                  <strong>Wirtschaftswachstum (BIP):</strong> Veränderung des realen Bruttoinlandsprodukts zum Vorjahr, erhoben durch die Volkswirtschaftlichen Gesamtrechnungen (VGR) des Bundes.
                </li>
                <li>
                  <strong>Arbeitslosenquote:</strong> Jahresdurchschnittliche Quoten bezogen auf alle zivilen Erwerbspersonen, bereitgestellt durch die Bundesagentur für Arbeit.
                </li>
              </ul>

              <div className="border-t border-zinc-800 pt-6 mt-4">
                <h4 className="text-white font-semibold text-base mb-2">Automatisierte Datenintegration:</h4>
                <p>
                  Für automatisierte Pipelines in Python eignet sich das Paket <code>deutschland</code> (bereitgestellt von der <em>bundesAPI</em> Initiative), welches standardisierte Wrapper für Destatis, die Jobsuche der Arbeitsagentur und viele weitere Schnittstellen zur Verfügung stellt.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
