import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';
import type { Asset } from 'react-native-image-picker';

let RNVideo: any = null;
try {
  RNVideo = require('react-native-video').default;
} catch {}

export type StickerPoint = {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
};

export type MediaEdits = {
  filter: 'none' | 'warm' | 'cool' | 'mono' | 'vivid';
  brightness: number;
  mirror: boolean;
  stickers: StickerPoint[];
};

export const defaultMediaEdits: MediaEdits = {
  filter: 'none',
  brightness: 0,
  mirror: false,
  stickers: [],
};

type CropMedia = {
  path?: string;
  mime?: string;
  size?: number;
  width?: number;
  height?: number;
  duration?: number;
  filename?: string;
};

type Props = {
  visible: boolean;
  initialMedia: Asset | null;
  initialEdits?: MediaEdits;
  onApply: (media: Asset, edits: MediaEdits) => void;
  onClose: () => void;
};

const isImage = (m: CropMedia | Asset | null | undefined) =>
  !!m &&
  String((m as any).mime || (m as any).type || '')
    .toLowerCase()
    .startsWith('image/');

const isVideo = (m: CropMedia | Asset | null | undefined) =>
  !!m &&
  String((m as any).mime || (m as any).type || '')
    .toLowerCase()
    .startsWith('video/');

const toAsset = (m: CropMedia): Asset => ({
  uri: String(m.path || ''),
  type: m.mime || undefined,
  fileName: m.filename || (m.path ? String(m.path).split('/').pop() : undefined),
  fileSize: typeof m.size === 'number' ? m.size : undefined,
  width: typeof m.width === 'number' ? m.width : undefined,
  height: typeof m.height === 'number' ? m.height : undefined,
  duration:
    typeof m.duration === 'number' && Number.isFinite(m.duration)
      ? Math.round(m.duration)
      : undefined,
});

const FILTERS: MediaEdits['filter'][] = ['none', 'warm', 'cool', 'mono', 'vivid'];
const FUNNY_EMOJIS = ['🤡', '🥸', '😎', '🐵', '👽', '🦄', '🐸', '👺', '🤪', '🐙'];

const filterOverlayStyle = (filter: MediaEdits['filter']) => {
  switch (filter) {
    case 'warm':
      return { backgroundColor: 'rgba(255,155,84,0.20)' };
    case 'cool':
      return { backgroundColor: 'rgba(90,170,255,0.18)' };
    case 'mono':
      return { backgroundColor: 'rgba(0,0,0,0.30)' };
    case 'vivid':
      return { backgroundColor: 'rgba(255,0,120,0.10)' };
    default:
      return null;
  }
};

const MediaEditor: React.FC<Props> = ({
  visible,
  initialMedia,
  initialEdits = defaultMediaEdits,
  onApply,
  onClose,
}) => {
  const [media, setMedia] = useState<Asset | null>(initialMedia);
  const [busy, setBusy] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>('🤡');
  const [edits, setEdits] = useState<MediaEdits>(initialEdits);

  useEffect(() => {
    if (visible) {
      setMedia(initialMedia);
      setEdits(initialEdits || defaultMediaEdits);
    }
  }, [visible, initialMedia, initialEdits]);

  const canCrop = useMemo(() => isImage(media), [media]);
  const canRotate = useMemo(() => isImage(media), [media]);
  const canApply = !!media?.uri;

  const pickMedia = async () => {
    try {
      setBusy(true);
      const result = (await ImageCropPicker.openPicker({
        mediaType: 'any',
      })) as CropMedia;
      if (result?.path) {
        setMedia(toAsset(result));
        setEdits(defaultMediaEdits);
      }
    } catch (err: any) {
      if (err?.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Media Error', err?.message || 'Could not pick media.');
      }
    } finally {
      setBusy(false);
    }
  };

  const cropPreset = async (preset: 'square' | 'story' | 'free') => {
    if (!media?.uri || !canCrop) return;
    try {
      setBusy(true);
      const width = preset === 'story' ? 1080 : preset === 'square' ? 1080 : media.width || 1200;
      const height = preset === 'story' ? 1920 : preset === 'square' ? 1080 : media.height || 1200;
      const cropped = (await ImageCropPicker.openCropper({
        path: media.uri,
        width,
        height,
        cropping: true,
        freeStyleCropEnabled: preset === 'free',
        compressImageQuality: 0.95,
      })) as CropMedia;
      if (cropped?.path) setMedia(toAsset(cropped));
    } catch (err: any) {
      if (err?.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Crop Error', err?.message || 'Could not crop media.');
      }
    } finally {
      setBusy(false);
    }
  };

  const rotateMedia = async () => {
    if (!media?.uri || !canRotate) return;
    try {
      setBusy(true);
      const rotated = (await ImageCropPicker.openCropper({
        path: media.uri,
        width: media.width || 1080,
        height: media.height || 1080,
        cropping: true,
        freeStyleCropEnabled: true,
        enableRotationGesture: true,
        compressImageQuality: 0.95,
      })) as CropMedia;
      if (rotated?.path) setMedia(toAsset(rotated));
    } catch (err: any) {
      if (err?.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Rotate Error', err?.message || 'Could not rotate media.');
      }
    } finally {
      setBusy(false);
    }
  };

  const addStickerAt = (xRatio: number, yRatio: number) => {
    setEdits(prev => ({
      ...prev,
      stickers: [
        ...prev.stickers,
        {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          emoji: selectedEmoji,
          x: Math.max(0, Math.min(1, xRatio)),
          y: Math.max(0, Math.min(1, yRatio)),
          size: 34,
        },
      ],
    }));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Media Editor</Text>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.toolRow}>
              <Pressable style={styles.chip} onPress={pickMedia} disabled={busy}>
                <Text style={styles.chipText}>Pick</Text>
              </Pressable>
              <Pressable
                style={[styles.chip, !canCrop && styles.disabled]}
                onPress={() => cropPreset('square')}
                disabled={!canCrop || busy}
              >
                <Text style={styles.chipText}>1:1</Text>
              </Pressable>
              <Pressable
                style={[styles.chip, !canCrop && styles.disabled]}
                onPress={() => cropPreset('story')}
                disabled={!canCrop || busy}
              >
                <Text style={styles.chipText}>9:16</Text>
              </Pressable>
              <Pressable
                style={[styles.chip, !canCrop && styles.disabled]}
                onPress={() => cropPreset('free')}
                disabled={!canCrop || busy}
              >
                <Text style={styles.chipText}>Free Crop</Text>
              </Pressable>
              <Pressable
                style={[styles.chip, !canRotate && styles.disabled]}
                onPress={rotateMedia}
                disabled={!canRotate || busy}
              >
                <Text style={styles.chipText}>Rotate</Text>
              </Pressable>
            </View>

            <View style={styles.toolRow}>
              <Pressable
                style={styles.chip}
                onPress={() =>
                  setEdits(prev => ({
                    ...prev,
                    mirror: !prev.mirror,
                  }))
                }
              >
                <Text style={styles.chipText}>Mirror</Text>
              </Pressable>
              <Pressable
                style={styles.chip}
                onPress={() =>
                  setEdits(prev => ({
                    ...prev,
                    filter: FILTERS[(FILTERS.indexOf(prev.filter) + 1) % FILTERS.length],
                  }))
                }
              >
                <Text style={styles.chipText}>Filter: {edits.filter}</Text>
              </Pressable>
              <Pressable
                style={styles.chip}
                onPress={() => setEdits(prev => ({ ...prev, brightness: Math.max(-40, prev.brightness - 10) }))}
              >
                <Text style={styles.chipText}>-Light</Text>
              </Pressable>
              <Pressable
                style={styles.chip}
                onPress={() => setEdits(prev => ({ ...prev, brightness: Math.min(40, prev.brightness + 10) }))}
              >
                <Text style={styles.chipText}>+Light</Text>
              </Pressable>
              <Pressable
                style={styles.chip}
                onPress={() => setEdits(prev => ({ ...prev, brightness: 0 }))}
              >
                <Text style={styles.chipText}>Reset Light</Text>
              </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiRow}>
              {FUNNY_EMOJIS.map(emoji => (
                <Pressable
                  key={emoji}
                  style={[styles.emojiBtn, selectedEmoji === emoji && styles.emojiSelected]}
                  onPress={() => setSelectedEmoji(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={styles.toolRow}>
              <Pressable
                style={styles.chip}
                onPress={() =>
                  addStickerAt(Math.random() * 0.8 + 0.1, Math.random() * 0.8 + 0.1)
                }
              >
                <Text style={styles.chipText}>Random Funny</Text>
              </Pressable>
              <Pressable
                style={[styles.chip, edits.stickers.length === 0 && styles.disabled]}
                onPress={() =>
                  setEdits(prev => ({
                    ...prev,
                    stickers: prev.stickers.slice(0, -1),
                  }))
                }
              >
                <Text style={styles.chipText}>Undo Sticker</Text>
              </Pressable>
              <Pressable
                style={[styles.chip, edits.stickers.length === 0 && styles.disabled]}
                onPress={() => setEdits(prev => ({ ...prev, stickers: [] }))}
              >
                <Text style={styles.chipText}>Clear Stickers</Text>
              </Pressable>
              <Pressable style={styles.chip} onPress={() => setEdits(defaultMediaEdits)}>
                <Text style={styles.chipText}>Reset All</Text>
              </Pressable>
            </View>

            {media?.uri ? (
              <Pressable
                style={styles.previewWrap}
                onPress={e => {
                  const { locationX, locationY } = e.nativeEvent;
                  addStickerAt(locationX / 320, locationY / 320);
                }}
              >
                <View style={{ flex: 1, transform: [{ scaleX: edits.mirror ? -1 : 1 }] }}>
                  {isImage(media) ? (
                    <Image source={{ uri: media.uri }} style={styles.preview} resizeMode="contain" />
                  ) : isVideo(media) && RNVideo ? (
                    <RNVideo
                      source={{ uri: String(media.uri) }}
                      style={styles.preview}
                      controls
                      paused
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.hint}>Preview unavailable for this format.</Text>
                  )}
                </View>

                {filterOverlayStyle(edits.filter) ? (
                  <View style={[StyleSheet.absoluteFillObject, filterOverlayStyle(edits.filter)!]} pointerEvents="none" />
                ) : null}
                {edits.brightness !== 0 ? (
                  <View
                    style={[
                      StyleSheet.absoluteFillObject,
                      {
                        backgroundColor:
                          edits.brightness > 0
                            ? `rgba(255,255,255,${Math.min(0.4, edits.brightness / 100)})`
                            : `rgba(0,0,0,${Math.min(0.45, Math.abs(edits.brightness) / 90)})`,
                      },
                    ]}
                    pointerEvents="none"
                  />
                ) : null}
                {edits.stickers.map(s => (
                  <Text
                    key={s.id}
                    style={{
                      position: 'absolute',
                      left: `${s.x * 100}%`,
                      top: `${s.y * 100}%`,
                      fontSize: s.size,
                      transform: [{ translateX: -s.size / 2 }, { translateY: -s.size / 2 }],
                    }}
                    pointerEvents="none"
                  >
                    {s.emoji}
                  </Text>
                ))}
              </Pressable>
            ) : (
              <Text style={styles.hint}>Select a photo or video first.</Text>
            )}
            <Text style={styles.hint}>Tap the preview to drop funny stickers on faces.</Text>
            {busy ? <ActivityIndicator color="#00C2FF" style={{ marginTop: 8 }} /> : null}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={[styles.footerBtn, styles.cancel]} onPress={onClose} disabled={busy}>
              <Text style={styles.footerText}>Close</Text>
            </Pressable>
            <Pressable
              style={[styles.footerBtn, !canApply && styles.disabled]}
              onPress={() => {
                if (!media) return;
                onApply(media, edits);
                onClose();
              }}
              disabled={!canApply || busy}
            >
              <Text style={styles.footerText}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.70)',
    justifyContent: 'center',
    padding: 10,
  },
  sheet: {
    backgroundColor: '#091722',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    maxHeight: '92%',
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
  },
  content: {
    padding: 10,
    paddingBottom: 14,
  },
  toolRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 8,
  },
  chip: {
    backgroundColor: '#00B4EA',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  chipText: {
    color: '#032534',
    fontSize: 11,
    fontWeight: '700',
  },
  emojiRow: {
    marginTop: 8,
  },
  emojiBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#123447',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  emojiSelected: {
    borderWidth: 2,
    borderColor: '#00B4EA',
  },
  emojiText: {
    fontSize: 18,
  },
  previewWrap: {
    width: 320,
    height: 320,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#05101a',
    alignSelf: 'center',
    marginTop: 10,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  hint: {
    color: 'rgba(255,255,255,0.82)',
    marginTop: 7,
    textAlign: 'center',
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.16)',
  },
  footerBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    backgroundColor: '#00B4EA',
    alignItems: 'center',
  },
  cancel: {
    backgroundColor: '#6a7f95',
  },
  footerText: {
    color: '#032534',
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.45,
  },
});

export default MediaEditor;

