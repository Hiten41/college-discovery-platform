import { prisma } from "@/lib/prisma";
import image from "next/image";
import { NextResponse } from "next/server";

export async function GET() {
  try {
      await prisma.college.deleteMany()
    await prisma.college.createMany({
      data: [
       {
  name: "IIT Delhi",
  location: "Delhi",
  fees: 250000,
  rating: 4.9,
  description: "Top engineering institute",
  image: "https://images.unsplash.com/photo-1562774053-701939374585",
  avgPackage: "₹25 LPA",
  nirfRank: 2
},
{
  name: "IIT Bombay",
  location: "Mumbai",
  fees: 240000,
  rating: 4.8,
  description: "Premier engineering college",
  image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a",
  avgPackage: "₹30 LPA",
  nirfRank: 3
},
{
  name: "NIT Trichy",
  location: "Tamil Nadu",
  fees: 180000,
  rating: 4.7,
  description: "Best NIT in India",
  image: "https://picsum.photos/800/500",
  avgPackage: "₹18 LPA",
  nirfRank: 9
},
      ],
    });

    return NextResponse.json({
      message: "Data inserted successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to seed data" },
      { status: 500 }
    );
  }
}