import type { QueryClassification } from "@/lib/motu/types";

export function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function extractBudget(message: string): number | null {
  const normalized = normalizeText(message);
  const lakhMatch = normalized.match(
    /(?:under|below|within|up to|less than|max(?:imum)?)\s+(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|l)/,
  );

  if (lakhMatch?.[1]) {
    return Math.round(Number(lakhMatch[1]) * 100000);
  }

  const numericMatch = normalized.match(
    /(?:under|below|within|up to|less than|max(?:imum)?)\s+(\d{5,8})/,
  );

  return numericMatch?.[1] ? Number(numericMatch[1]) : null;
}

function extractStudentRank(message: string): number | null {
  const match = normalizeText(message).match(/(?:rank|air)\s*(?:is|of|around|under|below)?\s*(\d{2,7})/);
  return match?.[1] ? Number(match[1]) : null;
}

function extractBranch(message: string): string | null {
  const normalized = normalizeText(message);
  const branches = [
    "computer science",
    "software engineering",
    "mechanical engineering",
    "civil engineering",
    "electrical engineering",
    "electronics",
    "chemical engineering",
    "aerospace engineering",
    "cse",
  ];

  return branches.find((branch) => normalized.includes(branch)) ?? null;
}

function extractOwnership(message: string): string | null {
  const normalized = normalizeText(message);
  if (/\b(government|public|govt)\b/.test(normalized)) return "Government";
  if (/\b(private)\b/.test(normalized)) return "Private";
  return null;
}

export function classifyQuery(message: string): QueryClassification {
  const normalized = normalizeText(message);
  const budget = extractBudget(message);
  const studentRank = extractStudentRank(message);
  const branch = extractBranch(message);
  const ownership = extractOwnership(message);
  const recommendation = /\b(recommend|suggest|best|shortlist|suitable|option)\b/.test(normalized);

  if (normalized === "debug database") {
    return {
      type: "DATABASE_QUERY",
      operation: "DEBUG_DATABASE",
      budget,
      studentRank,
      branch,
      location: null,
      ownership,
    };
  }

  if (
    /\b(list|show|return|name|what)\b/.test(normalized) &&
    (/\b(all|every|available)\b/.test(normalized) || normalized.includes("in collegehub")) &&
    /\b(college|colleges)\b/.test(normalized)
  ) {
    return { type: "DATABASE_QUERY", operation: "LIST_COLLEGES", budget, studentRank, branch, location: null, ownership };
  }

  if (/\b(compare|comparison|versus|vs)\b/.test(normalized) || /\b(which one)\b/.test(normalized)) {
    return { type: "DATABASE_QUERY", operation: "COMPARE_COLLEGES", budget, studentRank, branch, location: null, ownership };
  }

  if (/\b(highest|top|best)\b/.test(normalized) && /\b(package|placement|placements)\b/.test(normalized)) {
    return { type: recommendation ? "HYBRID_QUERY" : "DATABASE_QUERY", operation: "TOP_BY_PACKAGE", budget, studentRank, branch, location: null, ownership };
  }

  if (budget !== null) {
    return { type: recommendation || /\b(explain|why)\b/.test(normalized) ? "HYBRID_QUERY" : "DATABASE_QUERY", operation: recommendation ? "RECOMMEND_COLLEGES" : "FILTER_BY_BUDGET", budget, studentRank, branch, location: null, ownership };
  }

  if (recommendation) {
    return { type: "HYBRID_QUERY", operation: "RECOMMEND_COLLEGES", budget, studentRank, branch, location: null, ownership };
  }

  if (
    /\b(collegehub|fees|fee|financial|aid|scholarship|scholarships|loan|loans|waiver|waivers|package|placements|nirf|rating)\b/.test(normalized) ||
    (/\b(worth|good|value|roi|return|choose|prefer)\b/.test(normalized) && /\b(college|institute|university|iit|nit|iiit)\b/.test(normalized)) ||
    (/\b(tell me about|details of|information about)\b/.test(normalized) && /\b(college|institute|university|iit|nit|iiit)\b/.test(normalized))
  ) {
    return { type: "DATABASE_QUERY", operation: "COLLEGE_DETAILS", budget, studentRank, branch, location: null, ownership };
  }

  return { type: "GENERAL_QUERY", operation: "GENERAL_GUIDANCE", budget, studentRank, branch, location: null, ownership };
}
