import React, { memo } from 'react';
import { View, Text } from 'react-native';
import VideoTile from '../components/VideoTile';

function FeedItem({
  item,
}: {
  item: { id: string; title: string; manifest?: any };
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#fff', marginBottom: 8, fontWeight: '700' }}>
        {item.title}
      </Text>
      <VideoTile videoId={item.id} manifest={item.manifest} />
    </View>
  );
}

export default memo(FeedItem);
