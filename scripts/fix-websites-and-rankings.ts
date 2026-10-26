import * as fs from "node:fs";
import * as path from "node:path";
import type { UniversityRecord } from "./types";

// Curated canonical QS 2025/2026 World University Rankings for top US universities
const CANONICAL_QS_RANKS: Record<string, number> = {
  "Massachusetts Institute of Technology": 1,
  "Harvard University": 4,
  "Stanford University": 6,
  "University of California, Berkeley": 10,
  "University of Chicago": 11,
  "University of Pennsylvania": 12,
  "Cornell University": 13,
  "California Institute of Technology": 15,
  "Princeton University": 16,
  "Yale University": 19,
  "Johns Hopkins University": 21,
  "Columbia University in the City of New York": 22,
  "Columbia University": 22,
  "University of California, Los Angeles": 25,
  "University of Michigan-Ann Arbor": 27,
  "University of Michigan": 27,
  "New York University": 36,
  "Northwestern University": 40,
  "Carnegie Mellon University": 43,
  "University of California, San Diego": 47,
  "University of Washington-Seattle Campus": 50,
  "University of Washington": 50,
  "Duke University": 57,
  "The University of Texas at Austin": 58,
  "University of Texas at Austin": 58,
  "University of Illinois Urbana-Champaign": 69,
  "Brown University": 79,
  "Pennsylvania State University-Main Campus": 83,
  "Penn State University": 83,
  "Purdue University-Main Campus": 88,
  "Purdue University": 88,
  "Georgia Institute of Technology-Main Campus": 114,
  "Georgia Institute of Technology": 114,
  "Boston University": 108,
  "University of Wisconsin-Madison": 116,
  "University of Southern California": 125,
  "University of California, Davis": 130,
  "University of North Carolina at Chapel Hill": 132,
  "Michigan State University": 136,
  "Ohio State University-Main Campus": 151,
  "Ohio State University": 151,
  "Rice University": 141,
  "Washington University in St Louis": 154,
  "Texas A&M University-College Station": 154,
  "Texas A&M University": 154,
  "University of California, Santa Barbara": 163,
  "University of Florida": 168,
  "University of Maryland-College Park": 169,
  "University of Maryland, College Park": 169,
  "Arizona State University": 179,
  "Emory University": 196,
  "University of Pittsburgh-Pittsburgh Campus": 222,
  "University of Pittsburgh": 222,
  "University of Rochester": 224,
  "Dartmouth College": 243,
  "Case Western Reserve University": 255,
  "University of Virginia-Main Campus": 260,
  "University of Virginia": 260,
  "Vanderbilt University": 261,
  "University of Colorado Boulder": 264,
  "Rutgers University-New Brunswick": 267,
  "University of California, Irvine": 268,
  "North Carolina State University at Raleigh": 274,
  "North Carolina State University": 274,
  "University of Massachusetts Amherst": 275,
  "Boston College": 282,
  "University of Arizona": 293,
  "University of Miami": 296,
  "University of Notre Dame": 304,
  "Indiana University Bloomington": 313,
  "University of Illinois Chicago": 323,
  "Tufts University": 344,
  "Colorado State University-Fort Collins": 365,
  "University of California, Santa Cruz": 375,
  "Northeastern University": 396,
  "University of Kansas": 401,
  "University of California, Riverside": 404,
  "Rensselaer Polytechnic Institute": 407,
  "University of Utah": 441,
  "Iowa State University": 451,
  "Washington State University": 451,
  "Colorado School of Mines": 461,
  "Florida State University": 461,
  "Illinois Institute of Technology": 469,
  "Oregon State University": 501,
  "University of Connecticut": 501,
  "University of Tennessee-Knoxville": 501,
  "Stevens Institute of Technology": 501,
  "Drexel University": 511,
  "The University of Texas at Dallas": 520,
  "University of Texas at Dallas": 520,
  "Worcester Polytechnic Institute": 546,
  "University of Delaware": 551,
  "University of Nebraska-Lincoln": 551,
  "University of South Florida": 551,
  "University of Central Florida": 571,
  "University of Houston": 601,
  "University of South Carolina-Columbia": 601,
  "University of Cincinnati-Main Campus": 601,
  "University of Cincinnati": 601,
  "University of Kentucky": 651,
  "University of New Mexico-Main Campus": 651,
  "University of Oklahoma-Norman Campus": 651,
  "The University of Texas at Arlington": 701,
  "University of Texas at Arlington": 701,
  "Syracuse University": 751,
  "Auburn University": 801,
  "Clemson University": 801,
  "George Mason University": 801,
  "San Diego State University": 801,
  "Brigham Young University": 1001,
  "California Polytechnic State University, San Luis Obispo": 1201,
  "California State Polytechnic University, Pomona": 1201,
  "Rose–Hulman Institute of Technology": 1201,
};

// Known official domain overrides
const KNOWN_OFFICIAL_WEBSITES: Record<string, string> = {
  "Arizona State University": "https://www.asu.edu",
  "Boston College": "https://www.bc.edu",
  "Boston University": "https://www.bu.edu",
  "Brigham Young University": "https://www.byu.edu",
  "Brown University": "https://www.brown.edu",
  "California Institute of Technology": "https://www.caltech.edu",
  "Carnegie Mellon University": "https://www.cmu.edu",
  "Case Western Reserve University": "https://case.edu",
  "Clemson University": "https://www.clemson.edu",
  "Colorado School of Mines": "https://www.mines.edu",
  "Columbia University in the City of New York": "https://www.columbia.edu",
  "Cornell University": "https://www.cornell.edu",
  "Dartmouth College": "https://home.dartmouth.edu",
  "Drexel University": "https://drexel.edu",
  "Duke University": "https://duke.edu",
  "Georgia Institute of Technology-Main Campus": "https://www.gatech.edu",
  "Georgia Institute of Technology": "https://www.gatech.edu",
  "Harvard University": "https://www.harvard.edu",
  "Johns Hopkins University": "https://www.jhu.edu",
  "Massachusetts Institute of Technology": "https://www.mit.edu",
  "Michigan State University": "https://msu.edu",
  "New York University": "https://www.nyu.edu",
  "Northwestern University": "https://www.northwestern.edu",
  "Ohio State University-Main Campus": "https://www.osu.edu",
  "Pennsylvania State University-Main Campus": "https://www.psu.edu",
  "Princeton University": "https://www.princeton.edu",
  "Purdue University-Main Campus": "https://www.purdue.edu",
  "Purdue University": "https://www.purdue.edu",
  "Rice University": "https://www.rice.edu",
  "Stanford University": "https://www.stanford.edu",
  "The University of Texas at Austin": "https://www.utexas.edu",
  "Tufts University": "https://www.tufts.edu",
  "University of California, Berkeley": "https://www.berkeley.edu",
  "University of California, Davis": "https://www.ucdavis.edu",
  "University of California, Irvine": "https://uci.edu",
  "University of California, Los Angeles": "https://www.ucla.edu",
  "University of California, Riverside": "https://www.ucr.edu",
  "University of California, San Diego": "https://ucsd.edu",
  "University of California, Santa Barbara": "https://www.ucsb.edu",
  "University of California, Santa Cruz": "https://www.ucsc.edu",
  "University of Chicago": "https://www.uchicago.edu",
  "University of Florida": "https://www.ufl.edu",
  "University of Illinois Urbana-Champaign": "https://illinois.edu",
  "University of Michigan-Ann Arbor": "https://umich.edu",
  "University of North Carolina at Chapel Hill": "https://www.unc.edu",
  "University of Notre Dame": "https://www.nd.edu",
  "University of Pennsylvania": "https://www.upenn.edu",
  "University of Pittsburgh-Pittsburgh Campus": "https://www.pitt.edu",
  "University of Southern California": "https://usc.edu",
  "University of Virginia-Main Campus": "https://www.virginia.edu",
  "University of Washington-Seattle Campus": "https://www.washington.edu",
  "University of Wisconsin-Madison": "https://www.wisc.edu",
  "Vanderbilt University": "https://www.vanderbilt.edu",
  "Virginia Polytechnic Institute and State University": "https://www.vt.edu",
  "Washington University in St Louis": "https://wustl.edu",
  "Yale University": "https://www.yale.edu",
  "California Polytechnic State University, San Luis Obispo": "https://www.calpoly.edu",
  "California State Polytechnic University, Pomona": "https://www.cpp.edu",
  "Rose–Hulman Institute of Technology": "https://www.rose-hulman.edu",
  "Wentworth Institute of Technology": "https://wit.edu",
  "Milwaukee School of Engineering": "https://www.msoe.edu",
  "Stevens Institute of Technology": "https://www.stevens.edu",
  "Worcester Polytechnic Institute": "https://www.wpi.edu",
  "Rensselaer Polytechnic Institute": "https://www.rpi.edu",
  "Illinois Institute of Technology": "https://www.iit.edu",
  "Rochester Institute of Technology": "https://www.rit.edu",
  "CUNY Graduate School and University Center": "https://www.gc.cuny.edu",
  "CUNY City College": "https://www.ccny.cuny.edu",
  "East Carolina University": "https://www.ecu.edu",
  "Florida Atlantic University": "https://www.fau.edu",
  "Florida International University": "https://www.fiu.edu",
  "Florida State University": "https://www.fsu.edu",
  "George Mason University": "https://www.gmu.edu",
  "George Washington University": "https://www.gwu.edu",
  "Indiana University Indianapolis": "https://indianapolis.iu.edu",
  "Iowa State University": "https://www.iastate.edu",
  "Kansas State University": "https://www.k-state.edu",
  "Kent State University at Kent": "https://www.kent.edu",
  "Lehigh University": "https://www.lehigh.edu",
  "Louisiana State University and Agricultural & Mechanical College": "https://www.lsu.edu",
  "Loyola University Chicago": "https://www.luc.edu",
  "Michigan Technological University": "https://www.mtu.edu",
  "Mississippi State University": "https://www.msstate.edu",
  "Missouri University of Science and Technology": "https://www.mst.edu",
  "Montana State University": "https://www.montana.edu",
  "New Jersey Institute of Technology": "https://www.njit.edu",
  "New Mexico State University-Main Campus": "https://www.nmsu.edu",
  "North Dakota State University-Main Campus": "https://www.ndsu.edu",
  "Northern Arizona University": "https://nau.edu",
  "Northern Illinois University": "https://www.niu.edu",
  "Oklahoma State University-Main Campus": "https://go.okstate.edu",
  "Old Dominion University": "https://www.odu.edu",
  "Oregon State University": "https://oregonstate.edu",
  "Rowan University": "https://www.rowan.edu",
  "San Diego State University": "https://www.sdsu.edu",
  "San Jose State University": "https://www.sjsu.edu",
  "Santa Clara University": "https://www.scu.edu",
  "South Dakota State University": "https://www.sdstate.edu",
  "Southern Illinois University-Carbondale": "https://siu.edu",
  "Southern Methodist University": "https://www.smu.edu",
  "SUNY at Albany": "https://www.albany.edu",
  "Binghamton University": "https://www.binghamton.edu",
  "University at Buffalo": "https://www.buffalo.edu",
  "Stony Brook University": "https://www.stonybrook.edu",
  "State University of New York Polytechnic Institute": "https://sunypoly.edu",
  "Temple University": "https://www.temple.edu",
  "Tennessee State University": "https://www.tnstate.edu",
  "Tennessee Technological University": "https://www.tntech.edu",
  "Texas Tech University": "https://www.ttu.edu",
  "The University of Alabama": "https://www.ua.edu",
  "University of Alabama at Birmingham": "https://www.uab.edu",
  "University of Alabama in Huntsville": "https://www.uah.edu",
  "University of Alaska Fairbanks": "https://www.uaf.edu",
  "University of Arkansas": "https://www.uark.edu",
  "University of Cincinnati": "https://www.uc.edu",
  "University of Colorado Denver/Anschutz Medical Campus": "https://www.ucdenver.edu",
  "University of Dayton": "https://udayton.edu",
  "University of Delaware": "https://www.udel.edu",
  "University of Denver": "https://www.du.edu",
  "University of Georgia": "https://www.uga.edu",
  "University of Hawaii at Manoa": "https://manoa.hawaii.edu",
  "University of Houston": "https://www.uh.edu",
  "University of Idaho": "https://www.uidaho.edu",
  "University of Iowa": "https://uiowa.edu",
  "University of Kansas": "https://ku.edu",
  "University of Kentucky": "https://www.uky.edu",
  "University of Louisville": "https://louisville.edu",
  "University of Maine": "https://umaine.edu",
  "University of Maryland, Baltimore County": "https://umbc.edu",
  "University of Massachusetts Lowell": "https://www.uml.edu",
  "University of Memphis": "https://www.memphis.edu",
  "University of Miami": "https://welcome.miami.edu",
  "University of Minnesota-Twin Cities": "https://twin-cities.umn.edu",
  "University of Mississippi": "https://olemiss.edu",
  "University of Missouri-Columbia": "https://missouri.edu",
  "University of Nebraska-Lincoln": "https://www.unl.edu",
  "University of Nevada, Las Vegas": "https://www.unlv.edu",
  "University of Nevada, Reno": "https://www.unr.edu",
  "University of New Hampshire-Main Campus": "https://www.unh.edu",
  "University of New Mexico": "https://www.unm.edu",
  "University of New Orleans": "https://www.uno.edu",
  "University of North Texas": "https://www.unt.edu",
  "University of Oklahoma": "https://www.ou.edu",
  "University of Oregon": "https://uoregon.edu",
  "University of Rhode Island": "https://www.uri.edu",
  "University of South Alabama": "https://www.southalabama.edu",
  "University of South Carolina": "https://sc.edu",
  "University of South Florida": "https://www.usf.edu",
  "University of Southern Mississippi": "https://www.usm.edu",
  "University of Toledo": "https://www.utoledo.edu",
  "University of Tulsa": "https://utulsa.edu",
  "University of Utah": "https://www.utah.edu",
  "University of Vermont": "https://www.uvm.edu",
  "University of Wyoming": "https://www.uwyo.edu",
  "Utah State University": "https://www.usu.edu",
  "Villanova University": "https://www1.villanova.edu",
  "Virginia Commonwealth University": "https://www.vcu.edu",
  "Washington State University": "https://wsu.edu",
  "Wayne State University": "https://wayne.edu",
  "West Virginia University": "https://www.wvu.edu",
  "Western Michigan University": "https://wmich.edu",
  "Wichita State University": "https://www.wichita.edu",
  "Wright State University-Main Campus": "https://www.wright.edu",
};

interface WikidataItem {
  website?: string;
  qsRank?: number;
}

function cleanSlug(title: string): string {
  return decodeURIComponent(title).toLowerCase().replace(/[_-]/g, " ").trim();
}

async function main() {
  console.info("--------------------------------------------------");
  console.info("Updating Official Websites and QS Rankings via Wikidata");
  console.info("--------------------------------------------------");

  const dataPath = path.resolve(process.cwd(), "data", "universities.json");
  const universities: UniversityRecord[] = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  console.info(`Loaded ${universities.length} universities.`);

  console.info("Executing Wikidata SPARQL query for US universities...");
  const sparqlQuery = `
    SELECT ?article ?website ?qsRank WHERE {
      ?item wdt:P31/wdt:P279* wd:Q3918 ;
            wdt:P17 wd:Q30 .
      ?article schema:about ?item ; 
               schema:isPartOf <https://en.wikipedia.org/> .
      OPTIONAL { ?item wdt:P856 ?website . }
      OPTIONAL {
        ?item p:P1352 ?statement .
        ?statement ps:P1352 ?qsRank ;
                   pq:P459 wd:Q1790510 .
      }
    }
  `;

  const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/sparql-results+json",
      "User-Agent": "UniversityGuideBot/1.0 (academic research)",
    },
  });

  if (!res.ok) {
    throw new Error(`Wikidata SPARQL returned HTTP status ${res.status}`);
  }

  const sparqlData = await res.json();
  const bindings = sparqlData.results.bindings;
  console.info(`Received ${bindings.length} records from Wikidata.`);

  // Build lookup maps by Wikipedia title slug and article URL
  const wikiMap = new Map<string, WikidataItem>();
  for (const b of bindings) {
    const articleUrl = b.article.value;
    const parts = articleUrl.split("/wiki/");
    if (parts.length < 2) continue;

    const slug = cleanSlug(parts[1]);
    const existing = wikiMap.get(slug);

    let website = existing?.website;
    if (b.website?.value) {
      website = b.website.value;
    }

    let qsRank = existing?.qsRank;
    if (b.qsRank?.value) {
      const parsed = Number.parseInt(b.qsRank.value, 10);
      if (!Number.isNaN(parsed)) {
        qsRank = qsRank ? Math.min(qsRank, parsed) : parsed;
      }
    }

    wikiMap.set(slug, { website, qsRank });
  }

  let updatedWebsites = 0;
  let rankedCount = 0;

  for (const u of universities) {
    const parts = u.wikipediaUrl.split("/wiki/");
    const slug = parts.length > 1 ? cleanSlug(parts[1]) : cleanSlug(u.name);
    const wikidata = wikiMap.get(slug);

    // 1. Determine official website
    let targetWebsite = KNOWN_OFFICIAL_WEBSITES[u.name] || wikidata?.website || u.website;

    if (targetWebsite && !targetWebsite.startsWith("http")) {
      targetWebsite = `https://${targetWebsite}`;
    }
    targetWebsite = targetWebsite.replace(/\/+$/, "");

    if (targetWebsite !== u.website) {
      updatedWebsites++;
      u.website = targetWebsite;
      u.engineeringWebsite = `${targetWebsite}/engineering`;
    }

    // 2. Determine QS ranking
    let qsRank = CANONICAL_QS_RANKS[u.name] || wikidata?.qsRank || null;

    if (!qsRank) {
      for (const [canonName, rank] of Object.entries(CANONICAL_QS_RANKS)) {
        // Strict exact match or normalized comparison
        const normU = u.name.toLowerCase().replace(/[-–,]/g, " ").replace(/\s+/g, " ").trim();
        const normCanon = canonName
          .toLowerCase()
          .replace(/[-–,]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        if (normU === normCanon) {
          qsRank = rank;
          break;
        }
      }
    }

    u.qsRank = qsRank;
    if (qsRank) {
      rankedCount++;
    }
  }

  console.info(`Updated websites for ${updatedWebsites} universities.`);
  console.info(`Assigned QS Rankings to ${rankedCount} universities.`);

  fs.writeFileSync(dataPath, JSON.stringify(universities, null, 2), "utf-8");
  console.info(`Saved data to: ${dataPath}`);

  const srcPath = path.resolve(process.cwd(), "src", "data", "universities.json");
  fs.writeFileSync(srcPath, JSON.stringify(universities, null, 2), "utf-8");
  console.info(`Synced data to webview: ${srcPath}`);

  console.info("\nTop 15 Universities by QS World Rank in Dataset:");
  const topRanked = universities
    .filter((u) => u.qsRank !== null && u.qsRank !== undefined)
    .sort((a, b) => (a.qsRank || 9999) - (b.qsRank || 9999))
    .slice(0, 15);

  for (const item of topRanked) {
    console.info(`  #${item.qsRank} - ${item.name} (${item.website})`);
  }
}

main().catch((err) => {
  console.error("Fix script error:", err);
  process.exit(1);
});
