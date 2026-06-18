import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET(req: Request) {
  try {

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
    const colleges = await prisma.college.findMany({
    where: {
  ...(search
    ? {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }
    : {}),

  ...(state
    ? {
        state: {
          contains: state,
          mode: "insensitive",
        },
      }
    : {}),

  ...(ownership
    ? {
        ownership: {
          contains: ownership,
          mode: "insensitive",
        },
      }
    : {}),

  ...(exam
    ? {
        examsAccepted: {
          contains: exam,
          mode: "insensitive",
        },
      }
    : {}),

  ...(maxFees
    ? {
        fees: {
          lte: Number(maxFees),
        },
      }
    : {}),

  ...(maxRank
    ? {
        nirfRank: {
          lte: Number(maxRank),
        },
      }
    : {}),
},
      select: {
  id: true,
  name: true,
  location: true,
  state: true,

  fees: true,

  avgPackage: true,
  highestPackage: true,

  nirfRank: true,
  rating: true,

  establishedYear: true,

  ownership: true,

  accreditation: true,

  examsAccepted: true,

  website: true,

  description: true,

  image: true,
},
    });

    return NextResponse.json(colleges, {
      headers: {
        "Cache-Control":
          "public, s-maxage=300, stale-while-revalidate=600",
      },
    });

  } catch (error) {

  console.error("COLLEGES API ERROR:", error);

  return NextResponse.json(
    {
      error: String(error),
    },
    {
      status: 500,
    }
  );

}
}