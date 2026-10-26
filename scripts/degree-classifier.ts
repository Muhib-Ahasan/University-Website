import type { DegreeLevel, DegreeType } from "./types";

export interface ClassificationResult {
  hasEngineering: boolean;
  engineeringSchool?: string;
  degreeLevels: DegreeLevel[];
  degreeType: DegreeType;
  engineeringDisciplines: string[];
  description: string;
  website: string;
  engineeringWebsite?: string;
}

const EXCLUDED_KEYWORDS = [
  "seminary",
  "theological",
  "music",
  "art and design",
  "law school",
  "medical center",
  "medical school",
  "medical university",
  "medical college",
  "health science",
  "cancer center",
  "optometry",
  "pharmacy school",
  "nursing",
];

export function isNonEngineeringInstitution(name: string): boolean {
  const lower = name.toLowerCase();
  return EXCLUDED_KEYWORDS.some((kw) => lower.includes(kw));
}

export function detectDisciplines(content: string): string[] {
  const lower = content.toLowerCase();
  const found: string[] = [];

  if (lower.includes("computer science") || lower.includes("computing")) {
    found.push("Computer Science & Engineering");
  }
  if (lower.includes("electrical") || lower.includes("electronic")) {
    found.push("Electrical & Computer Engineering");
  }
  if (lower.includes("mechanical engineering")) {
    found.push("Mechanical Engineering");
  }
  if (lower.includes("civil") || lower.includes("environmental engineering")) {
    found.push("Civil & Environmental Engineering");
  }
  if (lower.includes("biomedical") || lower.includes("bioengineering")) {
    found.push("Biomedical Engineering");
  }
  if (lower.includes("chemical engineering")) {
    found.push("Chemical & Biomolecular Engineering");
  }
  if (lower.includes("aerospace") || lower.includes("aeronautic")) {
    found.push("Aerospace Engineering");
  }
  if (lower.includes("materials science") || lower.includes("materials engineering")) {
    found.push("Materials Science & Engineering");
  }
  if (lower.includes("industrial engineering") || lower.includes("systems engineering")) {
    found.push("Industrial & Systems Engineering");
  }
  if (lower.includes("nuclear engineering")) {
    found.push("Nuclear Engineering");
  }
  if (lower.includes("robotics")) {
    found.push("Robotics & Autonomous Systems");
  }

  return found.length > 0
    ? found
    : [
        "Computer Science & Engineering",
        "Electrical & Computer Engineering",
        "Mechanical Engineering",
        "Civil & Environmental Engineering",
      ];
}

export function classifyDegrees(
  carnegieClass: string,
  text: string,
  knownMScOnly = false,
): { levels: DegreeLevel[]; type: DegreeType } {
  const lower = text.toLowerCase();

  // Check if known polytechnic or master's granting institution without doctoral engineering
  if (
    knownMScOnly ||
    carnegieClass.includes("Master's") ||
    carnegieClass.includes("Baccalaureate")
  ) {
    const hasDoctorate =
      lower.includes("ph.d.") ||
      lower.includes("phd") ||
      lower.includes("doctor of philosophy") ||
      lower.includes("doctoral degree");

    if (hasDoctorate && lower.includes("engineering")) {
      return { levels: ["MSc", "PhD"], type: "Both" };
    }
    return { levels: ["MSc"], type: "MSc Only" };
  }

  // Carnegie R1 universities with engineering universally offer both MS and PhD
  if (carnegieClass.includes("R1")) {
    return { levels: ["MSc", "PhD"], type: "Both" };
  }

  // Carnegie R2 or other research universities
  const mentionsPhD =
    lower.includes("ph.d") ||
    lower.includes("phd") ||
    lower.includes("doctoral") ||
    lower.includes("doctor of philosophy");
  const mentionsMaster =
    lower.includes("master") ||
    lower.includes("m.s.") ||
    lower.includes("msc") ||
    lower.includes("m.eng");

  if (mentionsPhD && mentionsMaster) {
    return { levels: ["MSc", "PhD"], type: "Both" };
  }
  if (mentionsPhD && !mentionsMaster) {
    return { levels: ["PhD"], type: "PhD Only" };
  }
  return { levels: ["MSc"], type: "MSc Only" };
}
