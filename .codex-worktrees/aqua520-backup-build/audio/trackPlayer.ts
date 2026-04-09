let isSetup = false;
let TP: any = null;

function getTP() {
  if (TP) return TP;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('react-native-track-player');
    TP = mod.default || mod;
    return TP;
  } catch {
    TP = null;
    return null;
  }
}

export async function ensureSetup() {
  if (isSetup) return;
  const tp = getTP();
  if (!tp) return;
  await tp.setupPlayer({ waitForBuffer: true });
  try {
    const mod = require('react-native-track-player');
    const Capability = mod.Capability;
    await tp.updateOptions({
      stopWithApp: false,
      capabilities: [Capability.Play, Capability.Pause, Capability.Stop, Capability.SeekTo],
      compactCapabilities: [Capability.Play, Capability.Pause],
    });
  } catch {}
  isSetup = true;
}

export async function loadAudio(url: string, title?: string) {
  await ensureSetup();
  const tp = getTP();
  if (!tp) return;
  await tp.reset();
  await tp.add({ id: 'attached-audio', url, title: title || 'Attached Audio' });
}

export async function play() {
  const tp = getTP();
  if (!tp) return;
  await tp.play();
}

export async function pause() {
  const tp = getTP();
  if (!tp) return;
  await tp.pause();
}

export async function stopAndReset() {
  const tp = getTP();
  if (!tp) return;
  try { await tp.stop(); } catch {}
  try { await tp.reset(); } catch {}
}

export async function seekTo(seconds: number) {
  const tp = getTP();
  if (!tp) return;
  await tp.seekTo(seconds);
}

export async function isPlaying(): Promise<boolean> {
  const tp = getTP();
  if (!tp) return false;
  const s = await tp.getState();
  try {
    const mod = require('react-native-track-player');
    const State = mod.State;
    return s === State.Playing || s === State.Buffering;
  } catch {
    return false;
  }
}
