# USA Graduate Engineering Universities Guide

An automated data extraction pipeline, ranking aggregator, and interactive web dashboard for United States universities offering accredited graduate degrees in Engineering (Master of Science, Doctor of Philosophy, or both).

Extracted from authoritative Wikipedia Carnegie classifications, enriched with Wikidata official website links and QS World University Rankings, and strictly filtered to eliminate non-engineering institutions. Includes FlareSolverr Cloudflare anti-bot challenge bypass integration.

---

## Key Features

- **Automated Wikipedia & Wikidata Extraction**:
  - Crawls Carnegie R1 (Very High Research), R2 (High Research), and Technological Universities / Polytechnic Institutes.
  - Resolves official university websites (`P856`) and QS World University Rankings (`Q1790510`) via Wikidata SPARQL.
- **Strict Engineering Qualification & Purge**:
  - Purges over 85 non-engineering doctoral institutions (e.g., Clark Atlanta University, Emory, Georgetown, UNC Chapel Hill, American University).
  - Purges pure undergraduate engineering colleges (e.g., Harvey Mudd, Franklin W. Olin).
  - Purges specialized medical/health science centers without general engineering divisions.
  - Final verified dataset: **246 accredited graduate engineering institutions** (207 Both MSc & PhD, 39 MSc Only).
- **FlareSolverr Integration**:
  - Remote FlareSolverr endpoint over HTTPS via Cloudflare Tunnel & Caddy reverse proxy (`https://flaresolverr.basic.int.eu.org/v1`).
  - Automatic fallback to standard HTTP fetching with configurable timeout and retry logic.
  - Docker Compose configuration for optional local FlareSolverr deployment (`http://localhost:8191/v1`).
- **Interactive React Web Dashboard**:
  - Fluid auto-filling responsive card grid: `grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))]`.
  - QS World University Ranking sorting: High to Low (#1 MIT, #4 Harvard, #6 Stanford...) and Low to High.
  - Segmented degree filter: All, Both (MSc & PhD), MSc Only, PhD Only.
  - QS Ranking tier filters: All, Top 100, Top 300, Top 500, Ranked Only.
  - Control filter: All, Public, Private.
  - State filter dropdown populated from active states.
  - Real-time search across university name, city, state, engineering school name, and disciplines.
  - Detail inspection modal displaying Carnegie tier, degree levels, disciplines, official website, and engineering portal.
  - Export filtered results to JSON and CSV formats.
- **Code Standards**:
  - TypeScript 5+, React 19, Tailwind CSS, Lucide icons, Sonner toast notifications.
  - Biome (`@biomejs/biome`) for strict linting and formatting.

---

## Architecture & Project Structure

```text
univarsity-guide/
├── docker-compose.yml          # Optional local FlareSolverr container setup
├── .env.example                # FlareSolverr and scraper configuration template
├── .gitignore                  # Git ignore rules for node_modules, build, etc.
├── biome.json                  # Biome formatter & linter configuration
├── package.json                # Project dependencies and npm scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite development and build settings
├── tailwind.config.ts          # Tailwind CSS theme extension
├── SKILLS.md                   # Technical skills, agent capabilities, and architecture guide
├── data/
│   └── universities.json       # Master verified dataset (246 institutions)
├── scripts/                    # Automated bot / scraper pipeline
│   ├── types.ts                # TypeScript interfaces for scraper & FlareSolverr
│   ├── flaresolverr-client.ts  # FlareSolverr client with fallback and health checks
│   ├── wiki-fetcher.ts         # Wikipedia table parser (R1, R2, and Polytechnics)
│   ├── degree-classifier.ts    # MSc/PhD classification and discipline detection
│   ├── fix-websites-and-rankings.ts # Wikidata SPARQL resolver for P856 URLs and QS ranks
│   ├── clean-dataset.ts        # Canonical normalizer and non-engineering purge engine
│   ├── test-flaresolverr.ts    # Standalone FlareSolverr connectivity test
│   └── run-scraper.ts          # Main scraper runner CLI
├── src/                        # Web dashboard frontend
│   ├── App.tsx                 # Main application dashboard
│   ├── index.css               # Tailwind CSS theme & variables
│   ├── main.tsx                # React entrypoint
│   ├── components/             # Modular UI components
│   │   ├── header.tsx          # App header & export controls
│   │   ├── stats-summary.tsx   # Metric summary cards
│   │   ├── filter-bar.tsx      # Search, ranking sort, and segmented filter bar
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

## Dataset Breakdown

| Metric | Count | Details |
|---|---|---|
| **Total Qualified Institutions** | **246** | Accredited US institutions offering graduate engineering |
| **Both MSc & PhD** | **207** | 84.1% of dataset (R1/R2 universities with full research programs) |
| **MSc Only** | **39** | 15.9% of dataset (Polytechnics, regional universities, master's colleges) |
| **Official Websites** | **246** | 100% verified working HTTP/HTTPS root URLs |
| **QS World Ranked** | **246** | 100% mapped with global QS ranking |
| **Top 100 QS** | **26** | MIT, Stanford, Harvard, Caltech, UC Berkeley, UPenn, Cornell, etc. |
| **Top 300 QS** | **53** | Top-tier US public and private research institutions |
| **Top 500 QS** | **74** | Broad selection of flagship state institutions |

### Non-Engineering Purge Rationale
Initial scraping from broad Carnegie R1/R2 lists captured institutions with general doctoral programs (humanities, education, business, law, medicine) that lack engineering schools. An audit purged over 85 non-engineering institutions, notably:
- **Clark Atlanta University** (`cau.edu`): Offers doctoral degrees in humanities, social work, and business, but no engineering degrees.
- **Emory University**: Renowned medical, health, and law programs; engineering is routed through dual-degree programs with Georgia Tech.
- **UNC Chapel Hill**: General research powerhouse; engineering for North Carolina is centered at NC State University.
- **Harvey Mudd & Olin College**: Excellent undergraduate engineering programs, but do not offer graduate MSc or PhD degrees.
- **Medical Centers**: Albert Einstein, Baylor College of Medicine, Weill Cornell, UT Southwestern, etc.

---

## Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node.js 20 & 24)
- npm or pnpm
- (Optional) Docker for local FlareSolverr container

### 2. Installation
```bash
git clone https://github.com/Muhib-Ahasan/University-Website.git
cd University-Website
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Default configuration connects to the remote HTTPS FlareSolverr proxy:
```env
FLARESOLVERR_URL=https://flaresolverr.basic.int.eu.org/v1
USE_FLARESOLVERR=true
REQUEST_TIMEOUT=60000
PORT=3000
```

Verify FlareSolverr connectivity:
```bash
npm run test:flare
```

If using local Docker FlareSolverr:
```bash
docker compose up -d
```
Then update `.env`:
```env
FLARESOLVERR_URL=http://localhost:8191/v1
```

### 4. Running the Web Dashboard
Start the Vite development server:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

Build for production:
```bash
npm run build
npm run preview
```

### 5. Running the Automation Pipeline
To re-run the full extraction and normalization process:

```bash
# 1. Scrape Wikipedia index tables
npm run scrape

# 2. Enrich official websites and QS rankings from Wikidata
npm run scrape:rankings

# 3. Clean, normalize canonical names, and purge non-engineering schools
npm run scrape:clean
```

### 6. Linting and Formatting
The codebase adheres to Biome guidelines:
```bash
# Run linter and formatting checks
npm run lint

# Auto-format files
npm run format
```

---

## License
MIT License. Open for academic, research, and educational purposes.
