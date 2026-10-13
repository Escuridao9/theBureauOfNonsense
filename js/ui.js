import { formatDate, formatField } from "./rules.js";
import { getMode } from "./modes.js";

const recordDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "2-digit",
});

const element = (id) => document.getElementById(id);
const text = (id, value) => {
  element(id).textContent = value;
};
const copyTemplate = (id) =>
  element(id).content.firstElementChild.cloneNode(true);
const pad = (value) => String(value).padStart(2, "0");

export function createInterface(definition) {
  let clockCase = null;
  let clockActive = null;
  let previousSeconds = 21;
  let applicationSlide = null;
  let verdictStamp = null;
  let stampScroll = null;
  let renderedShift = null;
  let renderedApplication = null;
  const clock = {
    decision: element("decision-clock"),
    rejection: element("rejection-clock"),
    seconds: element("clock-seconds"),
    rejectionSeconds: element("rejection-seconds"),
    progress: element("clock-progress"),
    warning: element("clock-warning"),
  };
  element("rulebook-panel").open =
    !window.matchMedia("(max-width: 780px)").matches;

  const photo = element("applicant-photo");
  const initials = element("applicant-initials");
  const stampTool = element("stamp-tool");
  const stampArea = element("verdict-stamp");
  const verdictImprint = element("verdict-imprint");

  photo.addEventListener("load", () => {
    photo.hidden = false;
    initials.hidden = true;
  });
  photo.addEventListener("error", () => {
    photo.hidden = true;
    initials.hidden = false;
  });

  function renderPortrait(application) {
    const portrait = application.portrait;
    const valid =
      typeof portrait?.sheet === "string" &&
      /^[a-z-]+$/.test(portrait.sheet) &&
      Number.isInteger(portrait.slot) &&
      portrait.slot >= 0 && portrait.slot < 8;

    element("applicant-portrait").setAttribute(
      "aria-label", `Identification for ${application.name}`,
    );
    initials.textContent = application.name
      .split(" ").slice(0, 2).map((word) => word[0]).join("");

    if (valid) {
      const source = new URL(
        `../assets/portraits/${portrait.sheet}.png`, import.meta.url,
      ).href;
      photo.style.left = `${-(portrait.slot % 3) * 100}%`;
      photo.style.top = `${-Math.floor(portrait.slot / 3) * 100}%`;
      if (photo.getAttribute("src") !== source) photo.src = source;
    } else {
      photo.removeAttribute("src");
    }

    const loaded = valid && photo.complete && photo.naturalWidth > 0;
    photo.hidden = !loaded;
    initials.hidden = loaded;
  }

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

  function getFeedbackPresentation(view) {
    const result = view.lastResult;
    let stamp;
    let label;
    let title;

    if (result.timedOut) {
      stamp = "TIME EXPIRED";
      label = "No decision filed";
      title = "The deadline has passed.";
    } else if (result.perfect) {
      stamp = "IN ORDER";
      label = "Decision correct";
      title = result.decision === "approve"
        ? "Authorisation granted."
        : "Refusal justified.";
    } else if (result.correctDecision) {
      stamp = "CORRECTION";
      label = "Decision correct";
      title = "The reasons need work.";
    } else {
      stamp = "AUDIT FAILED";
      label = "Incorrect decision";
      title = "The audit found a problem.";
    }

    if (view.runEnded) title = "Third warning. Run closed.";
    return { stamp, label, title };
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

    const presentation = getFeedbackPresentation(view);
    text("feedback-stamp", presentation.stamp);
    text("feedback-label", presentation.label);
    text("feedback-title", presentation.title);

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

  function getReportTitle(view, totals) {
    if (view.phase !== "complete") return "The desk is clear.";
    if (view.modeDetails.endless) return "The stamp must rest.";
    return totals.perfect === totals.count
      ? "You may keep the stamp."
      : "Your paperwork is on record.";
  }

  function getReportMessage(view, totals, savingAvailable) {
    if (view.phase !== "complete") {
      return `You processed ${totals.count} applications for the ${view.shift.name}. Review the paper trail before your next assignment.`;
    }

    const message = view.modeDetails.endless
      ? `You filed ${totals.count} applications across ${view.shiftIndex + 1} shifts before the third wrong verdict closed your appointment.`
      : `Three departments. Eighteen applications. An entirely unreasonable amount of responsibility. Your ${view.modeDetails.name} campaign is complete.`;

    return message + (savingAvailable
      ? " Your run is on file in the Roll of Honour."
      : " Your record is available for this visit; saving was unavailable.");
  }

  function renderReport(view, savingAvailable) {
    const finished = view.phase === "complete";
    const records = finished ? view.results : view.shiftResults;
    const totals = finished ? view.totals : view.shiftTotals;
    text(
      "report-code",
      finished ? "RUN COMPLETE" : `SHIFT ${pad(view.shiftIndex + 1)}`,
    );
    text(
      "report-label",
      `${view.modeDetails.name} / ${finished ? "Final assessment" : "End-of-shift assessment"}`,
    );
    text("report-title", getReportTitle(view, totals));
    text("report-message", getReportMessage(view, totals, savingAvailable));
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

    const list = element("rules");
    list.replaceChildren();
    for (const card of cards) list.appendChild(card);
  }

  function renderOfficeDate(shift) {
    const date = formatDate(shift.date);
    const checksExpiry = shift.rules.some((rule) => rule.type === "dateNotBefore");
    for (const id of ["office-date", "rulebook-date", "briefing-date"]) {
      text(id, date);
      element(id).dateTime = shift.date;
    }
    text("office-date-hint", checksExpiry ? "Use for expiry checks." : "Date of this shift.");
    element("expiry-reminder").hidden = !checksExpiry;
    element("briefing-expiry-hint").hidden = !checksExpiry;
  }

  function renderDocument(shift, application) {
    text("form-number", `FORM ${shift.form}`);
    text("application-title", shift.permit);
    text("applicant-name", application.name);
    text("applicant-species", application.species);
    renderPortrait(application);
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

  function renderVerdict(result) {
    verdictImprint.hidden = !result || result.timedOut;
    if (verdictImprint.hidden) return;
    element("verdict-stamp").dataset.decision = result.decision;
    verdictImprint.textContent = result.decision === "approve"
      ? "APPROVED"
      : "DENIED";
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

  function render(
    view,
    bestScore,
    savingAvailable,
    remaining = view.timer?.remainingMs ?? null,
    { deferFeedback = false } = {},
  ) {
    cancelApplicationSlide();
    cancelVerdictStamp();
    renderVerdict(!deferFeedback && view.phase === "feedback"
      ? view.lastResult
      : null);
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
    const shiftKey = `${view.runId}/${view.shiftIndex}`;
    const applicationKey = `${shiftKey}/${view.caseIndex}`;
    if (renderedShift !== shiftKey) {
      renderOfficeDate(view.shift);
      text("rulebook-intro", view.shift.intro);
      text("shift-memo", view.shift.memo);
      renderRules(view.shift);
      renderedShift = shiftKey;
    }
    if (renderedApplication !== applicationKey) {
      renderDocument(view.shift, view.application);
      renderedApplication = applicationKey;
    }
    renderQueue(view);
    const inspecting = view.phase === "inspection";

    if (clockCase !== applicationKey) {
      clockCase = applicationKey;
      previousSeconds = 21;
      clock.warning.textContent = "";
    }
    renderClock(view.modeDetails.timed && inspecting ? remaining : null);
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
      openFlowDialog(deferFeedback ? null : "feedback-dialog");
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
    if (clockActive !== active) {
      clock.decision.hidden = !active;
      clock.rejection.hidden = !active;
      clockActive = active;
    }
    if (!active) return;

    const secondsRemaining = Math.max(0, remaining) / 1000;
    const seconds = Math.ceil(secondsRemaining);
    clock.progress.value = secondsRemaining;
    if (seconds === previousSeconds) return;

    clock.seconds.textContent = seconds;
    clock.rejectionSeconds.textContent = seconds;
    clock.progress.setAttribute("aria-valuetext", `${seconds} seconds remaining`);
    clock.decision.classList.toggle("urgent", seconds <= 5);
    clock.rejection.classList.toggle("urgent", seconds <= 5);
    if (seconds <= 5 && seconds > 0 && previousSeconds > 5) {
      clock.warning.textContent = `${seconds} seconds left to file this decision.`;
    }
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
          : recordDateFormatter.format(new Date(record.endedAt));
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

  function cancelVerdictStamp() {
    if (stampScroll) {
      const { before, after } = stampScroll;
      stampScroll = null;
      if (Math.abs(window.scrollY - after.y) < 2 && Math.abs(window.scrollX - after.x) < 2) {
        window.scrollTo({ left: before.x, top: before.y, behavior: "auto" });
      }
    }
    if (!verdictStamp) return;
    const stamp = verdictStamp;
    verdictStamp = null;
    window.clearTimeout(stamp.impactTimer);
    stamp.motion.cancel();
    stampTool.hidden = true;
    stamp.resolve(false);
  }

  function stampApplication(decision, onImpact) {
    cancelApplicationSlide();
    cancelVerdictStamp();
    renderVerdict({ decision, timedOut: false });
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof stampTool.animate !== "function"
    ) {
      onImpact();
      return Promise.resolve(true);
    }

    verdictImprint.hidden = true;
    stampTool.hidden = false;
    const before = { x: window.scrollX, y: window.scrollY };
    stampArea.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "auto" });
    const after = { x: window.scrollX, y: window.scrollY };
    if (before.x !== after.x || before.y !== after.y) stampScroll = { before, after };
    const duration = 560;
    const impact = 0.34;
    const motion = stampTool.animate(
      [
        { offset: 0, opacity: 0, transform: "translate(18px, -150px) rotate(12deg) scale(1.08)", filter: "drop-shadow(12px 20px 12px #30291f35)" },
        { offset: 0.1, opacity: 1, transform: "translate(13px, -115px) rotate(8deg) scale(1.06)" },
        { offset: impact, opacity: 1, transform: "translate(0, 0) rotate(-7deg) scale(1)", filter: "drop-shadow(2px 2px 1px #30291f65)" },
        { offset: 0.44, opacity: 1, transform: "translate(0, 2px) rotate(-7deg) scale(1, 0.96)" },
        { offset: 0.58, opacity: 1, transform: "translate(0, -3px) rotate(-7deg) scale(1)" },
        { offset: 0.88, opacity: 1, transform: "translate(12px, -120px) rotate(8deg) scale(1.06)", filter: "drop-shadow(12px 20px 12px #30291f35)" },
        { offset: 1, opacity: 0, transform: "translate(18px, -155px) rotate(12deg) scale(1.08)" },
      ],
      { duration, easing: "linear" },
    );

    return new Promise((resolve) => {
      const stamp = { motion, resolve, impactTimer: null, impacted: false };
      verdictStamp = stamp;
      const press = () => {
        if (verdictStamp !== stamp || stamp.impacted) return;
        stamp.impacted = true;
        verdictImprint.hidden = false;
        onImpact();
      };
      stamp.impactTimer = window.setTimeout(press, duration * impact);
      motion.finished.then(() => {
        if (verdictStamp !== stamp) return;
        press();
        window.clearTimeout(stamp.impactTimer);
        verdictStamp = null;
        stampTool.hidden = true;
        resolve(true);
      }, () => {
        if (verdictStamp === stamp) cancelVerdictStamp();
      });
    });
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
    stampApplication,
    cancelVerdictStamp,
  };
}
