import React, { useEffect, useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import {
  View,
  TextInput,
  FlatList,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

type VibeUser = {
  uid: string;
  photoURL: string | null;
  username?: string;
  email?: string;
  bio?: string;
  minuteFameCareerPoints?: number;
};

type DiscoveryEntry = {
  id: string;
  type: 'user' | 'fleet' | 'topic' | 'post';
  title: string;
  subtitle: string;
  searchValue: string;
  photoURL?: string | null;
  userUid?: string;
  userName?: string;
  score?: number;
};

interface VibeHuntUserSearchProps {
  myUid?: string | null;
  blockedUserIds?: string[];
  onProfilePhotoSelect?: (photoURL: string | null) => void;
  onOpenUserProfile?: (user: { uid: string; name: string }) => void;
  onOpenAvatarPreview?: (photoURL: string) => void;
}

const VIBE_HUNT_RECENT_KEY = 'vibe_hunt_recent_queries';

const normalizeText = (value?: string | null) =>
  String(value || '')
    .trim()
    .replace(/^[@/]+/, '')
    .toLowerCase();

const normalizePhotoUrl = (value?: string | null) => {
  const raw = String(value || '').trim();
  if (!raw) return null;
  if (raw.toLowerCase() === 'null' || raw.toLowerCase() === 'undefined') return null;
  return raw;
};

const formatHandle = (value?: string | null) => {
  const core = String(value || '').trim().replace(/^[@/]+/, '');
  return core ? `@${core}` : '@user';
};

const extractTopics = (source: string) => {
  const matches = String(source || '')
    .match(/#[A-Za-z0-9_]+|\b[A-Z][a-z]{3,}\b/g);
  return (matches || [])
    .map(item => item.replace(/^#/, '').trim())
    .filter(item => item.length >= 4);
};

const VibeHuntUserSearch: React.FC<VibeHuntUserSearchProps> = ({
  myUid,
  blockedUserIds = [],
  onProfilePhotoSelect,
  onOpenUserProfile,
  onOpenAvatarPreview,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [directoryUsers, setDirectoryUsers] = useState<VibeUser[]>([]);
  const [discoveryEntries, setDiscoveryEntries] = useState<DiscoveryEntry[]>([]);
  const [results, setResults] = useState<DiscoveryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [brokenAvatarIds, setBrokenAvatarIds] = useState<Set<string>>(new Set());

  const blockedSet = useMemo(() => new Set(blockedUserIds), [blockedUserIds]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(VIBE_HUNT_RECENT_KEY);
        if (!mounted || !stored) return;
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentQueries(
            parsed
              .map(item => String(item || '').trim())
              .filter(Boolean)
              .slice(0, 8),
          );
        }
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadDirectory = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersSnap, fleetsSnap, wavesSnap] = await Promise.all([
          firestore().collection('users').limit(250).get(),
          firestore().collection('fleets').limit(120).get(),
          firestore().collection('waves').orderBy('createdAt', 'desc').limit(120).get(),
        ]);

        const users: VibeUser[] = usersSnap.docs
          .map(doc => {
            const data = doc.data() || {};
            return {
              uid: doc.id,
              username: String(
                data?.userName || data?.username || data?.displayName || data?.name || 'User',
              ).trim(),
              email: data?.email || undefined,
              photoURL:
                data?.userPhoto ||
                data?.photoURL ||
                data?.avatar ||
                data?.profilePicture ||
                null,
              bio: data?.bio || '',
              minuteFameCareerPoints: Number(data?.minuteFameCareerPoints || 0),
            };
          })
          .filter(user => !!user.uid && user.uid !== myUid);

        const userEntries: DiscoveryEntry[] = users.map(user => ({
          id: `user-${user.uid}`,
          type: 'user',
          title: formatHandle(user.username || user.email || 'user'),
          subtitle: String(user.bio || user.email || 'User profile').trim() || 'User profile',
          searchValue: `${user.username || ''} ${user.email || ''} ${user.bio || ''}`,
          photoURL: user.photoURL,
          userUid: user.uid,
          userName: user.username || user.email || 'User',
          score: Number(user.minuteFameCareerPoints || 0),
        }));

        const fleetEntries: DiscoveryEntry[] = fleetsSnap.docs.map(doc => {
          const data = doc.data() || {};
          const crewCount = Math.max(0, Number(data?.crewCount || 0));
          return {
            id: `fleet-${doc.id}`,
            type: 'fleet',
            title: String(data?.name || 'Fleet').trim(),
            subtitle: `${crewCount} crew • ${data?.description || 'Open this fleet in search'}`.trim(),
            searchValue: `${data?.name || ''} ${data?.description || ''} fleet`,
            photoURL: data?.photoURL || null,
            score: crewCount,
          };
        });

        const topicMap = new Map<string, number>();
        const postEntries: DiscoveryEntry[] = [];
        wavesSnap.docs.forEach(doc => {
          const data = doc.data() || {};
          const caption = String(data?.captionText || data?.caption || data?.text || '').trim();
          if (!caption) return;
          const ownerUid = String(data?.ownerUid || '').trim();
          const ownerName = String(data?.authorName || data?.userName || 'User').trim();
          postEntries.push({
            id: `post-${doc.id}`,
            type: 'post',
            title: caption.slice(0, 70),
            subtitle: `Post by ${formatHandle(ownerName)}`,
            searchValue: `${caption} ${ownerName}`,
            userUid: ownerUid || undefined,
            userName: ownerName || undefined,
            score: Math.max(
              0,
              Number(data?.counts?.echoes || 0) + Number(data?.counts?.hugs || data?.counts?.splashes || 0),
            ),
          });
          extractTopics(caption).forEach(topic => {
            const key = topic.toLowerCase();
            topicMap.set(key, (topicMap.get(key) || 0) + 1);
          });
        });

        const topicEntries: DiscoveryEntry[] = Array.from(topicMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 30)
          .map(([topic, count]) => ({
            id: `topic-${topic}`,
            type: 'topic',
            title: `#${topic}`,
            subtitle: `${count} related posts`,
            searchValue: `${topic} topic hashtag`,
            score: count,
          }));

        const combined = [...userEntries, ...fleetEntries, ...topicEntries, ...postEntries]
          .sort((a, b) => Number(b.score || 0) - Number(a.score || 0));

        if (!cancelled) {
          setDirectoryUsers(users);
          setDiscoveryEntries(combined);
          setResults(combined.slice(0, 80));
        }
      } catch (loadError) {
        if (!cancelled) {
          setError('Could not load discovery right now.');
          setDirectoryUsers([]);
          setDiscoveryEntries([]);
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadDirectory();
    return () => {
      cancelled = true;
    };
  }, [myUid]);

  useEffect(() => {
    const term = searchQuery.trim();
    if (!term) {
      setResults(discoveryEntries.slice(0, 80));
      setError(discoveryEntries.length === 0 && !loading ? 'No discovery results found.' : null);
      return;
    }

    const queryNorm = normalizeText(term);
    const exactMatches = discoveryEntries.filter(entry => {
      const normalizedTitle = normalizeText(entry.title);
      const normalizedSearch = normalizeText(entry.searchValue);
      return normalizedTitle === queryNorm || normalizedSearch === queryNorm;
    });
    const prefixMatches = discoveryEntries.filter(entry => {
      const normalizedTitle = normalizeText(entry.title);
      const normalizedSearch = normalizeText(entry.searchValue);
      return (
        (normalizedTitle.startsWith(queryNorm) || normalizedSearch.startsWith(queryNorm)) &&
        normalizedTitle !== queryNorm &&
        normalizedSearch !== queryNorm
      );
    });

    const containsMatches = discoveryEntries.filter(entry => {
      const normalizedTitle = normalizeText(entry.title);
      const normalizedSubtitle = normalizeText(entry.subtitle);
      const normalizedSearch = normalizeText(entry.searchValue);
      return (
        normalizedTitle.includes(queryNorm) ||
        normalizedSubtitle.includes(queryNorm) ||
        normalizedSearch.includes(queryNorm)
      );
    });

    const fuse = new Fuse(discoveryEntries, {
      keys: ['title', 'subtitle', 'searchValue'],
      threshold: 0.48,
      ignoreLocation: true,
      minMatchCharLength: 1,
    });
    const fuzzyResults = fuse.search(term).map(entry => entry.item);

    const seen = new Set<string>();
    const merged = [...exactMatches, ...prefixMatches, ...containsMatches, ...fuzzyResults].filter(entry => {
      if (seen.has(entry.id)) return false;
      seen.add(entry.id);
      return true;
    });

    const fallbackSuggestions =
      merged.length > 0
        ? merged
        : discoveryEntries
            .filter(entry => normalizeText(entry.title).slice(0, 1) === queryNorm.slice(0, 1))
            .slice(0, 12);

    setResults(fallbackSuggestions);
    setError(
      fallbackSuggestions.length === 0
        ? 'No direct match yet. Try a broader word.'
        : merged.length === 0
        ? 'Showing close results'
        : null,
    );
  }, [discoveryEntries, loading, searchQuery]);

  const persistRecentQuery = (value: string) => {
    const term = value.trim();
    if (!term) return;
    setRecentQueries(prev => {
      const next = [
        term,
        ...prev.filter(item => item.toLowerCase() !== term.toLowerCase()),
      ].slice(0, 8);
      AsyncStorage.setItem(VIBE_HUNT_RECENT_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const getInitials = (entry: DiscoveryEntry) => {
    const raw = String(entry.title || '?').replace(/^[@/#]+/, '');
    const parts = raw.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
  };

  const getTypeLabel = (entry: DiscoveryEntry) => {
    if (entry.type === 'user') return 'USER';
    if (entry.type === 'fleet') return 'FLEET';
    if (entry.type === 'topic') return 'TOPIC';
    return 'POST';
  };

  const handleEntryPress = (entry: DiscoveryEntry) => {
    persistRecentQuery(searchQuery || entry.searchValue || entry.title);
    if (entry.type === 'user' && entry.userUid) {
      onProfilePhotoSelect?.(entry.photoURL || null);
      onOpenUserProfile?.({
        uid: entry.userUid,
        name: String(entry.userName || entry.title || 'User'),
      });
      return;
    }
    if (entry.type === 'post' && entry.userUid) {
      onOpenUserProfile?.({
        uid: entry.userUid,
        name: String(entry.userName || 'User'),
      });
      return;
    }
    setSearchQuery(entry.title.replace(/^#/, ''));
  };

  const renderEntry = ({ item }: { item: DiscoveryEntry }) => {
    const isBlocked = !!item.userUid && blockedSet.has(item.userUid);
    const photoUrl = normalizePhotoUrl(item.photoURL);
    const showPhoto = !!photoUrl && !brokenAvatarIds.has(item.id);
    return (
      <Pressable style={styles.userItem} onPress={() => handleEntryPress(item)}>
        <Pressable
          onPress={() => handleEntryPress(item)}
          onLongPress={() => {
            if (photoUrl) {
              onProfilePhotoSelect?.(photoUrl);
              onOpenAvatarPreview?.(photoUrl);
            }
          }}
          style={{ borderRadius: 26 }}
        >
          <View style={styles.avatarWrap}>
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.initials}>{getInitials(item)}</Text>
            </View>
            {showPhoto ? (
              <Image
                source={{ uri: photoUrl as string }}
                style={[styles.avatar, styles.avatarImage]}
                onError={() => {
                  setBrokenAvatarIds(prev => {
                    if (prev.has(item.id)) return prev;
                    const next = new Set(prev);
                    next.add(item.id);
                    return next;
                  });
                }}
              />
            ) : null}
          </View>
        </Pressable>
        <View style={styles.userInfo}>
          <View style={styles.userTitleRow}>
            <Text style={styles.displayName} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.typePill}>
              <Text style={styles.typePillText}>{getTypeLabel(item)}</Text>
            </View>
            {isBlocked ? (
              <View style={styles.blockedPill}>
                <Text style={styles.blockedPillText}>Blocked</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.statusText} numberOfLines={2}>
            {item.subtitle}
          </Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.pointsValue}>{Number(item.score || 0)}</Text>
          <Text style={styles.pointsLabel}>rank</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Default search"
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => persistRecentQuery(searchQuery)}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />
        <Pressable
          style={({ pressed }) => [
            styles.searchButton,
            pressed && styles.searchButtonPressed,
          ]}
          onPress={() => persistRecentQuery(searchQuery)}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
      </View>

      {recentQueries.length > 0 ? (
        <View style={styles.recentWrap}>
          <View style={styles.recentHeaderRow}>
            <Text style={styles.sectionTitle}>Recent searches</Text>
            <Pressable
              onPress={() => {
                setRecentQueries([]);
                AsyncStorage.removeItem(VIBE_HUNT_RECENT_KEY).catch(() => {});
              }}
            >
              <Text style={styles.clearRecentText}>Clear</Text>
            </Pressable>
          </View>
          <View style={styles.recentChipRow}>
            {recentQueries.map(item => (
              <Pressable
                key={`hunt-recent-${item}`}
                style={styles.recentChip}
                onPress={() => setSearchQuery(item)}
              >
                <Text style={styles.recentChipText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.resultsContainer}>
        <Text style={styles.sectionTitle}>
          {searchQuery.trim() ? 'Matching results' : 'Trending now'}
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color="#00C2FF" style={{ paddingVertical: 18 }} />
        ) : error ? (
          <Text style={styles.emptyText}>{error}</Text>
        ) : (
          <FlatList
            data={results}
            renderItem={renderEntry}
            keyExtractor={item => item.id}
            style={styles.resultsList}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 31, 63, 0.9)',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: 'rgba(0, 194, 255, 0.3)',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  searchButton: {
    marginLeft: 8,
    backgroundColor: '#00C2FF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchButtonPressed: {
    opacity: 0.82,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  recentWrap: {
    marginTop: 8,
    backgroundColor: 'rgba(0, 31, 63, 0.75)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 194, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearRecentText: {
    color: '#58C8FF',
    fontWeight: '700',
    fontSize: 12,
  },
  recentChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  recentChip: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(88, 200, 255, 0.55)',
    backgroundColor: 'rgba(0, 194, 255, 0.14)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  recentChipText: {
    color: '#D9F5FF',
    fontSize: 12,
    fontWeight: '600',
  },
  resultsContainer: {
    backgroundColor: 'rgba(0, 31, 63, 0.95)',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 420,
    borderWidth: 1,
    borderColor: 'rgba(0, 194, 255, 0.3)',
  },
  sectionTitle: {
    color: '#9DDCFF',
    fontWeight: '700',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
  },
  resultsList: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 194, 255, 0.18)',
    gap: 10,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#082133',
  },
  avatarWrap: {
    width: 52,
    height: 52,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F4C75',
  },
  avatarImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  initials: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  displayName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
  },
  statusText: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 12,
    marginTop: 3,
  },
  metaCol: {
    alignItems: 'flex-end',
    minWidth: 58,
  },
  pointsValue: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  pointsLabel: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 11,
  },
  blockedPill: {
    borderRadius: 999,
    backgroundColor: 'rgba(141,0,0,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,80,80,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  blockedPillText: {
    color: '#FFD4D4',
    fontSize: 10,
    fontWeight: '800',
  },
  typePill: {
    borderRadius: 999,
    backgroundColor: 'rgba(14,165,233,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(125,211,252,0.45)',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  typePillText: {
    color: '#D8F4FF',
    fontSize: 10,
    fontWeight: '800',
  },
});

export default VibeHuntUserSearch;
