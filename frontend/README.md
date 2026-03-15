# EduSpark AI — Smart Classroom Assistant

EduSpark AI is an AI-powered classroom observation and insights platform for early-childhood educators. Teachers submit observations about student behavior (as text, audio, image, or PDF), and the platform uses a local AI backend to identify learning difficulties, map them to curriculum topics, and generate tailored classroom activities — all in real time.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Application Flow](#application-flow)
- [Pages & Routes](#pages--routes)
- [Backend API](#backend-api)
- [AI Models](#ai-models)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Configuration](#configuration)
- [Testing](#testing)
- [Build & Deployment](#build--deployment)
- [Troubleshooting](#troubleshooting)

---

## Overview

EduSpark AI connects a React frontend to a local Python AI backend. The frontend is a fully responsive single-page application (SPA) with a collapsible sidebar layout. Teachers can:

1. Submit classroom observations (free text or uploaded files)
2. Receive AI-generated insights identifying specific learning issues
3. Browse and filter a library of AI-generated classroom activities
4. View analytics charts tracking trends over time
5. Monitor the health of each AI model in real time
6. Configure the backend API URL and personal preferences

---

## Features

| Feature | Description |
|---|---|
| **Observation Submission** | Submit text observations or upload audio, image (PNG/JPG), or PDF files |
| **Multi-language Support** | Select observation language (English, Arabic, French, Spanish) before analysis |
| **AI Insights** | Structured results: identified issue, curriculum topic, age group, suggested activity, required materials, duration |
| **Demo Fallback** | If the AI server is unreachable, a demo result is shown so the UI remains functional |
| **Activity Library** | Filterable cards by age group, curriculum topic, and difficulty level |
| **Analytics Dashboard** | Four live charts: difficulty trends, topic distribution, activity frequency, daily submissions |
| **Model Status Monitor** | Real-time status of Ollama (LLM), Whisper (STT), NLLB (Translation), and Tesseract (OCR) — auto-refreshes every 10 seconds |
| **Configurable API URL** | Backend URL is stored in `localStorage` and editable from the Settings page |
| **Animated UI** | Smooth page transitions and card entrances via Framer Motion |
| **Collapsible Sidebar** | Icon-only collapse mode for compact screen layouts |

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type-safe JavaScript |
| Vite | 8.x | Build tool & dev server |
| React Router DOM | 6.x | Client-side routing |
| TanStack Query | 5.x | Server state management |
| Tailwind CSS | 3.x | Utility-first CSS |
| shadcn/ui | latest | Accessible component primitives |
| Framer Motion | 12.x | Animations & transitions |
| Recharts | 2.x | Charts (Area, Bar, Pie) |
| Axios | 1.x | HTTP client for API calls |
| react-dropzone | 15.x | Drag-and-drop file uploads |
| Sonner | 1.x | Toast notifications |
| react-hook-form + Zod | 7.x / 3.x | Form handling & validation |
| Lucide React | 0.462 | Icon library |

### Testing

| Tool | Purpose |
|---|---|
| Vitest | Unit & integration testing |
| @testing-library/react | React component testing |
| Playwright | End-to-end browser testing |

---

## Project Structure

```
eduspark-ai/
├── public/
│   └── robots.txt
├── src/
│   ├── App.tsx                    # Root router & provider setup
│   ├── main.tsx                   # React DOM entry point
│   ├── index.css                  # Global styles & CSS variables
│   ├── components/
│   │   ├── AppSidebar.tsx         # Collapsible navigation sidebar
│   │   ├── DashboardLayout.tsx    # Shared layout wrapper (sidebar + content)
│   │   ├── ModelStatusCard.tsx    # Individual AI model health card
│   │   ├── NavLink.tsx            # Active-state aware router link
│   │   ├── ResultCard.tsx         # AI insight result display card
│   │   ├── StatCard.tsx           # KPI stat card with icon
│   │   └── ui/                    # shadcn/ui component library
│   ├── hooks/
│   │   ├── use-mobile.tsx         # Responsive mobile detection hook
│   │   └── use-toast.ts           # Toast notification hook
│   ├── lib/
│   │   └── utils.ts               # Tailwind class merging utility
│   ├── pages/
│   │   ├── Dashboard.tsx          # /  — Overview stats & charts
│   │   ├── SubmitObservation.tsx  # /submit — Observation input & AI analysis
│   │   ├── Insights.tsx           # /insights — Structured AI insight results
│   │   ├── ActivityLibrary.tsx    # /activities — Filterable activity cards
│   │   ├── Analytics.tsx          # /analytics — Multi-chart analytics view
│   │   ├── ModelStatus.tsx        # /status — AI model health monitor
│   │   ├── Settings.tsx           # /settings — API URL & preferences
│   │   ├── Index.tsx              # Index redirect
│   │   └── NotFound.tsx           # 404 page
│   ├── services/
│   │   └── api.ts                 # Axios API client (health, analyze, upload)
│   └── test/
│       ├── example.test.ts        # Example Vitest unit test
│       └── setup.ts               # Test setup (jest-dom matchers)
├── index.html                     # Vite HTML entry
├── vite.config.ts                 # Vite config (port 8080, path aliases)
├── vitest.config.ts               # Vitest config
├── playwright.config.ts           # Playwright E2E config
├── tailwind.config.ts             # Tailwind theme config
├── tsconfig.json                  # TypeScript config
└── package.json
```

---

## Application Flow

```
Teacher Opens App
      │
      ▼
DashboardLayout (Sidebar + Outlet)
      │
      ├─► Dashboard (/)
      │     └─ KPI cards + 3 charts (difficulty trends, curriculum issues, daily activity)
      │
      ├─► Submit Observation (/submit)
      │     ├─ Teacher types free-text observation OR drags/drops file
      │     ├─ Selects analysis language (en / ar / fr / es)
      │     ├─ Clicks "Analyze"
      │     │     ├─ [text] → POST /teacher/analyze  → InsightResult[]
      │     │     └─ [file] → POST /teacher/upload   → InsightResult[]
      │     └─ Results rendered as ResultCards (issue, activity, age, materials, duration)
      │         (Falls back to demo data if backend is unreachable)
      │
      ├─► AI Insights (/insights)
      │     └─ Pre-loaded demo insight cards (issue → activity → age → materials)
      │
      ├─► Activity Library (/activities)
      │     ├─ Filter by: Age Group | Curriculum Topic | Difficulty
      │     └─ Grid of activity cards (title, description, duration, materials)
      │
      ├─► Analytics (/analytics)
      │     ├─ Area chart — Learning difficulty trends by week (Math / Literacy / Social)
      │     ├─ Pie chart  — Curriculum topic distribution
      │     ├─ Bar chart  — Activity recommendation frequency (horizontal)
      │     └─ Area chart — Daily observation submission counts
      │
      ├─► Model Status (/status)
      │     ├─ GET /health every 10 seconds
      │     ├─ Shows system status (healthy / degraded / demo)
      │     └─ Individual cards for: Ollama, Whisper, NLLB, Tesseract
      │
      └─► Settings (/settings)
            ├─ Backend API URL (saved to localStorage)
            ├─ Teacher display name
            ├─ Preferred language
            └─ Notifications toggle
```

---

## Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | Dashboard | KPI stats, area & bar charts for weekly overview |
| `/submit` | Submit Observation | Text area + file drop zone, language selector, AI analysis |
| `/insights` | AI Insights | Structured cards showing identified issues and suggested activities |
| `/activities` | Activity Library | Filterable grid of AI-curated classroom activities |
| `/analytics` | Analytics | Four Recharts visualizations for classroom data |
| `/status` | Model Status | Real-time AI model health with auto-refresh |
| `/settings` | Settings | Configure API endpoint, profile, language, notifications |
| `*` | Not Found | 404 fallback page |

---

## Backend API

The frontend connects to a Python AI backend. The default URL is `http://192.168.1.15:8000` and can be changed in **Settings**. The URL is persisted in `localStorage` under the key `eduai_api_url`.

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Returns system status and individual model statuses |
| `POST` | `/teacher/analyze` | Analyze a free-text observation |
| `POST` | `/teacher/upload` | Upload a file (audio, image, or PDF) for analysis |

### Request / Response Shapes

**GET `/health`**
```json
{
  "status": "healthy",
  "models": {
    "Ollama (LLM)": "available",
    "Whisper (Speech-to-Text)": "available",
    "NLLB (Translation)": "available",
    "Tesseract (OCR)": "not installed"
  }
}
```

**POST `/teacher/analyze`**
```json
// Request
{ "text": "Student struggles to count numbers from 1 to 10", "language": "en" }

// Response — array of InsightResult
[
  {
    "identified_issue": "Student struggles with number counting 1-10",
    "curriculum_topic": "Early Mathematics",
    "age_group": "3-5 years",
    "suggested_activity": "Number Line Hop — students hop along a floor number line while counting aloud",
    "required_materials": ["Floor number line mat", "Number flashcards", "Stickers"],
    "activity_duration": "15 minutes"
  }
]
```

**POST `/teacher/upload`**
- `multipart/form-data` with fields: `file` (required), `language` (optional)
- Response: same `InsightResult[]` format

---

## AI Models

| Model | Role | Status Key |
|---|---|---|
| **Ollama (LLM)** | Core language model for generating insights and activities | `Ollama (LLM)` |
| **Whisper (Speech-to-Text)** | Transcribes uploaded audio files (.mp3, .wav, .m4a) | `Whisper (Speech-to-Text)` |
| **NLLB (Translation)** | Translates non-English observations before analysis | `NLLB (Translation)` |
| **Tesseract (OCR)** | Extracts text from uploaded images and PDFs | `Tesseract (OCR)` |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20 and **npm** ≥ 10 ([download](https://nodejs.org/))
- A running EduSpark AI backend server (or use demo/fallback mode without one)

### Installation

```sh
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd eduspark-ai

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at **http://localhost:8080**.

> **Note:** If port 8080 is already in use, Vite will fall back to the next available port (e.g. 8081). Stop any other Vite process on 8080 first if you need a specific port.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR on port 8080 |
| `npm run build` | Production build to `dist/` |
| `npm run build:dev` | Development-mode build (with sourcemaps) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across all source files |
| `npm run test` | Run Vitest unit tests (single run) |
| `npm run test:watch` | Run Vitest in watch mode |

---

## Configuration

### Vite Dev Server

Configured in [vite.config.ts](vite.config.ts):

- **Port**: `8080`
- **Host**: `::` (all interfaces — accessible on LAN)
- **Path alias**: `@` maps to `./src`
- **HMR overlay**: disabled

### Backend API URL

The backend URL defaults to `http://192.168.1.15:8000`. To change it:

1. Open the app and navigate to **Settings**
2. Update the **API URL** field
3. Click **Save Settings**

The URL is stored in `localStorage` (`eduai_api_url`) and used for all subsequent API requests.

### Language Support

The Submit Observation page lets you choose the observation language before analysis. Supported values: `en` (English), `ar` (Arabic), `fr` (French), `es` (Spanish).

---

## Testing

### Unit / Integration Tests (Vitest)

```sh
npm run test          # single run
npm run test:watch    # watch mode
```

Test files live in `src/test/`. The setup file at [src/test/setup.ts](src/test/setup.ts) extends `expect` with `@testing-library/jest-dom` matchers.

### End-to-End Tests (Playwright)

```sh
npx playwright test
```

Playwright config is at [playwright.config.ts](playwright.config.ts). Fixture helpers are in [playwright-fixture.ts](playwright-fixture.ts).

---

## Build & Deployment

### Production Build

```sh
npm run build
```

Output is placed in `dist/`. The bundle is a single JS chunk (`~1 MB` minified, `~300 KB` gzipped). For production you may want to enable code-splitting via `build.rolldownOptions.output.codeSplitting` in `vite.config.ts`.

### Serving the Build

```sh
npm run preview      # serves dist/ locally via Vite preview
```

For production hosting, serve the `dist/` folder with any static file server (Nginx, Caddy, Vercel, Netlify, etc.). Since the app uses client-side routing, configure the server to redirect all `404` responses to `index.html`.

### Environment Notes

- The backend API URL is **runtime-configurable** (via Settings page / `localStorage`). There is no `.env` variable required for the frontend itself.
- Ensure the backend server's CORS policy allows requests from the frontend origin.

---

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| Blank page on load | Missing `react-dropzone` dependency (was not installed) | Run `npm install` — `react-dropzone` is now listed in `package.json` |
| Build fails with "cannot resolve react-dropzone" | Same as above | `npm install react-dropzone --legacy-peer-deps` |
| Port 8080 already in use | Another Vite / Node process is running | Stop the old process or run `npm run dev -- --port 8081` |
| "Could not reach the AI server" toast | Backend is offline or URL is wrong | Check the API URL in Settings; app will show demo data as fallback |
| Model Status shows "Demo mode" | Backend `/health` endpoint unreachable | Start the Python backend and verify network connectivity |
| `npm install` peer dependency error | `vite@8` is newer than some plugin peer ranges | Add `--legacy-peer-deps` flag: `npm install --legacy-peer-deps` |
