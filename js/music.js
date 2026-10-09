export function createMusicPlayer(element, {
    AudioContext = globalThis.window?.AudioContext || globalThis.window?.webkitAudioContext,
    fetchAudio = url => fetch(url)
} = {}) {
    if (!AudioContext || !element) return element;
    let context = null;
    let gain = null;
    let buffer = null;
    let loading = null;
    let starting = null;
    let source = null;
    let wanted = null;
    let position = 0;
    let startedAt = 0;

    function applyGain() {
        if (!gain) return;
        gain.gain.setTargetAtTime(element.muted ? 0 : element.volume, context.currentTime, .015);
    }

    function loadBuffer() {
        if (buffer) return Promise.resolve(buffer);
        if (!loading) {
            loading = (async () => {
                const response = await fetchAudio(element.getAttribute("src") || element.currentSrc);
                if (!response.ok) throw new Error("The music file could not be loaded.");
                buffer = await context.decodeAudioData(await response.arrayBuffer());
                if (!buffer.duration) throw new Error("The music file is empty.");
                return buffer;
            })().catch(error => {
                loading = null;
                buffer = null;
                throw error;
            });
        }
        return loading;
    }
}