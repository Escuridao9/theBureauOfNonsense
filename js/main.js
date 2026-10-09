import { createStorage } from "./storage.js";
import { createAudioController } from "./audio.js";

const storage = createStorage();

const element = id => document.getElementById(id);

const audio = createAudioController({
    atmosphere: element("atmosphere-audio"),
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
        element(`${channel}-volume`).setAttribute("aria-valuetext", `${preference-volume}%`);
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

for (const channel of Object.keys(audio-getSettings())) {
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