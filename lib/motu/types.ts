export type QueryType = "DATABASE_QUERY" | "GENERAL_QUERY" | "HYBRID_QUERY";

export type QueryOperation =
  | "DEBUG_DATABASE"
  | "LIST_COLLEGES"
  | "COLLEGE_DETAILS"
  | "COMPARE_COLLEGES"
  | "CONTEXT_FOLLOW_UP"
  | "TOP_BY_PACKAGE"
  | "FILTER_BY_BUDGET"
  | "RECOMMEND_COLLEGES"
  | "GENERAL_GUIDANCE";

export type ChatRole = "user" | "assistant";

export type ChatHistoryMessage = {
  role: ChatRole;
  content: string;
};

export type CollegeRecord = {
  name: string;
  location: string;
  state: string | null;
  fees: number | null;
  avgPackage: string | null;
  highestPackage: string | null;
  nirfRank: number | null;
  rating: number | null;
  ownership: string | null;
  examsAccepted: string | null;
  description: string;
};

export type QueryClassification = {
  type: QueryType;
  operation: QueryOperation;
  budget: number | null;
  studentRank: number | null;
  branch: string | null;
  location: string | null;
  ownership: string | null;
};

export type RetrievalResult = {
  colleges: CollegeRecord[];
  requestedNames: string[];
  missingNames: string[];
  notes: string[];
};

export type ActiveCollegeContext = string[];
