import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import type { FC } from "react";
import type { DegreeType, FilterState } from "../types/university";

interface FilterBarProps {
  filters: FilterState;
  onChange: (updated: FilterState) => void;
  availableStates: string[];
  totalResults: number;
}

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
    });
  };

  const hasActiveFilters =
    filters.searchQuery !== "" ||
    filters.degreeType !== "ALL" ||
    filters.control !== "ALL" ||
    filters.state !== "ALL" ||
    filters.discipline !== "ALL" ||
    filters.carnegieTier !== "ALL";

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-6 space-y-4">
      {/* Top Search Input */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by university name, city, state, or engineering school..."
            className="w-full pl-10 pr-4 py-2 bg-muted/60 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-muted hover:bg-accent text-muted-foreground hover:text-foreground text-xs font-medium border border-border rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-border/60 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Degree Program:</span>
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
  );
};
