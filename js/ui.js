import { formatDate, formatField, calculateTotals } from "./rules.js";
import { getMode } from "./modes.js";

const element = (id) => document.getElementById(id);
const text = (id, value) => {
  element(id).textContent = value;
};
const copyTemplate = (id) =>
  element(id).content.firstElementChild.cloneNode(true);
const pad = (value) => String(value).padStart(2, "0");

export function createInterface(definition) {
  let clockCase = null;
  let previousSeconds = 21;
  let applicationSlide = null;
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

  function renderAudit(records) {
    const items = records.map((record) => {
      const shift = definition.shifts.find(
        (item) => item.id === record.shiftId,
      );
      const application = shift.applications.find(
        (item) => item.id === record.caseId,
      );
      const item = copyTemplate("audit-template");
      item.classList.toggle("incorrect", !record.correctDecision);
      item.classList.toggle(
        "partial",
        record.correctDecision && !record.perfect,
      );
      item.querySelector(".audit-name").textContent = application.name;
      item.querySelector(".audit-result").textContent =
        `${record.points}/15 points`;
      item.querySelector(".audit-decision").textContent =
        `${record.caseId} · ${record.timedOut ? "No decision before the deadline" : `You ${record.decision === "approve" ? "approved" : "rejected"}`}; expected ${record.expectedDecision === "approve" ? "approval" : "rejection"}.`;
      renderExplanations(item.querySelector(".audit-explanations"), record);
      return item;
    });
    element("audit-list").replaceChildren(...items);
  }

  function renderReport(view, savingAvailable) {
    const finished = view.phase === "complete";
    const records = finished ? view.results : view.shiftResults;
    const totals = calculateTotals(records);
    text(
      "report-code",
      finished ? "RUN COMPLETE" : `SHIFT ${pad(view.shiftIndex + 1)}`,
    );
    text(
      "report-label",
      `${view.modeDetails.name} / ${finished ? "Final assessment" : "End-of-shift assessment"}`,
    );
    text(
      "report-title",
      finished
        ? view.modeDetails.endless
          ? "The stamp must rest."
          : totals.perfect === totals.count
            ? "You may keep the stamp."
            : "Your paperwork is on record."
        : "The desk is clear.",
    );
    text(
      "report-message",
      finished
        ? `${view.modeDetails.endless ? `You filed ${totals.count} applications across ${view.shiftIndex + 1} shifts before the third wrong verdict closed your appointment.` : `Three departments. Eighteen applications. An entirely unreasonable amount of responsibility. Your ${view.modeDetails.name} campaign is complete.`}${savingAvailable ? " Your run is on file in the Roll of Honour." : " Your record is available for this visit; saving was unavailable."}`
        : `You processed ${totals.count} applications for the ${view.shift.name}. Review the paper trail before your next assignment.`,
    );
    text(
      "report-score",
      finished && view.modeDetails.endless
        ? String(totals.points)
        : `${totals.points}/${totals.count * 15}`,
    );
    text("report-accuracy", `${totals.correct}/${totals.count}`);
    text("report-perfect", `${totals.perfect}/${totals.count}`);
    renderAudit(records);
    text(
      "report-continue-button",
      finished
        ? "Main menu"
        : view.shiftIndex + 1 === view.shiftCount
          ? "Complete campaign"
          : "Next shift",
    );
    element("report-menu-button").hidden = finished;
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

  function render(view, bestScore, savingAvailable) {
    cancelApplicationSlide();
    element("game").setAttribute("aria-busy", "false");
    element("loading-state").hidden = true;
    element("error-state").hidden = true;
    element("storage-warning").hidden = savingAvailable;
    text(
      "save-status",
      savingAvailable
        ? "Progress saved in this browser."
        : "Current run is not being saved.",
    );
    element("desk-layout").hidden = false;
    text("shift-number", `SHIFT ${pad(view.shiftIndex + 1)}`);
    text("department-name", view.shift.name);
    text("office-date", formatDate(view.shift.date));
    text("score", String(view.totals.points).padStart(3, "0"));
    text("mode-name", view.modeDetails.name);
    text("clerk-name", view.clerk);
    element("audit-warnings").hidden = !view.modeDetails.endless;
    text("warning-count", `${view.mistakes} of 3 audit warnings`);
    for (const [index, mark] of [
      ...element("audit-warnings").querySelectorAll("i"),
    ].entries()) {
      mark.classList.toggle("used", index < view.mistakes);
    }
    text(
      "best-score",
      bestScore === null ? "—" : String(bestScore).padStart(3, "0"),
    );
    text("rulebook-intro", view.shift.intro);
    text("shift-memo", view.shift.memo);
    renderRules(view.shift);
    renderDocument(view.shift, view.application);
    renderQueue(view);
    const inspecting = view.phase === "inspection";

    const nextClockCase = `${view.runId}/${view.shiftIndex}/${view.caseIndex}`;
    if (clockCase !== nextClockCase) {
      clockCase = nextClockCase;
      previousSeconds = 21;
      text("clock-warning", "");
    }
    renderClock(
      view.modeDetails.timed && inspecting ? view.timer.remainingMs : null,
    );
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
    } else if (["shift-report", "complete"].includes(view.phase)) {
      renderReport(view, savingAvailable);
      openFlowDialog("report-dialog");
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

  function renderClock(remaining) {
    const active = remaining !== null;
    element("decision-clock").hidden = !active;
    element("rejection-clock").hidden = !active;
    if (!active) return;
    const seconds = Math.ceil(Math.max(0, remaining) / 1000);
    text("clock-seconds", seconds);
    text("rejection-seconds", seconds);
    element("clock-progress").value = Math.max(0, remaining) / 1000;
    element("clock-progress").setAttribute(
      "aria-valuetext",
      `${seconds} seconds remaining`,
    );
    element("decision-clock").classList.toggle("urgent", seconds <= 5);
    element("rejection-clock").classList.toggle("urgent", seconds <= 5);
    if (seconds <= 5 && seconds > 0 && previousSeconds > 5)
      text("clock-warning", `${seconds} seconds left to file this decision.`);
    previousSeconds = seconds;
  }

  function renderRecords(records, mode) {
    const name = getMode(mode).name;
    text("records-caption", `${name} — ten best completed runs`);
    for (const button of document.querySelectorAll("[data-record-mode]")) {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.recordMode === mode),
      );
    }
    const rows = records.map((record, index) => {
      const row = copyTemplate("record-template");
      row.querySelector(".record-rank").textContent = pad(index + 1);
      row.querySelector(".record-clerk").textContent = record.clerk;
      row.querySelector(".record-points").textContent = String(
        record.points,
      ).padStart(3, "0");
      row.querySelector(".record-accuracy").textContent =
        record.count === null ? "—" : `${record.correct} / ${record.count}`;
      row.querySelector(".record-date").textContent =
        record.endedAt === null
          ? "—"
          : new Intl.DateTimeFormat("en-GB", {
              day: "numeric",
              month: "short",
              year: "2-digit",
            }).format(new Date(record.endedAt));
      return row;
    });
    element("records-body").replaceChildren(...rows);
    element("records-empty").hidden = rows.length > 0;
    element("records-ledger").hidden = rows.length === 0;
    text(
      "records-empty",
      `${name}: no appointments completed. There’s a blank line waiting for you.`,
    );
  }

  function cancelApplicationSlide() {
    applicationSlide?.cancel();
    applicationSlide = null;
  }

  function slideApplication() {
    cancelApplicationSlide();
    const paper = element("application");
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof paper.animate !== "function"
    )
      return;
    const motion = paper.animate(
      [
        { transform: "translateY(calc(-100% - 36px))" },
        { transform: "translateY(0)" },
      ],
      {
        duration: 560,
        easing: "cubic-bezier(0.16, 0.72, 0.2, 1)",
        fill: "none",
      },
    );
    applicationSlide = motion;
    motion.onfinish = () => {
      if (applicationSlide === motion) applicationSlide = null;
    };
  }

  return {
    render,
    openRejection,
    renderClock,
    renderRecords,
    slideApplication,
    cancelApplicationSlide,
  };
}
