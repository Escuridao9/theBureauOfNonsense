import { getMode, getModeIds, normalizeClerk } from "./modes.js";

const RECORD_LIMIT = 10;

const STORAGE_PREFIX = "bureau-of-nonsense:";
const PROGRESS_KEY = "bureau-of-nonsense:progress:v1";
const BEST_KEY = "bureau-of-nonsense:best:v1";
const SETTINGS_KEY = "bureau-of-nonsense:audio:v1";
const RECORDS_KEY = "bureau-of-nonsense:records:v1";

function rankRecords(records) {
  return [...records].sort(
    (first, second) =>
      second.points - first.points ||
      (second.correct ?? -1) - (first.correct ?? -1) ||
      (first.mistakes ?? Infinity) - (second.mistakes ?? Infinity) ||
      (Date.parse(second.endedAt) || 0) - (Date.parse(first.endedAt) || 0),
  );
}

function limitRecords(records) {
  return getModeIds().flatMap((mode) =>
    rankRecords(records.filter((record) => record.mode === mode)).slice(
      0,
      RECORD_LIMIT,
    ),
  );
}

function validateRecord(record) {
  try {
    if (
      !record ||
      typeof record.runId !== "string" ||
      !record.runId.length ||
      record.runId.length > 96 ||
      typeof record.mode !== "string" ||
      typeof record.clerk !== "string" ||
      !Number.isInteger(record.points) ||
      record.points < 0
    )
      return null;
    const mode = getMode(record.mode);
    if (record.legacy === true) {
      if (
        record.runId !== "previous-normal-record" ||
        mode.id !== "normal" ||
        record.points > 270
      )
        return null;
      return {
        runId: record.runId,
        mode: "normal",
        clerk: "Previous record",
        points: record.points,
        count: null,
        correct: null,
        perfect: null,
        mistakes: null,
        startedAt: null,
        endedAt: null,
        legacy: true,
      };
    }
    if (
      ![record.count, record.correct, record.perfect, record.mistakes].every(
        Number.isInteger,
      ) ||
      record.count < 1 ||
      record.correct < 0 ||
      record.correct > record.count ||
      record.perfect < 0 ||
      record.perfect > record.correct ||
      record.mistakes !== record.count - record.correct ||
      record.points !== record.correct * 10 + record.perfect * 5 ||
      (!mode.endless && record.count !== 18) ||
      (mode.endless && record.mistakes !== 3) ||
      !Number.isFinite(Date.parse(record.startedAt)) ||
      !Number.isFinite(Date.parse(record.endedAt)) ||
      Date.parse(record.endedAt) < Date.parse(record.startedAt)
    )
      return null;
    return {
      runId: record.runId,
      mode: mode.id,
      clerk: normalizeClerk(record.clerk),
      points: record.points,
      count: record.count,
      correct: record.correct,
      perfect: record.perfect,
      mistakes: record.mistakes,
      startedAt: record.startedAt,
      endedAt: record.endedAt,
    };
  } catch {
    return null;
  }
}

export function createStorage(getProvider = () => window.localStorage) {
  let available = true;
  let ledger = null;
  function read(key) {
    try {
      return getProvider().getItem(key);
    } catch {
      available = false;
      return null;
    }
  }
  function write(key, value) {
    try {
      getProvider().setItem(key, value);
      return true;
    } catch {
      available = false;
      return false;
    }
  }
  function readJSON(key) {
    const value = read(key);
    try {
      return value === null ? null : JSON.parse(value);
    } catch {
      return null;
    }
  }
  function previousBest() {
    const raw = read(BEST_KEY);
    if (raw === null) return null;
    const value = Number(raw);
    return Number.isInteger(value) && value >= 0 && value <= 270 ? value : null;
  }
  function getLedger() {
    if (ledger) return ledger;
    const saved = readJSON(RECORDS_KEY);
    const candidates =
      saved?.version === 1 && Array.isArray(saved.records) ? saved.records : [];
    const unique = new Map();
    for (const candidate of candidates) {
      const record = validateRecord(candidate);
      if (record && !unique.has(record.runId)) unique.set(record.runId, record);
    }
    let records = [...unique.values()];
    const best = previousBest();
    if (
      best !== null &&
      !records.some(
        (record) => record.mode === "normal" && record.points >= best,
      )
    ) {
      records = records.filter((record) => !record.legacy);
      records.push(
        validateRecord({
          runId: "previous-normal-record",
          mode: "normal",
          clerk: "Previous record",
          points: best,
          legacy: true,
        }),
      );
    }
    records = limitRecords(records);
    const seen = Array.isArray(saved?.seen)
      ? saved.seen
          .filter(
            (id) => typeof id === "string" && id.length > 0 && id.length <= 96,
          )
          .slice(-100)
      : [];
    ledger = {
      version: 1,
      records,
      seen: [
        ...new Set([...seen, ...records.map((record) => record.runId)]),
      ].slice(-100),
    };
    return ledger;
  }
  function getRecordsForMode(mode) {
    getMode(mode);
    return rankRecords(
      getLedger().records.filter((record) => record.mode === mode),
    );
  }
  function loadRecords(mode = "normal") {
    return structuredClone(getRecordsForMode(mode));
  }
  function loadBest(mode = "normal") {
    return getRecordsForMode(mode)[0]?.points ?? null;
  }
  function saveBest(points) {
    const previous = previousBest();
    if (!Number.isInteger(points) || points < 0 || points > 270)
      return loadBest();
    if (previous === null || points > previous) write(BEST_KEY, String(points));
    const best = previous === null ? points : Math.max(previous, points);
    if (
      ledger &&
      !ledger.records.some(
        (record) => record.mode === "normal" && record.points >= best,
      )
    ) {
      const imported = validateRecord({
        runId: "previous-normal-record",
        mode: "normal",
        clerk: "Previous record",
        points: best,
        legacy: true,
      });
      ledger.records = [
        ...ledger.records.filter((record) => !record.legacy),
        imported,
      ];
    }
    return best;
  }
  function saveRecord(candidate) {
    const record = validateRecord(candidate);
    if (!record || record.legacy) return false;
    const current = getLedger();
    if (
      current.seen.includes(record.runId) ||
      current.records.some((item) => item.runId === record.runId)
    )
      return available;
    const pool = current.records.filter((item) => item.runId !== record.runId);
    pool.push(record);
    ledger = {
      version: 1,
      records: limitRecords(pool),
      seen: [...current.seen, record.runId].slice(-100),
    };
    return write(RECORDS_KEY, JSON.stringify(ledger));
  }
  function clearData() {
    try {
      const provider = getProvider();
      const keys = new Set([PROGRESS_KEY, BEST_KEY, SETTINGS_KEY, RECORDS_KEY]);
      for (let index = 0; index < provider.length; index += 1) {
        const key = provider.key(index);
        if (key?.startsWith(STORAGE_PREFIX)) keys.add(key);
      }
      for (const key of keys) provider.removeItem(key);
      ledger = { version: 1, records: [], seen: [] };
      available = true;
      return true;
    } catch {
      available = false;
      return false;
    }
  }

  return {
    loadProgress: () => readJSON(PROGRESS_KEY),
    loadBest,
    saveBest,
    loadRecords,
    saveRecord,
    loadSettings: () => readJSON(SETTINGS_KEY),
    saveProgress: (state) => write(PROGRESS_KEY, JSON.stringify(state)),
    saveSettings: (settings) => write(SETTINGS_KEY, JSON.stringify(settings)),
    clearData,
    invalidateCache: () => {
      ledger = null;
    },
    isAvailable: () => available,
  };
}
