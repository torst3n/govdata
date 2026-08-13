import fs from 'fs/promises';
import path from 'path';

export async function getBudgetData() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'bundeshaushalt_2025.csv');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  
  const lines = fileContent.trim().split('\n');
  const headers = lines[0].split(',');
  
  const data = lines.slice(1).map(line => {
    // Basic CSV line parser handling commas in quotes if any (though we don't have them)
    const parts = line.split(',');
    return {
      source: parts[0],
      target: parts[1],
      value: parseFloat(parts[2]),
      category: parts[3]
    };
  });
  
  return data;
}

export async function getTrendData() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'deutschland_trends.csv');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  
  const lines = fileContent.trim().split('\n');
  const headers = lines[0].split(',');
  
  const data = lines.slice(1).map(line => {
    const parts = line.split(',');
    return {
      year: parseInt(parts[0]),
      population: parseFloat(parts[1]),
      gdpGrowth: parseFloat(parts[2]),
      inflation: parseFloat(parts[3]),
      unemployment: parseFloat(parts[4])
    };
  });
  
  return data;
}

export async function getDetailedSpendingData() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'oeffentliche_ausgaben_2024.csv');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  
  const lines = fileContent.trim().split('\n');
  
  const data = lines.slice(1).map(line => {
    const parts = line.split(',');
    return {
      source: parts[0],
      target: parts[1],
      value: parseFloat(parts[2]),
      stage: parts[3]
    };
  });
  
  return data;
}

export async function getEnergyMonthlyData() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'stromerzeugung_2024.csv');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const lines = fileContent.trim().split('\n');
  return lines.slice(1).map(line => {
    const p = line.split(',');
    return {
      month: p[0],
      windOnshore: parseFloat(p[1]),
      windOffshore: parseFloat(p[2]),
      solar: parseFloat(p[3]),
      biomass: parseFloat(p[4]),
      hydro: parseFloat(p[5]),
      coalBrown: parseFloat(p[6]),
      coalHard: parseFloat(p[7]),
      gas: parseFloat(p[8]),
      other: parseFloat(p[9])
    };
  });
}

export async function getEnergyDailyData() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'strom_tagesprofile.csv');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const lines = fileContent.trim().split('\n');
  return lines.slice(1).map(line => {
    const p = line.split(',');
    return {
      hour: parseInt(p[0]),
      type: p[1],
      solar: parseFloat(p[2]),
      wind: parseFloat(p[3]),
      conventional: parseFloat(p[4]),
      consumption: parseFloat(p[5])
    };
  });
}

export async function getEducationStateData() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'bildungsmonitor_bundeslaender.csv');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const lines = fileContent.trim().split('\n');
  return lines.slice(1).map(line => {
    const p = line.split(',');
    return {
      state: p[0],
      spendingPerPupil: parseFloat(p[1]),
      pupilsPerTeacher: parseFloat(p[2]),
      graduationRate: parseFloat(p[3]),
      dropoutRate: parseFloat(p[4]),
      daycareRate: parseFloat(p[5])
    };
  });
}

export async function getGermanNationalFinancesData() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'gesamtfinanzen_2024.csv');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const lines = fileContent.trim().split('\n');
  return lines.slice(1).map(line => {
    const p = line.split(',');
    return {
      source: p[0],
      target: p[1],
      value: parseFloat(p[2]),
      stage: p[3]
    };
  });
}

export async function getLocalMunicipalData() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'local_municipalities_data.csv');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const lines = fileContent.trim().split('\n');
  return lines.slice(1).map(line => {
    const p = line.split(',');
    return {
      municipality: p[0],
      hebesatzGewerbe: parseFloat(p[1]),
      hebesatzGrundB: parseFloat(p[2]),
      taxRevenuePerCapita: parseFloat(p[3]),
      solarExcellentSqm: parseFloat(p[4]),
      solarGoodSqm: parseFloat(p[5]),
      solarUnsuitableSqm: parseFloat(p[6]),
      avgAge: parseFloat(p[7]),
      householdCount: parseFloat(p[8])
    };
  });
}

export async function getLocalCommutersData() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'local_commuters_biberach.csv');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const lines = fileContent.trim().split('\n');
  return lines.slice(1).map(line => {
    const p = line.split(',');
    return {
      source: p[0],
      target: p[1],
      value: parseFloat(p[2]),
      stage: p[3]
    };
  });
}

export async function getLocalDemographicsData() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'local_demographics_pyramid.csv');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const lines = fileContent.trim().split('\n');
  return lines.slice(1).map(line => {
    const p = line.split(',');
    return {
      municipality: p[0],
      ageGroup: p[1],
      malePercent: parseFloat(p[2]),
      femalePercent: parseFloat(p[3])
    };
  });
}

export async function getUmmendorfBudgetData() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'ummendorf_haushalt_2024.csv');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const lines = fileContent.trim().split('\n');
  return lines.slice(1).map(line => {
    const p = line.split(',');
    return {
      year: parseInt(p[0]),
      source: p[1],
      target: p[2],
      value: parseFloat(p[3]),
      category: p[4]
    };
  });
}

export async function getUmmendorfBadeseeData() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'ummendorf_badesee_messwerte.csv');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const lines = fileContent.trim().split('\n');
  return lines.slice(1).map(line => {
    const p = line.split(',');
    return {
      month: p[0],
      tempCelsius: parseFloat(p[1]),
      ecoli: parseFloat(p[2]),
      enterokokken: parseFloat(p[3]),
      pegelUmlach: parseFloat(p[4])
    };
  });
}

export async function getUmmendorfBodenrichtwerteData() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'ummendorf_bodenrichtwerte.csv');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const lines = fileContent.trim().split('\n');
  return lines.slice(1).map(line => {
    const p = line.split(',');
    return {
      year: parseInt(p[0]),
      zone: p[1],
      valueSqm: parseFloat(p[2])
    };
  });
}

export async function getUmmendorfGemeinderatData() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'ummendorf_gemeinderat.csv');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const lines = fileContent.trim().split('\n');
  return lines.slice(1).map(line => {
    const p = line.split(',');
    return {
      party: p[0],
      seats: parseInt(p[1]),
      kernortPercent: parseFloat(p[2]),
      fischbachPercent: parseFloat(p[3])
    };
  });
}
