import { formatDate, formatField } from "./rules.js";

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

  function renderDocument(shift, application) {
  text("form-number", `FORM ${shift.form}`);
  text("application-title", shift.permit);
  text("applicant-name", application.name);
  text("applicant-species", application.species);
  text(
    "applicant-initials",
    application.name.split(" ").slice(0, 2).map(word => word[0]).join("")
  );
  text("applicant-quote", `“${application.quote}”`);
  text("application-reference", `REF. ${application.id}`);

  const fields = shift.fields.map(field => {
    const row = copyTemplate("field-template");

    row.dataset.format = field.format;
    row.querySelector("dt").textContent = field.label;
    row.querySelector("dd").textContent =
      formatField(application.fields[field.key], field);

    return row;
  });

  element("application-fields").replaceChildren(...fields);
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
    renderDocument(view.shift, view.application);
  }

  return { render };
}