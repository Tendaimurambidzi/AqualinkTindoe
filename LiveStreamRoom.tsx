import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  StyleSheet,
} from 'react-native';
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  IRtcEngine,
} from 'react-native-agora';

type Props = {
  appId: string;
  token: string;
  channelName: string;
  uid: number;
  isHost?: boolean;
  onLeave?: () => void;
};

export default function LiveStreamRoom({
  appId,
  token,
  channelName,
  uid,
  isHost = true,
  onLeave,
}: Props) {
  const engineRef = useRef<IRtcEngine | null>(null);
  const [joined, setJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState<number | null>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      await requestPermissions();

      const engine = createAgoraRtcEngine();
      engineRef.current = engine;

      engine.initialize({ appId });
      engine.setChannelProfile(ChannelProfileType.ChannelProfileLiveBroadcasting);
      engine.setClientRole(
        isHost
          ? ClientRoleType.ClientRoleBroadcaster
          : ClientRoleType.ClientRoleBroadcaster,
      );

      engine.enableAudio();
      try {
        engine.disableVideo();
      } catch {}

      engine.registerEventHandler({
        onJoinChannelSuccess: () => {
          if (mounted) setJoined(true);
        },
        onUserJoined: (_connection, remoteUserId) => {
          if (mounted) setRemoteUid(remoteUserId);
        },
        onUserOffline: (_connection, remoteUserId) => {
          if (mounted) {
            setRemoteUid(prev => (prev === remoteUserId ? null : prev));
          }
        },
        onError: (_err, msg) => {
          console.log('Agora error:', msg);
        },
      });

      engine.joinChannel(token, channelName, uid, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        publishCameraTrack: false,
        publishMicrophoneTrack: true,
        autoSubscribeAudio: true,
        autoSubscribeVideo: false,
      });
    }

    init();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [appId, channelName, isHost, token, uid]);

  async function requestPermissions() {
    if (Platform.OS !== 'android') return;

    const permissions = [
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ];

    await PermissionsAndroid.requestMultiple(permissions);
  }

  function toggleMute() {
    const engine = engineRef.current;
    if (!engine) return;
    const next = !muted;
    engine.muteLocalAudioStream(next);
    setMuted(next);
  }

  function cleanup() {
    const engine = engineRef.current;
    if (!engine) return;
    try {
      engine.leaveChannel();
      engine.release();
    } catch (e) {
      console.log('Cleanup error:', e);
    }
    engineRef.current = null;
  }

  function leaveRoom() {
    cleanup();
    onLeave?.();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {joined ? `Live in ${channelName}` : 'Joining live stream...'}
      </Text>

      <View style={styles.audioStage}>
        <Text style={styles.audioTitle}>Audio-only live room</Text>
        <Text style={styles.audioText}>Your mic is {muted ? 'muted' : 'live'}.</Text>
        <Text style={styles.audioText}>
          {remoteUid !== null ? `Listener joined: ${remoteUid}` : 'Waiting for another speaker...'}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={toggleMute}>
          <Text style={styles.buttonText}>{muted ? 'Unmute' : 'Mute'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.leaveButton]}
          onPress={leaveRoom}
        >
          <Text style={styles.buttonText}>Leave</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 40 },
  header: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  audioStage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  audioTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  audioText: {
    color: '#bbb',
    fontSize: 16,
    marginBottom: 8,
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 12,
    gap: 10,
    backgroundColor: '#111',
  },
  button: {
    backgroundColor: '#333',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  leaveButton: {
    backgroundColor: '#8b0000',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
