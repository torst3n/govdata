import React from "react";
import { 
  getBudgetData, 
  getTrendData, 
  getDetailedSpendingData,
  getEnergyMonthlyData,
  getEnergyDailyData,
  getEducationStateData,
  getGermanNationalFinancesData,
  getLocalMunicipalData,
  getLocalCommutersData,
  getLocalDemographicsData,
  getUmmendorfBudgetData,
  getUmmendorfBadeseeData,
  getUmmendorfBodenrichtwerteData,
  getUmmendorfGemeinderatData
} from "@/utils/dataParser";
import DashboardShell from "@/components/DashboardShell";

// Page metadata for search engine optimization
export const metadata = {
  title: "GovFacts Deutschland — Daten des Staates verständlich visualisiert",
  description: "Ein interaktives Dashboard für deutsche Haushaltsdaten, Demografie, Wirtschaftswachstum und Inflation.",
};

export default async function Home() {
  // Fetch and parse the CSV datasets on the server
  let budgetData = [];
  let trendData = [];
  let detailedSpendingData = [];
  let energyMonthlyData = [];
  let energyDailyData = [];
  let educationStateData = [];
  let nationalFinancesData = [];
  let municipalData = [];
  let commutersData = [];
  let demographicsData = [];
  let ummendorfBudgetData = [];
  let ummendorfBadeseeData = [];
  let ummendorfBodenData = [];
  let ummendorfCouncilData = [];
  
  try {
    [
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
    ] = await Promise.all([
      getBudgetData(),
      getTrendData(),
      getDetailedSpendingData(),
      getEnergyMonthlyData(),
      getEnergyDailyData(),
      getEducationStateData(),
      getGermanNationalFinancesData(),
      getLocalMunicipalData(),
      getLocalCommutersData(),
      getLocalDemographicsData(),
      getUmmendorfBudgetData(),
      getUmmendorfBadeseeData(),
      getUmmendorfBodenrichtwerteData(),
      getUmmendorfGemeinderatData()
    ]);
  } catch (error) {
    console.error("Error loading CSV datasets on the server:", error);
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Top German flag accent line spanning 100% width */}
      <div className="w-full h-1.5 flex overflow-hidden">
        <span className="flex-1 bg-black"></span>
        <span className="flex-1 bg-red-600"></span>
        <span className="flex-1 bg-amber-400"></span>
      </div>

      <div className="app-container flex-1 flex flex-col justify-between">
        <div>
          {/* Main App Header */}
          <header className="app-header">
            <div className="brand-section">
              <div className="flag-accent">
                <span className="black"></span>
                <span className="red"></span>
                <span className="gold"></span>
              </div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400">Ein Bürger-Dashboard</span>
            </div>
            
            <h1 className="app-title" id="page-h1-title">GovFacts Deutschland</h1>
            <p className="app-subtitle">
              Wir bereiten amtliche Statistiken und Haushaltsdaten der Bundesrepublik Deutschland verständlich auf &mdash; unabhängig, datenbasiert und ohne politische Färbung.
            </p>
          </header>

          {/* Interactive Shell */}
          <DashboardShell 
            budgetData={budgetData} 
            trendData={trendData} 
            detailedSpendingData={detailedSpendingData}
            energyMonthlyData={energyMonthlyData}
            energyDailyData={energyDailyData}
            educationStateData={educationStateData}
            nationalFinancesData={nationalFinancesData}
            municipalData={municipalData}
            commutersData={commutersData}
            demographicsData={demographicsData}
            ummendorfBudgetData={ummendorfBudgetData}
            ummendorfBadeseeData={ummendorfBadeseeData}
            ummendorfBodenData={ummendorfBodenData}
            ummendorfCouncilData={ummendorfCouncilData}
          />
        </div>

        {/* Footer */}
        <footer className="app-footer">
          <p>
            Datengrundlage: Bundesministerium der Finanzen & Statistisches Bundesamt (Destatis).
          </p>
          <p className="mt-1">
            Erstellt &copy; {new Date().getFullYear()} GovFacts Deutschland. Open-Source-Transparenz.
          </p>
        </footer>
      </div>
    </div>
  );
}
