import type { ChatHistoryMessage, CollegeRecord, QueryClassification } from "@/lib/motu/types";

const systemPrompt = `You are Motu, the AI college counselor inside CollegeHub.

Be concise, practical, accurate, and student-friendly. Never mention Gemini or Google AI.
Database context is authoritative for CollegeHub facts. Never add a college or factual value that is absent from it.
Treat the fees field as "stored fees"; do not infer whether it is annual, semester-wise, or total.
If context is limited, state the limitation plainly. Explain recommendation reasons using only supplied fields.
Use short paragraphs, bullets, and compact Markdown tables where useful. Do not repeat the question.`;

export function buildGroundedPrompt(
  message: string,
  classification: QueryClassification,
  colleges: CollegeRecord[],
  history: ChatHistoryMessage[],
  retrievalNotes: string[],
): string {
  return `${systemPrompt}

QUERY CLASSIFICATION:
${classification.type}

QUERY OPERATION:
${classification.operation}

DATABASE CONTEXT:
${JSON.stringify(colleges, null, 2)}

RETRIEVAL NOTES:
${JSON.stringify(retrievalNotes)}

RECENT CONVERSATION:
${JSON.stringify(history.slice(-8), null, 2)}

USER MESSAGE:
${message}`;
}
