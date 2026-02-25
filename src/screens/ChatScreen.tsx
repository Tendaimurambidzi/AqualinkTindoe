import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';

interface ChatScreenProps {
  route: { params: { userId: string; username: string } };
  navigation: any;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const { userId, username } = route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const currentUser = firestore().app.auth().currentUser;
  const chatId = [currentUser.uid, userId].sort().join('_');

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .onSnapshot(snapshot => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    return unsubscribe;
  }, [chatId]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    await firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .add({
        text: input,
        from: currentUser.uid,
        to: userId,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
    // Trigger VIBE ALERT for recipient
    try {
      const app = require('../../App');
      if (app && app.showVibeAlert) {
        app.showVibeAlert({
          hostUid: currentUser.uid,
          liveId: chatId,
          hostName: currentUser.displayName || 'You',
          hostPhoto: currentUser.photoURL || null,
        });
      }
    } catch (e) {
      // fallback: do nothing
    }
    setInput('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chat with {username}</Text>
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.message, item.from === currentUser.uid ? styles.myMessage : styles.theirMessage]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        style={styles.messagesList}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
        />
        <Pressable style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 18, fontWeight: 'bold', padding: 16, backgroundColor: '#00C2FF', color: '#fff' },
  messagesList: { flex: 1, padding: 16 },
  message: { padding: 10, borderRadius: 8, marginVertical: 4, maxWidth: '80%' },
  myMessage: { backgroundColor: '#00C2FF', alignSelf: 'flex-end' },
  theirMessage: { backgroundColor: '#eee', alignSelf: 'flex-start' },
  messageText: { color: '#222' },
  inputRow: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fafafa' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginRight: 8 },
  sendBtn: { backgroundColor: '#00C2FF', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' },
  sendText: { color: '#fff', fontWeight: 'bold' },
});

export default ChatScreen;
