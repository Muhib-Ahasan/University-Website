import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { UniversityRecord } from "../types/university";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function exportToJson(data: unknown, filename: string): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function exportToCsv(universities: UniversityRecord[], filename: string): void {
  const headers = [
    "Name",
    "Engineering School",
    "City",
    "State",
    "Control",
    "Carnegie Classification",
    "Degree Type",
    "Degree Levels",
    "Disciplines",
    "Website",
    "Wikipedia URL",
  ];

  const rows = universities.map((u) => [
    `"${u.name.replace(/"/g, '""')}"`,
    `"${(u.engineeringSchool || "").replace(/"/g, '""')}"`,
    `"${u.location.city.replace(/"/g, '""')}"`,
    `"${u.location.state}"`,
    `"${u.control}"`,
    `"${(u.carnegieClassification || "").replace(/"/g, '""')}"`,
    `"${u.degreeType}"`,
    `"${u.degreeLevels.join(", ")}"`,
    `"${u.engineeringDisciplines.join(", ").replace(/"/g, '""')}"`,
    `"${u.website}"`,
    `"${u.wikipediaUrl}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
