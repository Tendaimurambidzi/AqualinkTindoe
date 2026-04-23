import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  fetchPrivateGroupMeta,
  subscribePrivateGroupWaves,
} from '../services/privateGroupsService';

type RouteParams = { groupId: string; name?: string };

const GroupDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { groupId, name: routeName } = (route.params || {}) as RouteParams;
  const myUid = auth().currentUser?.uid || null;
  const [waves, setWaves] = useState<Array<{ id: string; [k: string]: unknown }>>(
    [],
  );
  const [metaName, setMetaName] = useState(routeName || 'Group');
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [createdBy, setCreatedBy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) {
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const meta = await fetchPrivateGroupMeta(groupId);
        if (!cancelled && meta) {
          setMetaName(meta.name);
          setInviteCode(meta.inviteCode);
          setCreatedBy(meta.createdBy);
        }
      } catch {}
    })();
    const unsub = subscribePrivateGroupWaves(
      groupId,
      next => {
        setWaves(next);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => {
      cancelled = true;
      unsub();
    };
  }, [groupId]);

  const showInvite = myUid && createdBy && myUid === createdBy && inviteCode;

  const renderWave = useCallback(
    ({ item }: { item: { id: string; [k: string]: unknown } }) => {
      const caption = String(item.captionText || item.text || '').trim();
      const uri = String(item.mediaUrl || (item.media as any)?.uri || '');
      const isVideo = String(item.mediaType || '')
        .toLowerCase()
        .startsWith('video');
      return (
        <View style={styles.waveCard}>
          {uri ? (
            isVideo ? (
              <View style={styles.mediaPlaceholder}>
                <Text style={styles.mediaLabel}>Video</Text>
              </View>
            ) : (
              <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
            )
          ) : (
            <View style={[styles.mediaPlaceholder, { minHeight: 0, padding: 8 }]}>
              <Text style={styles.mediaLabel}>Text</Text>
            </View>
          )}
          {!!caption && (
            <Text style={styles.caption} numberOfLines={4}>
              {caption}
            </Text>
          )}
        </View>
      );
    },
    [],
  );

  if (!groupId) {
    return (
      <View style={styles.root}>
        <Text style={styles.error}>Missing group.</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {metaName}
        </Text>
        <Pressable
          onPress={() =>
            navigation.navigate('GroupPostComposer', {
              groupId,
              name: metaName,
            })
          }
        >
          <Text style={styles.postLink}>Post</Text>
        </Pressable>
      </View>

      {showInvite ? (
        <View style={styles.inviteBanner}>
          <Text style={styles.inviteLabel}>Invite code (share privately)</Text>
          <Text selectable style={styles.inviteCode}>
            {inviteCode}
          </Text>
          <Text style={styles.inviteSub}>Group id (for join screen)</Text>
          <Text selectable style={styles.inviteId}>
            {groupId}
          </Text>
        </View>
      ) : null}

      {loading ? (
        <ActivityIndicator color="#7DD3FC" style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={waves}
          keyExtractor={w => w.id}
          renderItem={renderWave}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={
            <Text style={styles.empty}>No posts in this group yet. Tap Post.</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#061426' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  back: { color: '#7DD3FC', fontSize: 16, fontWeight: '600' },
  title: { flex: 1, marginHorizontal: 10, color: '#FFF', fontSize: 17, fontWeight: '800' },
  postLink: { color: '#38BDF8', fontWeight: '800', fontSize: 16 },
  inviteBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(14,165,233,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(125,211,252,0.35)',
  },
  inviteLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4 },
  inviteCode: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 2 },
  inviteSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 10,
    marginBottom: 2,
  },
  inviteId: { color: '#BAE6FD', fontSize: 12 },
  waveCard: {
    marginBottom: 14,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(125,211,252,0.2)',
  },
  thumb: { width: '100%', height: 220, backgroundColor: '#0F172A' },
  mediaPlaceholder: {
    width: '100%',
    minHeight: 120,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaLabel: { color: 'rgba(255,255,255,0.55)', fontWeight: '700' },
  caption: { color: '#E2E8F0', padding: 10, fontSize: 14 },
  empty: { color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginTop: 24 },
  error: { color: '#FCA5A5', padding: 24 },
});

export default GroupDetailScreen;
