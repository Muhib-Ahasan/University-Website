import { ExternalLink, Globe, MapPin, School, Trophy } from "lucide-react";
import type { FC } from "react";
import type { UniversityRecord } from "../types/university";

interface UniversityCardProps {
  university: UniversityRecord;
  onSelect: (university: UniversityRecord) => void;
}

export const UniversityCard: FC<UniversityCardProps> = ({ university, onSelect }) => {
  const getDegreeBadge = () => {
    switch (university.degreeType) {
      case "Both":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            MSc & PhD
          </span>
        );
      case "MSc Only":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            MSc Only
          </span>
        );
      case "PhD Only":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            PhD Only
          </span>
        );
    }
  };

  const getQsBadge = () => {
    if (!university.qsRank) return null;

    if (university.qsRank <= 50) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm shadow-amber-400/10">
          <Trophy className="h-3 w-3 text-amber-400" />
          <span>QS #{university.qsRank}</span>
        </span>
      );
    }

    if (university.qsRank <= 250) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <span>QS #{university.qsRank}</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border">
        QS #{university.qsRank}
      </span>
    );
  };

  return (
    <div className="group bg-card border border-border hover:border-primary/50 rounded-xl p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 w-full">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {getDegreeBadge()}
            {getQsBadge()}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border">
              {university.control}
            </span>
          </div>

          <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[110px]">
            {university.carnegieClassification?.split(":")[0] || "University"}
          </span>
        </div>

        {/* University Name */}
        <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors line-clamp-1">
          {university.name}
        </h3>

        {/* Engineering School Name */}
        {university.engineeringSchool ? (
          <div className="flex items-center gap-1.5 text-xs text-primary/90 font-medium mt-1">
            <School className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{university.engineeringSchool}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <School className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">College of Engineering</span>
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
          <span>
            {university.location.city}, {university.location.state}
          </span>
        </div>

        {/* Description Snippet */}
        <p className="text-xs text-muted-foreground/90 mt-2.5 line-clamp-2 leading-relaxed">
          {university.description}
        </p>

        {/* Disciplines Chips */}
        <div className="flex flex-wrap gap-1 mt-3">
          {university.engineeringDisciplines.slice(0, 3).map((disc) => (
            <span
              key={disc}
              className="text-[10px] px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground border border-border/50 truncate max-w-[150px]"
            >
              {disc.split("&")[0].trim()}
            </span>
          ))}
          {university.engineeringDisciplines.length > 3 && (
            <span className="text-[10px] px-1 py-0.5 rounded bg-muted/40 text-muted-foreground">
              +{university.engineeringDisciplines.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onSelect(university)}
          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
        >
          View Full Details
        </button>

        <div className="flex items-center gap-1.5">
          <a
            href={university.website}
            target="_blank"
            rel="noopener noreferrer"
            title={`Visit Official Website: ${university.website}`}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Globe className="h-3.5 w-3.5 text-primary" />
          </a>
          <a
            href={university.wikipediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Wikipedia Article"
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
