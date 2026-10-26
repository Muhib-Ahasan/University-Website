# System Skills & Architecture Reference

This document outlines the core technical skills, data processing pipelines, anti-bot mechanisms, and architectural standards implemented in the USA Graduate Engineering Universities Guide.

---

## 1. Web Automation & Anti-Bot Bypass Skill

### Pipeline Overview
Automated scraping of modern academic portals requires handling Cloudflare turnstiles, rate limits, and dynamic JS content.

### FlareSolverr Proxy Integration
- **Implementation**: [`scripts/flaresolverr-client.ts`](file:///E:/Development/AI%20Tools/univarsity-guide/scripts/flaresolverr-client.ts)
- **Protocol**: HTTP POST to `/v1` endpoint sending JSON payload `{ cmd: "request.get", url, maxTimeout: 60000 }`.
- **Infrastructure**: Remote Caddy reverse proxy + Cloudflare Tunnel routing traffic securely over HTTPS (`https://flaresolverr.basic.int.eu.org/v1`), with Docker Compose containerization fallback for local execution.
- **Failover Strategy**: The client checks health on initialization (`GET /`) and falls back gracefully to standard Node.js `fetch` requests with browser-like headers if FlareSolverr is unreachable or unconfigured.

### Wikipedia HTML & MediaWiki Extraction
- **Implementation**: [`scripts/wiki-fetcher.ts`](file:///E:/Development/AI%20Tools/univarsity-guide/scripts/wiki-fetcher.ts)
- **Sources**:
  - `List of research universities in the United States` (Carnegie R1 and R2 tables)
  - `Association of Independent Technological Universities`
  - Specialized state polytechnic indexes (e.g., California State Polytechnic, SUNY Poly, etc.)
- **DOM Parsing**: Uses Cheerio to parse HTML tables, strip citation tags (`[1]`, `[2]`), extract university links, city, state, control (Public/Private), and infobox metadata.

---

## 2. Academic Data Normalization & Qualification Skill

### Problem Statement
Unchecked web scraping of doctoral institutions produces false positives by capturing institutions that confer doctorates only in humanities, education, business, law, or medicine without having an engineering division (e.g., Clark Atlanta University, Emory University).

### Qualification Rules
- **Rule 1: Division Existence**: The institution must possess an active, accredited College or School of Engineering (or Division of Applied Science).
- **Rule 2: Graduate Degree Level**: The institution must confer at minimum an M.S. / M.Eng. degree in engineering. Pure undergraduate engineering colleges (e.g., Harvey Mudd, Franklin W. Olin) are excluded from the graduate dataset.
- **Rule 3: Conferred vs. Partnered**: Where engineering programs are administered through another institution's division (e.g., University of Nebraska Omaha engineering degrees conferred by University of Nebraska-Lincoln Peter Kiewit Institute), the parent awarding institution is retained to prevent duplicate or misleading entries.
- **Rule 4: Medical Separation**: Standalone medical universities offering bio-medical sciences without an engineering degree are excluded.

### Implementation
- **Implementation**: [`scripts/clean-dataset.ts`](file:///E:/Development/AI%20Tools/univarsity-guide/scripts/clean-dataset.ts)
- **Functions**: Deduplicates institutional alias variations (e.g., "The Pennsylvania State University" vs "Penn State University"), normalizes engineering school names, attaches validated official domains, and applies explicit purge filters.

---

## 3. Wikidata SPARQL & Academic Ranking Skill

### Problem Statement
Directly scraping university ranking sites or repeatedly hitting MediaWiki API endpoints triggers rate limiting and IP blocks.

### SPARQL Solution
- **Implementation**: [`scripts/fix-websites-and-rankings.ts`](file:///E:/Development/AI%20Tools/univarsity-guide/scripts/fix-websites-and-rankings.ts)
- **Endpoint**: `https://query.wikidata.org/sparql`
- **Ontology Properties**:
  - `wdt:P31/wdt:P279* wd:Q3918`: Target instances of universities or higher education institutions.
  - `wdt:P17 wd:Q30`: Country restricted to United States.
  - `wdt:P856 ?website`: Official canonical university website.
  - `p:P1352 [ ps:P1352 ?rank ; pq:P447 wd:Q1790510 ]`: QS World University Ranking point-in-time statement.
- **Performance**: Fetches all official websites and QS rankings in a single 4-second request, avoiding API rate limits and providing clean canonical domain URLs.

---

## 4. Modern Frontend Architecture & UI Skill

### Fluid Auto-Filling Grid Standard
Rigid breakpoint ladders (`grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6`) create awkward card stretching and horizontal overflow on mid-size screens. This project standardizes on fluid auto-filling CSS grids:
```tsx
<div className="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-4">
  {filteredUniversities.map((item) => (
    <UniversityCard key={item.id} university={item} onSelect={setSelectedUniversity} />
  ))}
</div>
```

### Component Hierarchy
- [`src/App.tsx`](file:///E:/Development/AI%20Tools/univarsity-guide/src/App.tsx): Root state container managing search query, degree filters, control filters, QS ranking sort direction, rank tier filters, and modal selection.
- [`src/components/header.tsx`](file:///E:/Development/AI%20Tools/univarsity-guide/src/components/header.tsx): Displays project branding, active record counts, and JSON/CSV export actions.
- [`src/components/stats-summary.tsx`](file:///E:/Development/AI%20Tools/univarsity-guide/src/components/stats-summary.tsx): Quick-glance stat cards displaying total counts, Both (MSc & PhD), MSc Only, Top 100 QS, and Public/Private ratios.
- [`src/components/filter-bar.tsx`](file:///E:/Development/AI%20Tools/univarsity-guide/src/components/filter-bar.tsx): Multi-control filter bar containing search input, segmented degree tabs, QS rank sorting, QS rank tier dropdown, control tabs, and state dropdown.
- [`src/components/university-card.tsx`](file:///E:/Development/AI%20Tools/univarsity-guide/src/components/university-card.tsx): Compact, accessible card component featuring institution name, QS badge, location, engineering school name, degree badges, and direct website links.
- [`src/components/university-modal.tsx`](file:///E:/Development/AI%20Tools/univarsity-guide/src/components/university-modal.tsx): Accessible dialog displaying exhaustive institution details, Carnegie classification, degree levels, engineering disciplines, and direct research portals.

### Data Export Utility
- **Implementation**: [`src/utils/helpers.ts`](file:///E:/Development/AI%20Tools/univarsity-guide/src/utils/helpers.ts)
- **Formats**: RFC 4180 compliant CSV generator (with escaped double quotes and newline handling) and formatted JSON exporter.

---

## 5. Code Quality & Formatting Skill

### Tooling Standards
- **Linter & Formatter**: Biome (`@biomejs/biome`) version 1.9+.
- **Configuration**: [`biome.json`](file:///E:/Development/AI%20Tools/univarsity-guide/biome.json) configured with:
  - 2-space indentation.
  - Double quotes.
  - 100 character line width.
  - Strict TypeScript rules with `noExplicitAny` enforced.
- **TypeScript**: Strict mode enabled in [`tsconfig.json`](file:///E:/Development/AI%20Tools/univarsity-guide/tsconfig.json) with `noUnusedLocals` and `noUnusedParameters`.
- **Zero AI Noise**:
  - No decorative emojis in code, comments, or terminal output.
  - No redundant docstrings or multi-line artificial comments.
  - Self-documenting, typed interfaces and concise single-line explanations where necessary.
