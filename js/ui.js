import { formatDate, formatField } from "./rules.js";

const element = (id) => document.getElementById(id);
const text = (id, value) => {
  element(id).textContent = value;
};
const copyTemplate = (id) =>
  element(id).content.firstElementChild.cloneNode(true);
const pad = (value) => String(value).padStart(2, "0");

export function createInterface() {
  element("rulebook-panel").open =
    !window.matchMedia("(max-width: 780px)").matches;

  function explanationsFor(result) {
    const broken = result.checks.filter((check) => !check.passed);

    const unnecessary = result.checks.filter(
      (check) => check.passed && result.reasons.includes(check.id),
    );

    return broken.length ? [...broken, ...unnecessary] : result.checks;
  }

  function renderExplanations(container, result) {
    const items = explanationsFor(result).map((check) => {
      const item = copyTemplate("explanation-template");

      item.querySelector(".explanation-code").textContent = check.id;
      item.querySelector("p").textContent =
        `${check.passed ? "Met" : "Broken"}: ${check.explanation}`;

      return item;
    });

    container.replaceChildren(...items);
  }

  function renderFeedback(view) {
    const result = view.lastResult;
    const dialog = element("feedback-dialog");

    dialog.classList.toggle("incorrect", !result.correctDecision);
    dialog.classList.toggle(
      "partial",
      result.correctDecision && !result.perfect,
    );

    text("feedback-reference", `REF. ${result.caseId}`);

    text(
      "feedback-stamp",
      result.timedOut
        ? "TIME EXPIRED"
        : result.perfect
          ? "IN ORDER"
          : result.correctDecision
            ? "CORRECTION"
            : "AUDIT FAILED",
    );

    text(
      "feedback-label",
      result.timedOut
        ? "No decision filed"
        : result.correctDecision
          ? "Decision correct"
          : "Incorrect decision",
    );

    text(
      "feedback-title",
      view.runEnded
        ? "Third warning. Run closed."
        : result.timedOut
          ? "The deadline has passed."
          : result.perfect
            ? result.decision === "approve"
              ? "Authorisation granted."
              : "Refusal justified."
            : result.correctDecision
              ? "The reasons need work."
              : "The audit found a problem.",
    );

    let message;

    if (!result.correctDecision) {
      message =
        `${result.timedOut ? "The 20 seconds elapsed before a decision was filed. No points awarded. " : ""}` +
        `This application should have been ${result.expectedDecision === "approve" ? "approved" : "rejected"}. ` +
        `${result.expectedDecision === "approve" ? "Every regulation is met." : "It breaks the regulation(s) listed below."}`;
    } else if (!result.perfect) {
      message =
        "The rejection is correct, but your reasons missed a broken rule or included a rule that was met. The decision earns 10 points; complete justification would earn 5 more.";
    } else {
      message =
        result.decision === "approve"
          ? "Every regulation is met. An impeccable inspection, with the stamp in exactly the right place."
          : "This application breaks the regulation(s) below. You identified every violation and cited no unnecessary rules.";
    }

    if (view.modeDetails.endless) {
      message += view.runEnded
        ? " That was your third wrong verdict. Your record is ready for the Roll of Honour."
        : ` Audit warnings: ${view.mistakes} of 3. ${view.warningsLeft} wrong verdict${view.warningsLeft === 1 ? "" : "s"} left.`;
    }

    text("feedback-body", message);
    text("feedback-points", `+${result.points}`);

    renderExplanations(element("feedback-explanations"), result);

    text(
      "next-applicant-button",
      view.runEnded
        ? "File final report"
        : view.caseIndex + 1 === view.casesPerShift
          ? "Finish shift"
          : "Next applicant",
    );
  }

  function openFlowDialog(id) {
    for (const other of document.querySelectorAll("dialog[open]")) {
      if (other.id !== id) other.close();
    }

    if (id && !element(id).open) {
      element(id).showModal();
    }
  }

  function renderRules(shift) {
    const cards = shift.rules.map((rule) => {
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
      application.name
        .split(" ")
        .slice(0, 2)
        .map((word) => word[0])
        .join(""),
    );
    text("applicant-quote", `“${application.quote}”`);
    text("application-reference", `REF. ${application.id}`);

    const fields = shift.fields.map((field) => {
      const row = copyTemplate("field-template");

      row.dataset.format = field.format;
      row.querySelector("dt").textContent = field.label;
      row.querySelector("dd").textContent = formatField(
        application.fields[field.key],
        field,
      );

      return row;
    });

    element("application-fields").replaceChildren(...fields);
  }

  function renderQueue(view) {
    text("case-number", pad(view.caseIndex + 1));
    text("case-total", pad(view.queue.length));

    const items = view.queue.map((application, index) => {
      const item = copyTemplate("queue-template");
      const result = view.shiftResults[index];
      const active = !result && index === view.caseIndex;

      item.classList.toggle("current", active);
      item.classList.toggle(
        "incorrect",
        Boolean(result && !result.correctDecision),
      );

      if (active) item.setAttribute("aria-current", "step");

      item.querySelector(".queue-number").textContent = pad(index + 1);
      item.querySelector(".queue-name").textContent = application.name;
      item.querySelector(".queue-status").textContent = result
        ? `Filed · ${result.points} points`
        : active
          ? "Awaiting your stamp"
          : "Waiting";
      item.querySelector(".queue-result").textContent = result
        ? result.correctDecision
          ? "+"
          : "!"
        : "";

      return item;
    });

    element("queue").replaceChildren(...items);
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
    text("shift-memo", view.shift.memo);
    renderRules(view.shift);
    renderDocument(view.shift, view.application);
    renderQueue(view);
    const inspecting = view.phase === "inspection";

    element("approve-button").disabled = !inspecting;
    element("reject-button").disabled = !inspecting;

    if (view.phase === "briefing") {
      text("briefing-shift", `SHIFT ${pad(view.shiftIndex + 1)}`);
      text("briefing-title", view.shift.briefingTitle);
      text("briefing-body", view.shift.briefing);
      text(
        "briefing-mode",
        `${view.modeDetails.name} — ${view.modeDetails.instruction}`,
      );

      openFlowDialog("briefing-dialog");
    } else if (view.phase === "feedback") {
      renderFeedback(view);
      openFlowDialog("feedback-dialog");
    } else {
      openFlowDialog(null);
    }
  }

  function openRejection(view) {
    element("rejection-form").reset();
    element("rejection-error").hidden = true;

    const choices = view.shift.rules.map((rule) => {
      const option = copyTemplate("reason-template");

      option.querySelector("input").value = rule.id;
      option.querySelector(".reason-title").textContent =
        `${rule.id} · ${rule.title}`;
      option.querySelector(".reason-description").textContent =
        rule.description;

      return option;
    });

    element("rejection-reasons").replaceChildren(...choices);
    element("reject-dialog").showModal();
  }

  return { render, openRejection };
}
