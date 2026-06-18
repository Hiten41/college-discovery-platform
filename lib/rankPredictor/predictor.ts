import { normalizeText } from "@/lib/motu/classifier";
import { scoreCollege } from "@/lib/rankPredictor/scoring";
import type {
  Exam,
  PreferredBranch,
  RankPredictionResult,
  RankPredictorCollege,
  RankPredictorInput,
} from "@/lib/rankPredictor/types";

const DISCLAIMER =
  "V1 is a deterministic recommendation engine based on CollegeHub data. Scores are not admission probabilities and do not use JoSAA or CSAB cutoffs.";

function examMatch(
  college: RankPredictorCollege,
  exam: Exam,
): "confirmed" | "verify" | "incompatible" {
  if (!college.examsAccepted?.trim()) return "verify";
  const accepted = normalizeText(college.examsAccepted);
  const expected = normalizeText(exam);
  return accepted.includes(expected) ? "confirmed" : "incompatible";
}

export function predictColleges(
  colleges: RankPredictorCollege[],
  input: RankPredictorInput,
  limitPerTier = 6,
): RankPredictionResult {
  const predictions = colleges
    .map((college) => ({ college, match: examMatch(college, input.exam) }))
    .filter(({ match }) => match !== "incompatible")
    .map(({ college, match }) => scoreCollege(college, input, match as "confirmed" | "verify"));

  const groups: RankPredictionResult["groups"] = {
    dream: [],
    target: [],
    safe: [],
  };

  for (const prediction of predictions) groups[prediction.tier].push(prediction);
  for (const tier of Object.keys(groups) as Array<keyof typeof groups>) {
    groups[tier] = groups[tier]
      .sort((a, b) =>
        b.collegeQualityScore - a.collegeQualityScore
        || b.rankFitScore - a.rankFitScore
        || a.college.name.localeCompare(b.college.name)
      )
      .slice(0, limitPerTier);
  }

  return {
    methodologyVersion: "v1",
    input,
    groups,
    totalEvaluated: predictions.length,
    disclaimer: DISCLAIMER,
    limitations: [
      "Category, gender and home-state reservation rules are collected but do not change V1 scores because cutoff data is not stored.",
      "Preferred branch is not scored until branch availability and branch-specific cutoffs are available.",
      "Always verify current JoSAA/CSAB cutoffs, eligibility and fee periods before making a decision.",
    ],
  };
}

function extractBranch(message: string): PreferredBranch {
  const normalized = normalizeText(message);
  if (/\b(cse|computer science)\b/.test(normalized)) return "CSE";
  if (/\b(ece|electronics)\b/.test(normalized)) return "ECE";
  if (/\bmechanical\b/.test(normalized)) return "Mechanical";
  if (/\belectrical\b/.test(normalized)) return "Electrical";
  if (/\bcivil\b/.test(normalized)) return "Civil";
  if (/\bchemical\b/.test(normalized)) return "Chemical";
  return "Other";
}

export function rankPredictionInputFromMessage(message: string): RankPredictorInput | null {
  const normalized = normalizeText(message);
  const rankMatch = normalized.match(/\b(?:rank|air)\s*(?:is|of|around|under|below)?\s*(\d{1,7})\b/);
  if (!rankMatch?.[1]) return null;
  if (!/\b(jee|college|colleges|recommend|predict|admission|air|rank)\b/.test(normalized)) return null;

  return {
    exam: normalized.includes("advanced") ? "JEE Advanced" : "JEE Main",
    rank: Number(rankMatch[1]),
    category: "General",
    gender: "Male",
    homeState: "Not specified",
    preferredBranch: extractBranch(message),
  };
}

export function formatRankPredictionForChat(result: RankPredictionResult): string {
  const sections = (["dream", "target", "safe"] as const).map((tier) => {
    const heading = `${tier[0].toUpperCase()}${tier.slice(1)} Colleges`;
    const items = result.groups[tier].slice(0, 3).map(
      (prediction) =>
        `- **${prediction.college.name}** — ${prediction.confidenceScore}% recommendation confidence\n  ${prediction.reasons.slice(0, 2).join("; ")}`,
    );
    return `**${heading}**\n${items.length > 0 ? items.join("\n") : "- No matching stored colleges in this band"}`;
  });

  return [
    `**Rank Predictor V1** — ${result.input.exam}, rank ${result.input.rank.toLocaleString("en-IN")}`,
    ...sections,
    `_${result.disclaimer}_`,
    "Category, gender, home-state and branch-specific cutoff effects are not estimated in V1.",
  ].join("\n\n");
}
