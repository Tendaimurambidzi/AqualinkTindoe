// InviteBadge component for Join/Miss actions
const InviteBadge = ({ onJoin, onMiss }) => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <View style={inviteBadgeStyles.badgeContainer}>
      <Text style={inviteBadgeStyles.badgeText}>Invite Sent</Text>
      <Pressable
        style={inviteBadgeStyles.badgeButton}
        onPress={() => { setVisible(false); onJoin?.(); }}
      >
        <Text style={inviteBadgeStyles.badgeButtonText}>Join</Text>
      </Pressable>
      <Pressable
        style={[inviteBadgeStyles.badgeButton, { backgroundColor: '#eee' }]}
        onPress={() => { setVisible(false); onMiss?.(); }}
      >
        <Text style={[inviteBadgeStyles.badgeButtonText, { color: '#888' }]}>Miss</Text>
      </Pressable>
    </View>
  );
};

const inviteBadgeStyles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    color: '#00C2FF',
    fontWeight: '700',
    marginRight: 8,
  },
  badgeButton: {
    backgroundColor: '#00C2FF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginHorizontal: 2,
  },
  badgeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
});
import React, { useState } from 'react';
import Fuse from 'fuse.js';
import {
  View,
  TextInput,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

type UserResult = {
  uid: string;
  displayName: string;
  photoURL: string | null;
  username?: string;
  email?: string;
};

type UserSearchProps = {
  onUserSelect: (user: UserResult) => void;
  onJoinCrew?: (user: UserResult) => void;
  onInviteToDrift?: (user: UserResult) => void;
};

const UserSearch: React.FC<UserSearchProps> = ({
  onUserSelect,
  onJoinCrew,
  onInviteToDrift,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [suggestions, setSuggestions] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      let searchTerm = query.trim();
      let usernameVariants = [searchTerm.replace(/^[@/]+/, '')];
      const displayNameSnap = await usersRef
        .where('displayName', '>=', searchTerm)
        .where('displayName', '<=', searchTerm + '\uf8ff')
        .limit(20)
        .get();
      let users: UserResult[] = displayNameSnap.docs
        .map(doc => {
          const data = doc.data() || {};
          if (data.appRemoved === true) return null;
          return {
            uid: doc.id,
            displayName: data.displayName || 'Anonymous',
            photoURL: data.photoURL || null,
            username: data.username,
            email: data.email,
          };
        })
        .filter(Boolean) as UserResult[];
      for (const variant of usernameVariants) {
        const usernameSnap = await usersRef
          .where('username', '==', variant)
          .limit(20)
          .get();
        usernameSnap.docs.forEach(doc => {
          const data = doc.data() || {};
          if (data.appRemoved === true) return;
          const user = {
            uid: doc.id,
            displayName: data.displayName || 'Anonymous',
            photoURL: data.photoURL || null,
            username: data.username,
            email: data.email,
          };
          if (!users.find(u => u.uid === user.uid)) {
            users.push(user);
          }
        });
      }
      setResults(users);
      if (users.length === 0) {
        // Fuzzy suggestions if no exact match
        const allSnap = await usersRef.limit(100).get();
        const allUsers: UserResult[] = allSnap.docs
          .map(doc => {
            const data = doc.data() || {};
            if (data.appRemoved === true) return null;
            return {
              uid: doc.id,
              displayName: data.displayName || 'Anonymous',
              photoURL: data.photoURL || null,
              username: data.username,
              email: data.email,
            };
          })
          .filter(Boolean) as UserResult[];
        const fuse = new Fuse(allUsers, {
          keys: ['displayName', 'username', 'email'],
          threshold: 0.4,
        });
        const fuzzyResults = fuse.search(query).map(res => res.item);
        setSuggestions(fuzzyResults.slice(0, 10));
        setError('No exact results. Did you mean:');
      } else {
        setSuggestions([]);
        setError(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setSuggestions([]);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderUser = ({ item }: { item: UserResult }) => (
    <Pressable
      style={styles.userItem}
      onPress={() => {
        onUserSelect(item);
        setSearchQuery('');
        setResults([]);
      }}
    >
      {item.photoURL ? (
        <Image source={{ uri: item.photoURL }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.fallbackEmoji}>🔥</Text>
        </View>
      )}
      <View style={styles.userInfo}>
        <Text style={styles.displayName}>{item.displayName}</Text>
        {item.username ? (
          <Text style={styles.username}>@{String(item.username).replace(/^[@/]+/, '')}</Text>
        ) : item.email ? (
          <Text style={styles.username}>{item.email}</Text>
        ) : null}
      </View>
      {(onJoinCrew || onInviteToDrift) && (
        <View style={styles.userActions}>
          {onJoinCrew && (
            <Pressable
              style={({ pressed }) => [
                styles.userActionButton,
                pressed && {
                  opacity: 0.8,
                  transform: [{ scale: 0.95 }],
                }
              ]}
              onPress={event => {
                event.stopPropagation?.();
                onJoinCrew(item);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.userActionText}>Connect</Text>
            </Pressable>
          )}
          {onInviteToDrift && (
            <InviteButton item={item} onInviteToDrift={onInviteToDrift} />
          )}
        </View>
      )}
    </Pressable>
  );

  // InviteButton component to prevent double-tap
function InviteButton({ item, onInviteToDrift }) {
  const [inviting, setInviting] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  return (
    <View>
      <Pressable
        style={({ pressed }) => [
          styles.userActionButton,
          pressed && {
            opacity: 0.8,
            transform: [{ scale: 0.95 }],
          },
          inviting && { backgroundColor: '#00C2FF', opacity: 0.6, borderColor: '#00C2FF' },
          inviting && { shadowColor: '#00C2FF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: 4 },
        ]}
        onPress={async event => {
          event.stopPropagation?.();
          if (inviting) return;
          setInviting(true);
          try {
            await onInviteToDrift(item);
            setShowBadge(true);
          } finally {
            setInviting(false);
          }
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        disabled={inviting}
      >
        {inviting ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={[styles.userActionText, { color: '#fff', fontWeight: 'bold' }]}>Inviting...</Text>
          </View>
        ) : (
          <Text style={styles.userActionText}>Invite</Text>
        )}
      </Pressable>
      {showBadge && (
        <InviteBadge
          onJoin={() => {
            setShowBadge(false);
            // Add join logic here if needed
          }}
          onMiss={() => {
            setShowBadge(false);
            // Add miss logic here if needed
          }}
        />
      )}
    </View>
  );
}

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
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
  userActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  userActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  userActionText: {
    color: '#00C2FF',
    fontWeight: '600',
    fontSize: 12,
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
    backgroundColor: 'rgba(0, 194, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackEmoji: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00C2FF',
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
});

export default UserSearch;
