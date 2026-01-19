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
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { uploadPost } from '../services/uploadPost';
import type { SimpleMedia } from '../services/uploadPost';
import auth from '@react-native-firebase/auth';

const mediaEditorItems = [
  { id: 'music', icon: 'dYZæ', label: 'Music' },
  { id: 'filters', icon: 'dYZ"', label: 'Filters' },
  { id: 'overlays', icon: 'dY-¬‹,?', label: 'Overlays' },
  { id: 'trim', icon: 'ƒo,‹,?', label: 'Trim' },
  { id: 'comment', icon: 'dY\'ª', label: 'Comment' },
];

const CreatePostScreen = ({ navigation, route }: any) => {
  const [caption, setCaption] = useState('');
  const [link, setLink] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<SimpleMedia | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const onPostPublished: ((wave: any) => void) | undefined =
    route?.params?.onPostPublished;

  const handlePickMedia = () => {
    launchImageLibrary(
      { mediaType: 'mixed', selectionLimit: 1 },
      async response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Could not pick file');
          return;
        }

        const asset = response.assets && response.assets[0];
        if (!asset?.uri) {
          Alert.alert('Error', 'No file selected');
          return;
        }

        // Check if it's a video and validate duration
        if (asset.type?.startsWith('video/')) {
          try {
            // Get video duration using react-native-video
            // We'll create a temporary video element to get duration
            const RNVideo = require('react-native-video').default;
            
            // For now, we'll use a simple approach - check file size as a proxy
            // Videos longer than 30 seconds are typically much larger
            // A more accurate approach would require native video metadata reading
            
            // For better accuracy, let's try to get duration from the asset if available
            const duration = asset.duration || 0;
            
            if (duration > 30) {
              Alert.alert(
                'Video Too Long',
                `Your video is ${duration.toFixed(1)} seconds long. Please select a video that is 30 seconds or shorter.`,
                [
                  { text: 'Choose Different Video', style: 'default' },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
              return;
            }
            
            // If duration is not available from asset, we'll allow it for now
            // In a production app, you'd want more robust duration checking
            
          } catch (error) {
            console.error('Video duration check error:', error);
            // If we can't check duration, allow the video but warn the user
            Alert.alert(
              'Video Upload',
              'Please ensure your video is 30 seconds or shorter. Longer videos may not upload properly.',
              [{ text: 'OK' }]
            );
          }
        }

        // Set the selected media
        setSelectedMedia({
          uri: asset.uri,
          fileName: asset.fileName || null,
          type: asset.type || null,
        });
      },
    );
  };

  const handleUpload = async () => {
    const trimmedCaption = caption.trim();
    if (!selectedMedia && !trimmedCaption) {
      Alert.alert(
        'Missing content',
        'Pick a photo/video or write something before posting.',
      );
      return;
    }

    const selected = selectedMedia;

    // Clear the form immediately for better UX
    setCaption('');
    setSelectedMedia(null);
    setLink('');

    try {
      setUploading(true);
      const result = await uploadPost({
        media: selected ?? undefined,
        caption: trimmedCaption,
        link: link.trim() || undefined,
        authorName: auth().currentUser?.displayName || null,
      });

      const waveUri = result.mediaUrl || selected?.uri;
      if (waveUri && onPostPublished) {
        const asset: Asset = {
          uri: waveUri,
          type: selected?.type || 'video/mp4',
          fileName: selected?.fileName || undefined,
        };
        try {
          onPostPublished({
            id: result.id,
            media: asset,
            audio: null,
            captionText: trimmedCaption,
            captionPosition: { x: 0, y: 0 },
            playbackUrl: selected?.type?.startsWith('image/') ? result.mediaUrl : null, // Use remote URL for images, local for videos until streaming is implemented
            muxStatus: null,
            authorName: auth().currentUser?.displayName || null,
            ownerUid: auth().currentUser?.uid || null,
          });
        } catch (callbackError) {
          console.warn('Post feed callback failed', callbackError);
        }
      }

      setUploading(false);

      if (navigation?.goBack) {
        navigation.goBack();
      }
    } catch (err: any) {
      console.warn(err);
      setUploading(false);
      // Restore the cleared content on error
      setCaption(trimmedCaption);
      setSelectedMedia(selected);
      setLink(link.trim());
      Alert.alert(
        'Upload failed',
        err?.message || 'Could not upload your post. Please try again.',
      );
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#f0f2f5' }}>
      <Text style={{ fontSize: 18, marginBottom: 8, fontWeight: 'bold' }}>Create Post</Text>

      <TextInput
        placeholder="What's on your mind?"
        value={caption}
        onChangeText={setCaption}
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
          backgroundColor: 'white',
          minHeight: 80,
          textAlignVertical: 'top',
        }}
        multiline
      />

      {showLinkInput && (
        <TextInput
          placeholder="Paste link here..."
          value={link}
          onChangeText={setLink}
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            padding: 8,
            marginBottom: 12,
            backgroundColor: 'white',
          }}
        />
      )}

      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        <Pressable
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 8,
            marginRight: 16,
          }}
          onPress={handlePickMedia}
        >
          <Text style={{ fontSize: 20, marginRight: 8 }}>📷</Text>
          <Text>Photo/Video</Text>
        </Pressable>
        <Pressable
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 8,
          }}
          onPress={() => setShowLinkInput(!showLinkInput)}
        >
          <Text style={{ fontSize: 20, marginRight: 8 }}>🔗</Text>
          <Text>Link</Text>
        </Pressable>
      </View>

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
        <Text style={{ marginBottom: 12, color: '#666' }}>No media selected</Text>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        {uploading ? (
          <ActivityIndicator />
        ) : (
          <Pressable
            style={{
              backgroundColor: '#1877f2',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 6,
            }}
            onPress={handleUpload}
            disabled={!selectedMedia && !caption.trim()}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Post</Text>
          </Pressable>
        )}
      </View>
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
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(0,0,0,0.35)',
    flexShrink: 0,
    minWidth: 0,
    width: 'auto',
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
