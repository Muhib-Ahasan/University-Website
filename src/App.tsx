import { useMemo, useState } from "react";
import { Toaster } from "sonner";
import { FilterBar } from "./components/filter-bar";
import { Header } from "./components/header";
import { StatsSummary } from "./components/stats-summary";
import { UniversityCard } from "./components/university-card";
import { UniversityModal } from "./components/university-modal";
import universitiesDataRaw from "./data/universities.json";
import type { FilterState, UniversityRecord } from "./types/university";

const initialFilters: FilterState = {
  searchQuery: "",
  degreeType: "ALL",
  control: "ALL",
  state: "ALL",
  discipline: "ALL",
  carnegieTier: "ALL",
  sortBy: "QS_ASC",
  rankFilter: "ALL",
};

export function App() {
  const universities = universitiesDataRaw as UniversityRecord[];
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityRecord | null>(null);

  // Extract available states sorted alphabetically
  const availableStates = useMemo(() => {
    const states = new Set<string>();
    for (const u of universities) {
      if (u.location.state) {
        states.add(u.location.state);
      }
    }
    return Array.from(states).sort();
  }, [universities]);

  // Filtered and sorted universities
  const filteredUniversities = useMemo(() => {
    const result = universities.filter((u) => {
      // Search query filter
      if (filters.searchQuery.trim() !== "") {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesName = u.name.toLowerCase().includes(query);
        const matchesCity = u.location.city.toLowerCase().includes(query);
        const matchesState = u.location.state.toLowerCase().includes(query);
        const matchesSchool = (u.engineeringSchool || "").toLowerCase().includes(query);
        const matchesDiscipline = u.engineeringDisciplines.some((d) =>
          d.toLowerCase().includes(query),
        );

        if (!matchesName && !matchesCity && !matchesState && !matchesSchool && !matchesDiscipline) {
          return false;
        }
      }

      // Degree Type filter
      if (filters.degreeType !== "ALL" && u.degreeType !== filters.degreeType) {
        return false;
      }

      // Control filter (Public / Private)
      if (filters.control !== "ALL" && u.control !== filters.control) {
        return false;
      }

      // State filter
      if (filters.state !== "ALL" && u.location.state !== filters.state) {
        return false;
      }

      // QS Rank Range filter
      if (filters.rankFilter === "TOP_100") {
        if (!u.qsRank || u.qsRank > 100) return false;
      } else if (filters.rankFilter === "TOP_300") {
        if (!u.qsRank || u.qsRank > 300) return false;
      } else if (filters.rankFilter === "TOP_500") {
        if (!u.qsRank || u.qsRank > 500) return false;
      } else if (filters.rankFilter === "RANKED") {
        if (!u.qsRank) return false;
      } else if (filters.rankFilter === "UNRANKED") {
        if (u.qsRank) return false;
      }

      return true;
    });

    // Sorting
    return result.sort((a, b) => {
      if (filters.sortBy === "QS_ASC") {
        // High rank to low rank (#1, #4, #6... at top, unranked at bottom)
        const rankA = a.qsRank ?? 999999;
        const rankB = b.qsRank ?? 999999;
        if (rankA !== rankB) return rankA - rankB;
        return a.name.localeCompare(b.name);
      }

      if (filters.sortBy === "QS_DESC") {
        // Low rank to high rank (unranked or highest numbers first)
        const rankA = a.qsRank ?? -1;
        const rankB = b.qsRank ?? -1;
        if (rankA !== rankB) return rankB - rankA;
        return a.name.localeCompare(b.name);
      }

      if (filters.sortBy === "NAME_ASC") {
        return a.name.localeCompare(b.name);
      }

      if (filters.sortBy === "NAME_DESC") {
        return b.name.localeCompare(a.name);
      }

      return 0;
    });
  }, [universities, filters]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header
        totalCount={universities.length}
        filteredCount={filteredUniversities.length}
        filteredData={filteredUniversities}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-8">
        <StatsSummary universities={universities} />

        <FilterBar
          filters={filters}
          onChange={setFilters}
          availableStates={availableStates}
          totalResults={filteredUniversities.length}
        />

        {/* Fluid Auto-Fill Grid Pattern */}
        {filteredUniversities.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-4">
            {filteredUniversities.map((item) => (
              <UniversityCard key={item.id} university={item} onSelect={setSelectedUniversity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <h3 className="text-base font-semibold text-foreground">
              No matching universities found
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Try adjusting your search terms, ranking filters, or degree criteria to see more
              results.
            </p>
            <button
              type="button"
              onClick={() => setFilters(initialFilters)}
              className="mt-4 px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        <p>
          USA University Engineering Guide &bull; Official Verified Websites &bull; QS World
          Rankings &bull; FlareSolverr Proxy Integrated
        </p>
      </footer>

      {/* University Detail Modal */}
      <UniversityModal
        university={selectedUniversity}
        onClose={() => setSelectedUniversity(null)}
      />

      <Toaster richColors position="bottom-right" />
    </div>
  );
}

export default App;
