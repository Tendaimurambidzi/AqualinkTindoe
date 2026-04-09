// @ts-nocheck
import React from 'react';
import { View } from 'react-native';
import Video from 'react-native-video';

export default function AudioSanityCheck() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Video
        source={{ uri: 'https://file-examples.com/storage/fe7e9f7b8f95f451dbd9b8c/2017/11/file_example_MP3_700KB.mp3' }}
        audioOnly
        paused={false}
        playInBackground
        ignoreSilentSwitch="ignore"
        onError={(e) => console.log('SANITY AUDIO ERROR', e)}
        onLoad={(m) => console.log('SANITY AUDIO LOADED sec=', m.duration)}
        style={{ height: 0, width: 0 }}
      />
    </View>
  );
}
