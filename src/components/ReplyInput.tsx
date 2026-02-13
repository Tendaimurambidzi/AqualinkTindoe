import React, { useState } from 'react';
import { View, TextInput, Pressable, Text } from 'react-native';

interface ReplyInputProps {
  value?: string;
  onChange?: (text: string) => void;
  onSend: () => void;
  onCancel: () => void;
  placeholder?: string;
  sending?: boolean;
}

const ReplyInput: React.FC<ReplyInputProps> = ({
  value = '',
  onChange,
  onSend,
  onCancel,
  placeholder = 'Write a reply...',
  sending = false,
}) => {
  return (
    <View style={{ marginBottom: 8, padding: 8, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 8, borderWidth: 1, borderColor: '#ddd' }}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        multiline
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8, minHeight: 60, marginBottom: 8, paddingTop: 8 }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Pressable
          onPress={onCancel}
          style={{ paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#ccc', borderRadius: 4 }}
        >
          <Text style={{ color: 'black', fontSize: 12 }}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={onSend}
          disabled={sending}
          style={{ paddingVertical: 6, paddingHorizontal: 12, backgroundColor: sending ? '#aaa' : '#00C2FF', borderRadius: 4 }}
        >
          <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>{sending ? 'Sending...' : 'Send'}</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ReplyInput;
