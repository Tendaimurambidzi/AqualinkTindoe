import React, { useState } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import ImageCropPicker, {
  Image as CropImage,
} from 'react-native-image-crop-picker';

// Add Firebase imports
let storage: any = null;
let auth: any = null;
let firestore: any = null;

try {
  storage = require('@react-native-firebase/storage').default;
} catch {}

try {
  auth = require('@react-native-firebase/auth').default;
} catch {}

try {
  firestore = require('@react-native-firebase/firestore').default;
} catch {}

const uploadProfilePhotoToFirebase = async (localUri: string): Promise<string> => {
  if (!storage || !auth) {
    throw new Error('Firebase Storage not available');
  }

  const user = auth().currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  const uid = user.uid;
  let localPath = localUri;

  console.log('Original URI:', localUri);

  // Handle different URI formats from ImageCropPicker
  if (Platform.OS === 'android') {
    // Remove file:// prefix if present
    if (localPath.startsWith('file://')) {
      localPath = localPath.replace('file://', '');
    }
    // Handle content:// URIs by copying to a temp file
    if (localPath.startsWith('content://')) {
      // For content:// URIs, we need to copy the file to a temp location
      // This is handled by react-native-image-crop-picker, so the path should be accessible
      console.log('Content URI detected, using as-is:', localPath);
    }
  } else if (Platform.OS === 'ios') {
    // iOS typically uses file:// prefix
    if (!localPath.startsWith('file://')) {
      localPath = `file://${localPath}`;
    }
  }

  // Decode URI if needed
  try {
    localPath = decodeURI(localPath);
  } catch {}

  console.log('Processed path:', localPath);

  // Create a unique filename
  const timestamp = Date.now();
  const safeName = 'profile';
  const dest = `users/${uid}/profile_${timestamp}_${safeName}.jpg`;

  console.log('Uploading to:', dest);

  // Upload file with proper metadata
  const storageRef = storage().ref(dest);
  const uploadTask = storageRef.putFile(localPath, {
    contentType: 'image/jpeg',
    cacheControl: 'public,max-age=31536000',
  });

  // Monitor upload progress
  uploadTask.on('state_changed', (snapshot) => {
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload progress:', progress + '%');
  });

  await uploadTask;

  // Get download URL
  const downloadURL = await storageRef.getDownloadURL();
  console.log('Download URL:', downloadURL);

  // Update Firestore
  if (firestore) {
    await firestore()
      .collection('users')
      .doc(uid)
      .set({ userPhoto: downloadURL }, { merge: true });
    console.log('Firestore updated with photo URL');
  }

  return downloadURL;
};

type EditableProfileAvatarProps = {
  initialPhotoUrl?: string | null;      // from Firestore
  onPhotoChanged?: (uri: string | null) => void; // send new cropped URI (or null) to parent
};

const EditableProfileAvatar: React.FC<EditableProfileAvatarProps> = ({
  initialPhotoUrl,
  onPhotoChanged,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    initialPhotoUrl ?? null
  );

  const openPickerWithCrop = async () => {
    try {
      // square crop for headshot; you can change width/height
      const img: CropImage = await ImageCropPicker.openPicker({
        mediaType: 'photo',
        cropping: true,          // 👈 enables MOVABLE crop box
        width: 500,              // output size
        height: 500,
        compressImageQuality: 0.9,
        cropperCircleOverlay: true, // optional: circular avatar preview
      });

      const croppedUri = img.path;

      // Upload to Firebase Storage immediately
      try {
        const downloadUrl = await uploadProfilePhotoToFirebase(croppedUri);
        setPhotoUrl(downloadUrl);
        onPhotoChanged?.(downloadUrl);
        Alert.alert('Success', 'Profile photo updated and visible to other users!');
      } catch (uploadError) {
        console.error('Failed to upload profile photo:', uploadError);
        // Don't fallback to local URI - show error and keep old photo
        Alert.alert(
          'Upload Failed',
          'Could not upload photo to server. Please check your connection and try again.',
          [{ text: 'OK' }]
        );
        // Keep the old photo URL
      }
    } catch (err: any) {
      if (err?.code === 'E_PICKER_CANCELLED') {
        return; // user cancelled, ignore
      }
      console.warn('Crop picker error', err);
      Alert.alert('Error', 'Could not pick image.');
    }
  };

  const confirmRemove = () => {
    Alert.alert(
      'Remove profile photo?',
      '',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: handleRemove,
        },
      ],
      { cancelable: true }
    );
  };

  const handleRemove = async () => {
    try {
      // Delete from Firebase Storage if it's a Firebase URL
      if (photoUrl && photoUrl.includes('firebasestorage.googleapis.com')) {
        try {
          // Extract the path from the Firebase Storage URL
          const urlParts = photoUrl.split('/o/')[1];
          if (urlParts) {
            const path = decodeURIComponent(urlParts.split('?')[0]);
            await storage().ref(path).delete();
          }
        } catch (storageError) {
          console.warn('Failed to delete from storage:', storageError);
          // Continue with removal even if storage delete fails
        }
      }

      // Update Firestore
      if (firestore && auth) {
        const user = auth().currentUser;
        if (user) {
          await firestore()
            .collection('users')
            .doc(user.uid)
            .set({ userPhoto: null }, { merge: true });
        }
      }

      setPhotoUrl(null);
      onPhotoChanged?.(null);
    } catch (e) {
      console.warn('Remove failed', e);
      Alert.alert('Error', 'Could not remove photo.');
    }
  };

  const openAvatarOptions = () => {
    Alert.alert(
      'Profile picture',
      '',
      [
        {
          text: 'Change / Edit photo',
          onPress: openPickerWithCrop,   // 👈 opens movable cropper
        },
        {
          text: 'Remove photo',
          style: 'destructive',
          onPress: confirmRemove,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={openAvatarOptions} activeOpacity={0.8}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Tap to add photo</Text>
          </View>
        )}
      </TouchableOpacity>
      {/* Removed label as requested */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#0099ff',
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef6ff',
  },
  placeholderText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
  label: {
    marginTop: 8,
    fontSize: 12,
    color: '#777',
  },
});

export default EditableProfileAvatar;
