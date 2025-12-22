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

  // Handle file:// prefix for Android
  if (Platform.OS === 'android' && localPath.startsWith('file://')) {
    localPath = localPath.replace('file://', '');
  }

  // Decode URI if needed
  try {
    localPath = decodeURI(localPath);
  } catch {}

  // Create a unique filename
  const timestamp = Date.now();
  const safeName = 'profile';
  const dest = `users/${uid}/profile_${timestamp}_${safeName}.jpg`;

  // Upload file
  const storageRef = storage().ref(dest);
  await storageRef.putFile(localPath, { contentType: 'image/jpeg' });

  // Get download URL
  const downloadURL = await storageRef.getDownloadURL();

  // Update Firestore
  if (firestore) {
    await firestore()
      .collection('users')
      .doc(uid)
      .set({ userPhoto: downloadURL }, { merge: true });
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
      } catch (uploadError) {
        console.error('Failed to upload profile photo:', uploadError);
        // Fallback to local URI if upload fails
        setPhotoUrl(croppedUri);
        onPhotoChanged?.(croppedUri);
        Alert.alert('Upload Failed', 'Photo saved locally. It may not be visible to other users.');
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
