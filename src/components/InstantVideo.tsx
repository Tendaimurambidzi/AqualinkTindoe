// InstantVideo.tsx - TikTok-style instant loading video component
import React from 'react';
import FeedVideoPlayer from './FeedVideoPlayer';
import InstantMediaService from '../services/InstantMediaService';

interface Props {
  source: { uri: string };
  style?: any;
  paused?: boolean;
  isActive?: boolean;
  shouldPreload?: boolean;
}

const InstantVideo: React.FC<Props> = ({
  source,
  style,
  paused = false,
  isActive = true,
  shouldPreload = true,
}) => {
  const instantSource = InstantMediaService.getInstantVideoSource(source.uri);

  return (
    <FeedVideoPlayer
      source={instantSource || source}
      style={style}
      paused={paused}
      isActive={isActive}
      shouldPreload={shouldPreload}
      resizeMode="cover"
      progressUpdateInterval={250}
      bufferConfig={{
        minBufferMs: 20000,
        maxBufferMs: 50000,
        bufferForPlaybackMs: 1000,
        bufferForPlaybackAfterRebufferMs: 4000,
      }}
    />
  );
};

export default InstantVideo;
