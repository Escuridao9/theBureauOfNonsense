import { createStorage } from "./storage.js";
import { createAudioController } from "./audio.js";
import { validateDefinition } from "./game.js";

const storage = createStorage();

const element = id => document.getElementById(id);

let definition;
let ready = false;
let loading = false;

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

element("settings-button").addEventListener("click", openSettings);

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
    if (!ready) return;

    closeDialogs();
    element("mode-form").reset();
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

element("new-campaign-button").addEventListener("click", openModeChooser);

element("cancel-mode-button").addEventListener("click", () => {
    element("mode-dialog").close();
});

element("mode-form").addEventListener("submit", event => {
    event.preventDefault();
});

element("start-campaign-button").disabled = true;
element("retry-button").addEventListener("click", loadCampaign);

loadCampaign();