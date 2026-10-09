import { assessInspection, calculateTotals } from ".rules/js";
import { getMode, normalizeClerk } from ".modes.js";

const PHASES = [
  "briefing",
  "inspection",
  "feedback",
  "shift-report",
  "complete",
];

const DECISION_TIME = 20000;

function shuffle(items, random) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }

  return shuffled;
}

function makeId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  );
}

export function validateDefinition(definition) {
  if (
    definition.version !== 1 ||
    !Array.isArray(definition.shifts) ||
    !definition.shifts.length ||
    !Number.isInteger(definition.casesPerShift) ||
    definition.casesPerShift < 1
  ) {
    throw new Error("The campaign data is incomplete.");
  }

  const shiftIds = new Set();

  for (const shift of definition.shifts) {
    if (
      shiftIds.has(shift.id) ||
      !Array.isArray(shift.rules) ||
      !shift.rules.length ||
      !Array.isArray(shift.field) ||
      !Array.isArray(shift.applications) ||
      shift.applications.length < definition.casesPerShift
    ) {
      throw new Error("A department has incomplete data.");
    }

    shiftIds.add(shift.id);

    if (
      new Set(shift.applications.map((item) => item.id)).size !==
        shift.applications.length ||
      new Set(shift.rules.map((item) => item.id)).size !== shift.rules.length
    ) {
      throw new Error("Document and regulation references must be unique.");
    }

    for (const application of shift.applications) {
      assessInspection(shift, application, "approve");
    }
  }
}
