import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

let WebView: any = null;
try {
  WebView = require('react-native-webview').default;
} catch {
  WebView = null;
}

type Props = {
  uri: string;
  height?: number;
};

/**
 * In-feed PDF preview (similar footprint to image posts).
 * Uses an embedded viewer when WebView is available; falls back to open-in-browser.
 */
const FeedPdfCard: React.FC<Props> = ({ uri, height = 440 }) => {
  const [loading, setLoading] = useState(true);
  const viewerUri = useMemo(() => {
    const enc = encodeURIComponent(uri);
    return `https://docs.google.com/gviewer?embedded=true&url=${enc}`;
  }, [uri]);

  if (!uri) return null;

  if (!WebView) {
    return (
      <Pressable
        onPress={() => Linking.openURL(uri).catch(() => {})}
        style={[styles.fallback, { minHeight: height }]}
      >
        <Text style={styles.fallbackTitle}>PDF</Text>
        <Text style={styles.fallbackHint}>Tap to open</Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.wrap, { height }]}>
      <WebView
        source={{ uri: viewerUri }}
        style={styles.web}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => setLoading(false)}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        mixedContentMode="always"
        setSupportMultipleWindows={false}
        allowsInlineMediaPlayback
      />
      {loading ? (
        <View style={styles.loader} pointerEvents="none">
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loaderText}>Loading preview…</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    backgroundColor: '#0b1220',
    borderRadius: 12,
    overflow: 'hidden',
  },
  web: { flex: 1, backgroundColor: '#0b1220' },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 15, 28, 0.42)',
    zIndex: 2,
  },
  loaderText: {
    marginTop: 10,
    color: 'rgba(226,232,240,0.9)',
    fontSize: 13,
    fontWeight: '600',
  },
  fallback: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fallbackTitle: {
    color: '#f87171',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  fallbackHint: {
    marginTop: 8,
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FeedPdfCard;
