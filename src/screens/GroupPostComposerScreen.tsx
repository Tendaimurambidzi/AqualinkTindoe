import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { uploadNewGroupWaveMedia } from '../services/privateGroupsService';

type RouteParams = { groupId: string; name?: string };

const GroupPostComposerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { groupId } = (route.params || {}) as RouteParams;
  const [caption, setCaption] = useState('');
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pickMedia = useCallback(async () => {
    const res = await launchImageLibrary({
      mediaType: 'mixed',
      selectionLimit: 1,
    });
    const a = res.assets?.[0];
    if (!a?.uri) {
      return;
    }
    setLocalUri(a.uri);
    setMimeType(a.type || null);
  }, []);

  const publish = useCallback(async () => {
    if (!groupId) {
      Alert.alert('Error', 'Missing group.');
      return;
    }
    if (!localUri) {
      Alert.alert('Media required', 'Choose a photo or video for this post.');
      return;
    }
    setBusy(true);
    try {
      const u = auth().currentUser;
      await uploadNewGroupWaveMedia({
        groupId,
        localUri,
        mimeType,
        caption: caption.trim(),
        authorName: u?.displayName || null,
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Upload failed', String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }, [groupId, localUri, mimeType, caption, navigation]);

  if (!groupId) {
    return (
      <View style={styles.root}>
        <Text style={styles.err}>Missing group.</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>Cancel</Text>
        </Pressable>
        <Text style={styles.title}>Group post</Text>
        <View style={{ width: 56 }} />
      </View>
      <Text style={styles.note}>This post stays in the group only.</Text>

      <Pressable style={styles.pickBtn} onPress={() => void pickMedia()}>
        <Text style={styles.pickBtnText}>
          {localUri ? 'Change photo / video' : 'Choose photo or video'}
        </Text>
      </Pressable>

      <TextInput
        value={caption}
        onChangeText={setCaption}
        placeholder="Caption (optional)"
        placeholderTextColor="rgba(255,255,255,0.45)"
        multiline
        style={styles.input}
      />

      <Pressable
        style={[styles.publish, busy && { opacity: 0.6 }]}
        disabled={busy}
        onPress={() => void publish()}
      >
        {busy ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.publishText}>Publish to group</Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#061426', padding: 16, paddingTop: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  back: { color: '#7DD3FC', fontSize: 16, fontWeight: '600' },
  title: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  note: { color: 'rgba(255,255,255,0.65)', marginBottom: 16, fontSize: 13 },
  pickBtn: {
    borderWidth: 1,
    borderColor: 'rgba(125,211,252,0.45)',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: 'rgba(14,165,233,0.15)',
  },
  pickBtnText: { color: '#E0F2FE', fontWeight: '700' },
  input: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(125,211,252,0.35)',
    borderRadius: 10,
    padding: 12,
    color: '#FFF',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  publish: {
    backgroundColor: '#0EA5E9',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  publishText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  err: { color: '#FCA5A5' },
});

export default GroupPostComposerScreen;
