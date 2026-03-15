import {
  createAgoraRtcEngine,
  IRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  RtcSurfaceView,
  VideoSourceType,
  RenderModeType,
} from 'react-native-agora';

let engine: IRtcEngine | null = null;

export const getAgoraEngine = () => {
  if (!engine) {
    engine = createAgoraRtcEngine();
  }
  return engine;
};

export const initAgoraEngine = async (appId: string) => {
  const rtc = getAgoraEngine();

  rtc.initialize({
    appId,
    channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
  });

  rtc.enableVideo();
  rtc.enableAudio();

  return rtc;
};

export const destroyAgoraEngine = () => {
  if (engine) {
    engine.release();
    engine = null;
  }
};

export { RtcSurfaceView, VideoSourceType, RenderModeType, ClientRoleType };
