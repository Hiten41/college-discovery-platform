import { normalizeText } from "@/lib/motu/classifier";
import type {
  ActiveCollegeContext,
  QueryClassification,
} from "@/lib/motu/types";

const followUpPatterns = [
  /^(?:and\s+)?(?:what|wht|how)\s+(?:about|abt)\b/,
  /^and\s+(?:fees?|rankings?|placements?|packages?|location|roi)\b/,
  /^which\s+(?:one\s+)?(?:is|has|would|should)\b/,
  /^which\s+(?:college|clg|institute|one)\b/,
  /^which\s+would\s+you\s+recommend\b/,
  /^compare\s+again\b/,
  /^tell\s+me\s+more\b/,
];

export function isContextualFollowUp(message: string): boolean {
  const normalized = normalizeText(message);
  return followUpPatterns.some((pattern) => pattern.test(normalized));
}

export function applyActiveContextClassification(
  message: string,
  classification: QueryClassification,
  activeCollegeContext: ActiveCollegeContext,
): QueryClassification {
  if (activeCollegeContext.length === 0 || !isContextualFollowUp(message)) {
    return classification;
  }

  return {
    ...classification,
    type: "DATABASE_QUERY",
    operation: "CONTEXT_FOLLOW_UP",
  };
}

export function findExplicitCollegeNames(
  message: string,
  availableCollegeNames: string[],
): string[] {
  const normalizedMessage = normalizeText(message);
  return availableCollegeNames
    .map((name) => ({ name, position: normalizedMessage.indexOf(normalizeText(name)) }))
    .filter(({ position }) => position >= 0)
    .sort((a, b) => a.position - b.position)
    .map(({ name }) => name);
}

export function updateActiveCollegeContext({
  message,
  currentContext,
  availableCollegeNames,
  resolvedCollegeNames = [],
  recommendedCollegeNames = [],
}: {
  message: string;
  currentContext: ActiveCollegeContext;
  availableCollegeNames: string[];
  resolvedCollegeNames?: string[];
  recommendedCollegeNames?: string[];
}): ActiveCollegeContext {
  if (resolvedCollegeNames.length > 0) {
    return resolvedCollegeNames;
  }

  const explicitNames = findExplicitCollegeNames(message, availableCollegeNames);
  if (explicitNames.length > 0) {
    return explicitNames;
  }

  if (isContextualFollowUp(message)) {
    return currentContext;
  }

  if (recommendedCollegeNames.length > 0) {
    return recommendedCollegeNames;
  }

  return currentContext;
}
