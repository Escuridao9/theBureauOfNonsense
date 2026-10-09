import { assessInspection, calculateTotals } from ".rules/js";
import { getMode, normalizeClerk } from ".modes.js";

const PHASES = [
    "briefing",
    "inspection",
    "feedback",
    "shift-report",
    "complete"
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