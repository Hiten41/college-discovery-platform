import { getCollegeCards } from "@/lib/collegeSource";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET(req: Request) {
  const { searchParams } =
    new URL(req.url)

  const search = searchParams.get("search")

  const state = searchParams.get("state")

  const ownership =
    searchParams.get("ownership")

  const exam =
    searchParams.get("exam")

  const maxFees =
    searchParams.get("maxFees")

  const maxRank =
    searchParams.get("maxRank")

  const colleges = await getCollegeCards({
    search,
    state,
    ownership,
    exam,
    maxFees: maxFees ? Number(maxFees) : null,
    maxRank: maxRank ? Number(maxRank) : null,
  });

  return NextResponse.json(colleges, {
    headers: {
      "Cache-Control":
        "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
