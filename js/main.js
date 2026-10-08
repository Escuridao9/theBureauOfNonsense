const element = id => document.getElementById(id);

function openSettings() {
    element("settings-dialog").showModal();
}

element("settings-button").addEventListener("click", openSettings);

element("close-settings-button").addEventListener("click", () => {
    element("settings-dialog").close();
})