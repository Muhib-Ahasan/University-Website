# USA Engineering Universities Guide (MSc & PhD Programs)

An automated data extraction pipeline and interactive web dashboard for United States universities offering graduate engineering programs (Master of Science, Doctor of Philosophy, or both).

Extracted from authoritative Wikipedia indexes and classified according to Carnegie Higher Education categories and engineering degree offerings, with native Cloudflare bypass via FlareSolverr.

---

## Features

- **Automated Wikipedia Scraper Bot**: Crawls Carnegie R1 (Very High Research), R2 (High Research), and Technological Universities / Polytechnics.
- **Degree Classification**: Filters and labels each university as offering **Both (MSc & PhD)**, **MSc Only**, or **PhD Only**. Excludes non-engineering institutions.
- **FlareSolverr Integration**: Pre-configured with remote HTTPS FlareSolverr (`https://flaresolverr.basic.int.eu.org/v1`) via Cloudflare Tunnel & Caddy proxy, with local Docker Compose fallback.
- **Interactive React Webview**:
  - Auto-fill fluid responsive grid.
  - Multi-criteria filtering: search by name/city/state, degree level (Both / MSc Only / PhD Only), institution control (Public / Private), and state dropdown.
  - Complete university inspection modal with official website links, Wikipedia references, and engineering school portals.
  - Instant One-Click Export to JSON and CSV.
- **Strict Code Standards**: Built with TypeScript 5+, React 19, Tailwind CSS, Lucide icons, Sonner notifications, and Biome linting/formatting.

---

## Project Structure

```text
univarsity-guide/
├── docker-compose.yml          # Optional local FlareSolverr container setup
├── .env.example                # FlareSolverr and scraper configuration template
├── .env                        # Active environment variables
├── .gitignore                  # Git ignore rules for node_modules, build, etc.
├── biome.json                  # Biome formatter & linter configuration
├── package.json                # Project dependencies and script runner
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite development and build settings
├── tailwind.config.ts          # Tailwind CSS theme extension
├── scripts/                    # Automated bot / scraper pipeline
│   ├── types.ts                # TypeScript interfaces for scraper & FlareSolverr
│   ├── flaresolverr-client.ts  # FlareSolverr client with smart fallback
│   ├── wiki-fetcher.ts         # Wikipedia table parser (R1, R2, and Polytechnics)
│   ├── degree-classifier.ts    # MSc/PhD classification and discipline detection
│   ├── test-flaresolverr.ts    # Standalone FlareSolverr connectivity test
│   └── run-scraper.ts          # Main scraper runner CLI
├── data/
│   └── universities.json       # Master scraped dataset (332 universities)
├── src/                        # Webview frontend
│   ├── App.tsx                 # Main application dashboard
│   ├── index.css               # Tailwind CSS theme & variables
│   ├── main.tsx                # React entrypoint
│   ├── components/             # Modular UI components
│   │   ├── header.tsx          # App header & export controls
│   │   ├── stats-summary.tsx   # Metric summary cards
│   │   ├── filter-bar.tsx      # Search & segmented filter bar
│   │   ├── university-card.tsx # Responsive auto-fill grid cards
│   │   └── university-modal.tsx# Detail dialog with full breakdown
│   ├── data/
│   │   └── universities.json   # Bundled dataset for static webview
│   ├── types/
│   │   └── university.ts       # Frontend type definitions
│   └── utils/
│       └── helpers.ts          # Formatting, class merging, and CSV/JSON export
└── dist/                       # Production build output
```

---

## Getting Started

### 1. Installation

Install all required dependencies:

```bash
npm install
```

### 2. FlareSolverr Configuration

The project is already pre-configured to communicate with the HTTPS FlareSolverr proxy endpoint:

```env
FLARESOLVERR_URL=https://flaresolverr.basic.int.eu.org/v1
USE_FLARESOLVERR=true
REQUEST_TIMEOUT=60000
```

To verify that FlareSolverr is online and solving challenges:

```bash
npm run test:flare
```

If you prefer to run a local instance of FlareSolverr via Docker:

```bash
docker compose up -d
```
Then set `FLARESOLVERR_URL=http://localhost:8191/v1` in `.env`.

### 3. Running the Scraper Bot

To re-crawl Wikipedia and update the universities dataset:

```bash
# Scrape all universities
npm run scrape

# Scrape with limit (for quick testing)
npx tsx scripts/run-scraper.ts --limit=20

# Force all requests through FlareSolverr
npx tsx scripts/run-scraper.ts --force-flare
```

The scraper outputs to `data/universities.json` and syncs with `src/data/universities.json`.

### 4. Starting the Webview

Launch the interactive web dashboard:

```bash
npm run dev
```

Open your browser at `http://localhost:3000`.

To create a production build:

```bash
npm run build
npm run preview
```

### 5. Code Quality & Formatting

The project uses Biome for linting and formatting:

```bash
# Check code rules
npm run lint

# Format code
npm run format
```

---

## Dataset Breakdown

The scraper extracts:
- **332 Total Verified Engineering Institutions**
- **181 Institutions offering Both (MSc & PhD)** (e.g., MIT, Stanford, UC Berkeley, Georgia Tech, Purdue, CMU, UIUC, Caltech, etc.)
- **144 Institutions offering MSc Only** (Polytechnics, regional institutes, and master's colleges such as Cal Poly SLO, Rose-Hulman, Wentworth, Milwaukee School of Engineering, SUNY Poly, etc.)
- **7 Institutions offering PhD Only**

Each record contains:
- University name & designated College/School of Engineering
- City, State abbreviation, and full state name
- Control (Public vs Private)
- Carnegie Research Classification
- Degree types (`Both`, `MSc Only`, `PhD Only`) and specific degree levels (`["MSc", "PhD"]`)
- Engineering disciplines (Computer Science, Electrical, Mechanical, Aerospace, Biomedical, etc.)
- Official website, engineering portal link, and Wikipedia article link
- Informative summary description

---

## Pushing to GitHub

To publish this project to your GitHub repository:

```bash
git init
git add .
git commit -m "feat: automated wikipedia engineering university scraper and webview"
git branch -M main
git remote add origin https://github.com/<your-username>/univarsity-guide.git
git push -u origin main
```
