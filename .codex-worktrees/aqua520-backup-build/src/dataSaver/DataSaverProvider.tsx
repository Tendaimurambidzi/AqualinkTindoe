import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

type DataSaverState = {
  enabled: boolean;
  autoplayOnWifiOnly: boolean;
  thumbnailsOnlyInFeed: boolean;
  maxResolution: 'low'|'med'|'high';
  wifiOnlyDownloads: boolean;
  mobileDataCapMB: number;
  preferModernCodec: boolean;
  cellular: boolean;
  setState: (patch: Partial<DataSaverState>) => void;
};

const KEY = 'dataSaver:v1';
const Ctx = createContext<DataSaverState | null>(null);

export function DataSaverProvider({ children }: { children: React.ReactNode }) {
  const [state, setStateRaw] = useState<DataSaverState>({
    enabled: true,
    autoplayOnWifiOnly: true,
    thumbnailsOnlyInFeed: true,
    maxResolution: 'low',
    wifiOnlyDownloads: true,
    mobileDataCapMB: 25,
    preferModernCodec: true,
    cellular: false,
    setState: () => {},
  });

  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(KEY);
        if (json) {
          const saved = JSON.parse(json);
          setStateRaw((s) => ({ ...s, ...saved }));
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(
      KEY,
      JSON.stringify({
        enabled: state.enabled,
        autoplayOnWifiOnly: state.autoplayOnWifiOnly,
        thumbnailsOnlyInFeed: state.thumbnailsOnlyInFeed,
        maxResolution: state.maxResolution,
        wifiOnlyDownloads: state.wifiOnlyDownloads,
        mobileDataCapMB: state.mobileDataCapMB,
        preferModernCodec: state.preferModernCodec,
      })
    ).catch(() => {});
  }, [
    state.enabled,
    state.autoplayOnWifiOnly,
    state.thumbnailsOnlyInFeed,
    state.maxResolution,
    state.wifiOnlyDownloads,
    state.mobileDataCapMB,
    state.preferModernCodec,
  ]);

  useEffect(() => {
    const sub = NetInfo.addEventListener((info) => {
      const cellular = info.type === 'cellular';
      setStateRaw((s) => ({ ...s, cellular }));
    });
    return () => sub && sub();
  }, []);

  const setState = (patch: Partial<DataSaverState>) => setStateRaw((s) => ({ ...s, ...patch }));
  const value = useMemo(() => ({ ...state, setState }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDataSaver() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDataSaver must be used inside DataSaverProvider');
  return ctx;
}

