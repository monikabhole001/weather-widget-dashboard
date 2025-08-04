# Wetter-Widget-Dashboard

Ein kleines Full‑Stack-Projekt (Next.js + Express + MongoDB), das ein Dashboard mit Wetter‑Widgets bietet. 
Städte können hinzugefügt und gelöscht werden; die Wetterdaten werden serverseitig von **Open‑Meteo** geholt und **5 Minuten** gecached.

---

## Tech-Stack

- **Frontend:** Next.js (React)
- **Backend:** Node.js + Express
- **Datenbank:** MongoDB (Mongoose)
- **Wetterdienst:** Open‑Meteo (kein API‑Key nötig)
- **Sonstiges:** In‑Memory‑Cache (5 Minuten TTL), dotenv

---

## Projektstruktur

```txt
/project-root
├── frontend/                   → Frontend (Dashboard)
│   ├── pages/
│   ├── components/
│   └── utils/
├── backend/                    → Backend (Express)
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── services/               → Wetterlogik inkl. Caching & Geocoding
│   └── cache/                  → In‑Memory‑Cache
└── README.md
```

---

## Setup-Anleitung

### Voraussetzungen
- Node.js **v18+** (empfohlen)
- MongoDB (lokal oder Atlas)
- NPM oder Yarn

### 1) Backend starten

```bash
# Ins Backend wechseln
cd backend

# Abhängigkeiten installieren
npm install

# .env anlegen (Beispiel unten) und Server starten
node index.js
# oder (wenn vorhanden): npm run dev
```
**Beispiel `.env`**  
```env
MONGODB_URI=mongodb://localhost:27017/weather-dashboard
PORT=5000
```

### 2) Frontend starten

```bash
# Ins Frontend wechseln
cd ../frontend

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```
Wenn alles läuft, solltest du in den Terminals u. a. sehen:
```
# Frontend (Next.js)
▲ Next.js 15.x
- Local:   http://localhost:3000

# Backend (Express)
MongoDB connected
Server running on port 5000
```
- Frontend: `http://localhost:3000`  
- Backend:  `http://localhost:5000`
- API‑Probe: **GET http://localhost:5000/api/widgets** (erwartet `[]` oder eine Widget‑Liste)

> Hinweis: In der Frontend‑Datei `frontend/utils/api.js` zeigt `BASE_URL` auf `http://localhost:5000/api/widgets`.

---
## 🔁 Projekt von Git klonen & starten (für neue Nutzer:innen)

```bash
# 1) Repo klonen
git clone https://github.com/monikabhole001/weather-widget-dashboard.git weather-widget-dashboard
cd weather-widget-dashboard

# 2) Backend vorbereiten
cd backend
npm install
# .env anlegen (siehe oben) und dann:
node index.js

# 3) Frontend vorbereiten (neues Terminal)
cd ../frontend
npm install
npm run dev

# 4) Browser öffnen
# http://localhost:3000
```

## Funktionale Anforderungen

### 🔹 Dashboard (Frontend)
- Nutzer*in kann mehrere Widgets anlegen (z. B. „Berlin“, „Hamburg“, „Paris“)
- Jedes Widget zeigt **aktuelle Wetterdaten**: Temperatur, Wind, Zeit sowie — optional — Luftfeuchte, Bewölkung, Regenmenge, Regenwahrscheinlichkeit, Sonnenauf‑/‑untergang, Orts‑Zeitzone
- Widgets können gelöscht werden
- **Keine** Authentifizierung

### 🔹 Backend (API + MongoDB)
- **REST‑API** zum Erstellen, Abrufen und Löschen von Widgets
- MongoDB speichert:
  - `Widget`: `{ _id, location, createdAt, updatedAt }`
- Beim Abruf reichert das Backend die Widgets mit Live‑Wetterdaten an
- Wetterdaten werden für **5 Minuten** im Speicher gecached (pro `location`)

### 🔹 Wetterdaten‑Handling
- Geocoding & Wetter über **Open‑Meteo** (kostenlos, **kein API‑Key**)
- Wenn für eine Stadt in den letzten **5 Minuten** bereits ein Abruf stattfand, wird der **Cache** verwendet

---

## 🧾 API

**Basis‑URL:** `http://localhost:5000/api`

| Methode | Endpoint             | Body (JSON)               | Beschreibung                                  |
|--------:|----------------------|---------------------------|-----------------------------------------------|
| GET     | `/widgets`           | —                         | Liste aller Widgets inkl. angereicherter Wetterdaten |
| POST    | `/widgets`           | `{ "location": "Berlin" }`| Neues Widget erstellen (validiert & ohne Duplikate)  |
| DELETE  | `/widgets/:id`       | —                         | Widget löschen                                 |

### Beispiel‑Antwort (GET `/widgets`)
```json
[
  {
    "_id": "64abc...",
    "location": "Berlin",
    "createdAt": "2025-07-31T16:32:10.269Z",
    "weather": {
      "time": "2025-08-01T08:30",
      "temperature": 18.6,
      "windspeed": 15.6,
      "winddirection": 262,
      "weathercode": 3,
      "humidity": 72,
      "cloudcover": 60,
      "precipitation": 0.2,
      "precipitation_probability": 35,
      "sunrise": "2025-08-01T05:31",
      "sunset": "2025-08-01T21:12",
      "timezone": "Europe/Berlin"
    },
    "updatedAt": "2025-08-01T08:35:01.232Z"
  }
]
```

### Fehlercodes
- `400 Bad Request` – ungültige Stadt / zu kurzer Name
- `500 Internal Server Error` – unerwarteter Serverfehler

---

## Datenmodell

**`Widget`**
```js
{
  _id: ObjectId,
  location: String,     // z. B. "Berlin"
  createdAt: Date,
  updatedAt: Date
}
```

**`weather` (berechnetes/transientes Objekt pro Antwort)**
```js
{
  time: ISOString,                    // Beobachtungszeit (lokal, vom API)
  temperature: Number,                // °C
  windspeed: Number,                  // km/h
  winddirection: Number,              // Grad
  weathercode: Number,                // WMO-Code
  humidity: Number,                   // %
  cloudcover: Number,                 // %
  precipitation: Number,              // mm
  precipitation_probability: Number,  // %
  sunrise: ISOString,                 // lokal
  sunset: ISOString,                  // lokal
  timezone: String                    // z. B. "Europe/Berlin"
}
```

---

## Architektur‑Überblick

- **Frontend** rendert eine Liste von Widgets und spricht die REST‑API an (`/api/widgets`).
- **Backend** hält die Widgetliste in MongoDB und holt on‑demand Wetterdaten von Open‑Meteo; Ergebnisse werden **5 Minuten gecached** (In‑Memory).
- **Trennung der Verantwortlichkeiten**: Controller → Service (Wetter/Cache) → Model (MongoDB).

```txt
[Frontend] --HTTP--> [Express API] --Mongoose--> [MongoDB]
                         |
                         └─> [Weather Service] --HTTP--> [Open‑Meteo]
                                ↳ [In‑Memory Cache 5 min]
```

---

## 🧪 Entwicklung & Skripte

Beispiele (je nach `package.json`):

```bash
# Backend
npm start                 # node index.js
npm run dev               # optional mit nodemon

# Frontend
npm run dev               # Next.js Dev-Server
```
