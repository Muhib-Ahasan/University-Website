import { Download, FileSpreadsheet, GraduationCap, Server } from "lucide-react";
import type { FC } from "react";
import { toast } from "sonner";
import type { UniversityRecord } from "../types/university";
import { exportToCsv, exportToJson } from "../utils/helpers";

interface HeaderProps {
  totalCount: number;
  filteredCount: number;
  filteredData: UniversityRecord[];
}

export const Header: FC<HeaderProps> = ({ totalCount, filteredCount, filteredData }) => {
  const handleExportJson = () => {
    exportToJson(filteredData, "usa-engineering-universities.json");
    toast.success(`Exported ${filteredData.length} universities to JSON`);
  };

  const handleExportCsv = () => {
    exportToCsv(filteredData, "usa-engineering-universities.csv");
    toast.success(`Exported ${filteredData.length} universities to CSV`);
  };

  return (
    <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-30 px-4 py-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                USA Engineering Graduate Guide
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                MSc & PhD Programs
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Showing {filteredCount} of {totalCount} USA institutions offering MSc & PhD degrees
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-xs text-muted-foreground border border-border">
            <Server className="h-3.5 w-3.5 text-emerald-400" />
            <span>FlareSolverr Ready</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-accent text-foreground text-xs font-medium border border-border transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>JSON ({filteredCount})</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
