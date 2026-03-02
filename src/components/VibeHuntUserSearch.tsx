import React, { useEffect, useState } from 'react';
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
  Modal,
  ScrollView,
  Linking,
} from 'react-native';
import {
  getCrewCount,
  isInCrew,
  joinCrew,
  leaveCrew,
} from '../services/crewService';
import firestore from '@react-native-firebase/firestore';
import { VIBE_HUNT_SEARCH_API_KEY } from '../../liveConfig';

export type VibeUser = {
  uid: string;
  photoURL: string | null;
  username?: string;
  email?: string;
};

type WebSearchResult = {
  id: string;
  title: string;
  url: string;
  description?: string;
};

interface VibeHuntUserSearchProps {
  onProfilePhotoSelect?: (photoURL: string | null) => void;
  onChatUserSelect?: (user: { uid: string; name: string }) => void;
  onAudioCallUserSelect?: (user: { uid: string; name: string }) => void;
  onVideoCallUserSelect?: (user: { uid: string; name: string }) => void;
}

const normalizeText = (value?: string | null) =>
  String(value || '')
    .trim()
    .replace(/^[@/]+/, '')
    .toLowerCase();

const VibeHuntUserSearch: React.FC<VibeHuntUserSearchProps> = ({
  onProfilePhotoSelect,
  onChatUserSelect,
  onAudioCallUserSelect,
  onVideoCallUserSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<VibeUser[]>([]);
  const [suggestions, setSuggestions] = useState<VibeUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [webLoading, setWebLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [webResults, setWebResults] = useState<WebSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<VibeUser | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [crewCount, setCrewCount] = useState<number | null>(null);
  const [inCrew, setInCrew] = useState<boolean>(false);
  const [bio, setBio] = useState<string>('');
  const [crewLoading, setCrewLoading] = useState(false);

  useEffect(() => {
    if (!selectedUser || !selectedUser.uid || !modalVisible) return;
    const unsubscribe = firestore()
      .collection('users')
      .doc(selectedUser.uid)
      .onSnapshot(doc => {
        if (!doc.exists) return;
        const data = doc.data() || {};
        const newPhoto = data.photoURL || data.userPhoto || null;
        setSelectedUser(prev => {
          if (!prev) return prev;
          if (prev.photoURL === newPhoto) return prev;
          if (onProfilePhotoSelect) onProfilePhotoSelect(newPhoto);
          return { ...prev, photoURL: newPhoto };
        });
      });
    return () => unsubscribe();
  }, [modalVisible, onProfilePhotoSelect, selectedUser]);

  const searchWeb = async (query: string): Promise<WebSearchResult[]> => {
    const q = query.trim();
    if (!q) return [];

    const normalize = (items: any[]): WebSearchResult[] =>
      items
        .map((item: any, idx: number) => ({
          id: String(item.url || item.link || item.title || idx),
          title: String(item.title || item.name || item.link || 'Result'),
          url: String(item.url || item.link || ''),
          description: String(item.description || item.snippet || item.body || ''),
        }))
        .filter((item: WebSearchResult) => !!item.url);

    if (VIBE_HUNT_SEARCH_API_KEY) {
      try {
        const braveResp = await fetch(
          `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(q)}&count=8`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'X-Subscription-Token': VIBE_HUNT_SEARCH_API_KEY,
            },
          },
        );
        if (braveResp.ok) {
          const payload: any = await braveResp.json();
          const braveItems = Array.isArray(payload?.web?.results) ? payload.web.results : [];
          const braveResults = normalize(braveItems);
          if (braveResults.length > 0) return braveResults;
        }
      } catch {}

      try {
        const serpResp = await fetch(
          `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(q)}&api_key=${encodeURIComponent(VIBE_HUNT_SEARCH_API_KEY)}`,
        );
        if (serpResp.ok) {
          const payload: any = await serpResp.json();
          const serpItems = Array.isArray(payload?.organic_results) ? payload.organic_results : [];
          const serpResults = normalize(serpItems);
          if (serpResults.length > 0) return serpResults;
        }
      } catch {}
    }

    try {
      const ddgResp = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`,
      );
      if (!ddgResp.ok) return [];
      const payload: any = await ddgResp.json();
      const topicItems: any[] = [];
      const related = Array.isArray(payload?.RelatedTopics) ? payload.RelatedTopics : [];
      related.forEach((entry: any) => {
        if (entry?.FirstURL) {
          topicItems.push({
            title: entry.Text || entry.FirstURL,
            url: entry.FirstURL,
            description: entry.Text || '',
          });
        } else if (Array.isArray(entry?.Topics)) {
          entry.Topics.forEach((child: any) => {
            if (child?.FirstURL) {
              topicItems.push({
                title: child.Text || child.FirstURL,
                url: child.FirstURL,
                description: child.Text || '',
              });
            }
          });
        }
      });
      return normalize(topicItems).slice(0, 8);
    } catch {
      return [];
    }
  };

  const handleSearchButton = async () => {
    setError(null);
    setSuggestions([]);
    setWebResults([]);
    if (!searchQuery.trim()) {
      setResults([]);
      setSuggestions([]);
      setError('Default: No search yet.');
      return;
    }
    setLoading(true);
    setWebLoading(true);
    try {
      const usersRef = firestore().collection('users');
      const allSnap = await usersRef.limit(200).get();
      const allUsers: VibeUser[] = allSnap.docs.map(doc => ({
        uid: doc.id,
        username: doc.data().username || 'Anonymous',
        photoURL: doc.data().photoURL || null,
        email: doc.data().email,
      }));

      const queryNorm = normalizeText(searchQuery);
      const exactMatches = allUsers.filter(user => {
        const usernameNorm = normalizeText(user.username);
        const emailNorm = normalizeText(user.email);
        return usernameNorm === queryNorm || emailNorm === queryNorm;
      });

      const prefixMatches = allUsers.filter(user => {
        const usernameNorm = normalizeText(user.username);
        const emailNorm = normalizeText(user.email);
        const isPrefix =
          usernameNorm.startsWith(queryNorm) || emailNorm.startsWith(queryNorm);
        const isExact =
          usernameNorm === queryNorm || emailNorm === queryNorm;
        return isPrefix && !isExact;
      });

      const fuse = new Fuse(allUsers, {
        keys: ['username', 'email'],
        threshold: 0.42,
        ignoreLocation: true,
        minMatchCharLength: 2,
      });
      const fuzzyResults = fuse.search(searchQuery).map(res => res.item);

      const seen = new Set<string>();
      const orderedResults = [
        ...exactMatches,
        ...prefixMatches,
        ...fuzzyResults,
      ].filter(user => {
        if (seen.has(user.uid)) return false;
        seen.add(user.uid);
        return true;
      });

      if (orderedResults.length === 0) {
        setResults([]);
        setSuggestions([]);
        setError(null);
      } else {
        setResults(orderedResults);
        setSuggestions([]);
        setError(null);
      }

      const web = await searchWeb(searchQuery);
      setWebResults(web);
      if (orderedResults.length === 0 && web.length === 0) {
        setError('Failed: No results.');
      }
    } catch {
      setResults([]);
      setSuggestions([]);
      setWebResults([]);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
      setWebLoading(false);
    }
  };

  const handleUserPress = async (user: VibeUser) => {
    setSelectedUser(user);
    setCrewLoading(true);
    setCrewCount(null);
    setInCrew(false);
    setBio('');
    setModalVisible(true);
    if (onProfilePhotoSelect) onProfilePhotoSelect(user.photoURL || null);
    try {
      const count = await getCrewCount(user.uid);
      setCrewCount(count);
      const inCrewRes = await isInCrew(user.uid);
      setInCrew(inCrewRes);
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      const userData = userDoc.data() || {};
      setBio(userData.bio || '');
      if (userData.photoURL && userData.photoURL !== user.photoURL) {
        setSelectedUser(prev =>
          prev ? { ...prev, photoURL: userData.photoURL } : prev,
        );
        if (onProfilePhotoSelect) onProfilePhotoSelect(userData.photoURL);
      }
    } catch {
      setCrewCount(null);
      setInCrew(false);
      setBio('');
    } finally {
      setCrewLoading(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedUser(null);
    setCrewCount(null);
    setInCrew(false);
    setBio('');
    setCrewLoading(false);
  };

  const handleConnectLeave = async () => {
    if (!selectedUser) return;
    setCrewLoading(true);
    try {
      if (inCrew) {
        await leaveCrew(selectedUser.uid);
        setInCrew(false);
        setCrewCount(c => (c !== null ? c - 1 : null));
      } else {
        await joinCrew(selectedUser.uid);
        setInCrew(true);
        setCrewCount(c => (c !== null ? c + 1 : null));
      }
    } finally {
      setCrewLoading(false);
    }
  };

  const getInitials = (user: VibeUser) => {
    const name = (user.username || '').replace(/^[@/]+/, '');
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const cleanUsername = (username?: string) =>
    String(username || '').replace(/^[@/]+/, '');

  const renderUser = ({ item }: { item: VibeUser }) => (
    <Pressable style={styles.userItem} onPress={() => handleUserPress(item)}>
      {item.photoURL ? (
        <Image source={{ uri: item.photoURL }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.initials}>{getInitials(item)}</Text>
        </View>
      )}
      <View style={styles.userInfo}>
        <Text style={styles.displayName}>{item.username}</Text>
        {!!item.username && (
          <Text style={styles.username}>{`@${cleanUsername(item.username)}`}</Text>
        )}
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users or email"
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />
        <Pressable
          style={({ pressed }) => [
            styles.searchButton,
            pressed && styles.searchButtonPressed,
          ]}
          onPress={handleSearchButton}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </Pressable>
      </View>

      {error === 'Failed: No results.' && (
        <Text style={{ color: '#888', textAlign: 'center', marginTop: 16 }}>
          Not found.
        </Text>
      )}

      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={results}
            renderItem={renderUser}
            keyExtractor={item => item.uid}
            style={styles.resultsList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {(webLoading || webResults.length > 0) && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Internet Results</Text>
          {webLoading ? (
            <ActivityIndicator size="small" color="#00C2FF" style={{ paddingVertical: 12 }} />
          ) : (
            <FlatList
              data={webResults}
              keyExtractor={item => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  style={styles.webItem}
                  onPress={() => Linking.openURL(item.url)}
                >
                  <Text style={styles.webTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.webUrl} numberOfLines={1}>
                    {item.url}
                  </Text>
                  {!!item.description && (
                    <Text style={styles.webDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                </Pressable>
              )}
            />
          )}
        </View>
      )}

      {suggestions.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderUser}
            keyExtractor={item => item.uid}
            style={styles.resultsList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Pressable
            style={styles.modalContent}
            onPress={e => e.stopPropagation()}
          >
            {selectedUser && (
              <>
                <ScrollView
                  style={styles.modalBody}
                  contentContainerStyle={styles.modalBodyContent}
                  showsVerticalScrollIndicator={false}
                >
                  {selectedUser.photoURL && selectedUser.photoURL.trim() !== '' ? (
                    <Image
                      source={{ uri: selectedUser.photoURL }}
                      style={styles.modalAvatar}
                      onError={() => {
                        setSelectedUser(prev =>
                          prev ? { ...prev, photoURL: null } : prev,
                        );
                      }}
                    />
                  ) : (
                    <View style={[styles.modalAvatar, styles.avatarFallback]}>
                      <Text style={styles.initials}>{getInitials(selectedUser)}</Text>
                    </View>
                  )}
                  <Text style={styles.modalDisplayName}>{selectedUser.username}</Text>
                  {!!selectedUser.username && (
                    <Text style={styles.modalUsername}>
                      {`@${cleanUsername(selectedUser.username)}`}
                    </Text>
                  )}
                  {bio ? (
                    <Text style={styles.modalBio}>{bio}</Text>
                  ) : (
                    <Text style={styles.modalBioPlaceholder}>No bio yet.</Text>
                  )}
                  <View style={styles.crewRow}>
                    <Text style={styles.crewText}>
                      Crew: {crewLoading ? '...' : crewCount !== null ? crewCount : '-'}
                    </Text>
                  </View>
                </ScrollView>

                <View style={styles.modalActions}>
                  <View style={styles.communicationActionsRow}>
                    <Pressable
                      style={[styles.modalActionButton, styles.primaryAction, styles.messageAction]}
                      onPress={() => {
                        if (!selectedUser) return;
                        const name =
                          selectedUser.username || selectedUser.email || 'User';
                        closeModal();
                        if (onChatUserSelect) {
                          onChatUserSelect({ uid: selectedUser.uid, name });
                        }
                      }}
                    >
                      <Text style={styles.primaryActionText}>Message</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.iconActionButton, styles.audioAction]}
                      onPress={() => {
                        if (!selectedUser) return;
                        const name =
                          selectedUser.username || selectedUser.email || 'User';
                        closeModal();
                        onAudioCallUserSelect?.({ uid: selectedUser.uid, name });
                      }}
                    >
                      <Text style={styles.iconActionText}>📞</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.iconActionButton, styles.videoAction]}
                      onPress={() => {
                        if (!selectedUser) return;
                        const name =
                          selectedUser.username || selectedUser.email || 'User';
                        closeModal();
                        onVideoCallUserSelect?.({ uid: selectedUser.uid, name });
                      }}
                    >
                      <Text style={styles.iconActionText}>🎥</Text>
                    </Pressable>
                  </View>
                  <Pressable
                    style={[
                      styles.modalActionButton,
                      inCrew ? styles.leaveAction : styles.connectAction,
                      crewLoading && styles.disabledAction,
                    ]}
                    onPress={handleConnectLeave}
                    disabled={crewLoading}
                  >
                    <Text style={styles.secondaryActionText}>
                      {crewLoading
                        ? inCrew
                          ? 'Leaving...'
                          : 'Connecting...'
                        : inCrew
                        ? 'Leave Tide'
                        : 'Connect Tide'}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.modalActionButton, styles.closeAction]}
                    onPress={closeModal}
                  >
                    <Text style={styles.closeActionText}>Close</Text>
                  </Pressable>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
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
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 194, 255, 0.3)',
  },
  searchIcon: {
    fontSize: 20,
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
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  searchButtonPressed: {
    backgroundColor: '#0090BB',
    opacity: 0.8,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  resultsContainer: {
    backgroundColor: 'rgba(0, 31, 63, 0.95)',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 300,
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
    padding: 8,
  },
  webItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 194, 255, 0.25)',
  },
  webTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  webUrl: {
    color: '#58C8FF',
    fontSize: 12,
    marginTop: 2,
  },
  webDescription: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(0, 194, 255, 0.5)',
  },
  avatarFallback: {
    backgroundColor: '#00C2FF33',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  displayName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  username: {
    color: 'rgba(0, 194, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '88%',
    maxWidth: 420,
    maxHeight: '82%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#001529',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalBody: {
    maxHeight: 360,
  },
  modalBodyContent: {
    alignItems: 'center',
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  modalDisplayName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginTop: 8,
    textAlign: 'center',
  },
  modalUsername: {
    fontSize: 16,
    color: '#00C2FF',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalBio: {
    color: '#334155',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalBioPlaceholder: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  crewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  crewText: {
    color: '#00C2FF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalActions: {
    marginTop: 16,
    gap: 10,
  },
  communicationActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  modalActionButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: '100%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
  },
  primaryAction: {
    backgroundColor: '#00C2FF',
  },
  messageAction: {
    flex: 1,
  },
  iconActionButton: {
    width: 48,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: '#0B1220',
  },
  audioAction: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16,185,129,0.22)',
  },
  videoAction: {
    borderColor: '#2563EB',
    backgroundColor: 'rgba(37,99,235,0.22)',
  },
  iconActionText: {
    fontSize: 18,
  },
  connectAction: {
    backgroundColor: '#0EA5E9',
  },
  leaveAction: {
    backgroundColor: '#EF4444',
  },
  closeAction: {
    backgroundColor: '#E2E8F0',
  },
  disabledAction: {
    opacity: 0.65,
  },
  initials: {
    color: '#00C2FF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  primaryActionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  secondaryActionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
  closeActionText: {
    color: '#1E293B',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },
});

export default VibeHuntUserSearch;


