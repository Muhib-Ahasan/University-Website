import { Award, BookOpen, Building, CheckCircle2, GraduationCap, MapPin } from "lucide-react";
import type { FC } from "react";
import type { UniversityRecord } from "../types/university";

interface StatsSummaryProps {
  universities: UniversityRecord[];
}

export const StatsSummary: FC<StatsSummaryProps> = ({ universities }) => {
  const total = universities.length;
  const bothCount = universities.filter((u) => u.degreeType === "Both").length;
  const mscCount = universities.filter((u) => u.degreeType === "MSc Only").length;
  const phdCount = universities.filter((u) => u.degreeType === "PhD Only").length;
  const publicCount = universities.filter((u) => u.control === "Public").length;
  const uniqueStates = new Set(universities.map((u) => u.location.state).filter(Boolean)).size;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      <div className="bg-card border border-border rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
          <span>Total Universities</span>
          <GraduationCap className="h-4 w-4 text-primary" />
        </div>
        <div className="mt-2 text-2xl font-bold text-foreground">{total}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">Engineering verified</div>
      </div>

      <div className="bg-card border border-border rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
          <span>Both (MSc & PhD)</span>
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="mt-2 text-2xl font-bold text-emerald-400">{bothCount}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">Dual graduate paths</div>
      </div>

      <div className="bg-card border border-border rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
          <span>MSc Only</span>
          <BookOpen className="h-4 w-4 text-amber-400" />
        </div>
        <div className="mt-2 text-2xl font-bold text-amber-400">{mscCount}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">Masters & polytechnics</div>
      </div>

      <div className="bg-card border border-border rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
          <span>PhD Only</span>
          <Award className="h-4 w-4 text-purple-400" />
        </div>
        <div className="mt-2 text-2xl font-bold text-purple-400">{phdCount}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">Doctoral focus</div>
      </div>

      <div className="bg-card border border-border rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
          <span>Public / Private</span>
          <Building className="h-4 w-4 text-sky-400" />
        </div>
        <div className="mt-2 text-lg font-bold text-foreground">
          {publicCount}{" "}
          <span className="text-xs text-muted-foreground font-normal">/ {total - publicCount}</span>
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">
          {total > 0 ? `${Math.round((publicCount / total) * 100)}% Public` : "0%"}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
          <span>States Covered</span>
          <MapPin className="h-4 w-4 text-rose-400" />
        </div>
        <div className="mt-2 text-2xl font-bold text-rose-400">{uniqueStates}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">US States & Territories</div>
      </div>
    </div>
  );
};
