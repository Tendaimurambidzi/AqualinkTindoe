import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import {
  createPrivateGroup,
  joinPrivateGroupWithInvite,
  PrivateGroupRow,
  subscribeMyPrivateGroupSummaries,
} from '../services/privateGroupsService';

const GroupsHubScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const uid = auth().currentUser?.uid || null;
  const [rows, setRows] = useState<PrivateGroupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createName, setCreateName] = useState('');
  const [joinId, setJoinId] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    const unsub = subscribeMyPrivateGroupSummaries(
      uid,
      next => {
        setRows(next);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, [uid]);

  const onCreate = useCallback(async () => {
    const name = createName.trim();
    if (!name) {
      Alert.alert('Name required', 'Enter a group name.');
      return;
    }
    setBusy(true);
    try {
      const { groupId, inviteCode } = await createPrivateGroup(name);
      setCreateName('');
      Alert.alert(
        'Group created',
        `Share this invite code with members:\n${inviteCode}\n\nGroup id:\n${groupId}`,
        [
          {
            text: 'Open group',
            onPress: () =>
              navigation.navigate('GroupDetail', {
                groupId,
                name,
              }),
          },
          { text: 'OK' },
        ],
      );
    } catch (e: any) {
      Alert.alert('Could not create', String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }, [createName, navigation]);

  const onJoin = useCallback(async () => {
    setBusy(true);
    try {
      await joinPrivateGroupWithInvite(joinId, joinCode);
      setJoinId('');
      setJoinCode('');
      Alert.alert('Joined', 'You are now a member of this group.');
    } catch (e: any) {
      Alert.alert('Could not join', String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }, [joinId, joinCode]);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Private groups</Text>
        <View style={{ width: 64 }} />
      </View>

      <Text style={styles.hint}>
        Posts in a group stay in that group only — they are not added to the
        public feed.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create group</Text>
        <TextInput
          value={createName}
          onChangeText={setCreateName}
          placeholder="Group name"
          placeholderTextColor="rgba(255,255,255,0.45)"
          style={styles.input}
        />
        <Pressable
          style={[styles.primaryBtn, busy && styles.btnDisabled]}
          onPress={() => void onCreate()}
          disabled={busy}
        >
          <Text style={styles.primaryBtnText}>Create</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Join with invite</Text>
        <TextInput
          value={joinId}
          onChangeText={setJoinId}
          placeholder="Group id"
          placeholderTextColor="rgba(255,255,255,0.45)"
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput
          value={joinCode}
          onChangeText={t => setJoinCode(t.toUpperCase())}
          placeholder="Invite code"
          placeholderTextColor="rgba(255,255,255,0.45)"
          autoCapitalize="characters"
          style={styles.input}
        />
        <Pressable
          style={[styles.secondaryBtn, busy && styles.btnDisabled]}
          onPress={() => void onJoin()}
          disabled={busy}
        >
          <Text style={styles.secondaryBtnText}>Join group</Text>
        </Pressable>
      </View>

      <Text style={styles.listHeading}>Your groups</Text>
      {loading ? (
        <ActivityIndicator color="#7DD3FC" style={{ marginTop: 16 }} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 32 }}
          ListEmptyComponent={
            <Text style={styles.empty}>No groups yet. Create or join one above.</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() =>
                navigation.navigate('GroupDetail', {
                  groupId: item.id,
                  name: item.name,
                })
              }
            >
              <Text style={styles.rowTitle}>{item.name}</Text>
              <Text style={styles.rowMeta}>{item.role === 'admin' ? 'Admin' : 'Member'}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#061426', paddingTop: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  back: { color: '#7DD3FC', fontSize: 16, fontWeight: '600' },
  title: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  hint: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(125,211,252,0.25)',
  },
  cardTitle: { color: '#E0F2FE', fontWeight: '700', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(125,211,252,0.35)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFF',
    marginBottom: 10,
  },
  primaryBtn: {
    backgroundColor: '#0EA5E9',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#FFF', fontWeight: '800' },
  secondaryBtn: {
    backgroundColor: 'rgba(14,165,233,0.2)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(125,211,252,0.45)',
  },
  secondaryBtnText: { color: '#E0F2FE', fontWeight: '700' },
  btnDisabled: { opacity: 0.55 },
  listHeading: {
    color: '#BAE6FD',
    fontWeight: '800',
    fontSize: 14,
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 6,
  },
  empty: { color: 'rgba(255,255,255,0.45)', paddingHorizontal: 16, marginTop: 8 },
  row: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(125,211,252,0.2)',
  },
  rowTitle: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  rowMeta: { color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 4 },
});

export default GroupsHubScreen;
