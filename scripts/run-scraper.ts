import * as fs from "node:fs";
import * as path from "node:path";
import {
  classifyDegrees,
  detectDisciplines,
  isNonEngineeringInstitution,
} from "./degree-classifier";
import { FlareSolverrClient } from "./flaresolverr-client";
import type { UniversityRecord } from "./types";
import { type RawUniversityItem, WikiFetcher } from "./wiki-fetcher";

// Known universities with MSc-only engineering graduate programs (no engineering PhD)
const KNOWN_MSC_ONLY_UNIVERSITIES = new Set([
  "California Polytechnic State University, San Luis Obispo",
  "California State Polytechnic University, Pomona",
  "California State Polytechnic University, Humboldt",
  "Wentworth Institute of Technology",
  "Milwaukee School of Engineering",
  "Rose-Hulman Institute of Technology",
  "SUNY Polytechnic Institute",
  "Lawrence Technological University",
  "Kettering University",
  "Southern Illinois University Edwardsville",
  "Western Carolina University",
  "Grand Valley State University",
  "San Jose State University",
  "California State University, Long Beach",
  "California State University, Northridge",
  "California State University, Fullerton",
  "Rowan University",
]);

// Known R1/R2 institutions without standard graduate engineering colleges
const KNOWN_NON_ENGINEERING = new Set([
  "American University",
  "Baylor College of Medicine",
  "Brandeis University",
  "Clark University",
  "Fordham University",
  "Georgetown University",
  "Georgia State University",
  "Howard University", // Howard has engineering, keep!
  "Indiana University Bloomington", // Has Informatics & Intelligent Systems, but no classic engineering college
  "Medical University of South Carolina",
  "Mount Sinai",
  "Rockefeller University",
  "Teachers College at Columbia University",
  "University of California, San Francisco",
  "University of Maryland, Baltimore",
  "University of Massachusetts Chan Medical School",
  "University of North Texas Health Science Center",
  "University of Texas Southwestern Medical Center",
  "University of Texas Medical Branch",
  "University of Texas Health Science Center at Houston",
  "University of Texas Health Science Center at San Antonio",
  "Wake Forest University",
  "Yeshiva University",
]);

// Common engineering school names mapped by university name
const KNOWN_ENGINEERING_SCHOOLS: Record<string, string> = {
  "Massachusetts Institute of Technology": "MIT School of Engineering",
  "Stanford University": "Stanford School of Engineering",
  "University of California, Berkeley": "UC Berkeley College of Engineering",
  "Carnegie Mellon University": "Carnegie Institute of Technology (CMU Engineering)",
  "Georgia Institute of Technology": "Georgia Tech College of Engineering",
  "Purdue University": "Purdue College of Engineering",
  "University of Illinois Urbana-Champaign": "The Grainger College of Engineering",
  "University of Michigan": "Michigan Engineering",
  "University of Texas at Austin": "Cockrell School of Engineering",
  "California Institute of Technology": "Caltech Division of Engineering and Applied Science",
  "Cornell University": "Cornell College of Engineering",
  "Columbia University": "Fu Foundation School of Engineering and Applied Science",
  "Johns Hopkins University": "Whiting School of Engineering",
  "Northwestern University": "Robert R. McCormick School of Engineering and Applied Science",
  "University of Southern California": "USC Viterbi School of Engineering",
  "University of California, Los Angeles": "UCLA Samueli School of Engineering",
  "University of California, San Diego": "Jacobs School of Engineering",
  "Harvard University": "Harvard John A. Paulson School of Engineering and Applied Sciences",
  "Princeton University": "Princeton School of Engineering and Applied Science",
  "University of Pennsylvania": "Penn Engineering (School of Engineering and Applied Science)",
  "Duke University": "Pratt School of Engineering",
  "Texas A&M University": "Texas A&M College of Engineering",
  "Virginia Tech": "Virginia Tech College of Engineering",
  "Ohio State University": "Ohio State College of Engineering",
  "University of Washington": "UW College of Engineering",
  "University of Wisconsin–Madison": "UW-Madison College of Engineering",
  "Penn State University": "Penn State College of Engineering",
  "University of Florida": "Herbert Wertheim College of Engineering",
  "University of Maryland, College Park": "A. James Clark School of Engineering",
  "North Carolina State University": "NC State College of Engineering",
  "Rice University": "George R. Brown School of Engineering",
  "University of Virginia": "UVA School of Engineering and Applied Science",
  "University of Colorado Boulder": "CU Boulder College of Engineering and Applied Science",
  "Arizona State University": "Ira A. Fulton Schools of Engineering",
  "Case Western Reserve University": "Case School of Engineering",
  "University of California, Irvine": "The Henry Samueli School of Engineering",
  "University of California, Davis": "UC Davis College of Engineering",
  "University of California, Santa Barbara": "UCSB College of Engineering",
  "University of California, Riverside": "Bourns College of Engineering",
  "University of California, Santa Cruz": "Baskin School of Engineering",
  "New York University": "NYU Tandon School of Engineering",
  "Northeastern University": "Northeastern College of Engineering",
  "Boston University": "BU College of Engineering",
  "Rensselaer Polytechnic Institute": "RPI School of Engineering",
  "Stevens Institute of Technology": "Charles V. Schaefer, Jr. School of Engineering and Science",
  "Worcester Polytechnic Institute": "WPI School of Engineering",
  "Rochester Institute of Technology": "Kate Gleason College of Engineering",
  "Illinois Institute of Technology": "Armour College of Engineering",
  "Colorado School of Mines": "Mines College of Engineering and Computational Sciences",
  "Dartmouth College": "Thayer School of Engineering",
  "Brown University": "Brown School of Engineering",
  "Yale University": "Yale School of Engineering & Applied Science",
  "University of Notre Dame": "Notre Dame College of Engineering",
  "Vanderbilt University": "Vanderbilt School of Engineering",
  "Washington University in St. Louis": "McKeevey School of Engineering",
  "University of Pittsburgh": "Swanson School of Engineering",
  "University of Utah": "John and Marcia Price College of Engineering",
  "Iowa State University": "Iowa State College of Engineering",
  "Michigan State University": "MSU College of Engineering",
  "Auburn University": "Samuel Ginn College of Engineering",
  "Clemson University": "Clemson College of Engineering, Computing and Applied Sciences",
  "University of Tennessee": "Tickle College of Engineering",
  "University of Cincinnati": "UC College of Engineering and Applied Science",
  "University of Houston": "Cullen College of Engineering",
  "University of Texas at Dallas": "Erik Jonsson School of Engineering and Computer Science",
  "University of Texas at Arlington": "UTA College of Engineering",
  "Drexel University": "Drexel College of Engineering",
  "George Mason University": "Volgenau School of Engineering",
  "University of Central Florida": "UCF College of Engineering and Computer Science",
  "University of South Florida": "USF College of Engineering",
  "Florida State University": "FAMU-FSU College of Engineering",
  "Florida International University": "FIU College of Engineering and Computing",
  "California Polytechnic State University, San Luis Obispo": "Cal Poly College of Engineering",
  "California State Polytechnic University, Pomona": "Cal Poly Pomona College of Engineering",
  "San Jose State University": "Charles W. Davidson College of Engineering",
  "San Diego State University": "SDSU College of Engineering",
  "Rowan University": "Henry M. Rowan College of Engineering",
  "Lehigh University": "P.C. Rossin College of Engineering and Applied Science",
  "Tufts University": "Tufts School of Engineering",
  "Villanova University": "Villanova College of Engineering",
  "Santa Clara University": "Santa Clara School of Engineering",
  "Clarkson University": "Clarkson Wallace H. Coulter School of Engineering",
  "Michigan Technological University": "Michigan Tech College of Engineering",
  "New Jersey Institute of Technology": "Newark College of Engineering (NJIT)",
  "Oregon State University": "OSU College of Engineering",
  "University of Arizona": "UArizona College of Engineering",
  "University of Delaware": "UD College of Engineering",
  "University of Iowa": "Iowa College of Engineering",
  "University of Kansas": "KU School of Engineering",
  "University of Kentucky": "UK Pigman College of Engineering",
  "University of Louisville": "J.B. Speed School of Engineering",
  "University of Massachusetts Amherst": "UMass Amherst College of Engineering",
  "University of Minnesota": "UMN College of Science and Engineering",
  "University of Missouri": "Mizzou College of Engineering",
  "Missouri University of Science and Technology":
    "Missouri S&T College of Engineering and Computing",
  "University of Nebraska–Lincoln": "UNL College of Engineering",
  "University of New Mexico": "UNM School of Engineering",
  "University of Oklahoma": "Gallogly College of Engineering",
  "University of South Carolina": "Molinaroli College of Engineering and Computing",
  "University of Texas at El Paso": "UTEP College of Engineering",
  "University of Texas at San Antonio": "UTSA Klesse College of Engineering and Integrated Design",
  "Virginia Commonwealth University": "VCU College of Engineering",
  "Washington State University": "Voiland College of Engineering and Architecture",
  "West Virginia University": "Benjamin M. Statler College of Engineering and Mineral Resources",
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function cleanWikiText(text: string): string {
  return text
    .replace(/\[\d+\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

interface WikiSummaryResponse {
  title?: string;
  extract?: string;
  description?: string;
  content_urls?: {
    desktop?: { page?: string };
  };
}

async function fetchWikiSummary(
  client: FlareSolverrClient,
  title: string,
  forceFlare = false,
): Promise<WikiSummaryResponse | null> {
  const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;

  try {
    if (forceFlare) {
      const html = await client.fetchWithFlareSolverr(apiUrl, 20000);
      return JSON.parse(html) as WikiSummaryResponse;
    }

    const res = await fetch(apiUrl, {
      headers: {
        "User-Agent": "UniversityGuideBot/1.0 (academic-research)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Status ${res.status}`);
    }

    return (await res.json()) as WikiSummaryResponse;
  } catch {
    return null;
  }
}

async function main() {
  console.info("--------------------------------------------------");
  console.info("Starting Wikipedia USA Engineering University Scraper");
  console.info("--------------------------------------------------");

  const args = process.argv.slice(2);
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number.parseInt(limitArg.split("=")[1], 10) : undefined;
  const forceFlare = args.includes("--force-flare");

  const client = new FlareSolverrClient();
  const health = await client.checkHealth();
  console.info(
    `FlareSolverr: ${health.available ? `Connected (${health.version})` : "Offline (using direct HTTP)"}`,
  );
  if (forceFlare) {
    console.info("Mode: Forcing all requests through FlareSolverr proxy");
  }

  const fetcher = new WikiFetcher(client);

  console.info("Fetching research universities list from Wikipedia...");
  const researchItems = await fetcher.fetchResearchUniversities();
  console.info(`Found ${researchItems.length} institutions in R1/R2 tables.`);

  console.info("Fetching technological universities list from Wikipedia...");
  let techItems: RawUniversityItem[] = [];
  try {
    techItems = await fetcher.fetchTechnologicalUniversities();
    console.info(`Found ${techItems.length} technological institutions.`);
  } catch (_err) {
    console.warn("Could not fetch tech universities table, using research list.");
  }

  // Combine and deduplicate
  const combinedMap = new Map<string, RawUniversityItem>();
  for (const item of [...researchItems, ...techItems]) {
    const key = item.name.toLowerCase().trim();
    if (!combinedMap.has(key)) {
      combinedMap.set(key, item);
    }
  }

  const rawList = Array.from(combinedMap.values());
  console.info(`Total unique universities to process: ${rawList.length}`);

  const candidatesToProcess = limit ? rawList.slice(0, limit) : rawList;
  console.info(`Processing ${candidatesToProcess.length} universities...\n`);

  const results: UniversityRecord[] = [];
  let processed = 0;

  for (const item of candidatesToProcess) {
    processed++;
    process.stdout.write(
      `[${processed}/${candidatesToProcess.length}] Processing: ${item.name}... `,
    );

    // Filter out medical schools or known non-engineering institutions
    if (KNOWN_NON_ENGINEERING.has(item.name) || isNonEngineeringInstitution(item.name)) {
      console.info("Skipped (Non-engineering institution)");
      continue;
    }

    // Check if known MSc only
    const isMScOnly = KNOWN_MSC_ONLY_UNIVERSITIES.has(item.name);

    // Fetch summary via Wikipedia API
    const summary = await fetchWikiSummary(client, item.wikiTitle, forceFlare);
    const extract = summary?.extract ? cleanWikiText(summary.extract) : "";
    const description = summary?.description || "";
    const combinedText = `${item.name} ${description} ${extract}`;

    // Verify engineering degree offerings
    const degreeClassification = classifyDegrees(item.carnegieClass, combinedText, isMScOnly);

    // Engineering school name detection
    const engineeringSchool =
      KNOWN_ENGINEERING_SCHOOLS[item.name] ||
      (combinedText.includes("School of Engineering")
        ? `${item.name} School of Engineering`
        : combinedText.includes("College of Engineering")
          ? `${item.name} College of Engineering`
          : undefined);

    // Identify departments
    const disciplines = detectDisciplines(combinedText);

    // Format website
    const domainGuess = generateSlug(item.name).replace(/-university|-institute|-college/g, "");
    const website = `https://www.${domainGuess}.edu`;

    const record: UniversityRecord = {
      id: generateSlug(item.name),
      name: item.name,
      engineeringSchool,
      location: {
        city: item.city || "United States",
        state: item.state || "US",
        stateName: fetcher.getStateFullName(item.state || ""),
      },
      control: item.control,
      carnegieClassification: item.carnegieClass,
      degreeLevels: degreeClassification.levels,
      degreeType: degreeClassification.type,
      engineeringDisciplines: disciplines,
      description:
        extract ||
        `${item.name} is a leading institution in higher education offering graduate engineering programs.`,
      website,
      engineeringWebsite: `${website}/engineering`,
      wikipediaUrl: item.wikiUrl,
    };

    results.push(record);
    console.info(`OK -> ${record.degreeType} [${record.degreeLevels.join(", ")}]`);

    // Polite rate limit delay
    await new Promise((resolve) => setTimeout(resolve, 80));
  }

  console.info("\n--------------------------------------------------");
  console.info(`Scraping Complete! Total Engineering Universities: ${results.length}`);
  const bothCount = results.filter((r) => r.degreeType === "Both").length;
  const mscCount = results.filter((r) => r.degreeType === "MSc Only").length;
  const phdCount = results.filter((r) => r.degreeType === "PhD Only").length;
  console.info(`Both (MSc & PhD): ${bothCount}`);
  console.info(`MSc Only: ${mscCount}`);
  console.info(`PhD Only: ${phdCount}`);
  console.info("--------------------------------------------------");

  // Write output files
  const dataDir = path.resolve(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const outputPath = path.join(dataDir, "universities.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf-8");
  console.info(`Saved data to: ${outputPath}`);

  // Also write to src/data for webview
  const srcDataDir = path.resolve(process.cwd(), "src", "data");
  if (!fs.existsSync(srcDataDir)) {
    fs.mkdirSync(srcDataDir, { recursive: true });
  }
  const srcOutputPath = path.join(srcDataDir, "universities.json");
  fs.writeFileSync(srcOutputPath, JSON.stringify(results, null, 2), "utf-8");
  console.info(`Synced data to webview: ${srcOutputPath}`);
}

main().catch((err) => {
  console.error("Scraper execution error:", err);
  process.exit(1);
});
