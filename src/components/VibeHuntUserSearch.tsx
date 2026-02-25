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
} from 'react-native';
import {
  getCrewCount,
  isInCrew,
  joinCrew,
  leaveCrew,
} from '../services/crewService';
import firestore from '@react-native-firebase/firestore';

export type VibeUser = {
  uid: string;
  photoURL: string | null;
  username?: string;
  email?: string;
};

interface VibeHuntUserSearchProps {
  onProfilePhotoSelect?: (photoURL: string | null) => void;
  onChatUserSelect?: (user: { uid: string; name: string }) => void;
}

const normalizeText = (value?: string | null) =>
  String(value || '')
    .trim()
    .replace(/^[@/]+/, '')
    .toLowerCase();

const VibeHuntUserSearch: React.FC<VibeHuntUserSearchProps> = ({
  onProfilePhotoSelect,
  onChatUserSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<VibeUser[]>([]);
  const [suggestions, setSuggestions] = useState<VibeUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  }, [selectedUser?.uid, modalVisible]);

  const handleSearchButton = async () => {
    setError(null);
    setSuggestions([]);
    if (!searchQuery.trim()) {
      setResults([]);
      setSuggestions([]);
      setError('Default: No search yet.');
      return;
    }
    setLoading(true);
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
        setError('Failed: No results.');
      } else {
        setResults(orderedResults);
        setSuggestions([]);
        setError(null);
      }
    } catch {
      setResults([]);
      setSuggestions([]);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
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
                  <Pressable
                    style={[styles.modalActionButton, styles.primaryAction]}
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
  resultsList: {
    padding: 8,
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
