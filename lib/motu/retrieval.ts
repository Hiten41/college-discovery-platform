import { getMotuColleges } from "@/lib/collegeSource";
import { normalizeText } from "@/lib/motu/classifier";
import type { CollegeRecord } from "@/lib/motu/types";

export function packageToLpa(value: string | null): number | null {
  if (!value) return null;
  const match = value.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(cr|crore|lpa|lakh|lac)/);
  if (!match?.[1] || !match[2]) return null;
  const amount = Number(match[1]);
  return match[2] === "cr" || match[2] === "crore" ? amount * 100 : amount;
}

export async function getAllColleges(): Promise<CollegeRecord[]> {
  return getMotuColleges();
}

export async function getCollegeByName(name: string): Promise<CollegeRecord | null> {
  const colleges = await getAllColleges();
  const normalizedName = normalizeText(name);
  return (
    colleges.find((college) => normalizeText(college.name) === normalizedName) ??
    colleges.find((college) => normalizeText(college.name).includes(normalizedName)) ??
    null
  );
}

export async function getTopCollegesByPackage(limit = 10): Promise<CollegeRecord[]> {
  const colleges = await getAllColleges();
  return colleges
    .filter((college) => packageToLpa(college.highestPackage) !== null)
    .sort(
      (a, b) =>
        (packageToLpa(b.highestPackage) ?? 0) - (packageToLpa(a.highestPackage) ?? 0),
    )
    .slice(0, limit);
}

export async function getCollegesUnderBudget(budget: number): Promise<CollegeRecord[]> {
  return (await getAllColleges())
    .filter((college) => college.fees !== null && college.fees <= budget)
    .sort(
      (a, b) =>
        (a.nirfRank ?? Number.POSITIVE_INFINITY) - (b.nirfRank ?? Number.POSITIVE_INFINITY) ||
        (b.rating ?? 0) - (a.rating ?? 0) ||
        (a.fees ?? Number.POSITIVE_INFINITY) - (b.fees ?? Number.POSITIVE_INFINITY),
    );
}

export async function compareColleges(names: string[]): Promise<{
  colleges: CollegeRecord[];
  missingNames: string[];
}> {
  const results = await Promise.all(names.map((name) => getCollegeByName(name)));
  return {
    colleges: results.filter((college): college is CollegeRecord => college !== null),
    missingNames: names.filter((_, index) => results[index] === null),
  };
}

export function findMentionedCollegeNames(message: string, colleges: CollegeRecord[]): string[] {
  const normalizedMessage = normalizeText(message);
  return colleges
    .filter((college) => normalizedMessage.includes(normalizeText(college.name)))
    .map((college) => college.name);
}

export function parseComparisonNames(message: string): string[] {
  const withoutCommand = message.replace(/^.*?\b(compare|comparison of)\b/i, "").trim();
  return withoutCommand
    .split(/\s+(?:and|vs\.?|versus|with)\s+/i)
    .map((name) => name.replace(/[?.!,]+$/g, "").trim())
    .filter(Boolean)
    .slice(0, 4);
}
