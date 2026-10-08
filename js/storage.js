const SETTINGS_KEY = "bureau-of-nonsense:audio:v1";

export function createStorage(getProvider = () => window.localStorage) {
    let available = true;
    function read(key) {
        try { return getProvider().getItem(key); }
        catch { available = false; return null; }
    }
    function write(key, value) {
        try { getProvider().setItem(key,value); return true; }
        catch { available = false; return false; }
    }
    function readJSON(key) {
        const value = read(key);
        try { return value === null ? null : JSON.parse(value); }
        catch { return null; }
    }
    return {
        loadSettings: () => readJSON(SETTINGS_KEY),
        saveSettings: settings => write(SETTINGS_KEY, JSON.stringify(settings)),
        isAvailable: () => available
    };
}