import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Switch, ScrollView, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ParentSafeHarborProps {
  userId: string;
  userAge?: number;
  onSettingsChange?: (settings: SafetySettings) => void;
}

export interface SafetySettings {
  shallowWatersMode: boolean; // Kids under 13 mode
  lifeguardAlertsEnabled: boolean; // AI content moderation
  buddySystemEnabled: boolean; // Parent monitoring
  noCurrentZone: boolean; // Disable DMs
  ageVerified: boolean;
  restrictedContentHidden: boolean;
}

const ParentSafeHarbor: React.FC<ParentSafeHarborProps> = ({ userId, userAge, onSettingsChange }) => {
  const [settings, setSettings] = useState<SafetySettings>({
    shallowWatersMode: userAge ? userAge < 13 : false,
    lifeguardAlertsEnabled: true,
    buddySystemEnabled: userAge ? userAge < 18 : false,
    noCurrentZone: userAge ? userAge < 13 : false,
    ageVerified: false,
    restrictedContentHidden: true,
  });

  const [showSettings, setShowSettings] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSettings();
  }, [userId]);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: showSettings ? 1 : 0,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [showSettings]);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(`safe_harbor_${userId}`);
      if (stored) {
        const loadedSettings = JSON.parse(stored);
        setSettings(loadedSettings);
        onSettingsChange?.(loadedSettings);
      }
    } catch (error) {
      console.error('Error loading safety settings:', error);
    }
  };

  const updateSetting = async <K extends keyof SafetySettings>(
    key: K,
    value: SafetySettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await AsyncStorage.setItem(`safe_harbor_${userId}`, JSON.stringify(newSettings));
      onSettingsChange?.(newSettings);
    } catch (error) {
      console.error('Error saving safety settings:', error);
    }
  };

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
  });

  return (
    <View style={styles.container}>
      {/* Toggle Button */}
      <Pressable
        style={styles.toggleButton}
        onPress={() => setShowSettings(!showSettings)}
      >
        <Text style={styles.toggleIcon}>🛡️</Text>
      </Pressable>

      {/* Settings Panel */}
      <Animated.View
        style={[
          styles.settingsPanel,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>🛡️ Safe Harbor</Text>
          <Pressable onPress={() => setShowSettings(false)}>
            <Text style={styles.closeButton}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.settingsList}>
          {/* Shallow Waters Mode */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>🏖️ Shallow Waters Mode</Text>
              <Text style={styles.settingDesc}>
                Age-appropriate content for users under 13
              </Text>
            </View>
            <Switch
              value={settings.shallowWatersMode}
              onValueChange={(v) => updateSetting('shallowWatersMode', v)}
              trackColor={{ false: '#444', true: '#00C2FF' }}
              thumbColor={settings.shallowWatersMode ? '#00FFD1' : '#888'}
            />
          </View>

          {/* Lifeguard Alerts */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>👁️ Lifeguard Alerts</Text>
              <Text style={styles.settingDesc}>
                AI monitors content for safety
              </Text>
            </View>
            <Switch
              value={settings.lifeguardAlertsEnabled}
              onValueChange={(v) => updateSetting('lifeguardAlertsEnabled', v)}
              trackColor={{ false: '#444', true: '#00C2FF' }}
              thumbColor={settings.lifeguardAlertsEnabled ? '#00FFD1' : '#888'}
            />
          </View>

          {/* Buddy System */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>👨‍👩‍👧 Buddy System</Text>
              <Text style={styles.settingDesc}>
                Parent/guardian can monitor activity
              </Text>
            </View>
            <Switch
              value={settings.buddySystemEnabled}
              onValueChange={(v) => updateSetting('buddySystemEnabled', v)}
              trackColor={{ false: '#444', true: '#00C2FF' }}
              thumbColor={settings.buddySystemEnabled ? '#00FFD1' : '#888'}
            />
          </View>

          {/* No Current Zone */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>🚫 No Current Zone</Text>
              <Text style={styles.settingDesc}>
                Disable all direct messages
              </Text>
            </View>
            <Switch
              value={settings.noCurrentZone}
              onValueChange={(v) => updateSetting('noCurrentZone', v)}
              trackColor={{ false: '#444', true: '#00C2FF' }}
              thumbColor={settings.noCurrentZone ? '#00FFD1' : '#888'}
            />
          </View>

          {/* Hide Restricted Content */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>🔒 Hide Restricted Content</Text>
              <Text style={styles.settingDesc}>
                Filter mature or sensitive content
              </Text>
            </View>
            <Switch
              value={settings.restrictedContentHidden}
              onValueChange={(v) => updateSetting('restrictedContentHidden', v)}
              trackColor={{ false: '#444', true: '#00C2FF' }}
              thumbColor={settings.restrictedContentHidden ? '#00FFD1' : '#888'}
            />
          </View>

          {/* Safety Info */}
          <View style={styles.safetyInfo}>
            <Text style={styles.safetyTitle}>🌊 Safety Tips</Text>
            <Text style={styles.safetyText}>
              • Never share personal information{'\n'}
              • Report inappropriate content{'\n'}
              • Block users who make you uncomfortable{'\n'}
              • Talk to a trusted adult if you need help
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

export const shouldFilterContent = (settings: SafetySettings, contentFlags?: string[]): boolean => {
  if (!settings.restrictedContentHidden) return false;
  if (!contentFlags || contentFlags.length === 0) return false;
  
  const restrictedFlags = ['mature', 'sensitive', 'violence', 'adult'];
  return contentFlags.some(flag => restrictedFlags.includes(flag.toLowerCase()));
};

export const canSendDirectMessage = (settings: SafetySettings): boolean => {
  return !settings.noCurrentZone;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 160,
    right: 0,
    zIndex: 500,
  },
  toggleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
    marginRight: 16,
  },
  toggleIcon: {
    fontSize: 24,
  },
  settingsPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 320,
    height: 600,
    backgroundColor: 'rgba(10, 25, 41, 0.98)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
    padding: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: -4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    color: 'white',
    fontSize: 24,
    paddingHorizontal: 8,
  },
  settingsList: {
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  settingDesc: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  safetyInfo: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  safetyTitle: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  safetyText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    lineHeight: 20,
  },
});

export default ParentSafeHarbor;
