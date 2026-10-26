export type DegreeType = "Both" | "MSc Only" | "PhD Only";

export type DegreeLevel = "MSc" | "PhD";

export interface UniversityRecord {
  id: string;
  name: string;
  engineeringSchool?: string;
  location: {
    city: string;
    state: string;
    stateName: string;
  };
  control: "Public" | "Private";
  carnegieClassification?: string;
  degreeLevels: DegreeLevel[];
  degreeType: DegreeType;
  engineeringDisciplines: string[];
  description: string;
  website: string;
  engineeringWebsite?: string;
  wikipediaUrl: string;
  established?: number;
  campusSetting?: string;
  qsRank?: number | null;
}

export type SortOption = "QS_ASC" | "QS_DESC" | "NAME_ASC" | "NAME_DESC";

export interface FilterState {
  searchQuery: string;
  degreeType: "ALL" | DegreeType;
  control: "ALL" | "Public" | "Private";
  state: string;
  discipline: string;
  carnegieTier: "ALL" | "R1" | "R2" | "TECH";
  sortBy: SortOption;
  rankFilter: "ALL" | "TOP_100" | "TOP_300" | "TOP_500" | "RANKED" | "UNRANKED";
}
