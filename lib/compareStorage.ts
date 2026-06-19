export type StoredCompareCollege = {
  id: string;
  name: string;
  image: string;
  location: string;
  state: string | null;
  fees: number;
  avgPackage: string;
  rating: number;
  nirfRank: number;
  ownership: string | null;
  examsAccepted: string[];
  highestPackage: string | null;
  website: string | null;
  description: string | null;
  establishedYear: number | null;
  accreditation: string | null;
};

function splitExams(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((exam): exam is string => typeof exam === "string" && exam.trim().length > 0);
  }
  if (typeof value !== "string") return [];
  return value
    .split(/[,/|]+|\s+and\s+/i)
    .map((exam) => exam.trim())
    .filter(Boolean);
}

export function normalizeStoredCompareCollege(value: unknown): StoredCompareCollege | null {
  if (typeof value !== "object" || value === null) return null;
  const college = value as Record<string, unknown>;

  if (
    typeof college.id !== "string" ||
    typeof college.name !== "string" ||
    typeof college.location !== "string"
  ) {
    return null;
  }

  return {
    id: college.id,
    name: college.name,
    image: typeof college.image === "string" ? college.image : "/images/hacker.jpg",
    location: college.location,
    state: typeof college.state === "string" ? college.state : null,
    fees: typeof college.fees === "number" ? college.fees : Number(college.fees) || 0,
    avgPackage: typeof college.avgPackage === "string" ? college.avgPackage : "N/A",
    rating: typeof college.rating === "number" ? college.rating : Number(college.rating) || 0,
    nirfRank: typeof college.nirfRank === "number" ? college.nirfRank : Number(college.nirfRank) || 999,
    ownership: typeof college.ownership === "string" ? college.ownership : null,
    examsAccepted: splitExams(college.examsAccepted),
    highestPackage: typeof college.highestPackage === "string" ? college.highestPackage : null,
    website: typeof college.website === "string" ? college.website : null,
    description: typeof college.description === "string" ? college.description : null,
    establishedYear: typeof college.establishedYear === "number" ? college.establishedYear : null,
    accreditation: typeof college.accreditation === "string" ? college.accreditation : null,
  };
}

export function normalizeStoredCompareColleges(value: unknown): StoredCompareCollege[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(normalizeStoredCompareCollege)
    .filter((college): college is StoredCompareCollege => college !== null)
    .slice(0, 3);
}
