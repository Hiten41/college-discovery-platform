import { fallbackColleges } from "@/lib/collegeFallback";
import { prisma } from "@/lib/prisma";

export type UnifiedCollege = {
  id: string;
  name: string;
  location: string;
  state: string | null;
  fees: number | null;
  avgPackage: string | null;
  highestPackage: string | null;
  nirfRank: number | null;
  rating: number | null;
  ownership: string | null;
  examsAccepted: string[];
  website: string | null;
  image: string | null;
  accreditation: string | null;
  establishedYear: number | null;
  description: string | null;
};

export type CollegeFilters = {
  search?: string | null;
  state?: string | null;
  ownership?: string | null;
  exam?: string | null;
  maxFees?: number | null;
  maxRank?: number | null;
};

const collegeSelect = {
  id: true,
  name: true,
  location: true,
  state: true,
  fees: true,
  avgPackage: true,
  highestPackage: true,
  nirfRank: true,
  rating: true,
  ownership: true,
  examsAccepted: true,
  website: true,
  image: true,
  accreditation: true,
  establishedYear: true,
  description: true,
} as const;

type DbCollege = {
  id: string;
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
  website: string | null;
  image: string | null;
  accreditation: string | null;
  establishedYear: number | null;
  description: string | null;
};

function splitExams(value: string | string[] | null | undefined): string[] {
  if (Array.isArray(value)) return value.map((exam) => exam.trim()).filter(Boolean);
  if (!value) return [];
  return value
    .split(/[,/|]+|\s+and\s+/i)
    .map((exam) => exam.trim())
    .filter(Boolean);
}

export function normalizeCollege(college: DbCollege | (typeof fallbackColleges)[number]): UnifiedCollege {
  return {
    id: college.id,
    name: college.name,
    location: college.location,
    state: college.state ?? null,
    fees: college.fees ?? null,
    avgPackage: college.avgPackage ?? null,
    highestPackage: college.highestPackage ?? null,
    nirfRank: college.nirfRank ?? null,
    rating: college.rating ?? null,
    ownership: college.ownership ?? null,
    examsAccepted: splitExams(college.examsAccepted),
    website: college.website ?? null,
    image: college.image ?? null,
    accreditation: college.accreditation ?? null,
    establishedYear: college.establishedYear ?? null,
    description: college.description ?? null,
  };
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function applyFilters(colleges: UnifiedCollege[], filters: CollegeFilters = {}) {
  const search = filters.search?.trim();
  const state = filters.state?.trim();
  const ownership = filters.ownership?.trim();
  const exam = filters.exam?.trim();

  return colleges.filter((college) => {
    const matchesSearch = search
      ? normalizeText(college.name).includes(normalizeText(search))
      : true;
    const matchesState = state
      ? normalizeText(college.state ?? "").includes(normalizeText(state))
      : true;
    const matchesOwnership = ownership
      ? normalizeText(college.ownership ?? "").includes(normalizeText(ownership))
      : true;
    const matchesExam = exam
      ? college.examsAccepted.some((acceptedExam) =>
          normalizeText(acceptedExam).includes(normalizeText(exam)),
        )
      : true;
    const matchesFees =
      filters.maxFees !== null && filters.maxFees !== undefined
        ? college.fees !== null && college.fees <= filters.maxFees
        : true;
    const matchesRank =
      filters.maxRank !== null && filters.maxRank !== undefined
        ? college.nirfRank !== null && college.nirfRank <= filters.maxRank
        : true;

    return matchesSearch && matchesState && matchesOwnership && matchesExam && matchesFees && matchesRank;
  });
}

function sortColleges(colleges: UnifiedCollege[]) {
  return [...colleges].sort(
    (a, b) =>
      (a.nirfRank ?? Number.POSITIVE_INFINITY) - (b.nirfRank ?? Number.POSITIVE_INFINITY) ||
      (b.rating ?? 0) - (a.rating ?? 0) ||
      a.name.localeCompare(b.name),
  );
}

function fallbackSource(filters?: CollegeFilters) {
  return sortColleges(applyFilters(fallbackColleges.map(normalizeCollege), filters));
}

async function dbSource(filters?: CollegeFilters) {
  if (process.env.COLLEGEHUB_FORCE_FALLBACK === "1") {
    throw new Error("Forced fallback mode");
  }

  const colleges = await prisma.college.findMany({
    select: collegeSelect,
    orderBy: [{ nirfRank: "asc" }, { rating: "desc" }, { name: "asc" }],
  });

  return sortColleges(applyFilters(colleges.map(normalizeCollege), filters));
}

export async function getAllColleges(filters?: CollegeFilters): Promise<UnifiedCollege[]> {
  try {
    return await dbSource(filters);
  } catch (error) {
    console.error("COLLEGE SOURCE FALLBACK:", error);
    return fallbackSource(filters);
  }
}

export async function getCollegeCards(filters?: CollegeFilters): Promise<UnifiedCollege[]> {
  return getAllColleges(filters);
}

export async function getRankPredictorColleges(): Promise<UnifiedCollege[]> {
  return getAllColleges();
}

export async function getMotuColleges(): Promise<UnifiedCollege[]> {
  return getAllColleges();
}

export async function getCollegeById(id: string): Promise<UnifiedCollege | null> {
  const colleges = await getAllColleges();
  return colleges.find((college) => college.id === id) ?? null;
}
