import * as cheerio from "cheerio";
import type { FlareSolverrClient } from "./flaresolverr-client";

export interface RawUniversityItem {
  name: string;
  wikiTitle: string;
  wikiUrl: string;
  city: string;
  state: string;
  control: "Public" | "Private";
  carnegieClass: string;
}

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

export class WikiFetcher {
  private client: FlareSolverrClient;

  constructor(client: FlareSolverrClient) {
    this.client = client;
  }

  public getStateFullName(stateCodeOrName: string): string {
    const trimmed = stateCodeOrName.trim();
    const upper = trimmed.toUpperCase();
    if (STATE_NAMES[upper]) {
      return STATE_NAMES[upper];
    }
    return trimmed;
  }

  public async fetchResearchUniversities(): Promise<RawUniversityItem[]> {
    const url = "https://en.wikipedia.org/wiki/List_of_research_universities_in_the_United_States";
    const html = await this.client.get(url);
    const $ = cheerio.load(html);
    const results: RawUniversityItem[] = [];

    $("table.wikitable").each((index, table) => {
      const caption = $(table).find("caption").text().toLowerCase();

      let carnegieClass = "Doctoral University";
      let isR1 = false;
      let isR2 = false;

      if (caption.includes("very high") || index === 0) {
        carnegieClass = "R1: Very High Research Activity";
        isR1 = true;
      } else if (caption.includes("high research") || index === 1) {
        carnegieClass = "R2: High Research Activity";
        isR2 = true;
      } else {
        return;
      }

      $(table)
        .find("tr")
        .each((_, row) => {
          const cells = $(row).find("td");
          if (cells.length < 4) return;

          const firstCell = $(cells[0]);
          const link = firstCell.find("a").first();
          if (!link.length) return;

          const name = link.text().trim();
          const href = link.attr("href") || "";
          if (!href.includes("/wiki/")) return;

          const wikiTitle = href.split("/wiki/")[1]?.split("#")[0] || "";
          const wikiUrl = href.startsWith("http") ? href : `https://en.wikipedia.org${href}`;

          let city = "";
          let state = "";
          let controlRaw = "";

          if (isR1) {
            // Table 0: Name, City, State, Control
            city = $(cells[1])
              .text()
              .replace(/\[.*?\]/g, "")
              .trim();
            state = $(cells[2])
              .text()
              .replace(/\[.*?\]/g, "")
              .trim();
            controlRaw = $(cells[3]).text().toLowerCase();
          } else if (isR2) {
            // Table 1: Institution, Control, City, State
            controlRaw = $(cells[1]).text().toLowerCase();
            city = $(cells[2])
              .text()
              .replace(/\[.*?\]/g, "")
              .trim();
            state = $(cells[3])
              .text()
              .replace(/\[.*?\]/g, "")
              .trim();
          }

          const control: "Public" | "Private" = controlRaw.includes("public")
            ? "Public"
            : "Private";

          results.push({
            name,
            wikiTitle,
            wikiUrl,
            city,
            state,
            control,
            carnegieClass,
          });
        });
    });

    return results;
  }

  public async fetchTechnologicalUniversities(): Promise<RawUniversityItem[]> {
    const url = "https://en.wikipedia.org/wiki/List_of_United_States_technological_universities";
    const html = await this.client.get(url);
    const $ = cheerio.load(html);
    const results: RawUniversityItem[] = [];

    $("table.wikitable tr").each((_, row) => {
      const cells = $(row).find("td");
      if (cells.length < 5) return;

      const link = $(cells[0]).find("a").first();
      if (!link.length) return;

      const name = link.text().trim();
      const href = link.attr("href") || "";
      if (!href.includes("/wiki/")) return;

      const wikiTitle = href.split("/wiki/")[1]?.split("#")[0] || "";
      const wikiUrl = href.startsWith("http") ? href : `https://en.wikipedia.org${href}`;

      const locationText = $(cells[1]).text().trim();
      const locParts = locationText.split(",").map((s) => s.trim());
      const city = locParts[0] || "";
      const state = locParts[1] || "";

      const controlRaw = $(cells[3]).text().toLowerCase();
      const control: "Public" | "Private" = controlRaw.includes("public") ? "Public" : "Private";

      const carnegie = $(cells[cells.length - 1])
        .text()
        .trim();

      results.push({
        name,
        wikiTitle,
        wikiUrl,
        city,
        state,
        control,
        carnegieClass: carnegie || "Technological University",
      });
    });

    return results;
  }
}
