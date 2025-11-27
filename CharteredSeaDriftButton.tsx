import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  StyleProp,
  TextStyle,
  ViewStyle,
  Share,
  Dimensions,
} from 'react-native';
import {
  startCharteredDrift,
  endCharteredDrift,
  getCharteredDriftPasses,
  toggleCharteredDriftChat,
  getCharteredDriftEarnings,
  shareCharteredDriftPromo,
} from './src/services/driftService';

type AccessMode = 'paid-only';
type MinutesOption = 30 | 60 | 120;

type Props = {
  // Optional callbacks you can wire later into your logic
  onStartPaidDrift?: (cfg: {
    title: string;
    ticketNumber: string;
    priceUSD: number;
    durationMins: MinutesOption;
    access: AccessMode;
    startLive: () => void;
  }) => void;
  onEndPaidDrift?: () => void;
  onViewPasses?: () => void;
  onToggleChat?: (enabled: boolean) => void;
  onViewEarnings?: () => void;
  onSharePromo?: (cfg: { title: string; priceUSD: number }) => void;
  buttonStyle?: StyleProp<ViewStyle>;
  buttonTextStyle?: StyleProp<TextStyle>;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');


const minutesOptions: MinutesOption[] = [30, 60, 120];

export default function CharteredSeaDriftButton(props: Props) {
  const {
    onStartPaidDrift,
    onEndPaidDrift,
    onViewPasses,
    onToggleChat,
    onViewEarnings,
    onSharePromo,
    buttonStyle,
    buttonTextStyle,
  } = props;

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('Chartered Sea Drift');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('1.00'); // USD
  const [ticketNumber, setTicketNumber] = useState('');
  const [maxAttendees, setMaxAttendees] = useState<string>('50');
  const [category, setCategory] = useState<string>('General');
  const [access] = useState<AccessMode>('paid-only');
  const [duration, setDuration] = useState<MinutesOption>(60);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [showLive, setShowLive] = useState(false);
  const [activeDriftId, setActiveDriftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const categories = ['General', 'Music', 'Gaming', 'Education', 'Business', 'Entertainment', 'Sports', 'Technology', 'Art', 'Other'];
  
  const priceNumber = useMemo(() => {
    const n = Number(price.replace(',', '.'));
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [price]);
  const shouldRegisterCharteredDrift = useMemo(() => {
    try {
      const cfg: any = require('./liveConfig');
      return !!cfg?.ENABLE_CHARTERED_BACKEND;
    } catch {
      return false;
    }
  }, []);

  function validateConfig() {
    // Validate all required fields
    if (!title.trim()) {
      Alert.alert('Title Required', 'Please enter a title for your chartered drift.');
      return false;
    }
    if (!ticketNumber.trim()) {
      Alert.alert('Ticket Number Required', 'Please enter a unique ticket number (e.g., DRIFT001).');
      return false;
    }
    if (priceNumber <= 0) {
      Alert.alert('Invalid Price', 'Price must be greater than $0.');
      return false;
    }
    const maxNum = parseInt(maxAttendees);
    if (!maxNum || maxNum < 1) {
      Alert.alert('Invalid Max Attendees', 'Please enter a valid number of maximum attendees.');
      return false;
    }
    return true;
  }

  const handleStart = useCallback(() => {
    if (!validateConfig()) {
      return;
    }
    
    // Start camera preview immediately
    onStartPaidDrift?.({
      title: title.trim(),
      priceUSD: priceNumber,
      durationMins: duration,
      access,
      startLive: () => setShowLive(true),
      ticketNumber: ticketNumber.trim(),
    });
    
    setOpen(false);
    setShowLive(true);
    
    if (!shouldRegisterCharteredDrift) {
      return;
    }

    // Optional: Try to register with backend (silent fail if network unavailable)
    // This is completely optional and won't affect the drift functionality
    try {
      startCharteredDrift({
        title: title.trim(),
        ticketNumber: ticketNumber.trim(),
        priceUSD: priceNumber,
        durationMins: duration,
        access,
        hostUid: '123',
        hostName: 'Host',
      }).then((result) => {
        setActiveDriftId(result.driftId);
        console.log('Chartered drift registered:', result.driftId);
      }).catch(() => {
        // Silent fail - backend unavailable, but drift works fine
      });
    } catch {
      // Silent fail - backend unavailable, but drift works fine
    }
  }, [validateConfig, onStartPaidDrift, title, priceNumber, duration, access, ticketNumber, shouldRegisterCharteredDrift]);

  function handleEnd() {
    onEndPaidDrift?.();
    setOpen(false);
    
    // End drift in background if we have an active ID
    if (activeDriftId) {
      endCharteredDrift(activeDriftId)
        .then((result) => {
          console.log('Drift ended. Earnings:', result.earnings);
          setActiveDriftId(null);
        })
        .catch((error) => {
          console.error('Failed to end chartered drift:', error);
        });
    }
  }

  function handleSaveSettings() {
    if (!validateConfig()) return;
    Alert.alert('Saved ✅', 'Charter settings updated. Starting drift...');
    handleStart();
  }

  async function handleSharePromo() {
    if (!validateConfig()) return;
    
    onSharePromo?.({ title: title.trim(), priceUSD: priceNumber });
    
    // Enhanced share message with all details
    const message = `🎟 Join my Chartered Sea Drift: "${title.trim()}"!\n\n` +
      `${description ? `📝 ${description}\n\n` : ''}` +
      `💰 Tickets: $${priceNumber.toFixed(2)}\n` +
      `🎫 Ticket #${ticketNumber}\n` +
      `⏱ Duration: ${duration} minutes\n` +
      `👥 Max Attendees: ${maxAttendees}\n` +
      `📂 Category: ${category}\n\n` +
      `🌊 Premium drift experience - Don't miss out!`;
    
    try {
      await Share.share({
        message,
        title: `Join ${title.trim()}`,
      });
    } catch (shareError) {
      console.log('Share cancelled or failed:', shareError);
    }
  }

  function handleToggleChat() {
    const next = !chatEnabled;
    setChatEnabled(next);
    onToggleChat?.(next);
    
    // Update backend in background if drift is active
    if (activeDriftId) {
      toggleCharteredDriftChat(activeDriftId, next).catch((error) => {
        console.error('Failed to toggle chat:', error);
      });
    }
  }

  function handleViewPasses() {
    onViewPasses?.();
    Alert.alert('Pass Holders', 'This feature will show ticket holders for your chartered drift.\n\nIntegrate with your ticketing system to view pass holders.');
  }

  function handleViewEarnings() {
    onViewEarnings?.();
    Alert.alert('Earnings', `Drift: ${title}\n\nThis feature will show your earnings from ticket sales.\n\nIntegrate with your payment provider to track earnings.`);
  }

  return (
    <>
      {/* MAIN BUTTON you can place inside your MAKE WAVES actions */}
      <Pressable
        style={({ pressed }) => [
          styles.logbookAction,
          buttonStyle,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => setOpen(true)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: 'red' }} />
            <Text style={[styles.logbookActionText, buttonTextStyle]}>CHARTERED SEA DRIFT</Text>
        </View>
      </Pressable>

      {/* MODAL */}
      <Modal visible={open} animationType="fade" transparent onRequestClose={() => setOpen(false)}>
        <View style={[styles.modalRoot, { justifyContent: 'center', padding: 24 }]}>
          <View
            style={[
              styles.logbookContainer,
              {
                maxHeight: SCREEN_HEIGHT * 0.85,
                borderRadius: 16,
                overflow: 'hidden',
              },
            ]}
          >
            <View style={styles.logbookPage}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Chartered Sea Drift</Text>
                <Pressable onPress={() => setOpen(false)} style={styles.closeBtn}>
                  <Text style={styles.closeText}>Close</Text>
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* SETTINGS */}
                <Text style={styles.sectionLabel}>Charter Details</Text>

                <Text style={styles.inputLabel}>Title *</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Give your drift a title"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  style={styles.input}
                />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe what viewers can expect..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={3}
                />

                <Text style={styles.inputLabel}>Ticket Number *</Text>
                <TextInput
                  value={ticketNumber}
                  onChangeText={setTicketNumber}
                  placeholder="e.g. DRIFT001, SEAS2024"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  style={styles.input}
                  autoCapitalize="characters"
                />

                <Text style={styles.inputLabel}>Price (USD) *</Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  keyboardType={Platform.select({ ios: 'decimal-pad', android: 'decimal-pad' })}
                  placeholder="e.g. 1.00"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  style={styles.input}
                />

                <Text style={styles.inputLabel}>Max Attendees *</Text>
                <TextInput
                  value={maxAttendees}
                  onChangeText={setMaxAttendees}
                  keyboardType="number-pad"
                  placeholder="e.g. 50"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  style={styles.input}
                />

                <Text style={styles.inputLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                  <View style={styles.rowWrap}>
                    {categories.map((cat) => (
                      <Pressable
                        key={cat}
                        onPress={() => setCategory(cat)}
                        style={[
                          styles.pill,
                          category === cat && styles.pillActive,
                        ]}
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
                {minutesOptions.map((m) => (
                  <Pressable
                    key={m}
                    onPress={() => setDuration(m)}
                    style={[
                      styles.pill,
                      duration === m && styles.pillActive,
                    ]}
                  >
                    <Text style={duration === m ? styles.pillTxtActive : styles.pillTxt}>
                      {m} min
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.inputLabel}>Access</Text>
              <View style={styles.rowWrap}>
                <View style={[styles.pill, styles.pillActive]}>
                  <Text style={styles.pillTxtActive}>
                    Paid Only 🎟
                  </Text>
                </View>
              </View>

              <Pressable onPress={handleSaveSettings} style={styles.saveBtn}>
                <Text style={styles.saveBtnTxt}>Start Chartered Drift</Text>
              </Pressable>

              {/* SUB-BUTTONS */}
              <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Controls</Text>

              <View style={styles.grid}>
                <LineButton
                  icon="🎟"
                  text="View Passes"
                  onPress={handleViewPasses}
                />
                <LineButton
                  icon={chatEnabled ? '💬' : '🔇'}
                  text={chatEnabled ? 'Chat On' : 'Chat Off'}
                  onPress={handleToggleChat}
                />
                <LineButton
                  icon="🪙"
                  text="View Earnings"
                  onPress={handleViewEarnings}
                />
                <LineButton
                  icon="📣"
                  text="Promo Drift"
                  onPress={handleSharePromo}
                />
              </View>
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
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  closeText: { color: 'white', fontWeight: '700' },
  content: {
    padding: 16,
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
  sectionLabel: { color: '#A6B4C6', fontSize: 12, marginBottom: 4 },
  inputLabel: { color: '#E6EDF5', fontSize: 13, marginTop: 16, marginBottom: 4 },
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
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  pillTxt: { color: '#C9D3DF', fontSize: 12, fontWeight: '600' },
  pillTxtActive: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  saveBtn: {
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  saveBtnTxt: { color: '#FFFFFF', fontWeight: '800' },
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

