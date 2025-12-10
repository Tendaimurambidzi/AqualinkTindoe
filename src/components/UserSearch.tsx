import React, { useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

type UserResult = {
  uid: string;
  displayName: string;
  photoURL: string | null;
  username?: string;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setError(null);
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }
    setLoading(true);
    try {
      const usersRef = firestore().collection('users');
      let searchTerm = query.trim();
      let usernameVariants = [searchTerm];
      if (!searchTerm.startsWith('/')) {
        usernameVariants.push('/' + searchTerm);
      } else {
        usernameVariants.push(searchTerm.replace(/^\//, ''));
      }
      const displayNameSnap = await usersRef
        .where('displayName', '>=', searchTerm)
        .where('displayName', '<=', searchTerm + '\uf8ff')
        .limit(20)
        .get();
      let users: UserResult[] = displayNameSnap.docs.map(doc => ({
        uid: doc.id,
        displayName: doc.data().displayName || 'Anonymous',
        photoURL: doc.data().photoURL || null,
        username: doc.data().username,
      }));
      for (const variant of usernameVariants) {
        const usernameSnap = await usersRef
          .where('username', '==', variant)
          .limit(20)
          .get();
        usernameSnap.docs.forEach(doc => {
          const user = {
            uid: doc.id,
            displayName: doc.data().displayName || 'Anonymous',
            photoURL: doc.data().photoURL || null,
            username: doc.data().username,
          };
          if (!users.find(u => u.uid === user.uid)) {
            users.push(user);
          }
        });
      }
      setResults(users);
      if (users.length === 0) {
        setResults([]);
        setError('No results found. Please check your search or try again.');
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
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
      <Image
        source={{ uri: item.photoURL || 'https://via.placeholder.com/50' }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.displayName}>{item.displayName}</Text>
        {item.username && (
          <Text style={styles.username}>@{item.username}</Text>
        )}
      </View>
      {(onJoinCrew || onInviteToDrift) && (
        <View style={styles.userActions}>
          {onJoinCrew && (
            <Pressable
              style={styles.userActionButton}
              onPress={event => {
                event.stopPropagation?.();
                onJoinCrew(item);
              }}
            >
              <Text style={styles.userActionText}>Join Crew</Text>
            </Pressable>
          )}
          {onInviteToDrift && (
            <Pressable
              style={styles.userActionButton}
              onPress={event => {
                event.stopPropagation?.();
                onInviteToDrift(item);
              }}
            >
              <Text style={styles.userActionText}>Invite</Text>
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Vibers..."
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {loading && <ActivityIndicator size="small" color="#00C2FF" />}
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
