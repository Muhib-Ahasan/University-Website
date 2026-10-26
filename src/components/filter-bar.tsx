import { ArrowUpDown, RotateCcw, Search, SlidersHorizontal, Trophy } from "lucide-react";
import type { FC } from "react";
import type { DegreeType, FilterState, SortOption } from "../types/university";

interface FilterBarProps {
  filters: FilterState;
  onChange: (updated: FilterState) => void;
  availableStates: string[];
  totalResults: number;
}

type RankFilterOption = "ALL" | "TOP_100" | "TOP_300" | "TOP_500" | "RANKED" | "UNRANKED";

const RANK_FILTERS: Array<{ id: RankFilterOption; label: string }> = [
  { id: "ALL", label: "All Ranks" },
  { id: "TOP_100", label: "Top 100" },
  { id: "TOP_300", label: "Top 300" },
  { id: "TOP_500", label: "Top 500" },
  { id: "RANKED", label: "Ranked Only" },
];

export const FilterBar: FC<FilterBarProps> = ({
  filters,
  onChange,
  availableStates,
  totalResults,
}) => {
  const handleDegreeChange = (degreeType: "ALL" | DegreeType) => {
    onChange({ ...filters, degreeType });
  };

  const handleControlChange = (control: "ALL" | "Public" | "Private") => {
    onChange({ ...filters, control });
  };

  const handleStateChange = (state: string) => {
    onChange({ ...filters, state });
  };

  const handleSortChange = (sortBy: SortOption) => {
    onChange({ ...filters, sortBy });
  };

  const handleRankFilterChange = (
    rankFilter: "ALL" | "TOP_100" | "TOP_300" | "TOP_500" | "RANKED" | "UNRANKED",
  ) => {
    onChange({ ...filters, rankFilter });
  };

  const handleSearchChange = (searchQuery: string) => {
    onChange({ ...filters, searchQuery });
  };

  const handleReset = () => {
    onChange({
      searchQuery: "",
      degreeType: "ALL",
      control: "ALL",
      state: "ALL",
      discipline: "ALL",
      carnegieTier: "ALL",
      sortBy: "QS_ASC",
      rankFilter: "ALL",
    });
  };

  const hasActiveFilters =
    filters.searchQuery !== "" ||
    filters.degreeType !== "ALL" ||
    filters.control !== "ALL" ||
    filters.state !== "ALL" ||
    filters.rankFilter !== "ALL" ||
    filters.sortBy !== "QS_ASC";

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-6 space-y-4">
      {/* Top Search & Sorting Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by university name, city, state, or engineering school..."
            className="w-full pl-10 pr-4 py-2 bg-muted/60 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/80 border border-border rounded-lg text-xs text-foreground">
            <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground font-medium hidden md:inline">Sort:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              aria-label="Sort universities"
              className="bg-transparent text-foreground focus:outline-none font-medium cursor-pointer"
            >
              <option value="QS_ASC" className="bg-card">
                QS Rank: High to Low (#1 first)
              </option>
              <option value="QS_DESC" className="bg-card">
                QS Rank: Low to High (Unranked first)
              </option>
              <option value="NAME_ASC" className="bg-card">
                Name: A to Z
              </option>
              <option value="NAME_DESC" className="bg-card">
                Name: Z to A
              </option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-muted hover:bg-accent text-muted-foreground hover:text-foreground text-xs font-medium border border-border rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Rows */}
      <div className="space-y-3 pt-2 border-t border-border/60 text-xs">
        {/* Row 1: QS Ranking Range Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-muted-foreground font-medium mr-1">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span>QS World Rank:</span>
          </div>

          <div className="inline-flex p-1 bg-muted/80 rounded-lg border border-border flex-wrap gap-0.5">
            {RANK_FILTERS.map((rf) => {
              const isActive = filters.rankFilter === rf.id;
              return (
                <button
                  key={rf.id}
                  type="button"
                  onClick={() => handleRankFilterChange(rf.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {rf.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Degrees, Type, and State */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Program:</span>
          </div>

          {/* Degree Segmented Buttons */}
          <div className="inline-flex p-1 bg-muted/80 rounded-lg border border-border">
            {(["ALL", "Both", "MSc Only", "PhD Only"] as const).map((type) => {
              const isActive = filters.degreeType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleDegreeChange(type)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type === "ALL" ? "All Degrees" : type}
                </button>
              );
            })}
          </div>

          {/* Control Filter */}
          <div className="inline-flex p-1 bg-muted/80 rounded-lg border border-border">
            {(["ALL", "Public", "Private"] as const).map((ctrl) => {
              const isActive = filters.control === ctrl;
              return (
                <button
                  key={ctrl}
                  type="button"
                  onClick={() => handleControlChange(ctrl)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-accent text-accent-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {ctrl === "ALL" ? "All Types" : ctrl}
                </button>
              );
            })}
          </div>

          {/* State Dropdown */}
          <select
            value={filters.state}
            onChange={(e) => handleStateChange(e.target.value)}
            aria-label="Filter by state"
            className="px-3 py-1.5 bg-muted/80 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All States ({availableStates.length})</option>
            {availableStates.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <div className="ml-auto text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{totalResults}</span> programs
          </div>
        </div>
      </div>
    </div>
  );
};
