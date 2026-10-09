const MODES = {
    normal: {
        id: "normal",
        name: "Normal",
        timed: false,
        endless: false,
        instruction: "Three shifts. Take the time you need."
    },
    hard: {
        id: "hard",
        name: "Under Pressure",
        timed: true,
        endless: false,
        instruction: "20 seconds per application, including refusal reasons. Main menu pauses the clock."
    },
    endless: {
        id: "endless",
        name: "Never-ending Paperwork",
        timed: false,
        endless: true,
        instruction: "The departments keep sending work. Your third wrong verdict closes the run."
    }
};

export function getMode(id = "normal") {
    if (!Object.hasOwn(MODES, id)) throw new Error("Unknown campaign mode.");
    return {...MODES[id] };
}

export function getModeIds() {
    return Object.keys(MODES);
}

export function normalizeClerk(value) {
    return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, "").trim()
    .replace(/\s+/g, " ").slice(0, 24) || "A. Clerk";
}