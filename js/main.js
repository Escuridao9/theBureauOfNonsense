const element = id => document.getElementById(id);

function syncSettings() {
    for (const channel of ["atmosphere", "music", "effects", "paper"]) {
        const volume = Number(element(`${channel}-volume`).value);
        element(`${channel}-volume`).setAttribute("aria-valuetext", `${volume}%`);
        element(`${channel}-volume-output`).value = `${volume}%`;
    }
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
}