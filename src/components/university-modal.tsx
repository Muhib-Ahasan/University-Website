import {
  BookOpen,
  Check,
  ExternalLink,
  Globe,
  GraduationCap,
  MapPin,
  School,
  X,
} from "lucide-react";
import { type FC, useEffect } from "react";
import type { UniversityRecord } from "../types/university";

interface UniversityModalProps {
  university: UniversityRecord | null;
  onClose: () => void;
}

export const UniversityModal: FC<UniversityModalProps> = ({ university, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!university) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="pr-8">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                university.degreeType === "Both"
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : university.degreeType === "MSc Only"
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    : "bg-purple-500/15 text-purple-400 border-purple-500/30"
              }`}
            >
              {university.degreeType === "Both"
                ? "Offers Both MSc & PhD in Engineering"
                : university.degreeType === "MSc Only"
                  ? "MSc Degree Only (No PhD)"
                  : "PhD Degree Only"}
            </span>

            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
              {university.control} Institution
            </span>

            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
              {university.carnegieClassification || "Doctoral University"}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-foreground tracking-tight">{university.name}</h2>

          <div className="flex items-center gap-2 text-sm text-primary font-medium mt-1">
            <School className="h-4 w-4 shrink-0" />
            <span>{university.engineeringSchool || "School / College of Engineering"}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span>
              {university.location.city}, {university.location.state} (
              {university.location.stateName})
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mt-5 pt-4 border-t border-border">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Overview
          </h4>
          <p className="text-sm text-foreground/90 leading-relaxed">{university.description}</p>
        </div>

        {/* Graduate Programs Offered */}
        <div className="mt-5 pt-4 border-t border-border">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Engineering Degree Programs
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div
              className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                university.degreeLevels.includes("MSc")
                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
                  : "bg-muted/40 border-border text-muted-foreground opacity-60"
              }`}
            >
              <GraduationCap className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold">
                  {university.degreeLevels.includes("MSc")
                    ? "Master of Science (MSc / M.S.)"
                    : "No Master's"}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Graduate engineering coursework, thesis & non-thesis tracks
                </div>
              </div>
            </div>

            <div
              className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                university.degreeLevels.includes("PhD")
                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
                  : "bg-muted/40 border-border text-muted-foreground opacity-60"
              }`}
            >
              <BookOpen className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold">
                  {university.degreeLevels.includes("PhD")
                    ? "Doctor of Philosophy (PhD)"
                    : "No PhD Track"}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Doctoral research, dissertation & faculty fellowship
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Engineering Disciplines */}
        <div className="mt-5 pt-4 border-t border-border">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Key Engineering Disciplines
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {university.engineeringDisciplines.map((disc) => (
              <span
                key={disc}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-muted/80 text-foreground border border-border"
              >
                <Check className="h-3 w-3 text-primary" />
                <span>{disc}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Links & Actions */}
        <div className="mt-6 pt-5 border-t border-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={university.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-colors"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Official Website</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            <a
              href={university.wikipediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-muted hover:bg-accent text-foreground text-xs font-medium border border-border transition-colors"
            >
              <span>Wikipedia Entry</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
