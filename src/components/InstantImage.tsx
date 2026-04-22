// InstantImage.tsx - TikTok-style instant loading image component
import React from 'react';
import FastImage from '@d11/react-native-fast-image';
import InstantMediaService from '../services/InstantMediaService';

interface Props {
  source: { uri: string };
  style?: any;
  resizeMode?: string;
  onLoad?: () => void;
}

const InstantImage: React.FC<Props> = ({ source, style, resizeMode, onLoad }) => {
  const instantSource = InstantMediaService.getInstantImageSource(source.uri);

  return (
    <FastImage
      source={instantSource || source}
      style={style}
      resizeMode={resizeMode as FastImage.resizeMode || FastImage.resizeMode.cover}
      onLoad={onLoad}
      cacheKey={source.uri}
      priority={FastImage.priority.high}
    />
  );
};

export default InstantImage;
