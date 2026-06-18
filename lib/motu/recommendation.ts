import { packageToLpa } from "@/lib/motu/retrieval";
import type { CollegeRecord, QueryClassification } from "@/lib/motu/types";

export type RankedCollege = {
  college: CollegeRecord;
  score: number;
  reasons: string[];
};

export function collegeRecommendationEngine(
  colleges: CollegeRecord[],
  query: QueryClassification,
): RankedCollege[] {
  return colleges
    .filter((college) => query.budget === null || (college.fees !== null && college.fees <= query.budget))
    .filter(
      (college) =>
        query.ownership === null ||
        college.ownership?.toLowerCase() === query.ownership.toLowerCase(),
    )
    .map((college) => {
      const reasons: string[] = [];
      let score = 0;

      if (college.nirfRank !== null) {
        score += Math.max(0, 60 - college.nirfRank);
        if (college.nirfRank <= 20) reasons.push(`Strong NIRF rank (${college.nirfRank})`);
      }
      const averagePackage = packageToLpa(college.avgPackage);
      if (averagePackage !== null) {
        score += Math.min(averagePackage * 2, 60);
        if (averagePackage >= 15) reasons.push(`Strong average package (${college.avgPackage})`);
      }
      if (query.budget !== null && college.fees !== null) {
        score += Math.max(0, 20 - (college.fees / query.budget) * 10);
        reasons.push(`Within budget at Rs. ${college.fees.toLocaleString("en-IN")}`);
      }
      if (college.rating !== null) score += college.rating * 3;
      if (reasons.length === 0) reasons.push("Good balance of ranking, rating, and placements");

      return { college, score, reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

type FutureEngineStatus = {
  available: false;
  reason: string;
};

// Extension points keep future predictors independent from chat orchestration.
export function rankPredictor(): FutureEngineStatus {
  return { available: false, reason: "Rank cutoff data is not configured yet." };
}

export function admissionChancePredictor(): FutureEngineStatus {
  return { available: false, reason: "Admission cutoff data is not configured yet." };
}

export function careerGuidanceEngine(): FutureEngineStatus {
  return { available: false, reason: "Career pathway data is not configured yet." };
}
