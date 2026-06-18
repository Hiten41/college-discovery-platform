export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } =
      await req.json();

    const existingUser =
      await prisma.user.findUnique({
        where: { email },
      });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user =
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

 return NextResponse.json({
  message: "User created successfully",
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
  },
});

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    );
  }
}