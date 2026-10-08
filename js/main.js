import { createStorage } from "./storage.js";

const storage = createStorage();

const element = id => document.getElementById(id);

function syncSettings() {
    for (const channel of ["atmosphere", "music", "effects", "paper"]) {
        const volume = Number(element(`${channel}-volume`).value);
        element(`${channel}-volume`).setAttribute("aria-valuetext", `${volume}%`);
        element(`${channel}-volume-output`).value = `${volume}%`;
    }
}

function saveSettings() {
    const settings = {};
    for (const channel of ["atmosphere", "music", "effects", "paper"]) {
        settings[channel] = {
            enabled: element(`${channel}-enabled`).checked,
            volume: Number(element(`${channel}-volume`).value)
        };
    }
    const saved = storage.saveSettings(settings);
    element("settings-status").textContent = saved
    ? "Preferences saved. Make yourself comfortable."
    : "Changes apply for this visit. Saving is unavailable in this browser.";
}

function openSettings() {
    syncSettings();
    element("settings-dialog").showModal();
}

element("settings-button").addEventListener("click", openSettings);

element("close-settings-button").addEventListener("click", () => {
    element("settings-dialog").close();
})

for (const channel of ["atmosphere", "music", "effects", "paper"]) {
    element(`${channel}-volume`).addEventListener("input", syncSettings);
    element(`${channel}-volume`).addEventListener("input", saveSettings);
    element(`${channel}-enabled`).addEventListener("change", saveSettings);
}