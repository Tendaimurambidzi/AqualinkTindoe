import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { getCrewCount, isInCrew, joinCrew, leaveCrew } from '../services/crewService';
import firestore from '@react-native-firebase/firestore';

// User type

export type VibeUser = {
  uid: string;
  displayName: string;
  photoURL: string | null;
  username?: string;
  email?: string;
};

import { useNavigation } from '@react-navigation/native';

const VibeHuntUserSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<VibeUser[]>([]);
  const [suggestions, setSuggestions] = useState<VibeUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<VibeUser | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  // Crew and profile modal state
  const [crewCount, setCrewCount] = useState<number | null>(null);
  const [inCrew, setInCrew] = useState<boolean>(false);
  const [bio, setBio] = useState<string>('');
  const [crewLoading, setCrewLoading] = useState(false);
  const navigation = useNavigation();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setError(null);
    setSuggestions([]);
    if (!query.trim()) {
      setResults([]);
      setSuggestions([]);
      setError(null);
      return;
    }
    setLoading(true);
    try {
      const usersRef = firestore().collection('users');
      const displayNameSnap = await usersRef
        .where('displayName', '>=', query)
        .where('displayName', '<=', query + '\uf8ff')
        .limit(20)
        .get();
      let users: VibeUser[] = displayNameSnap.docs.map(doc => ({
        uid: doc.id,
        displayName: doc.data().displayName || 'Anonymous',
        photoURL: doc.data().photoURL || null,
        username: doc.data().username,
        email: doc.data().email,
      }));
      // Fuzzy suggestions if no exact match
      if (users.length === 0) {
        const allSnap = await usersRef.limit(100).get();
        const allUsers: VibeUser[] = allSnap.docs.map(doc => ({
          uid: doc.id,
          displayName: doc.data().displayName || 'Anonymous',
          photoURL: doc.data().photoURL || null,
          username: doc.data().username,
          email: doc.data().email,
        }));
        const fuse = new Fuse(allUsers, {
          keys: ['displayName', 'username', 'email'],
          threshold: 0.4,
        });
        const fuzzyResults = fuse.search(query).map(res => res.item);
        setSuggestions(fuzzyResults.slice(0, 10));
        setError('No exact results. Did you mean:');
      } else {
        setResults(users);
        setSuggestions([]);
        setError(null);
      }
    } catch (error) {
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
    try {
      // Fetch crew count
      const count = await getCrewCount(user.uid);
      setCrewCount(count);
      // Check if current user is in crew
      const inCrewRes = await isInCrew(user.uid);
      setInCrew(inCrewRes);
      // Fetch bio
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      setBio(userDoc.data()?.bio || '');
    } catch (e) {
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
        setCrewCount((c) => (c !== null ? c - 1 : null));
      } else {
        await joinCrew(selectedUser.uid);
        setInCrew(true);
        setCrewCount((c) => (c !== null ? c + 1 : null));
      }
    } catch (e) {
      // Optionally show error
    } finally {
      setCrewLoading(false);
    }
  };

  const renderUser = ({ item }: { item: VibeUser }) => (
    <Pressable style={styles.userItem} onPress={() => handleUserPress(item)}>
      <Image
        source={{ uri: item.photoURL || 'https://via.placeholder.com/50' }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.displayName}>{item.displayName}</Text>
        {item.username ? (
          <Text style={styles.username}>@{item.username}</Text>
        ) : item.email ? (
          <Text style={styles.username}>{item.email}</Text>
        ) : null}
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search VIBE HUNT users..."
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />
        <Pressable
          style={({ pressed }) => [
            styles.searchButton,
            pressed && styles.searchButtonPressed,
          ]}
          onPress={() => handleSearch(searchQuery)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </Pressable>
      </View>
      {error && (
        <View style={{ padding: 12, alignItems: 'center' }}>
          <Text style={{ color: '#FF4444', fontWeight: 'bold' }}>{error}</Text>
        </View>
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
      {/* User Action Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={closeModal}
        >
          <Pressable
            style={styles.modalContent}
            onPress={e => e.stopPropagation()}
          >
            {selectedUser && (
              <>
                <Image
                  source={{ uri: selectedUser.photoURL || 'https://via.placeholder.com/80' }}
                  style={styles.modalAvatar}
                />
                <Text style={styles.modalDisplayName}>{selectedUser.displayName}</Text>
                {selectedUser.username && (
                  <Text style={styles.modalUsername}>@{selectedUser.username}</Text>
                )}
                {bio ? (
                  <Text style={{ color: '#444', fontSize: 14, marginBottom: 8, textAlign: 'center' }}>{bio}</Text>
                ) : null}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ color: '#00C2FF', fontWeight: 'bold', fontSize: 15 }}>
                    Crew: {crewLoading ? '...' : crewCount !== null ? crewCount : '-'}
                  </Text>
                </View>
                <View style={styles.modalActions}>
                  <Pressable
                    style={[styles.modalActionButton, { backgroundColor: inCrew ? '#FF4444' : '#00C2FF' }]}
                    onPress={handleConnectLeave}
                    disabled={crewLoading}
                  >
                    <Text style={styles.modalActionText}>
                      {crewLoading ? (inCrew ? 'Leaving...' : 'Connecting...') : inCrew ? 'Leave Tide' : 'Connect Tide'}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.modalActionButton}
                    onPress={() => {
                      if (selectedUser) {
                        closeModal();
                        navigation.navigate('ChatScreen', {
                          userId: selectedUser.uid,
                          username: selectedUser.displayName || selectedUser.username || 'User',
                        });
                      }
                    }}
                  >
                    <Text style={styles.modalActionText}>Chat</Text>
                  </Pressable>
                  <Pressable style={styles.modalActionButton} onPress={closeModal}>
                    <Text style={styles.modalActionText}>Close</Text>
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
    backgroundColor: '#0090bb',
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
    padding: 24,
    width: '85%',
    maxWidth: 400,
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
    fontWeight: 'bold',
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
  modalActions: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  modalActionButton: {
    backgroundColor: '#00C2FF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 4,
  },
  modalActionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default VibeHuntUserSearch;
