import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadPost } from '../services/uploadPost';
import type { SimpleMedia } from '../services/uploadPost';

const mediaEditorItems = [
  { id: 'music', icon: 'dYZæ', label: 'Music' },
  { id: 'filters', icon: 'dYZ"', label: 'Filters' },
  { id: 'overlays', icon: 'dY-¬‹,?', label: 'Overlays' },
  { id: 'trim', icon: 'ƒo,‹,?', label: 'Trim' },
  { id: 'comment', icon: 'dY\'ª', label: 'Comment' },
];

const CreatePostScreen = ({ navigation }: any) => {
  const [caption, setCaption] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<SimpleMedia | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePickMedia = () => {
    launchImageLibrary(
      { mediaType: 'mixed', selectionLimit: 1 },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Could not pick file');
          return;
        }

        const asset = response.assets && response.assets[0];
        if (asset?.uri) {
          setSelectedMedia({
            uri: asset.uri,
            fileName: asset.fileName || null,
            type: asset.type || null,
          });
        } else {
          Alert.alert('Error', 'No file selected');
        }
      },
    );
  };

  const handleUpload = async () => {
    if (!selectedMedia && !caption.trim()) {
      Alert.alert(
        'Missing content',
        'Pick a photo/video or write something before posting.',
      );
      return;
    }

    try {
      setUploading(true);
      await uploadPost({
        media: selectedMedia ?? undefined,
        caption: caption.trim(),
      });
      setUploading(false);
      setCaption('');
      setSelectedMedia(null);
      Alert.alert('Success', 'Your post was uploaded.');

      if (navigation?.goBack) {
        navigation.goBack();
      }
    } catch (err: any) {
      console.warn(err);
      setUploading(false);
      Alert.alert(
        'Upload failed',
        err?.message || 'Could not upload your post. Please try again.',
      );
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>Create Post</Text>

      <TextInput
        placeholder="Say something..."
        value={caption}
        onChangeText={setCaption}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 8,
          marginBottom: 12,
        }}
        multiline
      />

      {selectedMedia ? (
        <>
          <Image
            source={{ uri: selectedMedia.uri }}
            style={{
              width: '100%',
              height: 250,
              marginBottom: 12,
              borderRadius: 8,
            }}
            resizeMode="cover"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mediaEditorRow}
          >
            {mediaEditorItems.map(item => (
              <Pressable
                key={item.id}
                style={styles.mediaEditorItem}
                onPress={() =>
                  Alert.alert(item.label, 'Media editor coming soon.')
                }
              >
                <Text style={styles.mediaEditorIcon}>{item.icon}</Text>
                <Text style={styles.mediaEditorLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </>
      ) : (
        <Text style={{ marginBottom: 12 }}>No media selected</Text>
      )}

      <Button title="Pick Photo / Video" onPress={handlePickMedia} />

      <View style={{ height: 12 }} />

      {uploading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Post" onPress={handleUpload} />
      )}
    </View>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  mediaEditorRow: {
    gap: 12,
    marginBottom: 12,
  },
  mediaEditorItem: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  mediaEditorIcon: {
    fontSize: 20,
    color: 'white',
  },
  mediaEditorLabel: {
    color: 'white',
    fontSize: 11,
    marginTop: 4,
  },
});
