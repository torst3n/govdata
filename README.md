# GovFacts Deutschland 🇩🇪

[![Deploy Next.js site to Pages](https://github.com/torst3n/govdata/actions/workflows/deploy.yml/badge.svg)](https://github.com/torst3n/govdata/actions/workflows/deploy.yml)
[![Live Dashboard](https://img.shields.io/badge/Live_Dashboard-GitHub_Pages-blue?style=flat&logo=github)](https://torst3n.github.io/govdata/)

> **Amtliche Daten der Bundesrepublik Deutschland verständlich, datenbasiert und unabhängig visualisiert &mdash; inspiriert vom Vorbild [USAFacts.org](https://usafacts.org).**

🌐 **Live-Webseite**: [https://torst3n.github.io/govdata/](https://torst3n.github.io/govdata/)

---

## 📌 Über das Projekt

**GovFacts Deutschland** bereitet amtliche Statistiken, Haushaltsdaten und Umweltindikatoren des deutschen Staates in interaktiven, visuellen Dashboards auf. Ziel ist es, Bürgern, Journalisten und Interessierten einen transparenten, überparteilichen und wissenschaftlich fundierten Einblick in die Finanzen, die Energiewende, das Bildungssystem und lokale Gemeindestrukturen zu ermöglichen.

---

## 📊 Dashboard-Übersicht

Das Portal umfasst 9 spezialisierte Analyse-Bereiche:

1. **Gesamtfinanzen (Einnahmen & Ausgaben)**  
   *Doppelseitiges Sankey-Diagramm* zur konsolidierten Gesamtrechnung des Staates (Bund, Länder, Kommunen und Sozialversicherungen) inklusive Finanzierungsdefizit und Nettokreditaufnahme.
2. **Ausgabenstruktur (Staat)**  
   *Drei-Stufen-Flussdiagramm* der öffentlichen Gesamtausgaben (~2,09 Billionen €) nach internationalen COFOG-Funktionsbereichen (Soziale Sicherung, Gesundheit, Bildung, Verteidigung etc.).
3. **Ummendorf-Spiegel**  
   *Gemeinde-Portal für Ummendorf (Biberach)* mit Bürger-Haushalt, Wasserqualitäts- & Pegel-Monitor für den Ummendorfer Badesee, Bodenrichtwert-Entwicklung (2014–2024) und Gemeinderats-Sitzverteilung.
4. **Lokal-Spiegel (Biberach)**  
   *Kommunal-Benchmark für den Landkreis Biberach* mit Steuerkraft (Pro-Kopf-Steuereinnahmen & Hebesätze), Solarpotenzial-Rechner, Pendlerströmen und Demografie-Alterspyramide.
5. **Bundeshaushalt 2025**  
   *Bundesbudget-Visualisierung* von den Einnahmenquellen (Gemeinschaftsteuern, Abgaben) bis zu den Einzelplänen der Bundesministerien.
6. **Strom & Energiewende**  
   *Netzstrom-Mix-Simulator* mit monatlicher Erzeugung nach Energieträgern (Solar, Wind, Biomasse, Kohle, Gas) und stündlichen Lastkurven der Bundesnetzagentur.
7. **Bildungsvergleich**  
   *Bundesländer-Monitor* zu Schulausgaben je Schüler, Betreuungsschlüsseln, Kita-U3-Quoten und Abbrecherquoten.
8. **Entwicklungstrends**  
   *15-Jahre-Langzeitindikatoren* (2010–2024) für BIP-Wachstum, Inflationsrate (VPI), Arbeitslosigkeit und Bevölkerungsfortschreibung.
9. **Methodik & Quellen**  
   Vollständige Datenherkunft mit direkten Links zu den Primärquellen.

---

## 🔗 Datenquellen & Transparenz

Alle im Dashboard genutzten Daten stammen aus frei zugänglichen Open-Data-Portalen der öffentlichen Hand:

- **Haushalt & Finanzen**: [Statistisches Bundesamt (Destatis)](https://www.destatis.de) & [bundeshaushalt.de (BMF)](https://www.bundeshaushalt.de)
- **Kommunal- & Steuerdaten BW**: [Statistisches Landesamt Baden-Württemberg](https://www.statistik-bw.de) & [BORIS-BW](https://www.gutachterausschuesse-bw.de/borisbw/)
- **Energie & Stromnetz**: [SMARD.de (Bundesnetzagentur)](https://www.smard.de) & [Energieatlas BW](https://www.energieatlas-bw.de)
- **Arbeitsmarkt & Pendler**: [Bundesagentur für Arbeit](https://statistik.arbeitsagentur.de)
- **Umwelt & Gewässer**: [LUBW Badegewässerkarte](https://badegewaesserkarte.landbw.de) & [Gemeinde Ummendorf](https://www.ummendorf.de)
- **Zentraler Datenkatalog**: [GovData.de](https://www.govdata.de)

---

## 🛠️ Technologie-Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS Dark Theme
- **UI Primitives**: [shadcn/ui](https://ui.shadcn.com/) & Base UI Tabs
- **Icons**: [Lucide React](https://lucide.dev/)
- **Hosting**: [GitHub Pages](https://pages.github.com/) (Automatischer Serverless Build via GitHub Actions)

---

## 🚀 Lokale Entwicklung

```bash
# 1. Repository klonen
git clone https://github.com/torst3n/govdata.git
cd govdata

# 2. Abhängigkeiten installieren
npm install

# 3. Entwicklungs-Server starten
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) im Browser.

### Production Build & Export

```bash
# Statischen HTML-Export erstellen (ordner /out)
npm run build
```

---

## 📜 Lizenz & Open Source

Dieses Projekt ist Open-Source unter der MIT-Lizenz verfügbar. Daten der öffentlichen Hand unterliegen in der Regel der *Datenlizenz Deutschland – Namensnennung – Version 2.0 (dl-de/by-2-0)*.
