const DEFAULTS = {
    atmosphere: { enabled: true, volume: 65 },
    music: { enabled: true, volume: 35 },
    effects: {enabled: true, volume: 75 },
    paper: { enabled: true, volume: 55 },
}
const CHANNELS = Object.keys(DEFAULTS);

export function normalizeAudioSettings(value) {
    return Object.fromEntries(CHANNELS.map(channel => {
        const saved = value?.[channel];
        const defaults = DEFAULTS[channel];
        return [channel, {
            enabled: typeof saved?.enabled === "boolean" ? saved.enabled : defaults. enabled,
            volume: typeof saved?.volume === "number" && Number.isFinite(saved.volume)
            ? Math.round(Math.min(100, Math.max(0, saved.volume))) : defaults.volume
        }];
    }));
}