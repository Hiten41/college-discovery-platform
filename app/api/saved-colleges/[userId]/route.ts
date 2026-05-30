import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {

    const { userId } = await params;

    const savedColleges =
      await prisma.savedCollege.findMany({
        where: {
          userId,
        },
        include: {
          college: true,
        },
      });

    return NextResponse.json(
      savedColleges
    );

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch saved colleges" },
      { status: 500 }
    );

  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {

    const { userId } = await params;

console.log("DELETE HIT");
console.log("ID RECEIVED:", userId);

    await prisma.savedCollege.delete({
      where: {
        id: userId,
      },
    });

    return NextResponse.json({
      message: "Removed successfully",
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Failed to remove college" },
      { status: 500 }
    );

  }
}