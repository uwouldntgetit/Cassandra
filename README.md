<div align="center">
  <h1>🏙️ Cassandra</h1>
  <p><strong>A Next-Generation Real-Time Urban Monitoring System</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D" alt="Vue.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  </p>

  <p>
    <a href="https://github.com/uwouldntgetit/Cassandra/actions/workflows/ci.yml">
      <img src="https://github.com/uwouldntgetit/Cassandra/actions/workflows/ci.yml/badge.svg" alt="CI" />
    </a>
  </p>

  <p>
    <strong>🔗 <a href="https://cassandra-frontend.onrender.com">Live Demo</a></strong> &nbsp;•&nbsp;
    <a href="https://cassandra-rdy2.onrender.com/api-docs">API Docs (Swagger)</a>
  </p>
</div>

<br />

> ⏳ **Nota**: backend e frontend sono ospitati sul piano gratuito di Render, che va in sospensione dopo inattività. Il primo caricamento può richiedere ~30 secondi al "risveglio".

## 📖 Overview

**Cassandra** è un'applicazione web full-stack progettata per il monitoraggio in tempo reale delle infrastrutture e degli eventi della città di Trento. Attraverso un'interfaccia interattiva e data-driven, permette ad amministratori e cittadini di visualizzare livelli di affollamento, stato dell'illuminazione pubblica, flussi di traffico e molto altro.

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

### Frontend (`frontend/`)
* **[Vue 3 (Composition API)](https://vuejs.org/)** + **[TypeScript](https://www.typescriptlang.org/)** + **[Vite](https://vitejs.dev/)**: UI reattiva, tipizzata e con build ottimizzate.
* **[Pinia](https://pinia.vuejs.org/)** & **[Vue Router](https://router.vuejs.org/)**: Gestione dello stato (Layer, Auth, Notifiche) e navigazione SPA.
* **[Tailwind CSS](https://tailwindcss.com/)** & **[DaisyUI](https://daisyui.com/)**: Design system utility-first.
* **[Leaflet](https://leafletjs.com/)** & **[Leaflet.heat](https://github.com/Leaflet/Leaflet.heat)**: Motore cartografico e heatmap.
* **[Chart.js](https://www.chartjs.org/)** & **[Lucide](https://lucide.dev/)**: Grafici e icone.

### Backend (`backend/`)
* **[Node.js](https://nodejs.org/)** + **[Express](https://expressjs.com/)** (ESM): API REST.
* **[MongoDB](https://www.mongodb.com/)** + **[Mongoose](https://mongoosejs.com/)**: Persistenza dati (MongoDB Atlas).
* **Autenticazione**: JWT + Google OAuth ([google-auth-library](https://github.com/googleapis/google-auth-library-nodejs)), password con [bcrypt](https://github.com/kelektiv/node.bcrypt.js).
* **[Swagger UI](https://swagger.io/tools/swagger-ui/)**: Documentazione interattiva delle API su [`/api-docs`](https://cassandra-rdy2.onrender.com/api-docs).

### Testing & CI/CD
* **[Jest](https://jestjs.io/)** + **[Supertest](https://github.com/ladjs/supertest)** + **mongodb-memory-server** (backend) e **[Vitest](https://vitest.dev/)** (frontend).
* **GitHub Actions**: test di backend e frontend + build su ogni push/PR verso `main`.
* **Deploy**: backend e frontend su [Render](https://render.com/) (configurazione in [`render.yaml`](./render.yaml)).

---

## 🚀 Getting Started

### Prerequisiti
* **Node.js** 18+ (consigliato 20).
* Un'istanza **MongoDB** (locale o [MongoDB Atlas](https://www.mongodb.com/atlas)) per il backend.

### 1. Clona il repository
```bash
git clone https://github.com/uwouldntgetit/Cassandra.git
cd Cassandra
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env      # poi compila i valori (DB_URL, SUPER_SECRET, GOOGLE_CLIENT_ID, ...)
npm run seed              # popola il database con i dati di esempio (opzionale)
npm start                 # avvia l'API su http://localhost:3000
```
Documentazione API disponibile su `http://localhost:3000/api-docs`.

### 3. Frontend
In un secondo terminale:
```bash
cd frontend
npm install
cp .env.example .env.development   # imposta VITE_API_URL (default http://localhost:3000)
npm run dev                        # avvia l'app su http://localhost:5173
```

### Test
```bash
cd backend  && npm test    # Jest
cd frontend && npm test    # Vitest
```

### Build di produzione (frontend)
```bash
cd frontend && npm run build   # output in frontend/dist
```

---

## 📂 Struttura del Progetto

```text
Cassandra/
├── backend/          # API Node/Express + MongoDB
│   ├── app/          # Route, middleware e modelli
│   │   ├── *.js          # Endpoint REST (authentication, layers, predictions,
│   │   │                 #   users, admin, roads, routing, zones, notifications)
│   │   ├── tokenChecker.js / adminChecker.js   # Middleware di autorizzazione
│   │   └── models/       # Schemi Mongoose
│   ├── tests/        # Test Jest + Supertest
│   ├── scripts/      # Script di manutenzione (migrazioni, reset password)
│   ├── swagger.js    # Definizione documentazione API
│   ├── seed.js       # Popolamento dati di esempio
│   └── index.js      # Entry point del server
├── frontend/         # SPA Vue 3 + TypeScript
│   └── src/
│       ├── components/   # Componenti riutilizzabili (TopBar, Modals, Map)
│       ├── composables/  # Logica riutilizzabile (es. simulatore eventi)
│       ├── router/       # Rotte Vue Router
│       ├── stores/       # Store Pinia (auth, layer, notifiche)
│       └── views/        # Pagine (Landing, Dashboard, Admin)
├── render.yaml       # Configurazione deploy (Render Blueprint)
└── .github/workflows/ci.yml
```

---

<div align="center">
  <p>Sviluppato per il corso di <strong>Ingegneria del Software</strong> - Università di Trento</p>
</div>
