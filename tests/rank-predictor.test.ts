import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "../app/api/rank-predictor/route";
import {
  formatRankPredictionForChat,
  predictColleges,
  rankPredictionInputFromMessage,
} from "../lib/rankPredictor/predictor";
import { scoreCollege, scoreNirfQuality, tierForScore } from "../lib/rankPredictor/scoring";
import type {
  RankPredictorCollege,
  RankPredictorInput,
} from "../lib/rankPredictor/types";

const input: RankPredictorInput = {
  exam: "JEE Main",
  rank: 18000,
  category: "General",
  gender: "Male",
  homeState: "Tamil Nadu",
  preferredBranch: "CSE",
};

const colleges: RankPredictorCollege[] = [
  {
    name: "NIT Trichy",
    location: "Tiruchirappalli",
    state: "Tamil Nadu",
    fees: 180000,
    avgPackage: "18 LPA",
    highestPackage: "52 LPA",
    nirfRank: 9,
    ownership: "Government",
    examsAccepted: "JEE Main",
  },
  {
    name: "IIT Madras",
    location: "Chennai",
    state: "Tamil Nadu",
    fees: 240000,
    avgPackage: "22 LPA",
    highestPackage: "1.3 Cr",
    nirfRank: 1,
    ownership: "Government",
    examsAccepted: "JEE Advanced",
  },
  {
    name: "College With Unverified Exam",
    location: "Lucknow",
    state: "Uttar Pradesh",
    fees: null,
    avgPackage: null,
    highestPackage: null,
    nirfRank: 120,
    ownership: null,
    examsAccepted: null,
  },
];

const iitDelhi: RankPredictorCollege = {
  name: "IIT Delhi",
  location: "New Delhi",
  state: "Delhi",
  fees: 240000,
  avgPackage: "25 LPA",
  highestPackage: "2 Cr",
  nirfRank: 2,
  ownership: "Government",
  examsAccepted: "JEE Advanced",
};

test("score bands use the documented boundaries", () => {
  assert.equal(tierForScore(0), "dream");
  assert.equal(tierForScore(34.9), "dream");
  assert.equal(tierForScore(35), "target");
  assert.equal(tierForScore(74.9), "target");
  assert.equal(tierForScore(75), "safe");
  assert.equal(tierForScore(100), "safe");
});

test("scoring is deterministic and includes an explainable factor breakdown", () => {
  const first = scoreCollege(colleges[0], input, "confirmed");
  const second = scoreCollege(colleges[0], input, "confirmed");
  assert.deepEqual(first, second);
  assert.ok(first.confidenceScore >= 0 && first.confidenceScore <= 100);
  assert.ok(first.rankFitScore >= 0 && first.rankFitScore <= 100);
  assert.ok(first.collegeQualityScore >= 0 && first.collegeQualityScore <= 100);
  assert.equal(first.confidenceScore, first.rankFitScore);
  assert.deepEqual(first.factors.map(({ key }) => key), [
    "rankFit",
    "nirfQuality",
    "package",
    "value",
    "ownership",
    "branch",
  ]);
  assert.match(first.factors.at(-1)?.explanation ?? "", /does not alter the V1 score/);
});

test("NIRF quality scoring rewards better ranks", () => {
  assert.equal(scoreNirfQuality(1).score, 35);
  assert.ok(scoreNirfQuality(10).score > scoreNirfQuality(50).score);
  assert.ok(scoreNirfQuality(50).score > scoreNirfQuality(150).score);
  assert.equal(scoreNirfQuality(150).score, 0);
});

test("rank fit materially changes IIT Delhi recommendations", () => {
  const scoreForRank = (rank: number) =>
    scoreCollege(iitDelhi, { ...input, exam: "JEE Advanced", rank }, "confirmed");

  const rank500 = scoreForRank(500);
  const rank5000 = scoreForRank(5000);
  const rank50000 = scoreForRank(50000);
  const rank500000 = scoreForRank(500000);

  assert.ok(rank500.rankFitScore - rank500000.rankFitScore >= 60);
  assert.equal(rank500.tier, "safe");
  assert.equal(rank5000.tier, "target");
  assert.equal(rank50000.tier, "dream");
  assert.equal(rank500000.tier, "dream");
});

test("predictor excludes known incompatible exams and flags missing exam data", () => {
  const result = predictColleges(colleges, input);
  const predictions = Object.values(result.groups).flat();
  assert.equal(predictions.some(({ college }) => college.name === "IIT Madras"), false);
  assert.equal(predictions.find(({ college }) => college.name === "NIT Trichy")?.examMatch, "confirmed");
  assert.equal(
    predictions.find(({ college }) => college.name === "College With Unverified Exam")?.examMatch,
    "verify",
  );
  assert.match(result.disclaimer, /not admission probabilities/);
});

test("Motu rank intent produces the shared predictor input and grouped response", () => {
  const parsed = rankPredictionInputFromMessage("Recommend colleges for rank 25000 in CSE");
  assert.equal(parsed?.rank, 25000);
  assert.equal(parsed?.exam, "JEE Main");
  assert.equal(parsed?.preferredBranch, "CSE");

  const result = predictColleges(colleges, parsed ?? input);
  const reply = formatRankPredictionForChat(result);
  assert.match(reply, /Dream Colleges/);
  assert.match(reply, /Target Colleges/);
  assert.match(reply, /Safe Colleges/);
  assert.match(reply, /not admission probabilities/);
});

test("rank predictor API rejects incomplete input before database retrieval", async () => {
  const request = new Request("http://localhost/api/rank-predictor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exam: "JEE Main", rank: 18000 }),
  });
  const response = await POST(request);
  assert.equal(response.status, 400);
});
