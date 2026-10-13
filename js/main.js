import { createCampaign, validateDefinition } from "./game.js";
import { createStorage } from "./storage.js";
import { createInterface } from "./ui.js";
import { createAudioController, getAudioChannelIds } from "./audio.js";

const storage = createStorage();
const element = (id) => document.getElementById(id);
let definition;
let campaign = null;
let ui;
let screen = "menu";
let recordMode = "normal";
let ready = false;
let loading = false;
let pendingStamp = null;

const audio = createAudioController(
  {
    atmosphere: element("atmosphere-audio"),
    music: element("music-audio"),
    effects: element("stamp-audio"),
    paper: element("paper-audio"),
  },
  storage.loadSettings(),
  (settings) => {
    const saved = storage.saveSettings(settings);
    element("settings-status").textContent = saved
      ? "Preferences saved. Make yourself comfortable."
      : "Changes apply for this visit. Saving is unavailable in this browser.";
  },
);

function syncAudioControl(id, { enabled, volume }) {
  element(`${id}-enabled`).checked = enabled;
  element(`${id}-volume`).value = volume;
  element(`${id}-volume`).setAttribute("aria-valuetext", `${volume}%`);
  element(`${id}-volume-output`).value = `${volume}%`;
}

function syncSettings() {
  const settings = audio.getSettings();
  syncAudioControl("master", {
    enabled: settings.masterEnabled,
    volume: settings.masterVolume,
  });
  for (const channel of getAudioChannelIds()) {
    syncAudioControl(channel, settings[channel]);
  }
}

function bindAudioControl(id, setEnabled, setVolume) {
  element(`${id}-enabled`).addEventListener("change", (event) => {
    setEnabled(event.target.checked);
    syncSettings();
  });
  element(`${id}-volume`).addEventListener("input", (event) => {
    setVolume(Number(event.target.value));
    syncSettings();
  });
}

function openSettings() {
  revealPendingFeedback();
  syncSettings();
  element("settings-status").textContent = storage.isAvailable()
    ? "Your preferences stay with this browser."
    : "Changes apply for this visit. Saving is unavailable in this browser.";
  element("settings-dialog").showModal();
}

function resetSessionAfterClearing() {
  cancelPendingStamp();
  campaign = null;
  recordMode = "normal";
  ui?.cancelApplicationSlide();
  audio.resetSettings();
  syncSettings();
  closeDialogs();
  screen = "menu";
  renderMenu();
  element("campaign-status").textContent =
    "The filing cabinet is empty. Your next shift awaits.";
  element("start-title").focus({ preventScroll: true });
}

function clearSavedData() {
  if (!element("clear-data-dialog").open) return;
  if (!storage.clearData()) {
    element("clear-data-error").hidden = false;
    return;
  }
  resetSessionAfterClearing();
}

function closeDialogs() {
  for (const dialog of document.querySelectorAll("dialog[open]"))
    dialog.close();
}

function getCampaignStatusMessage(view) {
  if (!view) return "No campaign on file. Your first shift awaits.";
  if (view.phase === "complete") {
    return `${view.modeDetails.name} run complete. A fresh stack of paperwork awaits.`;
  }
  if (view.runEnded) {
    return `${view.modeDetails.name} run closed. Continue to collect your final report.`;
  }

  const shiftCount = view.shiftCount === null ? "" : ` of ${view.shiftCount}`;
  let message = `${view.modeDetails.name} · Shift ${view.shiftIndex + 1}${shiftCount} · ${view.totals.count} applications filed · ${view.totals.points} points.`;
  if (view.modeDetails.endless) {
    message += ` ${view.mistakes}/3 audit warnings.`;
  } else if (view.modeDetails.timed && view.phase === "inspection") {
    message += ` Clock paused at ${Math.ceil(campaign.timeRemaining() / 1000)}s.`;
  }
  return message;
}

function renderMenu() {
  element("start-screen").hidden = false;
  element("campaign-screen").hidden = true;
  element("desk-header").hidden = true;
  element("desk-footer").hidden = true;
  element("skip-link").setAttribute("href", "#start-title");
  element("new-campaign-button").disabled = !ready;
  element("honours-button").disabled = !ready;
  const view = campaign?.getView();
  element("continue-campaign-button").disabled =
    !ready || !view || view.phase === "complete";
  const bestScore = storage.loadBest();
  element("menu-best-score").textContent =
    bestScore === null ? "—" : String(bestScore).padStart(3, "0");
  element("campaign-status").hidden = !ready;
  let message = getCampaignStatusMessage(view);
  if (!storage.isAvailable())
    message += " Progress is available during this visit only.";
  element("campaign-status").textContent = message;
}

function refresh(options = {}) {
  if (!campaign || screen !== "desk") return;
  const view = campaign.getView();
  if (view.runEnded) {
    storage.saveRecord({
      runId: view.runId,
      mode: view.mode,
      clerk: view.clerk,
      startedAt: view.startedAt,
      endedAt: view.endedAt,
      ...view.totals,
      mistakes: view.mistakes,
    });
    if (view.mode === "normal") storage.saveBest(view.totals.points);
  }
  storage.saveProgress(campaign.snapshot());
  ui.render(
    view,
    storage.loadBest(view.mode),
    storage.isAvailable(),
    campaign.timeRemaining(),
    options,
  );
  return view;
}

function showMenu() {
  cancelPendingStamp();
  ui?.cancelApplicationSlide();
  if (campaign) {
    campaign.pauseClock();
    storage.saveProgress(campaign.snapshot());
  }
  closeDialogs();
  screen = "menu";
  renderMenu();
  element("start-title").focus({ preventScroll: true });
}

function openDesk() {
  if (!ready || !campaign) return;
  closeDialogs();
  screen = "desk";
  element("start-screen").hidden = true;
  element("campaign-screen").hidden = false;
  element("desk-header").hidden = false;
  element("desk-footer").hidden = false;
  element("skip-link").setAttribute("href", "#application");
  campaign.resumeClock();
  refresh();
  tickClock();
  if (campaign.getPhase() === "inspection")
    element("application").focus({ preventScroll: true });
}

async function loadCampaign() {
  if (loading) return;
  loading = true;
  ready = false;
  renderMenu();
  element("loading-state").hidden = false;
  element("error-state").hidden = true;
  element("retry-button").disabled = true;
  element("game").setAttribute("aria-busy", "true");
  try {
    const response = await fetch(
      new URL("../data/applications.json", import.meta.url),
    );
    if (!response.ok)
      throw new Error(
        `The applications could not be retrieved (HTTP ${response.status}).`,
      );
    definition = await response.json();
    validateDefinition(definition);
    const saved = storage.loadProgress();
    const restored = saved ? createCampaign(definition, saved) : null;
    campaign = restored?.getView().restored ? restored : null;
    campaign?.pauseClock();
    ui = createInterface(definition);
    ready = true;
    renderMenu();
  } catch (error) {
    element("error-state").hidden = false;
    element("error-message").textContent =
      `Please serve the source project with a local web server or GitHub Pages and try again. ${error.message}`;
  } finally {
    loading = false;
    element("loading-state").hidden = true;
    element("retry-button").disabled = false;
    element("game").setAttribute("aria-busy", "false");
  }
}

function cancelPendingStamp() {
  pendingStamp = null;
  ui?.cancelVerdictStamp();
}

function revealPendingFeedback() {
  if (!pendingStamp) return;
  cancelPendingStamp();
  refresh();
}

async function finishInspection(decision, reasons = []) {
  if (screen !== "desk") return;
  const result = campaign?.submit(decision, reasons);
  if (!result) return;
  if (element("reject-dialog").open) element("reject-dialog").close();
  if (result.timedOut) {
    refresh();
    return;
  }
  const submittedCampaign = campaign;
  pendingStamp = submittedCampaign;
  refresh({ deferFeedback: true });
  const finished = await ui.stampApplication(result.decision, audio.playStamp);
  if (pendingStamp !== submittedCampaign) return;
  pendingStamp = null;
  if (finished && screen === "desk" && campaign === submittedCampaign) refresh();
}

function advance() {
  if (screen !== "desk" || pendingStamp || !campaign?.advance()) return;
  const view = refresh();
  if (view.phase === "inspection") {
    presentApplication();
  }
}

function presentApplication() {
  ui.slideApplication();
  audio.playPaper();
  element("application").focus({ preventScroll: true });
}

function openModeChooser() {
  if (!ready) return;
  closeDialogs();
  element("mode-form").reset();
  element("clerk-input").value = campaign?.getView().clerk ?? "";
  element("mode-dialog").showModal();
}

function tickClock() {
  if (screen !== "desk" || !campaign) return;
  const remaining = campaign.timeRemaining();
  if (remaining === null) return;
  if (remaining <= 0) {
    if (campaign.expire()) refresh();
  } else ui.renderClock(remaining);
}

function openRejection() {
  if (screen !== "desk") return;
  tickClock();
  if (campaign?.getPhase() !== "inspection") return;
  ui.openRejection(campaign.getView());
  ui.renderClock(campaign.timeRemaining());
}

function renderHonours() {
  ui.renderRecords(storage.loadRecords(recordMode), recordMode);
  element("records-status").textContent = storage.isAvailable()
    ? "These records belong to this browser. A fresh campaign keeps them on file."
    : "Records are available for this visit. Saving is unavailable in this browser.";
}

element("new-campaign-button").addEventListener("click", () => {
  if (!ready) return;
  if (campaign && !campaign.getView().runEnded)
    element("restart-dialog").showModal();
  else openModeChooser();
});
element("mode-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!ready || !element("mode-dialog").open) return;
  const form = new FormData(event.currentTarget);
  campaign = createCampaign(definition, null, Math.random, {
    mode: form.get("mode"),
    clerk: form.get("clerk"),
  });
  openDesk();
});
element("cancel-mode-button").addEventListener("click", () =>
  element("mode-dialog").close(),
);
element("honours-button").addEventListener("click", () => {
  if (!ready) return;
  recordMode = campaign?.getView().mode ?? "normal";
  renderHonours();
  element("honours-dialog").showModal();
});
for (const button of document.querySelectorAll("[data-record-mode]"))
  button.addEventListener("click", () => {
    recordMode = button.dataset.recordMode;
    renderHonours();
  });
element("close-honours-button").addEventListener("click", () =>
  element("honours-dialog").close(),
);
element("continue-campaign-button").addEventListener("click", () => {
  if (campaign && campaign.getPhase() !== "complete") openDesk();
});
element("menu-button").addEventListener("click", showMenu);
for (const button of document.querySelectorAll("[data-main-menu]"))
  button.addEventListener("click", showMenu);

element("begin-shift-button").addEventListener("click", () => {
  if (screen !== "desk" || !campaign?.startShift()) return;
  refresh();
  presentApplication();
});
element("approve-button").addEventListener("click", () =>
  finishInspection("approve"),
);
element("reject-button").addEventListener("click", openRejection);
element("cancel-rejection-button").addEventListener("click", () =>
  element("reject-dialog").close(),
);
element("rejection-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const reasons = new FormData(event.currentTarget).getAll("reasons");
  if (!reasons.length) {
    element("rejection-error").hidden = false;
    return;
  }
  finishInspection("reject", reasons);
});
element("next-applicant-button").addEventListener("click", advance);
element("report-continue-button").addEventListener("click", () => {
  if (campaign?.getPhase() === "complete") showMenu();
  else advance();
});
element("help-button").addEventListener("click", () => {
  revealPendingFeedback();
  element("help-dialog").showModal();
});
element("close-help-button").addEventListener("click", () =>
  element("help-dialog").close(),
);
element("cancel-restart-button").addEventListener("click", () =>
  element("restart-dialog").close(),
);
element("confirm-restart-button").addEventListener("click", openModeChooser);
element("retry-button").addEventListener("click", loadCampaign);

for (const id of ["settings-button", "desk-settings-button"])
  element(id).addEventListener("click", openSettings);
element("close-settings-button").addEventListener("click", () =>
  element("settings-dialog").close(),
);
const settingsDialog = element("settings-dialog");
let settingsClickStartedOutside = false;

function isOutsideSettings(event) {
  const bounds = settingsDialog.getBoundingClientRect();

  return (
    event.target === settingsDialog &&
    (event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom)
  );
}

settingsDialog.addEventListener("pointerdown", (event) => {
  settingsClickStartedOutside = isOutsideSettings(event);
});

settingsDialog.addEventListener("click", (event) => {
  if (settingsClickStartedOutside && isOutsideSettings(event)) {
    settingsDialog.close();
  }

  settingsClickStartedOutside = false;
});
element("clear-data-button").addEventListener("click", () => {
  element("clear-data-error").hidden = true;
  element("clear-data-dialog").showModal();
});
element("cancel-clear-data-button").addEventListener("click", () =>
  element("clear-data-dialog").close(),
);
element("confirm-clear-data-button").addEventListener("click", clearSavedData);
bindAudioControl("master", audio.setMasterEnabled, audio.setMasterVolume);
for (const channel of getAudioChannelIds()) {
  bindAudioControl(
    channel,
    (enabled) => audio.setChannel(channel, { enabled }),
    (volume) => audio.setChannel(channel, { volume }),
  );
}
document.addEventListener("pointerdown", () => audio.activate());
document.addEventListener("keydown", () => audio.activate());
syncSettings();
for (const id of ["briefing-dialog", "feedback-dialog", "report-dialog"]) {
  element(id).addEventListener("cancel", (event) => event.preventDefault());
}

document.addEventListener("keydown", (event) => {
  if (
    screen !== "desk" ||
    event.repeat ||
    event.ctrlKey ||
    event.altKey ||
    event.metaKey ||
    !campaign
  )
    return;
  if (element("settings-dialog").open || element("help-dialog").open) return;
  const phase = campaign.getPhase();
  if (
    element("feedback-dialog").open &&
    phase === "feedback" &&
    event.key === "Enter" &&
    !event.target.closest("[data-main-menu]")
  ) {
    event.preventDefault();
    advance();
    return;
  }
  if (document.querySelector("dialog[open]") || phase !== "inspection") return;
  if (event.target.matches("input, textarea, select")) return;
  const key = event.key.toLowerCase();
  if (key === "a") {
    event.preventDefault();
    finishInspection("approve");
  } else if (key === "r") {
    event.preventDefault();
    openRejection();
  }
});
window.setInterval(tickClock, 100);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) tickClock();
});
window.addEventListener("pagehide", () => {
  cancelPendingStamp();
  ui?.cancelApplicationSlide();
  if (campaign) {
    campaign.pauseClock();
    storage.saveProgress(campaign.snapshot());
  }
});
window.addEventListener("pageshow", () => {
  if (screen === "desk" && campaign) {
    campaign.resumeClock();
    refresh();
    tickClock();
  }
});

window.addEventListener("storage", (event) => {
  if (event.key !== null && !event.key.startsWith("bureau-of-nonsense:"))
    return;
  storage.invalidateCache();
  if (event.newValue === null) {
    resetSessionAfterClearing();
  } else if (screen === "menu") {
    renderMenu();
    if (element("honours-dialog").open) renderHonours();
  }
});

loadCampaign();
