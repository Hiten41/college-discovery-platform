import type {
  CollegePrediction,
  PredictionTier,
  RankPredictorCollege,
  RankPredictorInput,
  ScoreFactor,
} from "@/lib/rankPredictor/types";

const round = (value: number) => Math.round(value * 10) / 10;
const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

function packageToLpa(value: string | null): number | null {
  if (!value) return null;
  const match = value.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(cr|crore|lpa|lakh|lac)/);
  if (!match?.[1] || !match[2]) return null;
  const amount = Number(match[1]);
  return match[2] === "cr" || match[2] === "crore" ? amount * 100 : amount;
}

function competitivenessBenchmark(nirfRank: number | null): number {
  if (nirfRank === null) return 75000;
  return 1500 + (clamp(nirfRank, 1, 150) - 1) / 149 * 148500;
}

function scoreRankFit(college: RankPredictorCollege, input: RankPredictorInput): ScoreFactor {
  const benchmark = competitivenessBenchmark(college.nirfRank);
  const score = clamp(100 / (1 + Math.pow(input.rank / benchmark, 0.75)), 1, 99);
  return {
    key: "rankFit",
    label: "Rank fit",
    score: round(score),
    maximum: 100,
    explanation: `Rank ${input.rank.toLocaleString("en-IN")} is compared with a ${Math.round(benchmark).toLocaleString("en-IN")} competitiveness benchmark derived from stored NIRF data.`,
  };
}

export function scoreNirfQuality(nirfRank: number | null): ScoreFactor {
  if (nirfRank === null) {
    return {
      key: "nirfQuality",
      label: "NIRF quality",
      score: 14,
      maximum: 35,
      explanation: "No NIRF rank is stored, so a conservative neutral value is used.",
    };
  }

  const score = clamp(((150 - clamp(nirfRank, 1, 150)) / 149) * 35, 0, 35);
  return {
    key: "nirfQuality",
    label: "NIRF quality",
    score: round(score),
    maximum: 35,
    explanation: `Stored NIRF rank ${nirfRank} contributes to college quality only, not Dream/Target/Safe tiering.`,
  };
}

function scoreValue(college: RankPredictorCollege): ScoreFactor {
  const averagePackage = packageToLpa(college.avgPackage);
  if (averagePackage === null || college.fees === null || college.fees <= 0) {
    return {
      key: "value",
      label: "Stored value profile",
      score: 12,
      maximum: 30,
      explanation: "Package or fee data is incomplete, so a conservative neutral value is used.",
    };
  }

  const ratio = averagePackage / (college.fees / 100000);
  const score = clamp((ratio / 8) * 30, 0, 30);
  return {
    key: "value",
    label: "Stored value profile",
    score: round(score),
    maximum: 30,
    explanation: `The stored average-package-to-fee ratio contributes ${round(score)} of 30 quality points.`,
  };
}

function scorePackage(college: RankPredictorCollege): ScoreFactor {
  const averagePackage = packageToLpa(college.avgPackage);
  if (averagePackage === null) {
    return {
      key: "package",
      label: "Average package",
      score: 8,
      maximum: 20,
      explanation: "Average package data is incomplete, so a conservative neutral value is used.",
    };
  }

  const score = clamp((averagePackage / 40) * 20, 0, 20);
  return {
    key: "package",
    label: "Average package",
    score: round(score),
    maximum: 20,
    explanation: `Stored average package ${college.avgPackage} contributes ${round(score)} of 20 quality points.`,
  };
}

function scoreOwnership(ownership: string | null): ScoreFactor {
  const isPublic = /government|public|central|state/i.test(ownership ?? "");
  return {
    key: "ownership",
    label: "Ownership",
    score: isPublic ? 15 : 7.5,
    maximum: 15,
    explanation: isPublic
      ? "Government/public ownership adds 15 quality points for affordability and stability."
      : "Ownership contributes a neutral 7.5 quality points.",
  };
}

function scoreBranch(input: RankPredictorInput): ScoreFactor {
  return {
    key: "branch",
    label: "Branch preference",
    score: 0,
    maximum: 5,
    explanation: `${input.preferredBranch} is recorded, but CollegeHub has no branch availability or branch cutoff data, so it does not alter the V1 score.`,
  };
}

export function tierForScore(score: number): PredictionTier {
  if (score < 35) return "dream";
  if (score < 75) return "target";
  return "safe";
}

export function scoreCollege(
  college: RankPredictorCollege,
  input: RankPredictorInput,
  examMatch: "confirmed" | "verify",
): CollegePrediction {
  const rankFitFactor = scoreRankFit(college, input);
  const qualityFactors = [
    scoreNirfQuality(college.nirfRank),
    scorePackage(college),
    scoreValue(college),
    scoreOwnership(college.ownership),
  ];
  const factors = [
    rankFitFactor,
    ...qualityFactors,
    scoreBranch(input),
  ];
  const rankFitScore = Math.round(rankFitFactor.score);
  const collegeQualityScore = Math.round(clamp(
    qualityFactors.reduce((total, factor) => total + factor.score, 0),
    0,
    100,
  ));
  const confidenceScore = rankFitScore;
  const valueFactor = factors.find((factor) => factor.key === "value");
  const reasons = [
    `Rank fit score: ${rankFitScore}/100 determines the ${tierForScore(rankFitScore)} tier`,
    `College quality score: ${collegeQualityScore}/100 is used only for ordering within this tier`,
    college.avgPackage
      ? `Stored average package: ${college.avgPackage}`
      : "Average package data should be verified",
    college.fees !== null
      ? `Stored fee: Rs. ${college.fees.toLocaleString("en-IN")}`
      : "Fee data should be verified",
    college.nirfRank !== null
      ? `NIRF rank ${college.nirfRank} informs competitiveness and quality proxies`
      : "NIRF rank is unavailable",
  ];

  if ((valueFactor?.score ?? 0) >= 21) reasons.push("Strong stored package-to-fee profile");
  if (examMatch === "verify") reasons.push(`${input.exam} acceptance is not confirmed in the stored record`);
  reasons.push(`Verify ${input.preferredBranch} availability and current counselling cutoffs`);

  return {
    college,
    tier: tierForScore(confidenceScore),
    confidenceScore,
    rankFitScore,
    collegeQualityScore,
    reasons,
    factors,
    examMatch,
  };
}
