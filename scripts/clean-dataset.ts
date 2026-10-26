import * as fs from "node:fs";
import * as path from "node:path";
import type { UniversityRecord } from "./types";

// Explicit non-engineering or undergraduate-only institutions to purge
const EXCLUDE_INSTITUTIONS = new Set([
  // No engineering school / degrees
  "Clark Atlanta University",
  "American University",
  "Brandeis University",
  "Clark University",
  "Claremont Graduate University",
  "Creighton University",
  "DePaul University",
  "Duquesne University",
  "East Tennessee State University",
  "Fordham University",
  "Georgetown University",
  "Georgia State University",
  "Loyola University Chicago",
  "The New School",
  "Texas Woman's University",
  "University of San Francisco",
  "University of North Carolina at Greensboro",
  "University of North Carolina Wilmington",
  "West Chester University of Pennsylvania",
  "Yeshiva University",
  "University of South Dakota",
  "University of Northern Colorado",
  "University of New England",
  "Teachers College, Columbia University",
  "Seton Hall University",
  "St. John's University",
  "Saint Joseph's University",
  "Sam Houston State University",
  "Southern Connecticut State University",
  "Pace University",
  "Nova Southeastern University",
  "The University of West Florida",
  "Indiana University of Pennsylvania",
  "Montclair State University",
  "William & Mary",
  "Wake Forest University",
  "Biola University",
  "Azusa Pacific University",
  "Regent University",
  "Abilene Christian University",
  "Appalachian State University",
  "Arkansas State University",
  "Augusta University",
  "Ball State University",
  "Bowling Green State University",
  "Central Michigan University",
  "Chapman University",
  "Delaware State University",
  "Illinois State University",
  "James Madison University",
  "Kean University",
  "Long Island University",
  "Pepperdine University",
  "Rutgers University–Camden",
  "Rutgers University–Newark",
  "The University of Montana",
  "University of Massachusetts-Boston",
  "University of Oregon",
  "University of Missouri–St. Louis",
  "University of Puerto Rico, Rio Piedras",
  "Thomas Jefferson University",
  "Boston College",
  "Texas Christian University",
  "Texas Southern University",
  "East Texas A&M University",
  "Eastern Michigan University",
  "Middle Tennessee State University",
  "CUNY Hunter College",
  "CUNY Graduate School and University Center",
  "Emory University",
  "University of North Carolina at Chapel Hill",
  "Harrisburg University of Science and Technology",
  "New England Institute of Technology",
  "DigiPen Institute of Technology",
  "Colorado Technical University",
  "University of Nebraska Omaha",
  "Utah Tech University",
  "South Carolina State University",

  // Pure undergraduate institutions (No MSc or PhD graduate engineering programs)
  "Harvey Mudd College",
  "Franklin W. Olin College of Engineering",

  // Medical/Health only
  "University of Arkansas for Medical Sciences",
  "Texas Tech University Health Sciences Center",
  "University of Oklahoma-Health Sciences Center",
  "University of Massachusetts Chan Medical School",
  "Upstate Medical University",
  "Albert Einstein College of Medicine",
  "Baylor College of Medicine",
  "The University of Tennessee Health Science Center",
  "The University of Texas Health Science Center at Houston",
  "The University of Texas Health Science Center at San Antonio",
  "The University of Texas Southwestern Medical Center",
  "University of Nebraska Medical Center",
  "Weill Cornell Medicine",
  "Medical University of South Carolina",
  "Medical College of Wisconsin",
  "Eastern Virginia Medical School",
  "Icahn School of Medicine at Mount Sinai",
  "Loma Linda University",
  "Rush University",
  "Oregon Health & Science University",
  "Oklahoma State University Center for Health Sciences",
  "University of North Texas Health Science Center",
  "University of Texas Medical Branch",
  "Louisiana State University New Orleans",
]);

// Map of canonical school names and verified websites for universities
const METADATA_MAP: Record<
  string,
  {
    school: string;
    website: string;
    degreeType?: "Both" | "MSc Only";
    qsRank?: number;
  }
> = {
  "Massachusetts Institute of Technology": {
    school: "MIT School of Engineering",
    website: "https://www.mit.edu",
    degreeType: "Both",
    qsRank: 1,
  },
  "Stanford University": {
    school: "Stanford School of Engineering",
    website: "https://www.stanford.edu",
    degreeType: "Both",
    qsRank: 6,
  },
  "University of California, Berkeley": {
    school: "UC Berkeley College of Engineering",
    website: "https://www.berkeley.edu",
    degreeType: "Both",
    qsRank: 10,
  },
  "Harvard University": {
    school: "Harvard John A. Paulson School of Engineering and Applied Sciences",
    website: "https://www.harvard.edu",
    degreeType: "Both",
    qsRank: 4,
  },
  "California Institute of Technology": {
    school: "Caltech Division of Engineering and Applied Science",
    website: "https://www.caltech.edu",
    degreeType: "Both",
    qsRank: 15,
  },
  "Carnegie Mellon University": {
    school: "Carnegie Institute of Technology (CMU Engineering)",
    website: "https://www.cmu.edu",
    degreeType: "Both",
    qsRank: 43,
  },
  "Purdue University": {
    school: "Purdue College of Engineering",
    website: "https://www.purdue.edu",
    degreeType: "Both",
    qsRank: 88,
  },
  "Georgia Institute of Technology": {
    school: "Georgia Tech College of Engineering",
    website: "https://www.gatech.edu",
    degreeType: "Both",
    qsRank: 114,
  },
  "University of Illinois Urbana-Champaign": {
    school: "The Grainger College of Engineering",
    website: "https://illinois.edu",
    degreeType: "Both",
    qsRank: 69,
  },
  "University of Michigan-Ann Arbor": {
    school: "Michigan Engineering",
    website: "https://umich.edu",
    degreeType: "Both",
    qsRank: 27,
  },
  "The University of Texas at Austin": {
    school: "Cockrell School of Engineering",
    website: "https://www.utexas.edu",
    degreeType: "Both",
    qsRank: 58,
  },
  "Cornell University": {
    school: "Cornell College of Engineering",
    website: "https://www.cornell.edu",
    degreeType: "Both",
    qsRank: 13,
  },
  "Columbia University in the City of New York": {
    school: "Fu Foundation School of Engineering and Applied Science",
    website: "https://www.columbia.edu",
    degreeType: "Both",
    qsRank: 22,
  },
  "Johns Hopkins University": {
    school: "Whiting School of Engineering",
    website: "https://www.jhu.edu",
    degreeType: "Both",
    qsRank: 21,
  },
  "Northwestern University": {
    school: "Robert R. McCormick School of Engineering and Applied Science",
    website: "https://www.northwestern.edu",
    degreeType: "Both",
    qsRank: 40,
  },
  "University of Southern California": {
    school: "USC Viterbi School of Engineering",
    website: "https://usc.edu",
    degreeType: "Both",
    qsRank: 125,
  },
  "University of California, Los Angeles": {
    school: "UCLA Samueli School of Engineering",
    website: "https://www.ucla.edu",
    degreeType: "Both",
    qsRank: 25,
  },
  "University of California, San Diego": {
    school: "Jacobs School of Engineering",
    website: "https://ucsd.edu",
    degreeType: "Both",
    qsRank: 47,
  },
  "Princeton University": {
    school: "Princeton School of Engineering and Applied Science",
    website: "https://www.princeton.edu",
    degreeType: "Both",
    qsRank: 16,
  },
  "University of Pennsylvania": {
    school: "Penn Engineering (School of Engineering and Applied Science)",
    website: "https://www.upenn.edu",
    degreeType: "Both",
    qsRank: 12,
  },
  "Yale University": {
    school: "Yale School of Engineering & Applied Science",
    website: "https://www.yale.edu",
    degreeType: "Both",
    qsRank: 19,
  },
  "Duke University": {
    school: "Pratt School of Engineering",
    website: "https://duke.edu",
    degreeType: "Both",
    qsRank: 57,
  },
  "Texas A&M University": {
    school: "Texas A&M College of Engineering",
    website: "https://www.tamu.edu",
    degreeType: "Both",
    qsRank: 154,
  },
  "Virginia Polytechnic Institute and State University": {
    school: "Virginia Tech College of Engineering",
    website: "https://www.vt.edu",
    degreeType: "Both",
    qsRank: 363,
  },
  "The Ohio State University-Main Campus": {
    school: "Ohio State College of Engineering",
    website: "https://www.osu.edu",
    degreeType: "Both",
    qsRank: 151,
  },
  "University of Washington-Seattle Campus": {
    school: "UW College of Engineering",
    website: "https://www.washington.edu",
    degreeType: "Both",
    qsRank: 50,
  },
  "University of Wisconsin-Madison": {
    school: "UW-Madison College of Engineering",
    website: "https://www.wisc.edu",
    degreeType: "Both",
    qsRank: 116,
  },
  "The Pennsylvania State University": {
    school: "Penn State College of Engineering",
    website: "https://www.psu.edu",
    degreeType: "Both",
    qsRank: 83,
  },
  "University of Florida": {
    school: "Herbert Wertheim College of Engineering",
    website: "https://www.ufl.edu",
    degreeType: "Both",
    qsRank: 168,
  },
  "University of Maryland-College Park": {
    school: "A. James Clark School of Engineering",
    website: "https://umd.edu",
    degreeType: "Both",
    qsRank: 169,
  },
  "North Carolina State University at Raleigh": {
    school: "NC State College of Engineering",
    website: "https://www.ncsu.edu",
    degreeType: "Both",
    qsRank: 274,
  },
  "Rice University": {
    school: "George R. Brown School of Engineering",
    website: "https://www.rice.edu",
    degreeType: "Both",
    qsRank: 141,
  },
  "University of Virginia-Main Campus": {
    school: "UVA School of Engineering and Applied Science",
    website: "https://www.virginia.edu",
    degreeType: "Both",
    qsRank: 260,
  },
  "University of Colorado Boulder": {
    school: "CU Boulder College of Engineering and Applied Science",
    website: "https://www.colorado.edu",
    degreeType: "Both",
    qsRank: 264,
  },
  "Arizona State University": {
    school: "Ira A. Fulton Schools of Engineering",
    website: "https://www.asu.edu",
    degreeType: "Both",
    qsRank: 179,
  },
  "Case Western Reserve University": {
    school: "Case School of Engineering",
    website: "https://case.edu",
    degreeType: "Both",
    qsRank: 255,
  },
  "University of California, Irvine": {
    school: "The Henry Samueli School of Engineering",
    website: "https://uci.edu",
    degreeType: "Both",
    qsRank: 268,
  },
  "University of California, Davis": {
    school: "UC Davis College of Engineering",
    website: "https://www.ucdavis.edu",
    degreeType: "Both",
    qsRank: 130,
  },
  "University of California, Santa Barbara": {
    school: "UCSB College of Engineering",
    website: "https://www.ucsb.edu",
    degreeType: "Both",
    qsRank: 163,
  },
  "University of California, Riverside": {
    school: "Bourns College of Engineering",
    website: "https://www.ucr.edu",
    degreeType: "Both",
    qsRank: 404,
  },
  "University of California, Santa Cruz": {
    school: "Baskin School of Engineering",
    website: "https://www.ucsc.edu",
    degreeType: "Both",
    qsRank: 375,
  },
  "University of California, Merced": {
    school: "UC Merced School of Engineering",
    website: "https://www.ucmerced.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "New York University": {
    school: "NYU Tandon School of Engineering",
    website: "https://www.nyu.edu",
    degreeType: "Both",
    qsRank: 36,
  },
  "Northeastern University": {
    school: "Northeastern College of Engineering",
    website: "https://www.northeastern.edu",
    degreeType: "Both",
    qsRank: 396,
  },
  "Boston University": {
    school: "BU College of Engineering",
    website: "https://www.bu.edu",
    degreeType: "Both",
    qsRank: 108,
  },
  "Rensselaer Polytechnic Institute": {
    school: "RPI School of Engineering",
    website: "https://www.rpi.edu",
    degreeType: "Both",
    qsRank: 407,
  },
  "Stevens Institute of Technology": {
    school: "Charles V. Schaefer, Jr. School of Engineering and Science",
    website: "https://www.stevens.edu",
    degreeType: "Both",
    qsRank: 501,
  },
  "Worcester Polytechnic Institute": {
    school: "WPI School of Engineering",
    website: "https://www.wpi.edu",
    degreeType: "Both",
    qsRank: 546,
  },
  "Rochester Institute of Technology": {
    school: "Kate Gleason College of Engineering",
    website: "https://www.rit.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "Illinois Institute of Technology": {
    school: "Armour College of Engineering",
    website: "https://www.iit.edu",
    degreeType: "Both",
    qsRank: 469,
  },
  "Colorado School of Mines": {
    school: "Mines College of Engineering and Computational Sciences",
    website: "https://www.mines.edu",
    degreeType: "Both",
    qsRank: 461,
  },
  "Dartmouth College": {
    school: "Thayer School of Engineering",
    website: "https://home.dartmouth.edu",
    degreeType: "Both",
    qsRank: 243,
  },
  "Brown University": {
    school: "Brown School of Engineering",
    website: "https://www.brown.edu",
    degreeType: "Both",
    qsRank: 79,
  },
  "University of Notre Dame": {
    school: "Notre Dame College of Engineering",
    website: "https://www.nd.edu",
    degreeType: "Both",
    qsRank: 304,
  },
  "Vanderbilt University": {
    school: "Vanderbilt School of Engineering",
    website: "https://www.vanderbilt.edu",
    degreeType: "Both",
    qsRank: 261,
  },
  "Washington University in St Louis": {
    school: "McKeevey School of Engineering",
    website: "https://wustl.edu",
    degreeType: "Both",
    qsRank: 154,
  },
  "University of Pittsburgh-Pittsburgh Campus": {
    school: "Swanson School of Engineering",
    website: "https://www.pitt.edu",
    degreeType: "Both",
    qsRank: 222,
  },
  "University of Utah": {
    school: "John and Marcia Price College of Engineering",
    website: "https://www.utah.edu",
    degreeType: "Both",
    qsRank: 441,
  },
  "Iowa State University": {
    school: "Iowa State College of Engineering",
    website: "https://www.iastate.edu",
    degreeType: "Both",
    qsRank: 451,
  },
  "Michigan State University": {
    school: "MSU College of Engineering",
    website: "https://msu.edu",
    degreeType: "Both",
    qsRank: 136,
  },
  "Auburn University": {
    school: "Samuel Ginn College of Engineering",
    website: "https://auburn.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "Clemson University": {
    school: "Clemson College of Engineering, Computing and Applied Sciences",
    website: "https://www.clemson.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "The University of Tennessee-Knoxville": {
    school: "Tickle College of Engineering",
    website: "https://www.utk.edu",
    degreeType: "Both",
    qsRank: 501,
  },
  "University of Cincinnati": {
    school: "UC College of Engineering and Applied Science",
    website: "https://www.uc.edu",
    degreeType: "Both",
    qsRank: 601,
  },
  "University of Houston": {
    school: "Cullen College of Engineering",
    website: "https://www.uh.edu",
    degreeType: "Both",
    qsRank: 601,
  },
  "The University of Texas at Dallas": {
    school: "Erik Jonsson School of Engineering and Computer Science",
    website: "https://www.utdallas.edu",
    degreeType: "Both",
    qsRank: 520,
  },
  "The University of Texas at Arlington": {
    school: "UTA College of Engineering",
    website: "https://www.uta.edu",
    degreeType: "Both",
    qsRank: 701,
  },
  "The University of Texas at El Paso": {
    school: "UTEP College of Engineering",
    website: "https://www.utep.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "The University of Texas at San Antonio": {
    school: "UTSA Klesse College of Engineering and Integrated Design",
    website: "https://www.utsa.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "Drexel University": {
    school: "Drexel College of Engineering",
    website: "https://drexel.edu",
    degreeType: "Both",
    qsRank: 511,
  },
  "George Mason University": {
    school: "Volgenau School of Engineering",
    website: "https://www.gmu.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "University of Central Florida": {
    school: "UCF College of Engineering and Computer Science",
    website: "https://www.ucf.edu",
    degreeType: "Both",
    qsRank: 571,
  },
  "University of South Florida": {
    school: "USF College of Engineering",
    website: "https://www.usf.edu",
    degreeType: "Both",
    qsRank: 551,
  },
  "Florida State University": {
    school: "FAMU-FSU College of Engineering",
    website: "https://www.fsu.edu",
    degreeType: "Both",
    qsRank: 461,
  },
  "Florida International University": {
    school: "FIU College of Engineering and Computing",
    website: "https://www.fiu.edu",
    degreeType: "Both",
    qsRank: 751,
  },
  "Lehigh University": {
    school: "P.C. Rossin College of Engineering and Applied Science",
    website: "https://www.lehigh.edu",
    degreeType: "Both",
    qsRank: 501,
  },
  "Tufts University": {
    school: "Tufts School of Engineering",
    website: "https://www.tufts.edu",
    degreeType: "Both",
    qsRank: 344,
  },
  "Villanova University": {
    school: "Villanova College of Engineering",
    website: "https://www1.villanova.edu",
    degreeType: "Both",
    qsRank: 751,
  },
  "Santa Clara University": {
    school: "Santa Clara School of Engineering",
    website: "https://www.scu.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "Clarkson University": {
    school: "Clarkson Wallace H. Coulter School of Engineering",
    website: "https://www.clarkson.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "Michigan Technological University": {
    school: "Michigan Tech College of Engineering",
    website: "https://www.mtu.edu",
    degreeType: "Both",
    qsRank: 651,
  },
  "New Jersey Institute of Technology": {
    school: "Newark College of Engineering (NJIT)",
    website: "https://www.njit.edu",
    degreeType: "Both",
    qsRank: 651,
  },
  "Oregon State University": {
    school: "OSU College of Engineering",
    website: "https://oregonstate.edu",
    degreeType: "Both",
    qsRank: 501,
  },
  "University of Arizona": {
    school: "UArizona College of Engineering",
    website: "https://www.arizona.edu",
    degreeType: "Both",
    qsRank: 293,
  },
  "University of Delaware": {
    school: "UD College of Engineering",
    website: "https://www.udel.edu",
    degreeType: "Both",
    qsRank: 551,
  },
  "University of Iowa": {
    school: "Iowa College of Engineering",
    website: "https://uiowa.edu",
    degreeType: "Both",
    qsRank: 451,
  },
  "University of Kansas": {
    school: "KU School of Engineering",
    website: "https://ku.edu",
    degreeType: "Both",
    qsRank: 401,
  },
  "University of Kentucky": {
    school: "UK Pigman College of Engineering",
    website: "https://www.uky.edu",
    degreeType: "Both",
    qsRank: 651,
  },
  "University of Louisville": {
    school: "J.B. Speed School of Engineering",
    website: "https://louisville.edu",
    degreeType: "Both",
    qsRank: 751,
  },
  "University of Massachusetts-Amherst": {
    school: "UMass Amherst College of Engineering",
    website: "https://www.umass.edu",
    degreeType: "Both",
    qsRank: 275,
  },
  "University of Massachusetts-Lowell": {
    school: "Francis College of Engineering",
    website: "https://www.uml.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "University of Massachusetts Dartmouth": {
    school: "UMass Dartmouth College of Engineering",
    website: "https://www.umassd.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "University of Minnesota-Twin Cities": {
    school: "UMN College of Science and Engineering",
    website: "https://twin-cities.umn.edu",
    degreeType: "Both",
    qsRank: 195,
  },
  "University of Missouri-Columbia": {
    school: "Mizzou College of Engineering",
    website: "https://missouri.edu",
    degreeType: "Both",
    qsRank: 501,
  },
  "University of Missouri-Kansas City": {
    school: "School of Science and Engineering",
    website: "https://www.umkc.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "Missouri University of Science and Technology": {
    school: "Missouri S&T College of Engineering and Computing",
    website: "https://www.mst.edu",
    degreeType: "Both",
    qsRank: 551,
  },
  "University of Nebraska-Lincoln": {
    school: "UNL College of Engineering",
    website: "https://www.unl.edu",
    degreeType: "Both",
    qsRank: 551,
  },
  "University of New Mexico-Main Campus": {
    school: "UNM School of Engineering",
    website: "https://www.unm.edu",
    degreeType: "Both",
    qsRank: 651,
  },
  "University of Oklahoma-Norman Campus": {
    school: "Gallogly College of Engineering",
    website: "https://www.ou.edu",
    degreeType: "Both",
    qsRank: 651,
  },
  "University of South Carolina-Columbia": {
    school: "Molinaroli College of Engineering and Computing",
    website: "https://sc.edu",
    degreeType: "Both",
    qsRank: 601,
  },
  "Virginia Commonwealth University": {
    school: "VCU College of Engineering",
    website: "https://www.vcu.edu",
    degreeType: "Both",
    qsRank: 751,
  },
  "Washington State University": {
    school: "Voiland College of Engineering and Architecture",
    website: "https://wsu.edu",
    degreeType: "Both",
    qsRank: 451,
  },
  "West Virginia University": {
    school: "Benjamin M. Statler College of Engineering and Mineral Resources",
    website: "https://www.wvu.edu",
    degreeType: "Both",
    qsRank: 751,
  },
  "Binghamton University": {
    school: "Thomas J. Watson College of Engineering and Applied Science",
    website: "https://www.binghamton.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "University at Buffalo": {
    school: "School of Engineering and Applied Sciences",
    website: "https://www.buffalo.edu",
    degreeType: "Both",
    qsRank: 491,
  },
  "Stony Brook University": {
    school: "College of Engineering and Applied Sciences",
    website: "https://www.stonybrook.edu",
    degreeType: "Both",
    qsRank: 396,
  },
  "Rutgers University-New Brunswick": {
    school: "Rutgers School of Engineering",
    website: "https://www.rutgers.edu",
    degreeType: "Both",
    qsRank: 267,
  },
  "Syracuse University": {
    school: "College of Engineering and Computer Science",
    website: "https://www.syracuse.edu",
    degreeType: "Both",
    qsRank: 751,
  },
  "Southern Methodist University": {
    school: "Lyle School of Engineering",
    website: "https://www.smu.edu",
    degreeType: "Both",
    qsRank: 751,
  },
  "Temple University": {
    school: "Temple University College of Engineering",
    website: "https://www.temple.edu",
    degreeType: "Both",
    qsRank: 701,
  },
  "Texas Tech University": {
    school: "Edward E. Whitacre Jr. College of Engineering",
    website: "https://www.ttu.edu",
    degreeType: "Both",
    qsRank: 751,
  },
  "The University of Alabama": {
    school: "University of Alabama College of Engineering",
    website: "https://www.ua.edu",
    degreeType: "Both",
    qsRank: 751,
  },
  "University of Alabama at Birmingham": {
    school: "UAB School of Engineering",
    website: "https://www.uab.edu",
    degreeType: "Both",
    qsRank: 751,
  },
  "University of Alabama, Huntsville": {
    school: "UAH College of Engineering",
    website: "https://www.uah.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "University of Arkansas": {
    school: "University of Arkansas College of Engineering",
    website: "https://www.uark.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "University of Chicago": {
    school: "Pritzker School of Molecular Engineering",
    website: "https://www.uchicago.edu",
    degreeType: "Both",
    qsRank: 11,
  },
  "University of Colorado Denver/Anschutz Medical Campus": {
    school: "College of Engineering, Design and Computing",
    website: "https://www.ucdenver.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "University of Colorado Colorado Springs": {
    school: "College of Engineering and Applied Science",
    website: "https://www.uccs.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "University of Connecticut": {
    school: "UConn College of Engineering",
    website: "https://uconn.edu",
    degreeType: "Both",
    qsRank: 501,
  },
  "University of Dayton": {
    school: "University of Dayton School of Engineering",
    website: "https://udayton.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "University of Denver": {
    school: "Ritchie School of Engineering and Computer Science",
    website: "https://www.du.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "University of Georgia": {
    school: "UGA College of Engineering",
    website: "https://www.uga.edu",
    degreeType: "Both",
    qsRank: 551,
  },
  "University of Hawaii at Manoa": {
    school: "UH Manoa College of Engineering",
    website: "https://manoa.hawaii.edu",
    degreeType: "Both",
    qsRank: 551,
  },
  "University of Idaho": {
    school: "University of Idaho College of Engineering",
    website: "https://www.uidaho.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "University of Illinois Chicago": {
    school: "UIC College of Engineering",
    website: "https://www.uic.edu",
    degreeType: "Both",
    qsRank: 323,
  },
  "University of Louisiana at Lafayette": {
    school: "UL Lafayette College of Engineering",
    website: "https://louisiana.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "University of Maryland-Baltimore County": {
    school: "UMBC College of Engineering and Information Technology",
    website: "https://umbc.edu",
    degreeType: "Both",
    qsRank: 751,
  },
  "University of Memphis": {
    school: "Herff College of Engineering",
    website: "https://www.memphis.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "University of Miami": {
    school: "University of Miami College of Engineering",
    website: "https://welcome.miami.edu",
    degreeType: "Both",
    qsRank: 296,
  },
  "University of Mississippi": {
    school: "Ole Miss School of Engineering",
    website: "https://olemiss.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "University of Nevada-Las Vegas": {
    school: "Howard R. Hughes College of Engineering",
    website: "https://www.unlv.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "University of Nevada-Reno": {
    school: "UNR College of Engineering",
    website: "https://www.unr.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "University of New Hampshire-Main Campus": {
    school: "UNH College of Engineering and Physical Sciences",
    website: "https://www.unh.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "University of North Carolina at Charlotte": {
    school: "William States Lee College of Engineering",
    website: "https://www.charlotte.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "University of North Dakota": {
    school: "UND College of Engineering & Mines",
    website: "https://und.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "University of North Texas": {
    school: "UNT College of Engineering",
    website: "https://www.unt.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "University of Rhode Island": {
    school: "URI College of Engineering",
    website: "https://www.uri.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "University of Rochester": {
    school: "Hajim School of Engineering & Applied Sciences",
    website: "https://www.rochester.edu",
    degreeType: "Both",
    qsRank: 224,
  },
  "University of South Alabama": {
    school: "South Alabama College of Engineering",
    website: "https://www.southalabama.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "University of Southern Mississippi": {
    school: "School of Polymer Science and Engineering",
    website: "https://www.usm.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "University of Toledo": {
    school: "UToledo College of Engineering",
    website: "https://www.utoledo.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "University of Tulsa": {
    school: "Tulsa College of Engineering & Natural Sciences",
    website: "https://utulsa.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "University of Vermont": {
    school: "UVM College of Engineering and Mathematical Sciences",
    website: "https://www.uvm.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "University of Wyoming": {
    school: "UWyo College of Engineering and Physical Sciences",
    website: "https://www.uwyo.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "Utah State University": {
    school: "USU College of Engineering",
    website: "https://www.usu.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "Wayne State University": {
    school: "Wayne State College of Engineering",
    website: "https://wayne.edu",
    degreeType: "Both",
    qsRank: 751,
  },
  "Wichita State University": {
    school: "Wichita State College of Engineering",
    website: "https://www.wichita.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "Wright State University": {
    school: "College of Engineering and Computer Science",
    website: "https://www.wright.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "Western Michigan University": {
    school: "WMU College of Engineering and Applied Sciences",
    website: "https://wmich.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "Tulane University of Louisiana": {
    school: "School of Science and Engineering",
    website: "https://tulane.edu",
    degreeType: "Both",
    qsRank: 601,
  },
  "University at Albany": {
    school: "College of Nanotechnology, Science, and Engineering",
    website: "https://www.albany.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "George Washington University": {
    school: "School of Engineering and Applied Science",
    website: "https://www.gwu.edu",
    degreeType: "Both",
    qsRank: 362,
  },
  "Florida Atlantic University": {
    school: "College of Engineering and Computer Science",
    website: "https://www.fau.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "Louisiana State University and Agricultural & Mechanical College": {
    school: "LSU College of Engineering",
    website: "https://www.lsu.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "Mississippi State University": {
    school: "James Worth Bagley College of Engineering",
    website: "https://www.msstate.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "Montana State University": {
    school: "Norm Asbjornson College of Engineering",
    website: "https://www.montana.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "New Mexico State University-Main Campus": {
    school: "NMSU College of Engineering",
    website: "https://www.nmsu.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "North Dakota State University-Main Campus": {
    school: "NDSU College of Engineering",
    website: "https://www.ndsu.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "Northern Arizona University": {
    school: "College of Engineering, Informatics, and Applied Sciences",
    website: "https://nau.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "Northern Illinois University": {
    school: "College of Engineering and Engineering Technology",
    website: "https://www.niu.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "Oakland University": {
    school: "School of Engineering and Computer Science",
    website: "https://www.oakland.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "Oklahoma State University": {
    school: "College of Engineering, Architecture and Technology",
    website: "https://go.okstate.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "Old Dominion University": {
    school: "Batten College of Engineering & Technology",
    website: "https://www.odu.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "Rowan University": {
    school: "Henry M. Rowan College of Engineering",
    website: "https://www.rowan.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "San Diego State University": {
    school: "SDSU College of Engineering",
    website: "https://www.sdsu.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "San Jose State University": {
    school: "Charles W. Davidson College of Engineering",
    website: "https://www.sjsu.edu",
    degreeType: "MSc Only",
    qsRank: 1001,
  },
  "San Francisco State University": {
    school: "SF State School of Engineering",
    website: "https://www.sfsu.edu",
    degreeType: "MSc Only",
    qsRank: 1001,
  },
  "Southern Illinois University-Carbondale": {
    school: "College of Engineering, Computing, Technology, and Mathematics",
    website: "https://siu.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "South Dakota State University": {
    school: "Jerome J. Lohr College of Engineering",
    website: "https://www.sdstate.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "Tennessee Technological University": {
    school: "Tennessee Tech College of Engineering",
    website: "https://www.tntech.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "Tennessee State University": {
    school: "College of Engineering",
    website: "https://www.tnstate.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "Texas A&M University–Kingsville": {
    school: "Frank H. Dotterweich College of Engineering",
    website: "https://www.tamuk.edu",
    degreeType: "Both",
    qsRank: 1201,
  },
  "Texas A&M University–Corpus Christi": {
    school: "College of Science and Engineering",
    website: "https://www.tamucc.edu",
    degreeType: "MSc Only",
    qsRank: 1201,
  },
  "Texas State University": {
    school: "Ingram School of Engineering",
    website: "https://www.txst.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "The University of Texas at Tyler": {
    school: "College of Engineering",
    website: "https://www.uttyler.edu",
    degreeType: "MSc Only",
    qsRank: 1201,
  },
  "The University of Texas Rio Grande Valley": {
    school: "College of Engineering and Computer Science",
    website: "https://www.utrgv.edu",
    degreeType: "MSc Only",
    qsRank: 1001,
  },
  "University of Akron": {
    school: "College of Engineering and Polymer Science",
    website: "https://www.uakron.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "University of Alaska Fairbanks": {
    school: "College of Engineering and Mines",
    website: "https://www.uaf.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "University of Arkansas at Little Rock": {
    school: "Donaghey College of Science, Technology, Engineering, and Mathematics",
    website: "https://ualr.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "University of Michigan-Dearborn": {
    school: "College of Engineering and Computer Science",
    website: "https://umdearborn.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "University of New Orleans": {
    school: "Dr. Robert A. Savoie College of Engineering",
    website: "https://www.uno.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "University of North Florida": {
    school: "College of Computing, Engineering & Construction",
    website: "https://www.unf.edu",
    degreeType: "MSc Only",
    qsRank: 1001,
  },
  "University of Puerto Rico, Mayaguez": {
    school: "UPRM College of Engineering",
    website: "https://www.uprm.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "Virginia State University": {
    school: "College of Engineering and Technology",
    website: "https://www.vsu.edu",
    degreeType: "MSc Only",
    qsRank: 1201,
  },
  "Howard University": {
    school: "College of Engineering and Architecture",
    website: "https://howard.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "Morgan State University": {
    school: "Clarence M. Mitchell, Jr. School of Engineering",
    website: "https://www.morgan.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "Catholic University of America": {
    school: "CUA School of Engineering",
    website: "https://engineering.catholic.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "Saint Louis University": {
    school: "Parks College of Engineering, Aviation and Technology",
    website: "https://www.slu.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "Baylor University": {
    school: "School of Engineering and Computer Science",
    website: "https://www.baylor.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "Brigham Young University": {
    school: "Ira A. Fulton College of Engineering",
    website: "https://www.byu.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "University of San Diego": {
    school: "Shiley-Marcos School of Engineering",
    website: "https://www.sandiego.edu",
    degreeType: "MSc Only",
    qsRank: 1001,
  },
  "California Polytechnic State University, San Luis Obispo": {
    school: "Cal Poly College of Engineering",
    website: "https://www.calpoly.edu",
    degreeType: "MSc Only",
    qsRank: 1201,
  },
  "California State Polytechnic University, Pomona": {
    school: "Cal Poly Pomona College of Engineering",
    website: "https://www.cpp.edu",
    degreeType: "MSc Only",
    qsRank: 1201,
  },
  "California State Polytechnic University, Humboldt": {
    school: "College of Natural Resources and Sciences (Engineering)",
    website: "https://www.humboldt.edu",
    degreeType: "MSc Only",
    qsRank: 1201,
  },
  "Rose-Hulman Institute of Technology": {
    school: "Rose-Hulman Institute of Technology",
    website: "https://www.rose-hulman.edu",
    degreeType: "MSc Only",
    qsRank: 1201,
  },
  "Wentworth Institute of Technology": {
    school: "School of Engineering",
    website: "https://wit.edu",
    degreeType: "MSc Only",
    qsRank: 1201,
  },
  "Milwaukee School of Engineering": {
    school: "MSOE Engineering Faculty",
    website: "https://www.msoe.edu",
    degreeType: "MSc Only",
    qsRank: 1201,
  },
  "State University of New York Polytechnic Institute": {
    school: "SUNY Poly College of Engineering",
    website: "https://sunypoly.edu",
    degreeType: "MSc Only",
    qsRank: 1201,
  },
  "Lawrence Technological University": {
    school: "College of Engineering",
    website: "https://www.ltu.edu",
    degreeType: "Both",
    qsRank: 1201,
  },
  "Kettering University": {
    school: "Kettering College of Engineering",
    website: "https://www.kettering.edu",
    degreeType: "MSc Only",
    qsRank: 1201,
  },
  "Florida Polytechnic University": {
    school: "Florida Poly Department of Engineering",
    website: "https://floridapoly.edu",
    degreeType: "MSc Only",
    qsRank: 1201,
  },
  "New Mexico Institute of Mining and Technology": {
    school: "New Mexico Tech Engineering Division",
    website: "https://www.nmt.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "South Dakota School of Mines and Technology": {
    school: "South Dakota Mines Engineering Division",
    website: "https://www.sdsmt.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "Montana Technological University": {
    school: "School of Mines and Engineering",
    website: "https://mtech.edu",
    degreeType: "MSc Only",
    qsRank: 1201,
  },
  "Oregon Institute of Technology": {
    school: "Oregon Tech College of Engineering, Technology, and Management",
    website: "https://www.oit.edu",
    degreeType: "MSc Only",
    qsRank: 1201,
  },
  "Capitol Technology University": {
    school: "School of Engineering and Computer Science",
    website: "https://www.captechu.edu",
    degreeType: "Both",
    qsRank: 1201,
  },
  "Indiana Institute of Technology": {
    school: "Talwar College of Engineering and Computer Sciences",
    website: "https://www.indianatech.edu",
    degreeType: "MSc Only",
    qsRank: 1201,
  },
  "New York Institute of Technology": {
    school: "College of Engineering and Computing Sciences",
    website: "https://www.nyit.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "Polytechnic University of Puerto Rico": {
    school: "PUPR School of Engineering",
    website: "https://www.pupr.edu",
    degreeType: "MSc Only",
    qsRank: 1201,
  },
  "University of Wisconsin–Stout Polytechnic": {
    school: "College of Science, Technology, Engineering, Mathematics and Management",
    website: "https://www.uwstout.edu",
    degreeType: "MSc Only",
    qsRank: 1201,
  },
  "Utah Tech University": {
    school: "College of Science, Engineering & Technology",
    website: "https://utahtech.edu",
    degreeType: "MSc Only",
    qsRank: 1201,
  },
  "Air Force Institute of Technology": {
    school: "Graduate School of Engineering & Management",
    website: "https://www.afit.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "Colorado State University-Fort Collins": {
    school: "Walter Scott, Jr. College of Engineering",
    website: "https://www.colostate.edu",
    degreeType: "Both",
    qsRank: 365,
  },
  "Kansas State University": {
    school: "Carl R. Ice College of Engineering",
    website: "https://www.k-state.edu",
    degreeType: "Both",
    qsRank: 401,
  },
  "Ohio University-Main Campus": {
    school: "Russ College of Engineering and Technology",
    website: "https://www.ohio.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "Indiana University Indianapolis": {
    school: "Purdue School of Engineering and Technology",
    website: "https://indianapolis.iu.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "East Carolina University": {
    school: "College of Engineering and Technology",
    website: "https://www.ecu.edu",
    degreeType: "MSc Only",
    qsRank: 1001,
  },
  "University of Maine": {
    school: "College of Engineering and Computing",
    website: "https://umaine.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "University of Wisconsin-Milwaukee": {
    school: "College of Engineering & Applied Science",
    website: "https://uwm.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "Boise State University": {
    school: "College of Engineering",
    website: "https://www.boisestate.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "California State University, Long Beach": {
    school: "CSULB College of Engineering",
    website: "https://www.csulb.edu",
    degreeType: "MSc Only",
    qsRank: 1001,
  },
  "California State University, Fullerton": {
    school: "College of Engineering and Computer Science",
    website: "https://www.fullerton.edu",
    degreeType: "MSc Only",
    qsRank: 1001,
  },
  "California State University, Los Angeles": {
    school: "College of Engineering, Computer Science, and Technology",
    website: "https://www.calstatela.edu",
    degreeType: "MSc Only",
    qsRank: 1001,
  },
  "California State University, Sacramento": {
    school: "College of Engineering and Computer Science",
    website: "https://www.csus.edu",
    degreeType: "MSc Only",
    qsRank: 1001,
  },
  "California State University, Fresno": {
    school: "Lyles College of Engineering",
    website: "https://www.fresnostate.edu",
    degreeType: "MSc Only",
    qsRank: 1001,
  },
  "Cleveland State University": {
    school: "Washkewicz College of Engineering",
    website: "https://www.csuohio.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "CUNY City College": {
    school: "Grove School of Engineering",
    website: "https://www.ccny.cuny.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "Embry-Riddle Aeronautical University-Daytona Beach": {
    school: "College of Engineering",
    website: "https://erau.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "Florida Institute of Technology": {
    school: "College of Engineering and Science",
    website: "https://www.fit.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "Florida Agricultural and Mechanical University": {
    school: "FAMU-FSU College of Engineering",
    website: "https://www.famu.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "Georgia Southern University": {
    school: "Allen E. Paulson College of Engineering and Computing",
    website: "https://www.georgiasouthern.edu",
    degreeType: "MSc Only",
    qsRank: 1201,
  },
  "Hofstra University": {
    school: "Fred DeMatteis School of Engineering and Applied Science",
    website: "https://www.hofstra.edu",
    degreeType: "MSc Only",
    qsRank: 1001,
  },
  "Idaho State University": {
    school: "College of Science and Engineering",
    website: "https://www.isu.edu",
    degreeType: "Both",
    qsRank: 1201,
  },
  "Jackson State University": {
    school: "College of Science, Engineering and Technology",
    website: "https://www.jsums.edu",
    degreeType: "MSc Only",
    qsRank: 1201,
  },
  "Kennesaw State University": {
    school: "Southern Polytechnic College of Engineering and Engineering Technology",
    website: "https://www.kennesaw.edu",
    degreeType: "MSc Only",
    qsRank: 1001,
  },
  "Lamar University": {
    school: "College of Engineering",
    website: "https://www.lamar.edu",
    degreeType: "Both",
    qsRank: 1201,
  },
  "Louisiana Tech University": {
    school: "College of Engineering and Science",
    website: "https://www.latech.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "Loyola Marymount University": {
    school: "Frank R. Seaver College of Science and Engineering",
    website: "https://www.lmu.edu",
    degreeType: "MSc Only",
    qsRank: 1001,
  },
  "Marquette University": {
    school: "Opus College of Engineering",
    website: "https://www.marquette.edu",
    degreeType: "Both",
    qsRank: 801,
  },
  "Marshall University": {
    school: "College of Engineering and Computer Sciences",
    website: "https://www.marshall.edu",
    degreeType: "MSc Only",
    qsRank: 1201,
  },
  "Mercer University": {
    school: "School of Engineering",
    website: "https://www.mercer.edu",
    degreeType: "MSc Only",
    qsRank: 1001,
  },
  "Miami University": {
    school: "College of Engineering and Computing",
    website: "https://miamioh.edu",
    degreeType: "MSc Only",
    qsRank: 1001,
  },
  "North Carolina A&T State University": {
    school: "College of Engineering",
    website: "https://www.ncat.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "Portland State University": {
    school: "Maseeh College of Engineering and Computer Science",
    website: "https://www.pdx.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "Prairie View A&M University": {
    school: "Roy G. Perry College of Engineering",
    website: "https://www.pvamu.edu",
    degreeType: "Both",
    qsRank: 1201,
  },
  "South Carolina State University": {
    school: "College of Science, Mathematics and Engineering Technology",
    website: "https://www.scsu.edu",
    degreeType: "MSc Only",
    qsRank: 1201,
  },
  "Southern University": {
    school: "College of Sciences and Engineering",
    website: "https://www.subr.edu",
    degreeType: "MSc Only",
    qsRank: 1201,
  },
  "SUNY College of Environmental Science and Forestry": {
    school: "Department of Environmental Resources Engineering",
    website: "https://www.esf.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "Tarleton State University": {
    school: "School of Engineering",
    website: "https://www.tarleton.edu",
    degreeType: "MSc Only",
    qsRank: 1201,
  },
  "Hampton University": {
    school: "School of Engineering and Technology",
    website: "https://home.hamptonu.edu",
    degreeType: "MSc Only",
    qsRank: 1201,
  },
  "Kent State University at Kent": {
    school: "College of Aeronautics and Engineering",
    website: "https://www.kent.edu",
    degreeType: "Both",
    qsRank: 1001,
  },
  "University of Nebraska Omaha": {
    school: "College of Information Science and Technology",
    website: "https://www.unomaha.edu",
    degreeType: "MSc Only",
    qsRank: 1201,
  },
};

function main() {
  console.info("--------------------------------------------------");
  console.info("Strict Engineering Filter & Normalization");
  console.info("--------------------------------------------------");

  const dataPath = path.resolve(process.cwd(), "data", "universities.json");
  const rawList: UniversityRecord[] = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  console.info(`Base count: ${rawList.length}`);

  // Deduplication map
  const canonicalMap = new Map<string, UniversityRecord>();
  let duplicateCount = 0;
  let excludedCount = 0;

  for (const u of rawList) {
    // 1. Exclude verified non-engineering institutions
    if (EXCLUDE_INSTITUTIONS.has(u.name)) {
      excludedCount++;
      continue;
    }

    // 2. Canonical alias normalization
    let canonName = u.name;
    if (canonName === "Georgia Institute of Technology-Main Campus")
      canonName = "Georgia Institute of Technology";
    if (canonName === "Purdue University-Main Campus") canonName = "Purdue University";
    if (canonName === "Iowa State University of Science and Technology")
      canonName = "Iowa State University";
    if (canonName === "Rose–Hulman Institute of Technology")
      canonName = "Rose-Hulman Institute of Technology";
    if (canonName === "The Ohio State University-Main Campus") canonName = "Ohio State University";
    if (canonName === "The Pennsylvania State University") canonName = "Penn State University";
    if (canonName === "Pennsylvania State University-Main Campus")
      canonName = "Penn State University";
    if (canonName === "Texas A & M University-College Station") canonName = "Texas A&M University";
    if (canonName === "Texas A&M University-College Station") canonName = "Texas A&M University";
    if (canonName === "University of Michigan-Ann Arbor") canonName = "University of Michigan";
    if (canonName === "The University of Texas at Austin")
      canonName = "University of Texas at Austin";

    u.name = canonName;

    // Apply metadata
    const meta = METADATA_MAP[canonName] || METADATA_MAP[u.name];
    if (meta) {
      u.engineeringSchool = meta.school;
      u.website = meta.website;
      u.engineeringWebsite = `${meta.website}/engineering`;
      if (meta.degreeType) {
        u.degreeType = meta.degreeType;
        u.degreeLevels = meta.degreeType === "Both" ? ["MSc", "PhD"] : ["MSc"];
      }
      if (meta.qsRank) {
        u.qsRank = meta.qsRank;
      }
    }

    // 3. Deduplicate by canonical name
    if (canonicalMap.has(canonName)) {
      duplicateCount++;
      continue;
    }

    canonicalMap.set(canonName, u);
  }

  const cleanList = Array.from(canonicalMap.values());
  console.info(`Excluded ${excludedCount} non-engineering institutions.`);
  console.info(`Removed ${duplicateCount} duplicates.`);
  console.info(`Final Verified Engineering Universities: ${cleanList.length}`);

  const bothCount = cleanList.filter((u) => u.degreeType === "Both").length;
  const mscCount = cleanList.filter((u) => u.degreeType === "MSc Only").length;
  console.info(`  Both (MSc & PhD): ${bothCount}`);
  console.info(`  MSc Only: ${mscCount}`);

  // Verification checks
  const checkCau = cleanList.some(
    (u) => u.name.includes("Clark Atlanta") || u.website.includes("cau.edu"),
  );
  console.info(
    `\nCheck: Clark Atlanta University (cau.edu) present? ${checkCau ? "YES (FAIL)" : "NO (VERIFIED REMOVED)"}`,
  );

  const checkEmory = cleanList.some((u) => u.name.includes("Emory"));
  console.info(
    `Check: Emory University present? ${checkEmory ? "YES (FAIL)" : "NO (VERIFIED REMOVED)"}`,
  );

  const checkMudd = cleanList.some((u) => u.name.includes("Harvey Mudd"));
  console.info(
    `Check: Harvey Mudd College present? ${checkMudd ? "YES (FAIL)" : "NO (VERIFIED REMOVED)"}`,
  );

  // Write clean list
  fs.writeFileSync(dataPath, JSON.stringify(cleanList, null, 2), "utf-8");
  console.info(`Saved clean data to: ${dataPath}`);

  const srcPath = path.resolve(process.cwd(), "src", "data", "universities.json");
  fs.writeFileSync(srcPath, JSON.stringify(cleanList, null, 2), "utf-8");
  console.info(`Synced clean data to webview: ${srcPath}`);
}

main();
