import { createStorage } from "./storage.js";
import { createAudioController } from "./audio.js";
import { createCampaign, validateDefinition } from "./game.js";
import { formatDate } from "./rules.js";

const storage = createStorage();

const element = id => document.getElementById(id);

let definition;
let ready = false;
let loading = false;
let campaign = null;
let screen = "menu";

const audio = createAudioController({
    atmosphere: element("atmosphere-audio"),
    music: element("music-audio"),
    effects: element("stamp-audio"),
    paper: element("paper-audio")
}, storage.loadSettings(), settings => {
    const saved = storage.saveSettings(settings);
    element("settings-status").textContent = saved
    ? "Preferences saved. Make yourself comfortable."
    : "Changes apply for this visit. Saving is unavailable in this browser.";
});

function syncSettings() {
    const settings = audio.getSettings();
    for (const [channel, preference] of Object.entries(settings)) {
        element(`${channel}-enabled`).checked = preference.enabled;
        element(`${channel}-volume`).value = preference.volume;
        element(`${channel}-volume`).setAttribute("aria-valuetext", `${preference.volume}%`);
        element(`${channel}-volume-output`).value = `${preference.volume}%`;
    }
}

function openSettings() {
    syncSettings();
    element("settings-status").textContent = storage.isAvailable()
    ? "Your preferences stay with this browser."
    : "Changes apply for this visit. Saving is unavailable in this browser.";
    element("settings-dialog").showModal();
}

for (const id of ["settings-button", "desk-settings-button"]) {
  element(id).addEventListener("click", openSettings);
}

element("close-settings-button").addEventListener("click", () => {
    element("settings-dialog").close();
})

for (const channel of Object.keys(audio.getSettings())) {
    element(`${channel}-enabled`).addEventListener("change", event => {
        audio.setChannel(channel, { enabled: event.target.checked });
        syncSettings();
    });

    element(`${channel}-volume`).addEventListener("input", event => {
        audio.setChannel(channel, { volume: Number(event.target.value) });
        syncSettings();
    });
}

document.addEventListener("pointerdown", () => audio.activate());
document.addEventListener("keydown", () => audio.activate());

syncSettings();

function closeDialogs() {
    for (const dialog of document.querySelectorAll("dialog[open]")) {
        dialog.close();
    }
}

function openModeChooser() {
  if (!ready || screen !== "menu") return;

  closeDialogs();
  element("mode-form").reset();
  element("clerk-input").value = campaign?.getView().clerk ?? "";
  element("mode-dialog").showModal();
}

async function loadCampaign() {
  if (loading) return;

  loading = true;
  ready = false;
  element("new-campaign-button").disabled = true;
  element("loading-state").hidden = false;
  element("campaign-status").hidden = true;
  element("error-state").hidden = true;
  element("retry-button").disabled = true;
  element("game").setAttribute("aria-busy", "true");

  try {
    const response = await fetch(
      new URL("../data/applications.json", import.meta.url)
    );

    if (!response.ok) {
      throw new Error(
        `The applications could not be retrieved (HTTP ${response.status}).`
      );
    }

    definition = await response.json();
    validateDefinition(definition);

    ready = true;
    element("new-campaign-button").disabled = false;
    element("campaign-status").textContent =
      "No campaign on file. Your first shift awaits.";
    element("campaign-status").hidden = false;
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

function renderMenu() {
  element("start-screen").hidden = false;
  element("campaign-screen").hidden = true;
  element("desk-header").hidden = true;
  element("desk-footer").hidden = true;
  element("skip-link").setAttribute("href", "#start-title");
  element("new-campaign-button").disabled = !ready;

  const view = campaign?.getView();

  element("continue-campaign-button").disabled =
    !ready || !view || view.phase === "complete";
  element("campaign-status").hidden = !ready;
  element("campaign-status").textContent = view
    ? `${view.modeDetails.name} · Shift ${view.shiftIndex + 1}${
        view.shiftCount === null ? "" : ` of ${view.shiftCount}`
      } · ${view.totals.count} applications filed · ${view.totals.points} points.`
    : "No campaign on file. Your first shift awaits.";
}

function openDesk() {
  if (!ready || !campaign) return;

  closeDialogs();
  screen = "desk";
  element("start-screen").hidden = true;
  element("campaign-screen").hidden = false;
  element("desk-header").hidden = false;
  element("desk-footer").hidden = false;
  element("skip-link").setAttribute("href", "#department-name");
  campaign.resumeClock();

  const view = campaign.getView();

  element("shift-number").textContent =
    `SHIFT ${String(view.shiftIndex + 1).padStart(2, "0")}`;
  element("department-name").textContent = view.shift.name;
  element("office-date").textContent = formatDate(view.shift.date);
  element("score").textContent = String(view.totals.points).padStart(3, "0");
  element("mode-name").textContent = view.modeDetails.name;
  element("clerk-name").textContent = view.clerk;
  element("department-name").focus({ preventScroll: true });
}

function showMenu() {
  campaign?.pauseClock();
  closeDialogs();
  screen = "menu";
  renderMenu();
  element("start-title").focus({ preventScroll: true });
}

element("new-campaign-button").addEventListener("click", openModeChooser);

element("cancel-mode-button").addEventListener("click", () => {
    element("mode-dialog").close();
});

element("mode-form").addEventListener("submit", event => {
  event.preventDefault();

  if (!ready || !element("mode-dialog").open) return;

  const form = new FormData(event.currentTarget);

  campaign = createCampaign(definition, null, Math.random, {
    mode: form.get("mode"),
    clerk: form.get("clerk")
  });

  openDesk();
});

element("menu-button").addEventListener("click", showMenu);

element("continue-campaign-button").addEventListener("click", () => {
  if (campaign && campaign.getView().phase !== "complete") {
    openDesk();
  }
});

element("retry-button").addEventListener("click", loadCampaign);

loadCampaign();