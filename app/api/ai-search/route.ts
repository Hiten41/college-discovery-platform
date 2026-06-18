import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

   const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

    const prompt = `
Extract filters from this college search query.

Query:
"${query}"

Return ONLY valid JSON.

Example:
{
  "state": "Delhi",
  "ownership": "Private",
  "exam": "JEE",
  "maxFees": 300000,
  "maxRank": 50
}
`;

    const result = await model.generateContent(prompt);

    const text =
      result.response.text();

    return NextResponse.json({
      response: text,
    });

  } catch (error) {
    console.error(error);

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