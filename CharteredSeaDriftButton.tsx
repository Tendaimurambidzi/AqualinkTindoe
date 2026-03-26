import React, { useCallback, useMemo, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import {
  createPremiumShowWithTokens,
  endPremiumShow,
  findReusablePremiumShowForCurrentHost,
  listMyPremiumAccess,
  listPremiumTokens,
  redeemPremiumCode,
  startPremiumShow,
  type PremiumTokenRecord,
} from './src/services/premiumService';

type AccessMode = 'paid-only';
type MinutesOption = 30 | 60 | 120;

type Props = {
  onStartPaidDrift?: (cfg: {
    title: string;
    ticketNumber: string;
    priceUSD: number;
    durationMins: MinutesOption;
    access: AccessMode;
    startLive: () => void;
    premiumShowId: string;
  }) => void;
  onJoinPremiumShow?: (cfg: {
    liveId: string;
    premiumShowId: string;
    title: string;
    channel?: string | null;
    hostName?: string | null;
  }) => void;
  onEndPaidDrift?: () => void;
  onViewPasses?: () => void;
  onToggleChat?: (enabled: boolean) => void;
  onViewEarnings?: () => void;
  onSharePromo?: (cfg: { title: string; priceUSD: number; premiumShowId: string }) => void;
  buttonStyle?: StyleProp<ViewStyle>;
  buttonTextStyle?: StyleProp<TextStyle>;
  hitSlop?: { top?: number; left?: number; bottom?: number; right?: number };
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const minutesOptions: MinutesOption[] = [30, 60, 120];

export default function CharteredSeaDriftButton(props: Props) {
  const {
    onStartPaidDrift,
    onJoinPremiumShow,
    onEndPaidDrift,
    onViewPasses,
    onToggleChat,
    onViewEarnings,
    onSharePromo,
    buttonStyle,
    buttonTextStyle,
    hitSlop,
  } = props;

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'host' | 'redeem'>('host');
  const [title, setTitle] = useState('Aqua Premium Show');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('1.00');
  const [ticketNumber, setTicketNumber] = useState('AQUA001');
  const [tokenCount, setTokenCount] = useState<string>('');
  const [category, setCategory] = useState<string>('General');
  const [access] = useState<AccessMode>('paid-only');
  const [duration, setDuration] = useState<MinutesOption>(60);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [activeShowId, setActiveShowId] = useState<string | null>(null);
  const [generatedTokens, setGeneratedTokens] = useState<PremiumTokenRecord[]>([]);
  const [redeemCode, setRedeemCode] = useState('');
  const [myAccess, setMyAccess] = useState<
    Array<{
      showId: string;
      showTitle: string;
      hostUid: string;
      status: string;
      validUntilMs: number;
      ticketId: string;
    }>
  >([]);
  const [busy, setBusy] = useState(false);

  const categories = [
    'General',
    'Music',
    'Gaming',
    'Education',
    'Business',
    'Entertainment',
    'Sports',
    'Technology',
    'Art',
    'Other',
  ];

  const priceNumber = useMemo(() => {
    const n = Number(price.replace(',', '.'));
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [price]);

  const loadMyAccess = useCallback(async () => {
    try {
      const rows = await listMyPremiumAccess();
      setMyAccess(rows);
    } catch {
      setMyAccess([]);
    }
  }, []);

  const resolvePremiumLiveRoom = useCallback(async (showId: string) => {
    const snap = await firestore()
      .collection('live')
      .where('premiumShowId', '==', showId)
      .limit(6)
      .get();
    const rows = (snap?.docs || []).map(doc => {
      const data = doc.data() || {};
      return {
        liveId: doc.id,
        status: String(data.status || '').toLowerCase(),
        title: String(data.title || data.liveTitle || 'Aqua Premium Show'),
        channel: data.channel ? String(data.channel) : data.liveChannel ? String(data.liveChannel) : null,
        hostName: data.hostName ? String(data.hostName) : null,
      };
    });
    return (
      rows.find(item => item.status === 'live') ||
      rows.find(item => item.status !== 'ended' && item.status !== 'cancelled') ||
      null
    );
  }, []);

  const validateConfig = useCallback(() => {
    if (!title.trim()) {
      Alert.alert('Title Required', 'Please enter a title for your Aqua Premium show.');
      return false;
    }
    if (!ticketNumber.trim()) {
      Alert.alert('Ticket Label Required', 'Please enter a ticket label such as AQUA001.');
      return false;
    }
    if (priceNumber <= 0) {
      Alert.alert('Invalid Price', 'Price must be greater than $0.');
      return false;
    }
    const tokens = parseInt(tokenCount, 10);
    if (!tokens || tokens < 1) {
      Alert.alert('Invalid Token Count', 'Please enter how many tokens to generate.');
      return false;
    }
    return true;
  }, [priceNumber, ticketNumber, title, tokenCount]);

  const ensureShowAndTokens = useCallback(async () => {
    if (!validateConfig()) return null;
    if (activeShowId) {
      if (generatedTokens.length === 0) {
        const existing = await listPremiumTokens(activeShowId);
        setGeneratedTokens(existing);
      }
      return {
        showId: activeShowId,
        tokens: generatedTokens,
      };
    }
    const created = await createPremiumShowWithTokens({
      title,
      description,
      priceUSD: priceNumber,
      durationMins: duration,
      capacity: parseInt(tokenCount, 10),
      tokenCount: parseInt(tokenCount, 10),
      category,
    });
    setActiveShowId(created.show.id);
    setGeneratedTokens(created.tokens);
    return {
      showId: created.show.id,
      tokens: created.tokens,
    };
  }, [
    activeShowId,
    category,
    description,
    duration,
    generatedTokens,
    priceNumber,
    title,
    tokenCount,
    validateConfig,
  ]);

  const handleGenerateTokens = useCallback(async () => {
    try {
      setBusy(true);
      const result = await ensureShowAndTokens();
      if (!result) return;
      Alert.alert(
        'Tokens Generated',
        `${result.tokens.length || parseInt(tokenCount, 10)} Tokens Generated.`,
      );
    } catch (error: any) {
      Alert.alert('Token generation failed', String(error?.message || 'Try again.'));
    } finally {
      setBusy(false);
    }
  }, [ensureShowAndTokens, tokenCount]);

  const handleStart = useCallback(async () => {
    try {
      setBusy(true);
      const result = await ensureShowAndTokens();
      if (!result?.showId) return;
      await startPremiumShow(result.showId);
      onStartPaidDrift?.({
        title: title.trim(),
        priceUSD: priceNumber,
        durationMins: duration,
        access,
        startLive: () => {},
        ticketNumber: ticketNumber.trim(),
        premiumShowId: result.showId,
      });
      setOpen(false);
    } catch (error: any) {
      Alert.alert('Could not start Aqua Premium', String(error?.message || 'Try again.'));
    } finally {
      setBusy(false);
    }
  }, [
    access,
    duration,
    ensureShowAndTokens,
    onStartPaidDrift,
    priceNumber,
    ticketNumber,
    title,
  ]);

  const handleEnd = useCallback(async () => {
    try {
      setBusy(true);
      if (activeShowId) {
        await endPremiumShow(activeShowId);
      }
      onEndPaidDrift?.();
      Alert.alert('Aqua Premium ended', 'The premium show has been closed.');
      setOpen(false);
    } catch (error: any) {
      Alert.alert('Could not end Aqua Premium', String(error?.message || 'Try again.'));
    } finally {
      setBusy(false);
    }
  }, [activeShowId, onEndPaidDrift]);

  const handleRedeem = useCallback(async () => {
    try {
      setBusy(true);
      const result = await redeemPremiumCode(redeemCode);
      setRedeemCode('');
      await loadMyAccess();
      const liveRoom = await resolvePremiumLiveRoom(result.showId);
      if (liveRoom && onJoinPremiumShow) {
        onJoinPremiumShow({
          liveId: liveRoom.liveId,
          premiumShowId: result.showId,
          title: liveRoom.title || result.showTitle,
          channel: liveRoom.channel,
          hostName: liveRoom.hostName,
        });
        setOpen(false);
        return;
      }
      Alert.alert(
        'Access granted',
        `${result.showTitle} is now unlocked. Tap Join Aqua Premium Show when the host opens the camera.`,
      );
    } catch (error: any) {
      Alert.alert('Redeem failed', String(error?.message || 'Try another token.'));
    } finally {
      setBusy(false);
    }
  }, [loadMyAccess, onJoinPremiumShow, redeemCode, resolvePremiumLiveRoom]);

  const handleJoinPremiumShow = useCallback(
    async (item: { showId: string; showTitle: string }) => {
      try {
        setBusy(true);
        const liveRoom = await resolvePremiumLiveRoom(item.showId);
        if (!liveRoom) {
          Alert.alert(
            'Show not live yet',
            'Your access is active. The Join Aqua Premium Show button will work once the host starts the premium camera.',
          );
          return;
        }
        if (!onJoinPremiumShow) {
          Alert.alert('Join unavailable', 'This build is missing the Aqua Premium join callback.');
          return;
        }
        onJoinPremiumShow({
          liveId: liveRoom.liveId,
          premiumShowId: item.showId,
          title: liveRoom.title || item.showTitle || 'Aqua Premium Show',
          channel: liveRoom.channel,
          hostName: liveRoom.hostName,
        });
        setOpen(false);
      } catch (error: any) {
        Alert.alert('Could not join Aqua Premium', String(error?.message || 'Try again.'));
      } finally {
        setBusy(false);
      }
    },
    [onJoinPremiumShow, resolvePremiumLiveRoom],
  );

  const handleShareToken = useCallback(
    async (token: PremiumTokenRecord) => {
      try {
        await Share.share({
          title: `Aqua Premium token for ${title.trim()}`,
          message: `Aqua Premium access code for "${title.trim()}": ${token.code}`,
        });
      } catch {}
    },
    [title],
  );

  const handleSharePromo = useCallback(async () => {
    if (!activeShowId) {
      Alert.alert('Generate tokens first', 'Create the Aqua Premium show and tokens before sharing.');
      return;
    }
    onSharePromo?.({
      title: title.trim(),
      priceUSD: priceNumber,
      premiumShowId: activeShowId,
    });
    try {
      await Share.share({
        title: `Join ${title.trim()}`,
        message:
          `Aqua Premium: "${title.trim()}"\n` +
          `${description ? `${description}\n` : ''}` +
          `Price: $${priceNumber.toFixed(2)}\n` +
          `Use the access token I send you in the Aqua Premium screen.`,
      });
    } catch {}
  }, [activeShowId, description, onSharePromo, priceNumber, title]);

  const handleToggleChat = useCallback(() => {
    const next = !chatEnabled;
    setChatEnabled(next);
    onToggleChat?.(next);
  }, [chatEnabled, onToggleChat]);

  const handleOpen = useCallback(() => {
    setOpen(true);
    void loadMyAccess();
    void (async () => {
      try {
        const reusable = await findReusablePremiumShowForCurrentHost();
        if (!reusable) return;
        const reusableDuration = Math.max(
          30,
          Number(Math.round((reusable.show.endsAtMs - reusable.show.startsAtMs) / 60000)) || 60,
        );
        const nearestDuration =
          minutesOptions.find(option => option >= reusableDuration) || minutesOptions[minutesOptions.length - 1];
        setActiveShowId(reusable.show.id);
        setGeneratedTokens(reusable.tokens);
        setTitle(reusable.show.title || 'Aqua Premium Show');
        setDescription(reusable.show.description || '');
        setDuration(nearestDuration);
        setTokenCount(String(reusable.tokens.length || reusable.show.capacity || ''));
      } catch {}
    })();
  }, [loadMyAccess]);

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.logbookAction,
          buttonStyle,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleOpen}
        hitSlop={hitSlop || { top: 200, left: 200, bottom: 200, right: 200 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: 'red' }} />
          <Text style={[styles.logbookActionText, buttonTextStyle]}>Aqua Premium</Text>
          <Text style={[styles.logbookActionText, buttonTextStyle]}>🎟️</Text>
        </View>
      </Pressable>

      <Modal visible={open} animationType="fade" transparent onRequestClose={() => setOpen(false)}>
        <View style={[styles.modalRoot, { justifyContent: 'center', padding: 24 }]}>
          <View
            style={[
              styles.logbookContainer,
              {
                maxHeight: SCREEN_HEIGHT * 0.88,
                borderRadius: 16,
                overflow: 'hidden',
              },
            ]}
          >
            <View style={styles.logbookPage}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Aqua Premium</Text>
                <Pressable onPress={() => setOpen(false)} style={styles.closeBtn}>
                  <Text style={styles.closeText}>Close</Text>
                </Pressable>
              </View>

              <View style={styles.modeRow}>
                {[
                  { key: 'host', label: 'Host Show' },
                  { key: 'redeem', label: 'Enter Code' },
                ].map(item => (
                  <Pressable
                    key={item.key}
                    onPress={() => setMode(item.key as 'host' | 'redeem')}
                    style={[
                      styles.modeChip,
                      item.key === 'host' ? styles.hostModeChip : styles.redeemModeChip,
                      mode === item.key &&
                        (item.key === 'host' ? styles.hostModeChipActive : styles.redeemModeChipActive),
                    ]}
                  >
                    <Text
                      style={
                        item.key === 'host'
                          ? styles.hostModeChipText
                          : styles.redeemModeChipText
                      }
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {mode === 'host' ? (
                  <>
                    <Text style={styles.sectionLabel}>Host Setup</Text>
                    <Text style={styles.inputLabel}>Show Title *</Text>
                    <TextInput
                      value={title}
                      onChangeText={setTitle}
                      placeholder="Give your show a title"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      style={styles.input}
                    />

                    <Text style={styles.inputLabel}>Description</Text>
                    <TextInput
                      value={description}
                      onChangeText={setDescription}
                      placeholder="Describe the premium show"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      style={[styles.input, styles.textArea]}
                      multiline
                      numberOfLines={3}
                    />

                    <Text style={styles.inputLabel}>Ticket Label *</Text>
                    <TextInput
                      value={ticketNumber}
                      onChangeText={setTicketNumber}
                      placeholder="e.g. AQUA001"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      style={styles.input}
                      autoCapitalize="characters"
                    />

                    <Text style={styles.inputLabel}>Price (USD) *</Text>
                    <TextInput
                      value={price}
                      onChangeText={setPrice}
                      keyboardType={Platform.select({ ios: 'decimal-pad', android: 'decimal-pad' })}
                      placeholder="1.00"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      style={styles.input}
                    />

                    <Text style={styles.inputLabel}>How Many Tokens *</Text>
                    <TextInput
                      value={tokenCount}
                      onChangeText={setTokenCount}
                      keyboardType="number-pad"
                      placeholder="Enter token count"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      style={styles.input}
                    />

                    <Text style={styles.inputLabel}>Category</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.rowWrap}>
                        {categories.map(cat => (
                          <Pressable
                            key={cat}
                            onPress={() => setCategory(cat)}
                            style={[styles.pill, category === cat && styles.pillActive]}
                          >
                            <Text style={category === cat ? styles.pillTxtActive : styles.pillTxt}>
                              {cat}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </ScrollView>

                    <Text style={styles.inputLabel}>Duration</Text>
                    <View style={styles.rowWrap}>
                      {minutesOptions.map(m => (
                        <Pressable
                          key={m}
                          onPress={() => setDuration(m)}
                          style={[styles.pill, duration === m && styles.pillActive]}
                        >
                          <Text style={duration === m ? styles.pillTxtActive : styles.pillTxt}>
                            {m} min
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <View style={styles.actionStack}>
                      <Pressable onPress={handleGenerateTokens} style={styles.hostSecondaryAction} disabled={busy}>
                        <Text numberOfLines={1} style={styles.hostSecondaryActionText}>Generate Tokens</Text>
                      </Pressable>
                      <Pressable onPress={handleStart} style={styles.hostPrimaryAction} disabled={busy}>
                        <Text numberOfLines={1} style={styles.hostPrimaryActionText}>Start Aqua Premium Show</Text>
                      </Pressable>
                    </View>

                    {busy ? <ActivityIndicator color="#8D0000" style={{ marginTop: 10 }} /> : null}

                    {activeShowId ? (
                      <Text style={styles.infoText}>Show ID: {activeShowId}</Text>
                    ) : null}

                    {generatedTokens.length > 0 ? (
                      <>
                        <Text style={[styles.sectionLabel, { marginTop: 14 }]}>Generated Tokens</Text>
                        {generatedTokens.map(token => (
                          <View key={token.ticketId} style={styles.tokenRow}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.tokenCode}>{token.code}</Text>
                              <Text style={styles.tokenMeta}>
                                {token.status === 'claimed'
                                  ? `Claimed by ${token.claimedByUid || 'viewer'}`
                                  : 'Ready to send'}
                              </Text>
                            </View>
                            <Pressable onPress={() => handleShareToken(token)} style={styles.tokenSendBtn}>
                              <Text style={styles.tokenSendText}>Send</Text>
                            </Pressable>
                          </View>
                        ))}
                      </>
                    ) : null}

                    <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Controls</Text>
                    <View style={styles.grid}>
                      <LineButton icon="🎟" text="View Passes" onPress={onViewPasses} />
                      <LineButton
                        icon={chatEnabled ? '💬' : '🔇'}
                        text={chatEnabled ? 'Chat On' : 'Chat Off'}
                        onPress={handleToggleChat}
                      />
                      <LineButton icon="🪙" text="View Earnings" onPress={onViewEarnings} />
                      <LineButton icon="📣" text="Share Promo" onPress={handleSharePromo} />
                      <LineButton icon="🛑" text="End Show" onPress={handleEnd} />
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.sectionLabel}>Redeem Aqua Premium Access</Text>
                    <Text style={styles.helperText}>
                      Enter the token the host sent you. Access is linked to your account for the show period.
                    </Text>
                    <TextInput
                      value={redeemCode}
                      onChangeText={setRedeemCode}
                      placeholder="ABCD-EFGH"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      style={styles.input}
                      autoCapitalize="characters"
                    />
                    <Pressable onPress={handleRedeem} style={styles.redeemPrimaryAction} disabled={busy}>
                      <Text style={styles.redeemPrimaryActionText}>Enter Code</Text>
                    </Pressable>
                    {busy ? <ActivityIndicator color="#00C2FF" style={{ marginTop: 10 }} /> : null}
                    <Text style={[styles.sectionLabel, { marginTop: 18 }]}>My Premium Access</Text>
                    {myAccess.length === 0 ? (
                      <Text style={styles.helperText}>No active Aqua Premium access yet.</Text>
                    ) : (
                      myAccess.map(item => (
                        <View key={`${item.showId}_${item.ticketId}`} style={styles.accessCard}>
                          <Text style={styles.accessTitle}>{item.showTitle}</Text>
                          <Text style={styles.accessMeta}>Status: {item.status}</Text>
                          <Text style={styles.accessMeta}>
                            Valid until:{' '}
                            {item.validUntilMs ? new Date(item.validUntilMs).toLocaleString() : 'Unknown'}
                          </Text>
                          <Pressable
                            onPress={() => handleJoinPremiumShow(item)}
                            style={styles.joinPremiumAction}
                            disabled={busy}
                          >
                            <Text style={styles.joinPremiumActionText}>Join Aqua Premium Show</Text>
                          </Pressable>
                        </View>
                      ))
                    )}
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function LineButton({
  icon,
  text,
  onPress,
  style,
}: {
  icon: string;
  text: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.logbookAction,
        styles.lineButton,
        pressed && styles.buttonPressed,
        style,
      ]}
    >
      <Text style={styles.lineButtonIcon}>{icon}</Text>
      <Text style={[styles.logbookActionText, styles.lineButtonText]}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  logbookContainer: {
    width: '100%',
    backgroundColor: 'rgba(11,18,36,0.98)',
  },
  logbookPage: {
    padding: 16,
    paddingTop: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  closeBtn: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#8D0000',
    borderWidth: 1,
    borderColor: '#8D0000',
  },
  closeText: { color: '#FFFFFF', fontWeight: '900' },
  content: {
    paddingBottom: 32,
    gap: 12,
  },
  logbookAction: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  logbookActionText: {
    color: 'rgba(220,220,240,0.9)',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  buttonPressed: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  modeChip: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 10,
    alignItems: 'center',
  },
  hostModeChip: {
    borderColor: '#8D0000',
    backgroundColor: '#8D0000',
  },
  redeemModeChip: {
    borderColor: '#0EA5D9',
    backgroundColor: '#0EA5D9',
  },
  modeChipActive: {
    borderColor: '#00C2FF',
    backgroundColor: 'rgba(0,194,255,0.12)',
  },
  hostModeChipActive: {
    borderColor: '#8D0000',
    backgroundColor: '#8D0000',
  },
  redeemModeChipActive: {
    borderColor: '#00C2FF',
    backgroundColor: 'rgba(0,194,255,0.12)',
  },
  modeChipText: {
    color: '#C9D3DF',
    fontWeight: '700',
  },
  hostModeChipText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  redeemModeChipText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  modeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  sectionLabel: { color: '#B30000', fontSize: 12, marginBottom: 4, fontWeight: '800' },
  helperText: { color: 'rgba(255,255,255,0.68)', fontSize: 12, lineHeight: 18 },
  inputLabel: { color: '#B30000', fontSize: 13, marginTop: 14, marginBottom: 4, fontWeight: '900' },
  input: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.35)',
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    paddingVertical: 8,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  pillActive: {
    borderColor: '#8D0000',
    backgroundColor: '#8D0000',
  },
  pillTxt: { color: '#C9D3DF', fontSize: 12, fontWeight: '600' },
  pillTxtActive: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  actionStack: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: '#006FBD',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#006FBD',
  },
  primaryActionText: { color: '#FFFFFF', fontWeight: '800' },
  secondaryAction: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  secondaryActionText: { color: '#FFFFFF', fontWeight: '700' },
  hostSecondaryAction: {
    flex: 1,
    backgroundColor: '#0EA5D9',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0EA5D9',
  },
  hostSecondaryActionText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
    textAlign: 'center',
  },
  hostPrimaryAction: {
    flex: 1,
    backgroundColor: '#8D0000',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8D0000',
  },
  hostPrimaryActionText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
    textAlign: 'center',
  },
  redeemPrimaryAction: {
    marginTop: 8,
    backgroundColor: '#0EA5D9',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0EA5D9',
  },
  redeemPrimaryActionText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  infoText: {
    color: 'rgba(157,230,255,0.82)',
    fontSize: 11,
    marginTop: 8,
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  tokenCode: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tokenMeta: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 11,
    marginTop: 3,
  },
  tokenSendBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,194,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,194,255,0.34)',
  },
  tokenSendText: {
    color: '#CFF6FF',
    fontWeight: '800',
    fontSize: 12,
  },
  accessCard: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  accessTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  accessMeta: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 12,
    marginTop: 4,
  },
  joinPremiumAction: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#8D0000',
    marginTop: 12,
  },
  joinPremiumActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  grid: {
    gap: 10,
  },
  lineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 0,
  },
  lineButtonIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  lineButtonText: {
    textTransform: 'none',
  },
});
