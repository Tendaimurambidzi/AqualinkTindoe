import React from 'react';
import { View, Text } from 'react-native';
import { useDataSaver } from '../dataSaver/DataSaverProvider';
import VideoTile from '../components/VideoTile';

export default function FeedItem({ item, uid }: { item: { id: string; title: string }; uid?: string }) {
  const s = useDataSaver();
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#fff', marginBottom: 8, fontWeight: '700' }}>{item.title}</Text>
      <VideoTile
        videoId={item.id}
        uid={uid}
        initialAutoPlay={!s.enabled || (!s.autoplayOnWifiOnly || !s.cellular)}
      />
    </View>
  );
}

