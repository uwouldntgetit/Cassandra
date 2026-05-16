# Trento Smart City Dashboard

Una dashboard interattiva per la visualizzazione e la gestione dei dati in tempo reale della città di Trento.

## Stack Tecnologico (Frontend)

Questo progetto è stato sviluppato utilizzando le seguenti tecnologie e librerie:

### Core & Framework
* **[Vue 3](https://vuejs.org/)**: Framework JavaScript progressivo per la costruzione dell'interfaccia utente (utilizzando Composition API e `<script setup>`).
* **[TypeScript](https://www.typescriptlang.org/)**: Superset tipizzato di JavaScript per garantire robustezza e manutenibilità del codice.
* **[Vite](https://vitejs.dev/)**: Build tool di nuova generazione, estremamente veloce per lo sviluppo locale e l'ottimizzazione del bundle di produzione.

### Gestione dello Stato & Navigazione
* **[Pinia](https://pinia.vuejs.org/)**: Lo store ufficiale di Vue per la gestione dello stato globale (usato per gestire i layer attivi, il tema dark/light e l'autenticazione).
* **[Vue Router](https://router.vuejs.org/)**: Libreria di routing ufficiale per Vue, utilizzata per gestire le viste (es. Dashboard, Landing Page, Admin Panel).

### UI & Styling
* **[Tailwind CSS](https://tailwindcss.com/)**: Framework CSS *utility-first* per creare design responsivi e moderni in modo rapido e coerente (inclusa la Dark Mode).
* **[DaisyUI](https://daisyui.com/)**: Libreria di componenti elegante basata su Tailwind CSS.

### Mappe & Visualizzazione Dati
* **[Leaflet](https://leafletjs.com/)**: Libreria JavaScript open-source leader per mappe interattive, fluide e leggere.
* **[Leaflet.heat](https://github.com/Leaflet/Leaflet.heat)**: Plugin ufficiale di Leaflet per la generazione di Heatmap (mappe di calore) basate su Canvas. Lo abbiamo utilizzato per i layer ad alta densità (Affollamento e Smart Lighting).
* **[Chart.js](https://www.chartjs.org/)** & **[vue-chartjs](https://vue-chartjs.org/)**: Utilizzati per renderizzare grafici analitici (es. grafici a linee e ad anello nel pannello di amministrazione).

### Iconografia
* **[Lucide Vue Next](https://lucide.dev/)**: Collezione di icone vettoriali pulite, moderne e personalizzabili, usate nei bottoni, nei menu e nei pannelli di controllo.
