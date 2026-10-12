const DEFAULTS = {
  atmosphere: { enabled: true, volume: 65 },
  music: { enabled: true, volume: 35 },
  effects: { enabled: true, volume: 75 },
  paper: { enabled: true, volume: 55 },
};
const CHANNELS = Object.keys(DEFAULTS);

const LOOPS = ["atmosphere", "music"];

export function normalizeAudioSettings(value) {
  const masterVolume = value?.masterVolume;

  return {
    masterEnabled:
      typeof value?.masterEnabled === "boolean" ? value.masterEnabled : true,
    masterVolume:
      typeof masterVolume === "number" && Number.isFinite(masterVolume)
        ? Math.round(Math.min(100, Math.max(0, masterVolume)))
        : 100,
    ...Object.fromEntries(
      CHANNELS.map((channel) => {
        const saved = value?.[channel];
        const defaults = DEFAULTS[channel];

        return [
          channel,
          {
            enabled:
              typeof saved?.enabled === "boolean"
                ? saved.enabled
                : defaults.enabled,
            volume:
              typeof saved?.volume === "number" && Number.isFinite(saved.volume)
                ? Math.round(Math.min(100, Math.max(0, saved.volume)))
                : defaults.volume,
          },
        ];
      }),
    ),
  };
}

export function createAudioController(
  players,
  initialSettings,
  onChange = () => {},
) {
  let settings = normalizeAudioSettings(initialSettings);
  let activated = false;

  const getSettings = () => structuredClone(settings);

  function hasSource(player) {
    return Boolean(
      player.currentSrc ||
      player.getAttribute("src")?.trim() ||
      [...player.querySelectorAll("source[src]")].some((source) =>
        source.getAttribute("src")?.trim(),
      ),
    );
  }

  function apply() {
    for (const channel of CHANNELS) {
      const player = players[channel];
      if (!player) continue;
      const preference = settings[channel];
      player.volume = (preference.volume / 100) * (settings.masterVolume / 100);
      player.muted =
        !settings.masterEnabled || !preference.enabled || player.volume === 0;
      if (!activated || player.muted || !hasSource(player)) {
        player.pause();
      } else if (LOOPS.includes(channel) && player.paused) {
        try {
          player.play()?.catch(() => {});
        } catch {}
      }
    }
  }

  function playOneShot(channel) {
    activated = true;
    apply();
    const sound = players[channel];
    if (!sound || sound.muted || !hasSource(sound)) return;
    try {
      sound.currentTime = 0;
      sound.play()?.catch(() => {});
    } catch {}
  }

  function setChannel(channel, changes) {
    if (!CHANNELS.includes(channel)) return;
    settings = normalizeAudioSettings({
      ...settings,
      [channel]: { ...settings[channel], ...changes },
    });
    apply();
    onChange(getSettings());
  }

  function setMasterVolume(volume) {
    settings = normalizeAudioSettings({ ...settings, masterVolume: volume });
    apply();
    onChange(getSettings());
  }

  function setMasterEnabled(enabled) {
    settings = normalizeAudioSettings({ ...settings, masterEnabled: enabled });
    apply();
    onChange(getSettings());
  }

  for (const player of Object.values(players)) {
    player?.addEventListener("canplay", apply);
  }
  apply();

  return {
    getSettings,
    setChannel,
    setMasterEnabled,
    setMasterVolume,
    resetSettings: () => {
      settings = normalizeAudioSettings(null);
      apply();
      return getSettings();
    },
    playStamp: () => playOneShot("effects"),
    playPaper: () => playOneShot("paper"),
    activate: () => {
      activated = true;
      apply();
    },
  };
}
