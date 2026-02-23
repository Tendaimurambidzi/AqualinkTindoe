import React from 'react';
import { Text, Linking } from 'react-native';

const parseUrls = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return { type: 'url', content: part, key: index };
    }
    return { type: 'text', content: part, key: index };
  });
};

interface ClickableTextWithLinksProps {
  text: string;
  style?: any;
  numberOfLines?: number;
}

const ClickableTextWithLinks: React.FC<ClickableTextWithLinksProps> = ({
  text,
  style,
  numberOfLines
}) => {
  const parts = parseUrls(text);

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {parts.map((part) => {
        if (part.type === 'url') {
          return (
            <Text
              key={part.key}
              style={{ color: '#1976D2', textDecorationLine: 'underline' }}
              onPress={() => {
                Linking.openURL(part.content).catch(err =>
                  console.log('Failed to open link:', err)
                );
              }}
            >
              {part.content}
            </Text>
          );
        }
        return (
          <Text key={part.key}>
            {part.content}
          </Text>
        );
      })}
    </Text>
  );
};

export default ClickableTextWithLinks;