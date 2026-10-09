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

export function createCampaign(definition, saved = null, random = Math.random,
    { mode = "normal", clerk = "A. Clerk", now = Date.now } = {}) {
        validateDefinition(definition);
        const requested = getMode(mode);

        const makeQueues = () => definition.shifts.map(shift => 
            shuffle(shift.applications.map(item => item.id), random)
            .slice(0, definition.casesPerShift));
        
        let state = {
            version: 2,
            runId: makeId(),
            mode: requested.id,
            clerk: normalizeClerk(clerk),
            startedAt: new Date(now()).toISOString(),
            endedAt: null,
            phase: "briefing",
            shiftIndex: 0,
            caseIndex: 0,
            queues: makeQueues(),
            results: [],
            timer: requested.timed
                ? { remainingMs: DECISION_TIME, deadline: null }
                : null
        };

        return {
            getView,
            snapshot: () => structuredClone(state)
        };

        const details = getMode(state.mode);
        const currentShift = () => 
            definition.shifts[state.shiftIndex % definition.shifts.length];
        const currentApplication = () => currentShift().application.find(item => 
            item.id === state.queues[state.shiftIndex][state.caseIndex]);
        const mistakes = () => state.results.filter(result => !result.correctDecision).length;
        
        function getView() {
            const shift = currentShift();
            const shiftResults = state.results.slice(
                state.shiftIndex * definition.casesPerShift,
                (state.shiftIndex + 1) * definition.casesPerShift
            );

            return structuredClone({
                ...state,
                modeDetails: details,
                shift,
                application: currentApplication(),
                shiftResults,
                queue: state.queues[state.shiftIndex].map(id =>
                    shift.applications.find(item => item.id === id)),
                totals: calculateTotals(state.results),
                shiftTotals: calculateTotals(shiftResults),
                mistakes: mistakes(),
                warningsLeft: details.endless ? Math.max(0, 3 - mistakes()): null,
                runEnded: Boolean(state.endedAt),
                lastResult: state.results.at(-1) ?? null,
                shiftCount: details.endless ? null : definition.shifts.length,
                casesPerShift: definition.casesPerShift,
                restored: false
            });
        }
    }