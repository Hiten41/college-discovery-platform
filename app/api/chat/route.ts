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

  if (contextualClassification.operation === "LIST_COLLEGES" || contextualClassification.operation === "DEBUG_DATABASE") {
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

  if (classification.operation === "COLLEGE_DETAILS") {
    if (result.colleges.length === 0) {
      return "I could not find that college in the CollegeHub database.";
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

function buildGeneralFallback(message: string): string {
  const normalized = normalizeText(message);

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

  return "Motu could not generate that general explanation right now. Please try again shortly.";
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
    model: "gemini-2.5-flash",
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

    const history = parseHistory(body.history);
    const activeCollegeContext = parseActiveCollegeContext(body.activeCollegeContext);
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
