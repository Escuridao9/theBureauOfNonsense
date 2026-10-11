import { formatDate } from "./rules.js";

const element = id => document.getElementById(id);
const text = (id, value) => {
  element(id).textContent = value;
};
const copyTemplate = id =>
  element(id).content.firstElementChild.cloneNode(true);
const pad = value => String(value).padStart(2, "0");

export function createInterface() {
  element("rulebook-panel").open =
    !window.matchMedia("(max-width: 780px)").matches;

  function renderRules(shift) {
    const cards = shift.rules.map(rule => {
      const card = copyTemplate("rule-template");

      card.querySelector(".rule-code").textContent = rule.id;
      card.querySelector(".rule-title").textContent = rule.title;
      card.querySelector(".rule-description").textContent = rule.description;

      return card;
    });

    element("rules").replaceChildren(...cards);
  }

  function render(view) {
    element("desk-layout").hidden = false;
    text("shift-number", `SHIFT ${pad(view.shiftIndex + 1)}`);
    text("department-name", view.shift.name);
    text("office-date", formatDate(view.shift.date));
    text("score", String(view.totals.points).padStart(3, "0"));
    text("mode-name", view.modeDetails.name);
    text("clerk-name", view.clerk);
    text("rulebook-intro", view.shift.intro);
    renderRules(view.shift);
  }

  return { render };
}