import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { classifyQuery, normalizeText } from "@/lib/motu/classifier";
import {
  applyActiveContextClassification,
  isContextualFollowUp,
  updateActiveCollegeContext,
} from "@/lib/motu/context";
import { buildGroundedPrompt } from "@/lib/motu/prompt";
import { collegeRecommendationEngine } from "@/lib/motu/recommendation";
import {
  formatRankPredictionForChat,
  predictColleges,
  rankPredictionInputFromMessage,
} from "@/lib/rankPredictor/predictor";
import {
  compareColleges,
  findMentionedCollegeNames,
  getAllColleges,
  getCollegesUnderBudget,
  getTopCollegesByPackage,
  packageToLpa,
  parseComparisonNames,
} from "@/lib/motu/retrieval";
import type {
  ActiveCollegeContext,
  ChatHistoryMessage,
  CollegeRecord,
  QueryClassification,
  RetrievalResult,
} from "@/lib/motu/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ChatRequestBody = {
  message?: unknown;
  history?: unknown;
  activeCollegeContext?: unknown;
};

type Coordinates = {
  lat: number;
  lon: number;
};

const CITY_COORDINATES: Record<string, Coordinates> = {
  chennai: { lat: 13.0827, lon: 80.2707 },
  delhi: { lat: 28.6139, lon: 77.209 },
  "new delhi": { lat: 28.6139, lon: 77.209 },
  gurgaon: { lat: 28.4595, lon: 77.0266 },
  gurugram: { lat: 28.4595, lon: 77.0266 },
  kanpur: { lat: 26.4499, lon: 80.3319 },
  mumbai: { lat: 19.076, lon: 72.8777 },
  tiruchirappalli: { lat: 10.7905, lon: 78.7047 },
  trichy: { lat: 10.7905, lon: 78.7047 },
  mangalore: { lat: 12.9141, lon: 74.856 },
  warangal: { lat: 17.9689, lon: 79.5941 },
  hyderabad: { lat: 17.385, lon: 78.4867 },
  prayagraj: { lat: 25.4358, lon: 81.8463 },
  allahabad: { lat: 25.4358, lon: 81.8463 },
  lucknow: { lat: 26.8467, lon: 80.9462 },
};

function parseMessage(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const message = value.trim();
  return message && message.length <= 1200 ? message : null;
}

function parseHistory(value: unknown): ChatHistoryMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (item): item is ChatHistoryMessage =>
        typeof item === "object" &&
        item !== null &&
        (item as { role?: unknown }).role !== undefined &&
        ((item as { role: unknown }).role === "user" ||
          (item as { role: unknown }).role === "assistant") &&
        typeof (item as { content?: unknown }).content === "string",
    )
    .map(({ role, content }) => ({ role, content: content.slice(0, 2000) }))
    .slice(-10);
}

function parseActiveCollegeContext(value: unknown): ActiveCollegeContext {
  if (!Array.isArray(value)) return [];
  return value
    .filter((name): name is string => typeof name === "string" && name.trim().length > 0)
    .map((name) => name.trim().slice(0, 160))
    .slice(0, 10);
}

export function isAbusiveMessage(message: string): boolean {
  const normalized = normalizeText(message);
  if (!normalized) return false;

  const abusiveTerms = [
    "madarchod",
    "madarchodh",
    "motherfucker",
    "bhenchod",
    "behenchod",
    "benchod",
    "bhosdike",
    "bhosdi",
    "bsdk",
    "b s d k",
    "chutiya",
    "chutia",
    "gaand",
    "gandu",
    "gaandu",
    "laude",
    "loda",
    "lund",
    "teri bund",
  ];

  return abusiveTerms.some((term) => normalized.includes(term));
}

export function buildAbuseFallback(): string {
  return [
    "Please keep the chat respectful.",
    "",
    "I am here to help with colleges, placements, fees, rankings, exams, admissions, and career paths. Ask a college-related question and I will help properly.",
  ].join("\n");
}

async function resolveFollowUpCollegeContext(
  message: string,
  history: ChatHistoryMessage[],
  activeCollegeContext: ActiveCollegeContext,
): Promise<ActiveCollegeContext> {
  if (!isContextualFollowUp(message)) {
    return activeCollegeContext;
  }

  const allColleges = await getAllColleges();
  if (findMentionedCollegeNames(message, allColleges).length > 0) {
    return [];
  }

  for (const item of [...history].reverse()) {
    if (item.role !== "user" || !/\b(compare|comparison of)\b/i.test(item.content)) continue;

    const compared = await compareColleges(parseComparisonNames(item.content));
    if (compared.colleges.length >= 2) {
      return compared.colleges.map((college) => college.name);
    }
  }

  return activeCollegeContext;
}

function formatFees(value: number | null): string {
  return value === null ? "N/A" : `Rs. ${value.toLocaleString("en-IN")}`;
}

function collegeTable(colleges: CollegeRecord[]): string {
  const header = "| College | Fees | Avg package | Highest package | NIRF | Location |";
  const divider = "|---|---:|---:|---:|---:|---|";
  const rows = colleges.map(
    (college) =>
      `| ${college.name} | ${formatFees(college.fees)} | ${college.avgPackage ?? "N/A"} | ${
        college.highestPackage ?? "N/A"
      } | ${college.nirfRank ?? "N/A"} | ${college.location} |`,
  );
  return [header, divider, ...rows].join("\n");
}

function isValueJudgementQuestion(message: string): boolean {
  return /\b(worth|good|value|roi|return|choose|prefer)\b/.test(normalizeText(message));
}

function isFinancialAidQuestion(message: string): boolean {
  return /\b(financial aid|scholarship|scholarships|loan|loans|waiver|waivers|fee remission|fee concession|afford|affordable)\b/.test(
    normalizeText(message),
  );
}

function isOwnershipQuestion(message: string): boolean {
  return /\b(government|govt|public|private|ownership|owned|based)\b/.test(
    normalizeText(message),
  );
}

function isPlacementStatsQuestion(message: string): boolean {
  return /\b(placement|placements|package|packages|ctc|stats|statistics)\b/.test(
    normalizeText(message),
  );
}

function buildOwnershipReply(college: CollegeRecord): string {
  const ownership = college.ownership ?? "N/A";
  const article = /^[aeiou]/i.test(ownership) ? "an" : "a";

  return [
    `**Yes. ${college.name} is listed as ${article} ${ownership} institution in CollegeHub.**`,
    "",
    `Stored details:`,
    `- **Ownership:** ${ownership}`,
    `- **Location:** ${college.location}${college.state ? `, ${college.state}` : ""}`,
    `- **Exams accepted:** ${college.examsAccepted.length > 0 ? college.examsAccepted.join(", ") : "N/A"}`,
  ].join("\n");
}

function buildPlacementStatsReply(college: CollegeRecord): string {
  return [
    `**${college.name} placement snapshot from CollegeHub:**`,
    "",
    `- **Average package:** ${college.avgPackage ?? "N/A"}`,
    `- **Highest package:** ${college.highestPackage ?? "N/A"}`,
    `- **NIRF rank:** ${college.nirfRank ?? "N/A"}`,
    `- **Fees:** ${formatFees(college.fees)}`,
    `- **Rating:** ${college.rating ?? "N/A"}`,
    `- **Location:** ${college.location}${college.state ? `, ${college.state}` : ""}`,
    `- **Exams accepted:** ${college.examsAccepted.length > 0 ? college.examsAccepted.join(", ") : "N/A"}`,
    "",
    "CollegeHub does not store branch-wise placement percentages, median CTC, recruiter counts, or year-wise placement reports yet. For final admission decisions, verify the latest official placement report from the institute.",
  ].join("\n");
}

function buildFinancialAidReply(college: CollegeRecord): string {
  return [
    `**Financial aid at ${college.name}:** CollegeHub has the college record, but it does not store exact scholarship or fee-waiver scheme rules yet.`,
    "",
    `What CollegeHub does know:`,
    `- **Stored fees:** ${formatFees(college.fees)}`,
    `- **Ownership:** ${college.ownership ?? "N/A"}`,
    `- **Location:** ${college.location}${college.state ? `, ${college.state}` : ""}`,
    `- **Exams accepted:** ${college.examsAccepted.length > 0 ? college.examsAccepted.join(", ") : "N/A"}`,
    `- **Website:** ${college.website ?? "N/A"}`,
    "",
    `For IITs, students should usually check institute scholarships, income-based tuition fee remission, education loans, and government/category scholarships directly on the official institute/admissions pages. Verify eligibility by income, category, program, and academic year before deciding.`,
  ].join("\n");
}

function buildCollegeWorthReply(college: CollegeRecord): string {
  const packageLpa = packageToLpa(college.avgPackage);
  const feesInLakhs = college.fees !== null ? college.fees / 100000 : null;
  const roiLine =
    packageLpa !== null && feesInLakhs !== null && feesInLakhs > 0
      ? `- **ROI signal:** strong on stored data, with avg package ${college.avgPackage} against fees of ${formatFees(college.fees)}.`
      : `- **ROI signal:** check the exact fee period and branch-wise placement report before deciding.`;

  return [
    `**Yes, ${college.name} is generally worth serious preference** if you are getting a branch you are happy with.`,
    "",
    `CollegeHub stored snapshot:`,
    `- **NIRF rank:** ${college.nirfRank ?? "N/A"}`,
    `- **Average package:** ${college.avgPackage ?? "N/A"}`,
    `- **Highest package:** ${college.highestPackage ?? "N/A"}`,
    `- **Fees:** ${formatFees(college.fees)}`,
    `- **Rating:** ${college.rating ?? "N/A"}`,
    `- **Location:** ${college.location}${college.state ? `, ${college.state}` : ""}`,
    `- **Ownership:** ${college.ownership ?? "N/A"}`,
    `- **Exams accepted:** ${college.examsAccepted.length > 0 ? college.examsAccepted.join(", ") : "N/A"}`,
    roiLine,
    "",
    `**Decision rule:** prefer ${college.name} when the branch aligns with your long-term goal. If another top IIT offers a much stronger branch for your goals, compare branch outcomes first; IIT brand alone should not override branch fit.`,
  ].join("\n");
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function distanceInKm(a: Coordinates, b: Coordinates): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lon - a.lon);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return Math.round(earthRadiusKm * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

function getCityCoordinates(value: string | null | undefined): Coordinates | null {
  if (!value) return null;
  return CITY_COORDINATES[normalizeText(value)] ?? null;
}

function inferReferenceCity(message: string): string | null {
  const normalized = normalizeText(message);
  return (
    Object.keys(CITY_COORDINATES)
      .sort((a, b) => b.length - a.length)
      .find((city) => normalized.includes(city)) ?? null
  );
}

function buildProximityReply(message: string, colleges: CollegeRecord[]): string | null {
  const normalized = normalizeText(message);
  if (!/\b(close|closest|near|nearby|nearest|distance|far|farther)\b/.test(normalized)) {
    return null;
  }

  const referenceCity = inferReferenceCity(message);
  const referenceCoordinates = getCityCoordinates(referenceCity);
  if (!referenceCity || !referenceCoordinates) {
    return null;
  }

  const ranked = colleges
    .map((college) => {
      const coordinates = getCityCoordinates(college.location);
      return coordinates
        ? {
            college,
            distance: distanceInKm(referenceCoordinates, coordinates),
          }
        : null;
    })
    .filter((item): item is { college: CollegeRecord; distance: number } => item !== null)
    .sort((a, b) => a.distance - b.distance);

  if (ranked.length === 0) {
    return null;
  }

  const closest = ranked[0];
  const rows = ranked
    .map(
      ({ college, distance }, index) =>
        `${index + 1}. **${college.name}** — ${college.location}, approx. ${distance.toLocaleString("en-IN")} km from ${referenceCity}`,
    )
    .join("\n");

  return `**Closest to ${referenceCity}: ${closest.college.name}.**\n\n${rows}\n\nFor Gurgaon/Gurugram specifically, IIT Delhi is the most practical nearby option among this list. Final preference should still depend on branch availability, JoSAA cutoff, and your branch priority.`;
}

function inferLocation(
  message: string,
  colleges: CollegeRecord[],
): string | null {
  const normalized = normalizeText(message);
  const locations = colleges.flatMap((college) => [college.location, college.state]).filter(
    (value): value is string => Boolean(value),
  );
  return locations.find((location) => normalized.includes(normalizeText(location))) ?? null;
}

async function retrieveDatabaseContext(
  message: string,
  initialClassification: QueryClassification,
  activeCollegeContext: ActiveCollegeContext,
): Promise<{
  classification: QueryClassification;
  result: RetrievalResult;
  availableCollegeNames: string[];
}> {
  const emptyResult: RetrievalResult = {
    colleges: [],
    requestedNames: [],
    missingNames: [],
    notes: [],
  };

  const contextualClassification = applyActiveContextClassification(
    message,
    initialClassification,
    activeCollegeContext,
  );

  if (contextualClassification.type === "GENERAL_QUERY") {
    return {
      classification: contextualClassification,
      result: emptyResult,
      availableCollegeNames: [],
    };
  }

  const allColleges = await getAllColleges();
  const availableCollegeNames = allColleges.map((college) => college.name);

  if (
    contextualClassification.operation === "LIST_COLLEGES" ||
    contextualClassification.operation === "COUNT_COLLEGES" ||
    contextualClassification.operation === "DEBUG_DATABASE"
  ) {
    return {
      classification: contextualClassification,
      result: { ...emptyResult, colleges: allColleges },
      availableCollegeNames,
    };
  }

  if (contextualClassification.operation === "TOP_BY_PACKAGE") {
    const colleges = await getTopCollegesByPackage(10);
    return {
      classification: contextualClassification,
      result: { ...emptyResult, colleges },
      availableCollegeNames,
    };
  }

  if (contextualClassification.operation === "FILTER_BY_BUDGET" && contextualClassification.budget !== null) {
    const colleges = await getCollegesUnderBudget(contextualClassification.budget);
    return {
      classification: contextualClassification,
      result: { ...emptyResult, colleges },
      availableCollegeNames,
    };
  }

  const location = inferLocation(message, allColleges);
  const classification = { ...contextualClassification, location };

  if (classification.operation === "CONTEXT_FOLLOW_UP") {
    const validatedContext = activeCollegeContext.filter((name) =>
      availableCollegeNames.includes(name),
    );
    const compared = await compareColleges(validatedContext);
    return {
      classification,
      result: {
        ...emptyResult,
        requestedNames: validatedContext,
        ...compared,
      },
      availableCollegeNames,
    };
  }

  if (classification.operation === "COMPARE_COLLEGES") {
    const requestedNames = parseComparisonNames(message);
    const compared = await compareColleges(requestedNames);
    return {
      classification,
      result: { ...emptyResult, requestedNames, ...compared },
      availableCollegeNames,
    };
  }

  if (classification.operation === "COLLEGE_DETAILS") {
    const requestedNames = findMentionedCollegeNames(message, allColleges);
    const colleges = allColleges.filter((college) => requestedNames.includes(college.name));
    return {
      classification,
      result: {
        ...emptyResult,
        colleges,
        requestedNames,
        missingNames: colleges.length === 0 ? [message] : [],
      },
      availableCollegeNames,
    };
  }

  const locationFiltered = location
    ? allColleges.filter(
        (college) => college.location === location || college.state === location,
      )
    : allColleges;
  const ranked = collegeRecommendationEngine(locationFiltered, classification);
  const notes = ranked.flatMap(({ college, reasons }) => [
    `${college.name}: ${reasons.join("; ")}`,
  ]);

  if (classification.branch) {
    notes.push(
      `CollegeHub does not store branch availability or branch-wise placements, so ${classification.branch} availability must be verified with each college.`,
    );
  }
  if (classification.studentRank !== null) {
    notes.push(
      "CollegeHub does not store admission cutoffs. Do not estimate admission chance from NIRF rank.",
    );
  }

  return {
    classification,
    result: { ...emptyResult, colleges: ranked.map(({ college }) => college), notes },
    availableCollegeNames,
  };
}

export function buildDatabaseReply(
  message: string,
  classification: QueryClassification,
  result: RetrievalResult,
  activeCollegeContext: ActiveCollegeContext,
): string {
  if (classification.operation === "DEBUG_DATABASE") {
    return [
      `Query classification: ${classification.type}`,
      `Active college context: ${activeCollegeContext.length > 0 ? activeCollegeContext.join(", ") : "None"}`,
      `Record count: ${result.colleges.length}`,
      "Retrieved colleges:",
      ...result.colleges.map((college) => `- ${college.name}`),
    ].join("\n");
  }

  if (classification.operation === "LIST_COLLEGES") {
    return result.colleges.map((college) => college.name).join("\n");
  }

  if (classification.operation === "COUNT_COLLEGES") {
    const count = result.colleges.length;
    return `CollegeHub currently has ${count.toLocaleString("en-IN")} college${count === 1 ? "" : "s"} listed.`;
  }

  if (classification.operation === "COLLEGE_DETAILS") {
    if (result.colleges.length === 0) {
      return "I could not find that college in the CollegeHub database.";
    }
    if (isPlacementStatsQuestion(message) && result.colleges.length === 1) {
      return buildPlacementStatsReply(result.colleges[0]);
    }
    if (isOwnershipQuestion(message) && result.colleges.length === 1) {
      return buildOwnershipReply(result.colleges[0]);
    }
    if (isFinancialAidQuestion(message) && result.colleges.length === 1) {
      return buildFinancialAidReply(result.colleges[0]);
    }
    if (isValueJudgementQuestion(message) && result.colleges.length === 1) {
      return buildCollegeWorthReply(result.colleges[0]);
    }
    return collegeTable(result.colleges);
  }

  if (classification.operation === "COMPARE_COLLEGES") {
    if (result.requestedNames.length === 0) {
      return "I could not determine which colleges you want to compare. Please name both colleges.";
    }
    if (result.missingNames.length > 0) {
      const missing = result.missingNames.join(", ");
      const found = result.colleges.length > 0 ? `\n\nAvailable record:\n${collegeTable(result.colleges)}` : "";
      return `I could not find ${missing} in the CollegeHub database.${found}`;
    }
    return `${collegeTable(result.colleges)}\n\n**Placement:** ${
      [...result.colleges].sort((a, b) =>
        (packageToLpa(b.avgPackage) ?? 0) - (packageToLpa(a.avgPackage) ?? 0),
      )[0]?.name ?? "Not available"
    } has the stronger stored average-package figure. Compare fees, rank, location, and exams alongside placements.`;
  }

  if (classification.operation === "CONTEXT_FOLLOW_UP") {
    if (result.colleges.length === 0) {
      return "I could not retrieve the colleges from the active conversation context.";
    }

    const normalized = normalizeText(message);
    const proximityReply = buildProximityReply(message, result.colleges);
    if (proximityReply) {
      return proximityReply;
    }
    if (/\b(fee|fees|cost|price)\b/.test(normalized)) {
      const collegesWithFees = [...result.colleges]
        .filter((college) => college.fees !== null)
        .sort((a, b) => (a.fees ?? Infinity) - (b.fees ?? Infinity));
      const lowest = collegesWithFees[0];
      const allEqual =
        collegesWithFees.length > 1 &&
        collegesWithFees.every((college) => college.fees === lowest?.fees);
      if (allEqual) {
        return `${collegeTable(result.colleges)}\n\n**Fees:** The stored fee is the same for both colleges at ${formatFees(lowest?.fees ?? null)}.`;
      }
      return `${collegeTable(result.colleges)}\n\n**Fees:** ${lowest?.name ?? "No college"} has the lower stored fee at ${formatFees(lowest?.fees ?? null)}.`;
    }
    if (/\b(rank|ranks|ranking|rankings|nirf)\b/.test(normalized)) {
      const highestRanked = [...result.colleges]
        .filter((college) => college.nirfRank !== null)
        .sort((a, b) => (a.nirfRank ?? Infinity) - (b.nirfRank ?? Infinity))[0];
      return `${collegeTable(result.colleges)}\n\n**Ranking:** ${highestRanked?.name ?? "No college"} has the stronger stored NIRF rank (${highestRanked?.nirfRank ?? "N/A"}).`;
    }
    if (/\b(location|city|state)\b/.test(normalized)) {
      return result.colleges
        .map((college) => `- **${college.name}:** ${college.location}${college.state ? `, ${college.state}` : ""}`)
        .join("\n");
    }
    if (/\b(roi|return on investment)\b/.test(normalized)) {
      const rankedByRoi = [...result.colleges].sort((a, b) => {
        const aRoi = (packageToLpa(a.avgPackage) ?? 0) / ((a.fees ?? Infinity) / 100000);
        const bRoi = (packageToLpa(b.avgPackage) ?? 0) / ((b.fees ?? Infinity) / 100000);
        return bRoi - aRoi;
      });
      return `${collegeTable(result.colleges)}\n\n**ROI:** ${rankedByRoi[0]?.name ?? "Not available"} has the stronger rough ratio of stored average package to stored fees. Verify the fee period and branch-wise placement report before deciding.`;
    }
    if (/\b(recommend|choose|pick)\b/.test(normalized)) {
      const ranked = collegeRecommendationEngine(result.colleges, classification);
      const best = ranked[0];
      return `${collegeTable(result.colleges)}\n\n**Recommendation:** ${best?.college.name ?? "No clear choice"}\n${best?.reasons.map((reason) => `- ${reason}`).join("\n") ?? "- Insufficient stored data"}`;
    }
    if (/\b(package|packages|placement|placements)\b/.test(normalized)) {
      const strongest = [...result.colleges].sort(
        (a, b) => (packageToLpa(b.avgPackage) ?? 0) - (packageToLpa(a.avgPackage) ?? 0),
      )[0];
      return `${collegeTable(result.colleges)}\n\n**Placements:** ${strongest?.name ?? "Not available"} has the higher stored average package (${strongest?.avgPackage ?? "N/A"}).`;
    }
    return collegeTable(result.colleges);
  }

  if (classification.operation === "TOP_BY_PACKAGE") {
    return result.colleges.length > 0
      ? collegeTable(result.colleges)
      : "No package data is currently available in the CollegeHub database.";
  }

  if (classification.operation === "FILTER_BY_BUDGET") {
    return result.colleges.length > 0
      ? collegeTable(result.colleges)
      : `No CollegeHub colleges were found under ${formatFees(classification.budget)}.`;
  }

  return "I could not retrieve enough CollegeHub data to answer reliably.";
}

function buildRecommendationFallback(
  classification: QueryClassification,
  result: RetrievalResult,
): string {
  if (result.colleges.length === 0) {
    return "I could not find CollegeHub colleges matching those filters.";
  }

  const items = result.colleges.slice(0, 5).map((college, index) => {
    const reason = result.notes.find((note) => note.startsWith(`${college.name}:`));
    return `${index + 1}. **${college.name}**\n- ${reason?.split(": ")[1] ?? "Strong database match"}`;
  });
  const limitations = result.notes.filter((note) => note.startsWith("CollegeHub does not"));
  return [...items, ...limitations.map((note) => `\n${note}`)].join("\n");
}

export function buildGeneralFallback(message: string): string {
  const normalized = normalizeText(message);

  if (/\b(hi|hello|hey|namaste|start)\b/.test(normalized)) {
    return "Hi, I am Motu. Ask me about colleges, fees, placements, rankings, exams, comparisons, or rank guidance. For example: **Compare IIT Delhi and IIT Bombay** or **Best colleges under Rs. 2L fees**.";
  }
  if (
    /\biits?\b/.test(normalized) && /\bnits?\b/.test(normalized) ||
    /\b(general|overall|broad)\s+comparison\b/.test(normalized)
  ) {
    return [
      "**General IIT vs NIT comparison:**",
      "",
      "| Factor | IITs | NITs |",
      "|---|---|---|",
      "| Entrance route | JEE Advanced after qualifying JEE Main | JEE Main |",
      "| Brand and research | Usually stronger national/global brand and deeper research ecosystem | Strong national reputation, especially top NITs |",
      "| Placements | Top IITs usually lead, but branch matters a lot | Top NITs can beat lower IITs or weaker branches in outcomes |",
      "| Fees and access | Often higher competition for seats | Wider geographic spread and more seats through JEE Main |",
      "| Best fit | Choose when you get a strong branch or value the IIT ecosystem | Choose when you get a better branch, location, or ROI at a strong NIT |",
      "",
      "**Simple rule:** prefer branch + college tier together. A good branch at NIT Trichy, Surathkal, Warangal, or similar top NITs can be a better decision than a weak-fit branch at a lower IIT.",
    ].join("\n");
  }
  if (normalized.includes("jee advanced")) {
    return "**JEE Advanced** is the entrance examination used for admission to IIT undergraduate programs. Candidates must first qualify through JEE Main and satisfy the current eligibility rules. Admission is based on the JEE Advanced rank through JoSAA counselling.";
  }
  if (normalized.includes("jee main")) {
    return "**JEE Main** is the national entrance examination used mainly for NIT, IIIT, and other centrally funded engineering admissions. Its result is also the qualifying route to JEE Advanced. Seat allocation commonly happens through JoSAA and CSAB counselling.";
  }
  if (/\bgate\b/.test(normalized)) {
    return "**GATE** tests undergraduate-level engineering and science knowledge. Its score is used for many M.Tech and postgraduate admissions, and some public-sector recruitment. Eligibility, accepted papers, and cutoffs vary by institution and year.";
  }
  if (/\bcat\b/.test(normalized)) {
    return "**CAT** is the management entrance test used by the IIMs and many other business schools. It evaluates quantitative aptitude, verbal ability and reading comprehension, and data interpretation and logical reasoning.";
  }
  if (normalized.includes("computer science") || /\bcse\b/.test(normalized)) {
    return "**Computer Science Engineering** covers programming, algorithms, computer systems, databases, networks, and software development. When comparing programs, check the curriculum, faculty, internships, coding culture, branch-wise placements, and total cost.";
  }

  return "I am Motu, CollegeHub's college guidance assistant. I can help with colleges, ranks, fees, placements, exams, comparisons, scholarships, and admissions. Try asking something like **Is IIT Kanpur worth it?** or **Financial aid in IIT Delhi**.";
}

async function generateGroundedReply(
  message: string,
  classification: QueryClassification,
  result: RetrievalResult,
  history: ChatHistoryMessage[],
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return classification.type === "HYBRID_QUERY"
      ? buildRecommendationFallback(classification, result)
      : buildGeneralFallback(message);
  }

  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  });
  const prompt = buildGroundedPrompt(
    message,
    classification,
    result.colleges,
    history,
    result.notes,
  );
  const generated = await model.generateContent(prompt);
  return generated.response.text().trim();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const message = parseMessage(body.message);
    if (!message) {
      return NextResponse.json(
        { error: "Please send a valid message under 1200 characters." },
        { status: 400 },
      );
    }

    if (isAbusiveMessage(message)) {
      return NextResponse.json({
        reply: buildAbuseFallback(),
        activeCollegeContext: parseActiveCollegeContext(body.activeCollegeContext),
      });
    }

    const history = parseHistory(body.history);
    const activeCollegeContext = parseActiveCollegeContext(body.activeCollegeContext);
    const rankPredictionInput = rankPredictionInputFromMessage(message);
    if (rankPredictionInput) {
      const colleges = await getAllColleges();
      const prediction = predictColleges(colleges, rankPredictionInput, 3);
      const recommendedCollegeNames = [
        ...prediction.groups.target,
        ...prediction.groups.safe,
        ...prediction.groups.dream,
      ].map(({ college }) => college.name);
      const nextActiveCollegeContext = updateActiveCollegeContext({
        message,
        currentContext: activeCollegeContext,
        availableCollegeNames: colleges.map((college) => college.name),
        recommendedCollegeNames,
      });

      return NextResponse.json({
        reply: formatRankPredictionForChat(prediction),
        activeCollegeContext: nextActiveCollegeContext,
      });
    }

    const resolvedCollegeContext = await resolveFollowUpCollegeContext(
      message,
      history,
      activeCollegeContext,
    );
    const initialClassification = classifyQuery(message);
    const { classification, result, availableCollegeNames } = await retrieveDatabaseContext(
      message,
      initialClassification,
      resolvedCollegeContext,
    );
    const recommendedCollegeNames =
      classification.operation === "RECOMMEND_COLLEGES"
        ? result.colleges.map((college) => college.name)
        : [];
    const resolvedCollegeNames =
      classification.operation === "COMPARE_COLLEGES" ||
      classification.operation === "COLLEGE_DETAILS"
        ? result.colleges.map((college) => college.name)
        : [];
    const nextActiveCollegeContext = updateActiveCollegeContext({
      message,
      currentContext: resolvedCollegeContext,
      availableCollegeNames,
      resolvedCollegeNames,
      recommendedCollegeNames,
    });

    if (classification.type === "DATABASE_QUERY") {
      return NextResponse.json({
        reply: buildDatabaseReply(
          message,
          classification,
          result,
          nextActiveCollegeContext,
        ),
        activeCollegeContext: nextActiveCollegeContext,
      });
    }

    try {
      const reply = await generateGroundedReply(message, classification, result, history);
      return NextResponse.json({ reply, activeCollegeContext: nextActiveCollegeContext });
    } catch (error) {
      console.error("ASK MOTU MODEL ERROR:", error);
      return NextResponse.json({
        reply:
          classification.type === "HYBRID_QUERY"
            ? buildRecommendationFallback(classification, result)
            : buildGeneralFallback(message),
        activeCollegeContext: nextActiveCollegeContext,
      });
    }
  } catch (error) {
    console.error("ASK MOTU CHAT ERROR:", error);
    return NextResponse.json(
      { error: "Motu could not complete that request. Please try again." },
      { status: 500 },
    );
  }
}
