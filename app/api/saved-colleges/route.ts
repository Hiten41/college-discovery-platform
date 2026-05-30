import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {

    const { userId, collegeId } =
      await req.json();

    const existing =
      await prisma.savedCollege.findFirst({
        where: {
          userId,
          collegeId,
        },
      });

    if (existing) {

      return NextResponse.json(
        {
          error: "College already saved",
        },
        {
          status: 400,
        }
      );

    }

    const savedCollege =
      await prisma.savedCollege.create({
        data: {
          userId,
          collegeId,
        },
      });

    return NextResponse.json(
      savedCollege
    );

  } catch (error) {

    console.error(
      "SAVE COLLEGE ERROR:",
      error
    );

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