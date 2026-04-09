import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const CreatePostScreen = ({ navigation, route }: any) => {
  const setCapturedMedia = route?.params?.setCapturedMedia;
  const handleSDCardPicker = route?.params?.handleSDCardPicker;

  const handleCamera = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'mixed',
        saveToPhotos: true,
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Camera failed');
        return;
      }

      const asset = result.assets?.[0];
      if (asset?.uri && setCapturedMedia) {
        setCapturedMedia(asset);
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const handleGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'mixed',
        selectionLimit: 1,
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Gallery failed');
        return;
      }

      const asset = result.assets?.[0];
      if (asset?.uri && setCapturedMedia) {
        setCapturedMedia(asset);
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const handleSDCard = async () => {
    if (handleSDCardPicker) {
      await handleSDCardPicker();
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Media Source</Text>

      <Pressable style={styles.button} onPress={handleCamera}>
        <Text style={styles.icon}>📷</Text>
        <Text style={styles.label}>Camera</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={handleGallery}>
        <Text style={styles.icon}>🖼️</Text>
        <Text style={styles.label}>Gallery</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={handleSDCard}>
        <Text style={styles.icon}>💾</Text>
        <Text style={styles.label}>SD Card</Text>
      </Pressable>

      <Pressable style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </View>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#0A1929',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  icon: {
    fontSize: 32,
    marginRight: 16,
  },
  label: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 16,
    padding: 16,
    alignItems: 'center',
  },
  cancelText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
});
