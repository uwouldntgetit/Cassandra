<div align="center">
  <h1>🏙️ Cassandra</h1>
  <p><strong>A Next-Generation Real-Time Urban Monitoring System</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D" alt="Vue.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  </p>
</div>

<br />

## 📖 Overview

**Cassandra** è un'applicazione web all'avanguardia progettata per il monitoraggio in tempo reale delle infrastrutture e degli eventi della città di Trento. Attraverso un'interfaccia interattiva e data-driven, permette ad amministratori e cittadini di visualizzare livelli di affollamento, stato dell'illuminazione pubblica, flussi di traffico e molto altro.

---

## ✨ Funzionalità Principali

- 🗺️ **Mappa Interattiva Avanzata**: Navigazione fluida della città basata su Leaflet.
- 🔥 **Heatmap ad Alte Prestazioni**: Rendering su Canvas (`leaflet.heat`) per visualizzare grandi moli di dati (Affollamento e Smart Lighting) in tempo reale tramite gradienti neon personalizzati.
- 🔐 **Pannello di Amministrazione Sicuro**: Sezione privata riservata agli admin (autenticazione JWT/Google) con grafici analitici (`Chart.js`) e metriche di sistema.
- 🌗 **Tema Dinamico (Dark/Light Mode)**: Supporto nativo per temi chiari e scuri, con una palette colori accuratamente studiata per non affaticare la vista.
- 📍 **Ricerca e Preferiti**: Geocodifica live tramite l'API Nominatim di OpenStreetMap e salvataggio delle posizioni preferite dell'utente.
- 🛡️ **UX Protettiva**: Sistemi di prevenzione sovrapposizione visiva (es. avvisi di conflitto tra layer) con salvataggio delle preferenze utente nel `localStorage`.

---

## 📡 Fonti Dati

| Dato | Fonte |
|---|---|
| Meteo e qualità dell'aria | Live da [Open-Meteo](https://open-meteo.com/) |
| Rete stradale | Live da [Overpass API](https://overpass-api.de/) (OSM), fallback OSRM |
| Livelli di congestione del traffico | Simulati (pattern orari/settimanali sulla rete stradale reale) |
| Affollamento e illuminazione | Sintetici (seed nel database) |
| Previsioni | Modello statistico su storico sintetico + meteo live |
| Metriche admin (system load, API requests) | Simulate |

---

## 🛠️ Stack Tecnologico

Il front-end è stato architettato utilizzando le tecnologie più moderne per garantire velocità, manutenibilità e scalabilità:

### Core & Framework
* **[Vue 3 (Composition API)](https://vuejs.org/)**: Gestione reattiva dell'interfaccia.
* **[TypeScript](https://www.typescriptlang.org/)**: Tipizzazione statica per una maggiore robustezza.
* **[Vite](https://vitejs.dev/)**: Hot Module Replacement fulmineo e build super ottimizzate.

### State & Routing
* **[Pinia](https://pinia.vuejs.org/)**: Gestione centralizzata dello stato (Layer, Autenticazione, Notifiche).
* **[Vue Router](https://router.vuejs.org/)**: Navigazione Single Page Application (SPA).

### UI, Styling & Data Visualization
* **[Tailwind CSS](https://tailwindcss.com/)** & **[DaisyUI](https://daisyui.com/)**: Design system utility-first per componenti eleganti e veloci.
* **[Leaflet](https://leafletjs.com/)** & **[Leaflet.heat](https://github.com/Leaflet/Leaflet.heat)**: Motore cartografico e rendering delle mappe di calore.
* **[Chart.js](https://www.chartjs.org/)** & **[vue-chartjs](https://vue-chartjs.org/)**: Componenti grafici (Doughnut, Line charts).
* **[Lucide Vue Next](https://lucide.dev/)**: Set di icone vettoriali moderne e pulite.

---

## 🚀 Getting Started

### Prerequisiti
Assicurati di avere installato **Node.js** (versione 18+ consigliata) sul tuo sistema.

### Installazione

1. Clona il repository:
   ```bash
   git clone https://github.com/uwouldntgetit/Cassandra.git
   cd Cassandra
   ```

2. Installa le dipendenze:
   ```bash
   npm install
   ```

3. Avvia il server di sviluppo locale:
   ```bash
   npm run dev
   ```

4. Apri il browser all'indirizzo `http://localhost:5173/`.

### Build per la Produzione
Per generare i file statici ottimizzati per il deploy:
```bash
npm run build
```
I file saranno generati nella cartella `/dist`.

---

## 📂 Struttura del Progetto

```text
src/
├── assets/       # Risorse statiche (es. logo)
├── components/   # Componenti Vue riutilizzabili (TopBar, Modals, Map)
├── composables/  # Logica riutilizzabile (es. useEventSimulator per notifiche)
├── router/       # Configurazione delle rotte Vue Router
├── stores/       # Store Pinia (auth, layer, notifiche)
├── views/        # Pagine principali (Dashboard, Admin, Landing)
├── App.vue       # Root component (Orchestratore)
└── main.ts       # Entry point dell'applicazione
```

---

<div align="center">
  <p>Sviluppato per il corso di <strong>Ingegneria del Software</strong> - Università di Trento</p>
</div>
