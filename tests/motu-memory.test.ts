import assert from "node:assert/strict";
import test from "node:test";
import { classifyQuery } from "../lib/motu/classifier";
import {
  applyActiveContextClassification,
  isContextualFollowUp,
  updateActiveCollegeContext,
} from "../lib/motu/context";
import { parseComparisonNames } from "../lib/motu/retrieval";
import { buildDatabaseReply, buildGeneralFallback } from "../app/api/chat/route";
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

test("general comparison correction is not treated as a college name", () => {
  const message = "bt i asked for general comparison";
  const classification = classifyQuery(message);

  assert.equal(classification.type, "GENERAL_QUERY");
  assert.deepEqual(parseComparisonNames(message), []);
  assert.match(buildGeneralFallback(message), /General IIT vs NIT comparison/);
});

test("IIT vs NIT is handled as an institute-type comparison", () => {
  const message = "IIT vs NIT";
  const classification = classifyQuery(message);

  assert.equal(classification.type, "GENERAL_QUERY");
  assert.deepEqual(parseComparisonNames(message), ["IIT", "NIT"]);
  assert.match(buildGeneralFallback(message), /branch \+ college tier/);
});

test("ownership question for a named college uses college details", () => {
  const message = "is iit delhi government based";
  const classification = classifyQuery(message);
  const college: CollegeRecord = {
    id: "test-iit-delhi",
    name: "IIT Delhi",
    location: "New Delhi",
    state: "Delhi",
    fees: 200000,
    avgPackage: "25 LPA",
    highestPackage: "2 Cr",
    nirfRank: 2,
    rating: 4.8,
    ownership: "Government",
    examsAccepted: ["JEE Advanced"],
    description: "",
    website: null,
    image: null,
    accreditation: null,
    establishedYear: null,
  };
  const result: RetrievalResult = {
    colleges: [college],
    requestedNames: ["IIT Delhi"],
    missingNames: [],
    notes: [],
  };
  const reply = buildDatabaseReply(message, classification, result, ["IIT Delhi"]);

  assert.equal(classification.type, "DATABASE_QUERY");
  assert.equal(classification.operation, "COLLEGE_DETAILS");
  assert.match(reply, /IIT Delhi is listed as a Government institution/);
});

test("college count questions return the database record count", () => {
  const messages = [
    "give me total of how many colleges r listed on collegehub",
    "give me total no. of colleges",
  ];
  const colleges: CollegeRecord[] = availableNames.map((name, index) => ({
    id: `college-${index}`,
    name,
    location: index === 3 ? "Tiruchirappalli" : "Delhi",
    state: index === 3 ? "Tamil Nadu" : "Delhi",
    fees: 200000,
    avgPackage: "20 LPA",
    highestPackage: "1 Cr",
    nirfRank: index + 1,
    rating: 4.5,
    ownership: "Government",
    examsAccepted: ["JEE"],
    description: "",
    website: null,
    image: null,
    accreditation: null,
    establishedYear: null,
  }));
  const result: RetrievalResult = {
    colleges,
    requestedNames: [],
    missingNames: [],
    notes: [],
  };

  for (const message of messages) {
    const classification = classifyQuery(message);
    const reply = buildDatabaseReply(message, classification, result, []);

    assert.equal(classification.type, "DATABASE_QUERY", message);
    assert.equal(classification.operation, "COUNT_COLLEGES", message);
    assert.match(reply, /4 colleges listed/);
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
      id: "test-iit-delhi",
      name: "IIT Delhi",
      location: "New Delhi",
      state: "Delhi",
      fees: 200000,
      avgPackage: "25 LPA",
      highestPackage: "2 Cr",
      nirfRank: 2,
      rating: 4.8,
      ownership: "Government",
      examsAccepted: ["JEE Advanced"],
      description: "",
      website: null,
      image: null,
      accreditation: null,
      establishedYear: null,
    },
    {
      id: "test-nit-trichy",
      name: "NIT Trichy",
      location: "Tiruchirappalli",
      state: "Tamil Nadu",
      fees: 150000,
      avgPackage: "15 LPA",
      highestPackage: "52 LPA",
      nirfRank: 9,
      rating: 4.6,
      ownership: "Government",
      examsAccepted: ["JEE Main"],
      description: "",
      website: null,
      image: null,
      accreditation: null,
      establishedYear: null,
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
