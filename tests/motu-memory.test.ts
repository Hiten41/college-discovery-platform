import assert from "node:assert/strict";
import test from "node:test";
import { classifyQuery } from "../lib/motu/classifier";
import {
  applyActiveContextClassification,
  isContextualFollowUp,
  updateActiveCollegeContext,
} from "../lib/motu/context";
import { buildDatabaseReply } from "../app/api/chat/route";
import type { CollegeRecord, RetrievalResult } from "../lib/motu/types";

const availableNames = [
  "IIT Madras",
  "IIT Delhi",
  "IIT Bombay",
  "NIT Trichy",
];

test("all supported contextual phrases are detected", () => {
  const messages = [
    "What about fees?",
    "wht abt fees",
    "What about rankings?",
    "And placements?",
    "Which is better?",
    "Which would you recommend?",
    "What about packages?",
    "What about location?",
    "What about ROI?",
    "Compare again.",
    "Tell me more.",
  ];

  for (const message of messages) {
    assert.equal(isContextualFollowUp(message), true, message);
  }
});

test("college context survives a chain of contextual follow-ups", () => {
  const expected = ["IIT Delhi", "NIT Trichy"];
  let context = updateActiveCollegeContext({
    message: "Compare IIT Delhi and NIT Trichy",
    currentContext: [],
    availableCollegeNames: availableNames,
  });
  assert.deepEqual(context, expected);

  const followUps = [
    "which has highest median package",
    "wht abt fees",
    "And rankings?",
    "Which would you recommend?",
    "What about location?",
  ];

  for (const message of followUps) {
    const classification = applyActiveContextClassification(
      message,
      classifyQuery(message),
      context,
    );
    assert.equal(classification.operation, "CONTEXT_FOLLOW_UP");
    context = updateActiveCollegeContext({
      message,
      currentContext: context,
      availableCollegeNames: availableNames,
    });
    assert.deepEqual(context, expected);
  }
});

test("explicit new college names replace the active context", () => {
  const context = updateActiveCollegeContext({
    message: "Compare IIT Bombay and IIT Madras",
    currentContext: ["IIT Delhi", "NIT Trichy"],
    availableCollegeNames: availableNames,
  });
  assert.deepEqual(context, ["IIT Bombay", "IIT Madras"]);
});

test("an explicitly named college takes priority over prior context", () => {
  const message = "What about IIT Bombay fees?";
  const context = updateActiveCollegeContext({
    message,
    currentContext: ["IIT Delhi", "NIT Trichy"],
    availableCollegeNames: availableNames,
    resolvedCollegeNames: ["IIT Bombay"],
  });
  assert.deepEqual(context, ["IIT Bombay"]);
});

test("fresh recommendations become the active context", () => {
  const context = updateActiveCollegeContext({
    message: "Recommend colleges under 3 lakh",
    currentContext: [],
    availableCollegeNames: availableNames,
    recommendedCollegeNames: ["IIT Delhi", "NIT Trichy"],
  });
  assert.deepEqual(context, ["IIT Delhi", "NIT Trichy"]);
});

test("resolved comparison records become the canonical active context", () => {
  const context = updateActiveCollegeContext({
    message: "Compare Delhi and Trichy",
    currentContext: [],
    availableCollegeNames: availableNames,
    resolvedCollegeNames: ["IIT Delhi", "NIT Trichy"],
  });
  assert.deepEqual(context, ["IIT Delhi", "NIT Trichy"]);
});

test("every answer in a multi-turn comparison uses the active colleges", () => {
  const colleges: CollegeRecord[] = [
    {
      name: "IIT Delhi",
      location: "New Delhi",
      state: "Delhi",
      fees: 200000,
      avgPackage: "25 LPA",
      highestPackage: "2 Cr",
      nirfRank: 2,
      rating: 4.8,
      ownership: "Government",
      examsAccepted: "JEE Advanced",
      description: "",
    },
    {
      name: "NIT Trichy",
      location: "Tiruchirappalli",
      state: "Tamil Nadu",
      fees: 150000,
      avgPackage: "15 LPA",
      highestPackage: "52 LPA",
      nirfRank: 9,
      rating: 4.6,
      ownership: "Government",
      examsAccepted: "JEE Main",
      description: "",
    },
  ];
  const result: RetrievalResult = {
    colleges,
    requestedNames: colleges.map((college) => college.name),
    missingNames: [],
    notes: [],
  };
  const context = colleges.map((college) => college.name);
  const followUps = [
    "Which one has better placements?",
    "What about fees?",
    "And rankings?",
    "Which would you recommend?",
    "What about location?",
  ];

  for (const message of followUps) {
    const classification = applyActiveContextClassification(
      message,
      classifyQuery(message),
      context,
    );
    const reply = buildDatabaseReply(message, classification, result, context);
    assert.match(reply, /IIT Delhi/, message);
    assert.match(reply, /NIT Trichy/, message);
  }
});
