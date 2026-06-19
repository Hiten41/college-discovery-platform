import { NextResponse } from "next/server";
import { getRankPredictorColleges } from "@/lib/collegeSource";
import { predictColleges } from "@/lib/rankPredictor/predictor";
import {
  BRANCHES,
  CATEGORIES,
  EXAMS,
  GENDERS,
  type RankPredictorInput,
} from "@/lib/rankPredictor/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function includes<T extends string>(values: readonly T[], value: unknown): value is T {
  return typeof value === "string" && values.includes(value as T);
}

function parseInput(value: unknown): RankPredictorInput | null {
  if (typeof value !== "object" || value === null) return null;
  const body = value as Record<string, unknown>;
  const rank = typeof body.rank === "number" ? body.rank : Number(body.rank);
  const homeState = typeof body.homeState === "string" ? body.homeState.trim() : "";

  if (
    !includes(EXAMS, body.exam) ||
    !Number.isInteger(rank) ||
    rank < 1 ||
    rank > 10_000_000 ||
    !includes(CATEGORIES, body.category) ||
    !includes(GENDERS, body.gender) ||
    homeState.length < 2 ||
    homeState.length > 80 ||
    !includes(BRANCHES, body.preferredBranch)
  ) {
    return null;
  }

  return {
    exam: body.exam,
    rank,
    category: body.category,
    gender: body.gender,
    homeState,
    preferredBranch: body.preferredBranch,
  };
}

export async function POST(request: Request) {
  try {
    const input = parseInput(await request.json());
    if (!input) {
      return NextResponse.json(
        { error: "Please provide a valid exam, rank, category, gender, home state and preferred branch." },
        { status: 400 },
      );
    }

    const colleges = await getRankPredictorColleges();

    return NextResponse.json(predictColleges(colleges, input));
  } catch (error) {
    console.error("RANK PREDICTOR ERROR:", error);
    return NextResponse.json(
      { error: "The rank predictor could not complete this request. Please try again." },
      { status: 500 },
    );
  }
}
