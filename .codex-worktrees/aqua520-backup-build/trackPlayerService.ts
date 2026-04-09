export default async function setupService() {
  let TP: any;
  let Event: any;
  let AppKilledPlaybackBehavior: any;
  let Capability: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('react-native-track-player');
    TP = mod.default || mod;
    Event = mod.Event;
    AppKilledPlaybackBehavior = mod.AppKilledPlaybackBehavior;
    Capability = mod.Capability;
  } catch {
    // Module not linked/available; skip service setup
    return;
  }

  try {
    TP.updateOptions({
      stopWithApp: false,
      capabilities: [Capability.Play, Capability.Pause, Capability.Stop, Capability.SeekTo],
      compactCapabilities: [Capability.Play, Capability.Pause],
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
    });

    TP.addEventListener(Event.RemotePlay, () => TP.play());
    TP.addEventListener(Event.RemotePause, () => TP.pause());
    TP.addEventListener(Event.RemoteStop, () => TP.stop());
    TP.addEventListener(Event.RemoteSeek, (e: any) => TP.seekTo(e.position));
  } catch {
    // ignore
  }
}
