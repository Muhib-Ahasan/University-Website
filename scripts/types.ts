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

export interface FlareSolverrRequest {
  cmd: "request.get" | "request.post" | "sessions.create" | "sessions.destroy";
  url?: string;
  session?: string;
  maxTimeout?: number;
  postData?: string;
}

export interface FlareSolverrResponse {
  status: "ok" | "error";
  message: string;
  startTimestamp?: number;
  endTimestamp?: number;
  version?: string;
  solution?: {
    url: string;
    status: number;
    headers: Record<string, string>;
    response: string;
    cookies: Array<{ name: string; value: string }>;
    userAgent: string;
  };
}
