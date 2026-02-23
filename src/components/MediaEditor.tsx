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
  rotation?: number;
};

export type MediaEdits = {
  filter: 'none' | 'warm' | 'cool' | 'mono' | 'vivid';
  brightness: number;
  contrast?: number;
  vignette?: number;
  mirror: boolean;
  flipVertical?: boolean;
  playbackRate?: number;
  volumeBoost?: number;
  voiceMode?: 'normal' | 'chipmunk' | 'deep' | 'robot';
  stickers: StickerPoint[];
};

export const defaultMediaEdits: MediaEdits = {
  filter: 'none',
  brightness: 0,
  contrast: 0,
  vignette: 0,
  mirror: false,
  flipVertical: false,
  playbackRate: 1,
  volumeBoost: 1,
  voiceMode: 'normal',
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
const FUNNY_EMOJIS = ['\u{1F921}', '\u{1F978}', '\u{1F60E}', '\u{1F435}', '\u{1F47D}', '\u{1F984}', '\u{1F438}', '\u{1F47A}', '\u{1F92A}', '\u{1F419}', '\u{1F916}', '\u{1F47B}'];
const VOICE_PRESETS: Array<{ id: NonNullable<MediaEdits['voiceMode']>; label: string; rate: number; volume: number }> = [
  { id: 'normal', label: 'Voice: Normal', rate: 1, volume: 1 },
  { id: 'chipmunk', label: 'Voice: Chipmunk', rate: 1.3, volume: 1 },
  { id: 'deep', label: 'Voice: Deep', rate: 0.82, volume: 1.15 },
  { id: 'robot', label: 'Voice: Robot', rate: 1.08, volume: 1.3 },
];

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
  const [selectedEmoji, setSelectedEmoji] = useState<string>('\u{1F921}');
  const [stickerSize, setStickerSize] = useState<number>(52);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [edits, setEdits] = useState<MediaEdits>(initialEdits);

  useEffect(() => {
    if (visible) {
      setMedia(initialMedia);
      setEdits(initialEdits || defaultMediaEdits);
      setSelectedStickerId(null);
      setStickerSize(52);
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
        mediaType: 'photo',
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
        mediaType: 'photo',
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
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setEdits(prev => ({
      ...prev,
      stickers: [
        ...prev.stickers,
        {
          id,
          emoji: selectedEmoji,
          x: Math.max(0, Math.min(1, xRatio)),
          y: Math.max(0, Math.min(1, yRatio)),
          size: stickerSize,
          rotation: 0,
        },
      ],
    }));
    setSelectedStickerId(id);
  };

  const updateSelectedSticker = (updater: (s: StickerPoint) => StickerPoint) => {
    setEdits(prev => {
      if (!selectedStickerId) return prev;
      return {
        ...prev,
        stickers: prev.stickers.map(s => (s.id === selectedStickerId ? updater(s) : s)),
      };
    });
  };

  const nudgeSelectedSticker = (dx: number, dy: number) => {
    updateSelectedSticker(s => ({
      ...s,
      x: Math.max(0, Math.min(1, s.x + dx)),
      y: Math.max(0, Math.min(1, s.y + dy)),
    }));
  };

  const changeSelectedRotation = (delta: number) => {
    updateSelectedSticker(s => ({
      ...s,
      rotation: ((s.rotation || 0) + delta) % 360,
    }));
  };

  const applyStickerSize = (next: number) => {
    const clamped = Math.max(32, Math.min(120, next));
    setStickerSize(clamped);
    updateSelectedSticker(s => ({ ...s, size: clamped }));
  };

  const duplicateSelectedSticker = () => {
    setEdits(prev => {
      if (!selectedStickerId) return prev;
      const target = prev.stickers.find(s => s.id === selectedStickerId);
      if (!target) return prev;
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const dup: StickerPoint = {
        ...target,
        id,
        x: Math.max(0.05, Math.min(0.95, target.x + 0.07)),
        y: Math.max(0.05, Math.min(0.95, target.y + 0.07)),
      };
      setSelectedStickerId(id);
      return { ...prev, stickers: [...prev.stickers, dup] };
    });
  };

  const removeSelectedSticker = () => {
    if (!selectedStickerId) return;
    setEdits(prev => ({
      ...prev,
      stickers: prev.stickers.filter(s => s.id !== selectedStickerId),
    }));
    setSelectedStickerId(null);
  };

  const addFacePack = () => {
    const baseSize = Math.max(42, stickerSize);
    const points: Array<{ x: number; y: number; emoji: string; size: number }> = [
      { x: 0.38, y: 0.38, emoji: selectedEmoji, size: baseSize },
      { x: 0.62, y: 0.38, emoji: selectedEmoji, size: baseSize },
      { x: 0.5, y: 0.6, emoji: '\u{1F92A}', size: Math.round(baseSize * 1.15) },
    ];
    setEdits(prev => ({
      ...prev,
      stickers: [
        ...prev.stickers,
        ...points.map(p => ({
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          x: p.x,
          y: p.y,
          emoji: p.emoji,
          size: p.size,
          rotation: 0,
        })),
      ],
    }));
  };

  const cycleVoice = () => {
    setEdits(prev => {
      const current = prev.voiceMode || 'normal';
      const index = Math.max(0, VOICE_PRESETS.findIndex(v => v.id === current));
      const next = VOICE_PRESETS[(index + 1) % VOICE_PRESETS.length];
      return {
        ...prev,
        voiceMode: next.id,
        playbackRate: next.rate,
        volumeBoost: next.volume,
      };
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Media Editor</Text>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Frame</Text>
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
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Look</Text>
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
                      flipVertical: !prev.flipVertical,
                    }))
                  }
                >
                  <Text style={styles.chipText}>Flip Y</Text>
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
                  onPress={() =>
                    setEdits(prev => ({ ...prev, brightness: Math.max(-40, prev.brightness - 10) }))
                  }
                >
                  <Text style={styles.chipText}>-Light</Text>
                </Pressable>
                <Pressable
                  style={styles.chip}
                  onPress={() =>
                    setEdits(prev => ({ ...prev, brightness: Math.min(40, prev.brightness + 10) }))
                  }
                >
                  <Text style={styles.chipText}>+Light</Text>
                </Pressable>
                <Pressable
                  style={styles.chip}
                  onPress={() => setEdits(prev => ({ ...prev, brightness: 0 }))}
                >
                  <Text style={styles.chipText}>Reset Light</Text>
                </Pressable>
                <Pressable
                  style={styles.chip}
                  onPress={() =>
                    setEdits(prev => ({ ...prev, contrast: Math.max(-40, Number(prev.contrast || 0) - 10) }))
                  }
                >
                  <Text style={styles.chipText}>-Contrast</Text>
                </Pressable>
                <Pressable
                  style={styles.chip}
                  onPress={() =>
                    setEdits(prev => ({ ...prev, contrast: Math.min(40, Number(prev.contrast || 0) + 10) }))
                  }
                >
                  <Text style={styles.chipText}>+Contrast</Text>
                </Pressable>
                <Pressable
                  style={styles.chip}
                  onPress={() =>
                    setEdits(prev => ({ ...prev, vignette: Math.max(0, Number(prev.vignette || 0) - 10) }))
                  }
                >
                  <Text style={styles.chipText}>-Vignette</Text>
                </Pressable>
                <Pressable
                  style={styles.chip}
                  onPress={() =>
                    setEdits(prev => ({ ...prev, vignette: Math.min(60, Number(prev.vignette || 0) + 10) }))
                  }
                >
                  <Text style={styles.chipText}>+Vignette</Text>
                </Pressable>
                <Pressable
                  style={styles.chip}
                  onPress={() =>
                    setEdits(prev => ({
                      ...prev,
                      playbackRate: Math.max(0.5, Number((Number(prev.playbackRate || 1) - 0.1).toFixed(2))),
                    }))
                  }
                >
                  <Text style={styles.chipText}>Speed -</Text>
                </Pressable>
                <Pressable
                  style={styles.chip}
                  onPress={() =>
                    setEdits(prev => ({
                      ...prev,
                      playbackRate: Math.min(2, Number((Number(prev.playbackRate || 1) + 0.1).toFixed(2))),
                    }))
                  }
                >
                  <Text style={styles.chipText}>Speed +</Text>
                </Pressable>
                <Pressable
                  style={styles.chip}
                  onPress={() =>
                    setEdits(prev => ({
                      ...prev,
                      volumeBoost: Math.max(0, Number((Number(prev.volumeBoost || 1) - 0.1).toFixed(2))),
                    }))
                  }
                >
                  <Text style={styles.chipText}>Vol -</Text>
                </Pressable>
                <Pressable
                  style={styles.chip}
                  onPress={() =>
                    setEdits(prev => ({
                      ...prev,
                      volumeBoost: Math.min(2, Number((Number(prev.volumeBoost || 1) + 0.1).toFixed(2))),
                    }))
                  }
                >
                  <Text style={styles.chipText}>Vol +</Text>
                </Pressable>
                <Pressable style={styles.chip} onPress={cycleVoice}>
                  <Text style={styles.chipText}>Voice FX</Text>
                </Pressable>
              </View>
              <Text style={styles.hint}>
                Speed {Number(edits.playbackRate || 1).toFixed(2)}x | Volume {Number(edits.volumeBoost || 1).toFixed(2)}x | {VOICE_PRESETS.find(v => v.id === (edits.voiceMode || 'normal'))?.label || 'Voice: Normal'}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Funny Face Studio</Text>
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
                  onPress={() => addStickerAt(Math.random() * 0.8 + 0.1, Math.random() * 0.8 + 0.1)}
                >
                  <Text style={styles.chipText}>Random Funny</Text>
                </Pressable>
                <Pressable style={styles.chip} onPress={addFacePack}>
                  <Text style={styles.chipText}>Face Pack</Text>
                </Pressable>
                <Pressable style={styles.chip} onPress={() => applyStickerSize(stickerSize - 6)}>
                  <Text style={styles.chipText}>Sticker -</Text>
                </Pressable>
                <Pressable style={styles.chip} onPress={() => applyStickerSize(stickerSize + 6)}>
                  <Text style={styles.chipText}>Sticker +</Text>
                </Pressable>
                <Pressable
                  style={[styles.chip, !selectedStickerId && styles.disabled]}
                  onPress={duplicateSelectedSticker}
                  disabled={!selectedStickerId}
                >
                  <Text style={styles.chipText}>Duplicate</Text>
                </Pressable>
                <Pressable
                  style={[styles.chip, !selectedStickerId && styles.disabled]}
                  onPress={removeSelectedSticker}
                  disabled={!selectedStickerId}
                >
                  <Text style={styles.chipText}>Remove</Text>
                </Pressable>
                <Pressable
                  style={[styles.chip, !selectedStickerId && styles.disabled]}
                  onPress={() => changeSelectedRotation(-15)}
                  disabled={!selectedStickerId}
                >
                  <Text style={styles.chipText}>Rotate -</Text>
                </Pressable>
                <Pressable
                  style={[styles.chip, !selectedStickerId && styles.disabled]}
                  onPress={() => changeSelectedRotation(15)}
                  disabled={!selectedStickerId}
                >
                  <Text style={styles.chipText}>Rotate +</Text>
                </Pressable>
                <Pressable
                  style={[styles.chip, !selectedStickerId && styles.disabled]}
                  onPress={() => nudgeSelectedSticker(0, -0.02)}
                  disabled={!selectedStickerId}
                >
                  <Text style={styles.chipText}>Move Up</Text>
                </Pressable>
                <Pressable
                  style={[styles.chip, !selectedStickerId && styles.disabled]}
                  onPress={() => nudgeSelectedSticker(0, 0.02)}
                  disabled={!selectedStickerId}
                >
                  <Text style={styles.chipText}>Move Down</Text>
                </Pressable>
                <Pressable
                  style={[styles.chip, !selectedStickerId && styles.disabled]}
                  onPress={() => nudgeSelectedSticker(-0.02, 0)}
                  disabled={!selectedStickerId}
                >
                  <Text style={styles.chipText}>Move Left</Text>
                </Pressable>
                <Pressable
                  style={[styles.chip, !selectedStickerId && styles.disabled]}
                  onPress={() => nudgeSelectedSticker(0.02, 0)}
                  disabled={!selectedStickerId}
                >
                  <Text style={styles.chipText}>Move Right</Text>
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
                  onPress={() => {
                    setEdits(prev => ({ ...prev, stickers: [] }));
                    setSelectedStickerId(null);
                  }}
                >
                  <Text style={styles.chipText}>Clear Stickers</Text>
                </Pressable>
                <Pressable
                  style={styles.chip}
                  onPress={() => {
                    setEdits(defaultMediaEdits);
                    setSelectedStickerId(null);
                    setStickerSize(52);
                  }}
                >
                  <Text style={styles.chipText}>Reset All</Text>
                </Pressable>
              </View>
            </View>

            {media?.uri ? (
              <Pressable
                style={styles.previewWrap}
                onPress={e => {
                  const { locationX, locationY } = e.nativeEvent;
                  addStickerAt(locationX / 320, locationY / 320);
                }}
              >
                <View
                  style={{
                    flex: 1,
                    transform: [
                      { scaleX: edits.mirror ? -1 : 1 },
                      { scaleY: edits.flipVertical ? -1 : 1 },
                    ],
                  }}
                >
                  {isImage(media) ? (
                    <Image source={{ uri: media.uri }} style={styles.preview} resizeMode="contain" />
                  ) : isVideo(media) && RNVideo ? (
                    <RNVideo
                      source={{ uri: String(media.uri) }}
                      style={styles.preview}
                      controls
                      paused
                      rate={Math.max(0.5, Math.min(2, Number(edits.playbackRate || 1)))}
                      volume={Math.max(0, Math.min(2, Number(edits.volumeBoost || 1)))}
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
                {Number(edits.contrast || 0) !== 0 ? (
                  <View
                    style={[
                      StyleSheet.absoluteFillObject,
                      {
                        backgroundColor:
                          Number(edits.contrast) > 0
                            ? `rgba(255,255,255,${Math.min(0.22, Number(edits.contrast) / 260)})`
                            : `rgba(0,0,0,${Math.min(0.28, Math.abs(Number(edits.contrast)) / 220)})`,
                      },
                    ]}
                    pointerEvents="none"
                  />
                ) : null}
                {Number(edits.vignette || 0) > 0 ? (
                  <View
                    style={[
                      StyleSheet.absoluteFillObject,
                      {
                        backgroundColor: `rgba(0,0,0,${Math.min(0.34, Number(edits.vignette) / 180)})`,
                      },
                    ]}
                    pointerEvents="none"
                  />
                ) : null}
                {edits.stickers.map(s => (
                  <Text
                    key={s.id}
                    onPress={() => {
                      setSelectedStickerId(s.id);
                      setStickerSize(s.size || 52);
                    }}
                    style={{
                      position: 'absolute',
                      left: `${s.x * 100}%`,
                      top: `${s.y * 100}%`,
                      fontSize: s.size,
                      transform: [
                        { translateX: -s.size / 2 },
                        { translateY: -s.size / 2 },
                        { rotate: `${s.rotation || 0}deg` },
                      ],
                      borderWidth: selectedStickerId === s.id ? 1 : 0,
                      borderColor: '#8be9ff',
                      borderRadius: 6,
                    }}
                  >
                    {s.emoji}
                  </Text>
                ))}
              </Pressable>
            ) : (
              <Text style={styles.hint}>Select a photo or video first.</Text>
            )}
            <Text style={styles.hint}>
              Tap preview to place stickers. Tap a sticker to edit size, move, rotate, or duplicate.
            </Text>
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
  section: {
    marginTop: 9,
    backgroundColor: 'rgba(10,43,61,0.35)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139,233,255,0.18)',
    padding: 9,
  },
  sectionTitle: {
    color: '#8be9ff',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
    fontWeight: '700',
  },
  toolRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  chip: {
    backgroundColor: '#00B4EA',
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  chipText: {
    color: '#032534',
    fontSize: 10,
    fontWeight: '700',
  },
  emojiRow: {
    marginTop: 6,
  },
  emojiBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#123447',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  emojiSelected: {
    borderWidth: 2,
    borderColor: '#00B4EA',
  },
  emojiText: {
    fontSize: 24,
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
