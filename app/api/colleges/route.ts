import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {

    const { searchParams } =
      new URL(req.url)

    const search =
      searchParams.get("search")
const location =
  searchParams.get("location")
   const colleges =
  await prisma.college.findMany({

    where: {

      ...(search
        ? {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }
        : {}),

      ...(location
        ? {
            location: {
              contains: location,
              mode: "insensitive",
            },
          }
        : {}),

    },

  })

    return NextResponse.json(colleges)

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