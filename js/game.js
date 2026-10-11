import { assessInspection, calculateTotals } from "./rules.js";
import { getMode, normalizeClerk } from "./modes.js";

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
    !definition ||
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
      !Array.isArray(shift.fields) ||
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

function legacyId(queues) {
  let hash = 2166136261;

  for (const character of JSON.stringify(queues)) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }

  return `legacy-${hash >>> 0}`;
}

function restoreState(definition, saved, now) {
  try {
    if (
      !saved ||
      ![1, 2].includes(saved.version) ||
      !PHASES.includes(saved.phase) ||
      !Number.isInteger(saved.shiftIndex) ||
      saved.shiftIndex < 0 ||
      !Number.isInteger(saved.caseIndex) ||
      saved.caseIndex < 0 ||
      saved.caseIndex >= definition.casesPerShift ||
      !Array.isArray(saved.queues) ||
      !Array.isArray(saved.results)
    )
      return null;

    if (saved.version === 2 && typeof saved.mode !== "string") return null;

    const mode = getMode(saved.version === 1 ? "normal" : saved.mode);
    const expectedQueues = mode.endless
      ? (Math.floor(saved.shiftIndex / definition.shifts.length) + 1) *
        definition.shifts.length
      : definition.shifts.length;

    if (
      saved.queues.length !== expectedQueues ||
      saved.shiftIndex >= saved.queues.length
    )
      return null;

    for (let index = 0; index < saved.queues.length; index += 1) {
      const queue = saved.queues[index];
      const shift = definition.shifts[index % definition.shifts.length];

      if (
        !Array.isArray(queue) ||
        queue.length !== definition.casesPerShift ||
        new Set(queue).size !== queue.length ||
        queue.some((id) => !shift.applications.some((item) => item.id === id))
      )
        return null;
    }

    if (saved.phase === "briefing" && saved.caseIndex !== 0) return null;
    if (
      saved.phase === "shift-report" &&
      saved.caseIndex !== definition.casesPerShift - 1
    )
      return null;
    if (
      saved.phase === "complete" &&
      !mode.endless &&
      (saved.shiftIndex !== definition.shifts.length - 1 ||
        saved.caseIndex !== definition.casesPerShift - 1)
    )
      return null;

    const expectedCount =
      saved.shiftIndex * definition.casesPerShift +
      saved.caseIndex +
      (["feedback", "shift-report", "complete"].includes(saved.phase) ? 1 : 0);

    if (saved.results.length !== expectedCount) return null;

    const results = saved.results.map((record, index) => {
      const shiftIndex = Math.floor(index / definition.casesPerShift);
      const shift = definition.shifts[shiftIndex % definition.shifts.length];
      const caseId = saved.queues[shiftIndex][index % definition.casesPerShift];

      if (
        record.shiftId !== shift.id ||
        record.caseId !== caseId ||
        !Array.isArray(record.reasons) ||
        (record.decision === "timeout" && !mode.timed)
      ) {
        throw new Error("The saved paper trail is inconsistent.");
      }

      return assessInspection(
        shift,
        shift.applications.find((item) => item.id === caseId),
        record.decision,
        record.reasons,
      );
    });

    const mistakes = results.filter((result) => !result.correctDecision).length;

    if (
      mode.endless &&
      (mistakes > 3 ||
        (mistakes === 3 && !["feedback", "complete"].includes(saved.phase)) ||
        (mistakes < 3 && saved.phase === "complete"))
    )
      return null;
    if (mode.endless && mistakes === 3 && results.at(-1).correctDecision)
      return null;

    const ended =
      saved.phase === "complete" || (mode.endless && mistakes === 3);
    const legacy = saved.version === 1;
    const startedAt = legacy ? new Date(now).toISOString() : saved.startedAt;
    const endedAt = legacy ? (ended ? startedAt : null) : saved.endedAt;

    if (
      !Number.isFinite(Date.parse(startedAt)) ||
      (ended &&
        (!Number.isFinite(Date.parse(endedAt)) ||
          Date.parse(endedAt) < Date.parse(startedAt))) ||
      (!ended && endedAt !== null)
    )
      return null;

    const runId = legacy ? legacyId(saved.queues) : saved.runId;

    if (
      typeof runId !== "string" ||
      !runId.length ||
      runId.length > 96 ||
      (!legacy && typeof saved.clerk !== "string")
    )
      return null;

    let timer = null;

    if (mode.timed) {
      timer = saved.timer;

      if (
        !timer ||
        !Number.isFinite(timer.remainingMs) ||
        timer.remainingMs < 0 ||
        timer.remainingMs > DECISION_TIME ||
        (timer.deadline !== null &&
          (!Number.isFinite(timer.deadline) ||
            timer.deadline > now + DECISION_TIME)) ||
        (saved.phase !== "inspection" && timer.deadline !== null)
      )
        return null;

      timer = { remainingMs: timer.remainingMs, deadline: timer.deadline };
    } else if (!legacy && saved.timer !== null) return null;

    return {
      version: 2,
      runId,
      clerk: normalizeClerk(legacy ? "A. Clerk" : saved.clerk),
      mode: mode.id,
      startedAt,
      endedAt,
      phase: saved.phase,
      shiftIndex: saved.shiftIndex,
      caseIndex: saved.caseIndex,
      queues: structuredClone(saved.queues),
      results,
      timer,
    };
  } catch {
    return null;
  }
}

export function createCampaign(
  definition,
  saved = null,
  random = Math.random,
  { mode = "normal", clerk = "A. Clerk", now = Date.now } = {},
) {
  validateDefinition(definition);
  const requested = getMode(mode);

  const restored = restoreState(definition, saved, now());

  const makeQueues = () =>
    definition.shifts.map((shift) =>
      shuffle(
        shift.applications.map((item) => item.id),
        random,
      ).slice(0, definition.casesPerShift),
    );

  let state = restored ?? {
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
      : null,
  };

  const details = getMode(state.mode);
  const currentShift = () =>
    definition.shifts[state.shiftIndex % definition.shifts.length];
  const currentApplication = () =>
    currentShift().applications.find(
      (item) => item.id === state.queues[state.shiftIndex][state.caseIndex],
    );
  const mistakes = () =>
    state.results.filter((result) => !result.correctDecision).length;

  const remaining = () =>
    !state.timer
      ? null
      : state.timer.deadline === null
        ? state.timer.remainingMs
        : Math.max(
            0,
            Math.min(state.timer.remainingMs, state.timer.deadline - now()),
          );

  const freshTimer = (active) =>
    details.timed
      ? {
          remainingMs: DECISION_TIME,
          deadline: active ? now() + DECISION_TIME : null,
        }
      : null;

  function startShift() {
    if (state.phase !== "briefing") return false;
    state = { ...state, phase: "inspection", timer: freshTimer(true) };
    return true;
  }

  function commit(result) {
    const results = [...state.results, result];
    const ended =
      details.endless &&
      results.filter((item) => !item.correctDecision).length === 3;

    state = {
      ...state,
      phase: "feedback",
      results,
      endedAt: ended ? new Date(now()).toISOString() : null,
      timer: details.timed
        ? { remainingMs: remaining(), deadline: null }
        : null,
    };

    return structuredClone(result);
  }

  function expire() {
    if (state.phase !== "inspection" || !details.timed || remaining() > 0)
      return null;
    return commit(
      assessInspection(currentShift(), currentApplication(), "timeout"),
    );
  }

  function submit(decision, reasons = []) {
    if (state.phase !== "inspection") return null;
    if (details.timed && remaining() <= 0) return expire();
    if (!["approve", "reject"].includes(decision))
      throw new Error("Unknown decision.");

    return commit(
      assessInspection(currentShift(), currentApplication(), decision, reasons),
    );
  }

  function advance() {
    if (state.phase === "feedback") {
      if (state.endedAt) {
        state = { ...state, phase: "complete" };
      } else {
        state =
          state.caseIndex + 1 < definition.casesPerShift
            ? {
                ...state,
                caseIndex: state.caseIndex + 1,
                phase: "inspection",
                timer: freshTimer(true),
              }
            : { ...state, phase: "shift-report", timer: freshTimer(false) };
      }
    } else if (state.phase === "shift-report") {
      const next = state.shiftIndex + 1;

      if (!details.endless && next === definition.shifts.length) {
        state = {
          ...state,
          phase: "complete",
          endedAt: new Date(now()).toISOString(),
        };
      } else {
        const queues =
          next === state.queues.length
            ? [...state.queues, ...makeQueues()]
            : state.queues;

        state = {
          ...state,
          shiftIndex: next,
          caseIndex: 0,
          phase: "briefing",
          queues,
          timer: freshTimer(false),
        };
      }
    } else {
      return false;
    }

    return true;
  }

  function pauseClock() {
    if (!details.timed || state.phase !== "inspection") return;
    state = { ...state, timer: { remainingMs: remaining(), deadline: null } };
  }

  function resumeClock() {
    if (
      !details.timed ||
      state.phase !== "inspection" ||
      state.timer.deadline !== null
    )
      return;
    state = {
      ...state,
      timer: { ...state.timer, deadline: now() + state.timer.remainingMs },
    };
  }

  function getView() {
    const shift = currentShift();
    const shiftResults = state.results.slice(
      state.shiftIndex * definition.casesPerShift,
      (state.shiftIndex + 1) * definition.casesPerShift,
    );

    return structuredClone({
      ...state,
      modeDetails: details,
      shift,
      application: currentApplication(),
      shiftResults,
      queue: state.queues[state.shiftIndex].map((id) =>
        shift.applications.find((item) => item.id === id),
      ),
      totals: calculateTotals(state.results),
      shiftTotals: calculateTotals(shiftResults),
      mistakes: mistakes(),
      warningsLeft: details.endless ? Math.max(0, 3 - mistakes()) : null,
      runEnded: Boolean(state.endedAt),
      lastResult: state.results.at(-1) ?? null,
      shiftCount: details.endless ? null : definition.shifts.length,
      casesPerShift: definition.casesPerShift,
      restored: Boolean(restored),
    });
  }

  return {
    startShift,
    submit,
    advance,
    expire,
    pauseClock,
    resumeClock,
    getView,
    timeRemaining: () =>
      details.timed && state.phase === "inspection" ? remaining() : null,
    snapshot: () => structuredClone(state),
  };
}
