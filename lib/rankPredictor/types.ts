export const EXAMS = ["JEE Main", "JEE Advanced"] as const;
export const CATEGORIES = ["General", "OBC", "EWS", "SC", "ST"] as const;
export const GENDERS = ["Male", "Female"] as const;
export const BRANCHES = [
  "CSE",
  "ECE",
  "Mechanical",
  "Electrical",
  "Civil",
  "Chemical",
  "Other",
] as const;

export type Exam = (typeof EXAMS)[number];
export type Category = (typeof CATEGORIES)[number];
export type Gender = (typeof GENDERS)[number];
export type PreferredBranch = (typeof BRANCHES)[number];
export type PredictionTier = "dream" | "target" | "safe";

export type RankPredictorInput = {
  exam: Exam;
  rank: number;
  category: Category;
  gender: Gender;
  homeState: string;
  preferredBranch: PreferredBranch;
};

export type RankPredictorCollege = {
  name: string;
  location: string;
  state: string | null;
  fees: number | null;
  avgPackage: string | null;
  highestPackage: string | null;
  nirfRank: number | null;
  ownership: string | null;
  examsAccepted: string[];
};

export type ScoreFactor = {
  key: "rankFit" | "nirfQuality" | "package" | "value" | "ownership" | "branch";
  label: string;
  score: number;
  maximum: number;
  explanation: string;
};

export type CollegePrediction = {
  college: RankPredictorCollege;
  tier: PredictionTier;
  confidenceScore: number;
  rankFitScore: number;
  collegeQualityScore: number;
  reasons: string[];
  factors: ScoreFactor[];
  examMatch: "confirmed" | "verify";
};

export type RankPredictionResult = {
  methodologyVersion: "v1";
  input: RankPredictorInput;
  groups: Record<PredictionTier, CollegePrediction[]>;
  totalEvaluated: number;
  disclaimer: string;
  limitations: string[];
};
