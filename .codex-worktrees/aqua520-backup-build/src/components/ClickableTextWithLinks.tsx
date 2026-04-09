import React, { useMemo } from 'react';
import { Text, Linking } from 'react-native';

type TokenType = 'text' | 'url' | 'hashtag';
type Token = { type: TokenType; content: string; key: string };

const TOKEN_REGEX = /(https?:\/\/[^\s]+|#[A-Za-z0-9_]+)/g;

const tokenize = (input: string): Token[] => {
  const text = String(input || '');
  if (!text) return [{ type: 'text', content: '', key: 'empty' }];

  const tokens: Token[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TOKEN_REGEX.exec(text)) !== null) {
    const start = match.index;
    const end = TOKEN_REGEX.lastIndex;
    if (start > lastIndex) {
      tokens.push({
        type: 'text',
        content: text.slice(lastIndex, start),
        key: `t-${lastIndex}`,
      });
    }
    const value = match[0];
    tokens.push({
      type: value.startsWith('#') ? 'hashtag' : 'url',
      content: value,
      key: `k-${start}`,
    });
    lastIndex = end;
  }

  if (lastIndex < text.length) {
    tokens.push({
      type: 'text',
      content: text.slice(lastIndex),
      key: `t-${lastIndex}`,
    });
  }
  return tokens;
};

interface ClickableTextWithLinksProps {
  text: string;
  style?: any;
  numberOfLines?: number;
}

const ClickableTextWithLinks: React.FC<ClickableTextWithLinksProps> = ({
  text,
  style,
  numberOfLines,
}) => {
  const tokens = useMemo(() => tokenize(text), [text]);

  const openExternal = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (err) {
      console.log('Failed to open URL:', err);
    }
  };

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {tokens.map(token => {
        if (token.type === 'url') {
          return (
            <Text
              key={token.key}
              style={{ color: '#1976D2', textDecorationLine: 'underline' }}
              onPress={() => openExternal(token.content)}
            >
              {token.content}
            </Text>
          );
        }
        if (token.type === 'hashtag') {
          const hash = token.content.replace(/^#/, '');
          const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`#${hash}`)}`;
          return (
            <Text
              key={token.key}
              style={{ color: '#1976D2', textDecorationLine: 'underline' }}
              onPress={() => openExternal(searchUrl)}
            >
              {token.content}
            </Text>
          );
        }
        return <Text key={token.key}>{token.content}</Text>;
      })}
    </Text>
  );
};

export default ClickableTextWithLinks;
