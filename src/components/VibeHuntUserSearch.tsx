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

export type VibeUser = {
  uid: string;
  photoURL: string | null;
  username?: string;
  email?: string;
  bio?: string;
  minuteFameCareerPoints?: number;
  minuteFameTitle?: string | null;
};

interface VibeHuntUserSearchProps {
  myUid?: string | null;
  blockedUserIds?: string[];
  onProfilePhotoSelect?: (photoURL: string | null) => void;
  onOpenUserProfile?: (user: { uid: string; name: string }) => void;
  onOpenAvatarPreview?: (photoURL: string) => void;
  /** Prefill search when opening Hunt (e.g. from a hashtag). */
  initialQuery?: string;
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

const sortUsers = (users: VibeUser[]) =>
  [...users].sort((a, b) => {
    const pointsDelta =
      Number(b.minuteFameCareerPoints || 0) - Number(a.minuteFameCareerPoints || 0);
    if (pointsDelta !== 0) return pointsDelta;
    return normalizeText(a.username || a.email).localeCompare(
      normalizeText(b.username || b.email),
    );
  });

const VibeHuntUserSearch: React.FC<VibeHuntUserSearchProps> = ({
  myUid,
  blockedUserIds = [],
  onProfilePhotoSelect,
  onOpenUserProfile,
  onOpenAvatarPreview,
  initialQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [directoryUsers, setDirectoryUsers] = useState<VibeUser[]>([]);
  const [results, setResults] = useState<VibeUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [brokenAvatarIds, setBrokenAvatarIds] = useState<Set<string>>(new Set());

  const blockedSet = useMemo(() => new Set(blockedUserIds), [blockedUserIds]);

  useEffect(() => {
    const q = String(initialQuery || '').trim();
    if (q) {
      setSearchQuery(q);
    }
  }, [initialQuery]);

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
    const loadUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const snap = await firestore().collection('users').limit(300).get();
        const users = sortUsers(
          snap.docs
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
                minuteFameTitle:
                  data?.minuteFameTitleLabel || data?.minuteFameTitle || null,
              } as VibeUser;
            })
            .filter(user => !!user.uid && user.uid !== myUid),
        );
        if (!cancelled) {
          setDirectoryUsers(users);
          setResults(users.slice(0, 80));
          setError(users.length === 0 ? 'No users found.' : null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError('Could not load users right now.');
          setDirectoryUsers([]);
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadUsers();
    return () => {
      cancelled = true;
    };
  }, [myUid]);

  useEffect(() => {
    const term = searchQuery.trim();
    if (!term) {
      setResults(directoryUsers.slice(0, 80));
      setError(directoryUsers.length === 0 && !loading ? 'No users found.' : null);
      return;
    }

    const queryNorm = normalizeText(term);
    const exactMatches = directoryUsers.filter(user => {
      const usernameNorm = normalizeText(user.username);
      const emailNorm = normalizeText(user.email);
      return usernameNorm === queryNorm || emailNorm === queryNorm;
    });

    const prefixMatches = directoryUsers.filter(user => {
      const usernameNorm = normalizeText(user.username);
      const emailNorm = normalizeText(user.email);
      return (
        (usernameNorm.startsWith(queryNorm) || emailNorm.startsWith(queryNorm)) &&
        usernameNorm !== queryNorm &&
        emailNorm !== queryNorm
      );
    });

    const containsMatches = directoryUsers.filter(user => {
      const usernameNorm = normalizeText(user.username);
      const emailNorm = normalizeText(user.email);
      const bioNorm = normalizeText(user.bio);
      return (
        usernameNorm.includes(queryNorm) ||
        emailNorm.includes(queryNorm) ||
        bioNorm.includes(queryNorm)
      );
    });

    const fuse = new Fuse(directoryUsers, {
      keys: ['username', 'email', 'bio'],
      threshold: 0.45,
      ignoreLocation: true,
      minMatchCharLength: 1,
    });
    const fuzzyResults = fuse.search(term).map(entry => entry.item);

    const seen = new Set<string>();
    const merged = [...exactMatches, ...prefixMatches, ...containsMatches, ...fuzzyResults].filter(user => {
      if (seen.has(user.uid)) return false;
      seen.add(user.uid);
      return true;
    });

    const fallback =
      merged.length > 0
        ? merged
        : directoryUsers
            .filter(user => normalizeText(user.username || user.email).slice(0, 1) === queryNorm.slice(0, 1))
            .slice(0, 20);

    setResults(fallback);
    setError(fallback.length === 0 ? 'No users found.' : null);
  }, [directoryUsers, loading, searchQuery]);

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

  const handleUserPress = (user: VibeUser) => {
    persistRecentQuery(searchQuery || user.username || user.email || '');
    onProfilePhotoSelect?.(user.photoURL || null);
    onOpenUserProfile?.({
      uid: user.uid,
      name: String(user.username || user.email || 'User'),
    });
  };

  const getInitials = (user: VibeUser) => {
    const name = String(user.username || user.email || '?').replace(/^[@/]+/, '');
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
  };

  const renderUser = ({ item }: { item: VibeUser }) => {
    const isBlocked = blockedSet.has(item.uid);
    const photoUrl = normalizePhotoUrl(item.photoURL);
    const showPhoto = !!photoUrl && !brokenAvatarIds.has(item.uid);
    return (
      <Pressable style={styles.userItem} onPress={() => handleUserPress(item)}>
        <Pressable
          onPress={() => handleUserPress(item)}
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
                    if (prev.has(item.uid)) return prev;
                    const next = new Set(prev);
                    next.add(item.uid);
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
              {item.username || item.email || 'User'}
            </Text>
            {isBlocked ? (
              <View style={styles.blockedPill}>
                <Text style={styles.blockedPillText}>Blocked</Text>
              </View>
            ) : null}
          </View>
          {!!item.username && (
            <Text style={styles.username} numberOfLines={1}>
              @{normalizeText(item.username)}
            </Text>
          )}
          {!!item.bio && (
            <Text style={styles.bioText} numberOfLines={2}>
              {item.bio}
            </Text>
          )}
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.pointsValue}>{Number(item.minuteFameCareerPoints || 0)}</Text>
          <Text style={styles.pointsLabel}>points</Text>
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
          placeholder="Search"
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
          {searchQuery.trim() ? 'Search results' : 'Popular'}
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color="#00C2FF" style={{ paddingVertical: 18 }} />
        ) : error ? (
          <Text style={styles.emptyText}>{error}</Text>
        ) : (
          <FlatList
            data={results}
            renderItem={renderUser}
            keyExtractor={item => item.uid}
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
  username: {
    color: '#81D4FA',
    fontSize: 12,
    marginTop: 2,
  },
  bioText: {
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
});

export default VibeHuntUserSearch;
