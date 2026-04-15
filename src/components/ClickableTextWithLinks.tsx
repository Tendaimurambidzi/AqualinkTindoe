import React, { useMemo } from 'react';
import { Text, Linking, Alert } from 'react-native';

type TokenType = 'text' | 'url' | 'hashtag';
type Token = { type: TokenType; content: string; key: string };

const TOKEN_REGEX = /((?:https?:\/\/|www\.)[^\s]+|#[A-Za-z0-9_]+)/g;

const stripTrailingPunctuation = (value: string) =>
  String(value || '').replace(/[),.;!?]+$/, '');

const normalizeUrl = (value: string) => {
  const cleaned = stripTrailingPunctuation(value);
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  if (/^www\./i.test(cleaned)) return `https://${cleaned}`;
  return cleaned;
};

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
  /** When set, hashtags open in-app (e.g. Hunt) instead of a web search. */
  onHashtagPress?: (tagWithoutHash: string) => void;
}

const ClickableTextWithLinks: React.FC<ClickableTextWithLinksProps> = ({
  text,
  style,
  numberOfLines,
  onHashtagPress,
}) => {
  const tokens = useMemo(() => tokenize(text), [text]);

  const copyText = (value: string) => {
    const trimmed = String(value || '').trim();
    if (!trimmed) return;
    try {
      const clipboardModule = require('@react-native-clipboard/clipboard');
      const setString =
        clipboardModule?.default?.setString || clipboardModule?.setString;
      if (typeof setString === 'function') {
        setString(trimmed);
      }
    } catch {}
    Alert.alert('Copied', trimmed);
  };

  const openExternal = async (url: string) => {
    try {
      const targetUrl = normalizeUrl(url);
      const supported = await Linking.canOpenURL(targetUrl);
      if (supported) {
        await Linking.openURL(targetUrl);
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
              onLongPress={() => {
                const targetUrl = normalizeUrl(token.content);
                Alert.alert('Link options', targetUrl, [
                  { text: 'Open', onPress: () => void openExternal(targetUrl) },
                  { text: 'Copy', onPress: () => copyText(targetUrl) },
                  { text: 'Cancel', style: 'cancel' },
                ]);
              }}
            >
              {stripTrailingPunctuation(token.content)}
            </Text>
          );
        }
        if (token.type === 'hashtag') {
          const hash = token.content.replace(/^#/, '');
          return (
            <Text
              key={token.key}
              style={{ color: '#1976D2', textDecorationLine: 'underline' }}
              onPress={() => {
                if (onHashtagPress) {
                  onHashtagPress(hash);
                  return;
                }
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`#${hash}`)}`;
                void openExternal(searchUrl);
              }}
              onLongPress={() => copyText(token.content)}
            >
              {token.content}
            </Text>
          );
        }
        return (
          <Text
            key={token.key}
            onLongPress={() => {
              if (String(token.content || '').trim()) {
                copyText(token.content);
              }
            }}
          >
            {token.content}
          </Text>
        );
      })}
    </Text>
  );
};

export default ClickableTextWithLinks;
