import React, { useEffect, useState } from 'react';
import { View, Text, ViewStyle } from 'react-native';

export default function WaveStatsBadge({
  waveId,
  style,
  compact = true,
}: {
  waveId: string;
  style?: ViewStyle;
  compact?: boolean;
}) {
  const [splashes, setSplashes] = useState<number>(0);
  const [echoes, setEchoes] = useState<number>(0);

  useEffect(() => {
    let firestoreMod: any = null;
    try { firestoreMod = require('@react-native-firebase/firestore').default; } catch {}
    if (!firestoreMod || !waveId) return;

    const ref = firestoreMod().collection('waves').doc(waveId);
    const unsub = ref.onSnapshot((snap: any) => {
      try {
        const d = snap?.data?.() || snap?.data || {};
        const counts = d?.counts || {};
        setSplashes(Math.max(0, Number(counts?.splashes || 0)));
        setEchoes(Math.max(0, Number(counts?.echoes || 0)));
      } catch {}
    }, () => {});

    return () => { try { unsub && unsub(); } catch {} };
  }, [waveId]);

  return (
    <View style={[{
      flexDirection: 'row',
      backgroundColor: '#0009',
      paddingHorizontal: 8,
      paddingVertical: compact ? 4 : 6,
      borderRadius: 14,
      alignItems: 'center',
      gap: 8,
    }, style]}> 
      <Text style={{ color: 'white', fontWeight: '700' }}>💧 {formatCount(splashes)}</Text>
      <Text style={{ color: 'white', fontWeight: '700' }}>📣 {formatCount(echoes)}</Text>
    </View>
  );
}

function formatCount(n: number) {
  if (!Number.isFinite(n)) return '-';
  if (n < 1000) return String(n);
  return `${Math.floor(n / 1000)}k`;
}
