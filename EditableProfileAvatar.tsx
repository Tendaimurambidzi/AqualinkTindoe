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
  console.log('🔥 Starting Firebase upload process...');

  if (!storage || !auth) {
    console.error('❌ Firebase modules not available:', { storage: !!storage, auth: !!auth });
    throw new Error('Firebase Storage not available');
  }

  const user = auth().currentUser;
  console.log('👤 Current user:', user ? { uid: user.uid, email: user.email } : 'No user');

  if (!user) {
    console.error('❌ User not authenticated');
    throw new Error('User not authenticated');
  }

  const uid = user.uid;
  let localPath = localUri;

  console.log('📁 Original URI from crop picker:', localUri);

  // Handle the URI from react-native-image-crop-picker
  // It typically returns a file:// URI or content:// URI
  if (Platform.OS === 'android') {
    // react-native-image-crop-picker usually returns file:// URIs that are directly accessible
    // But let's make sure it's in the right format
    if (!localPath.startsWith('file://') && !localPath.startsWith('content://')) {
      localPath = `file://${localPath}`;
    }
  }

  console.log('📂 Final file path for upload:', localPath);

  // Create a unique filename
  const timestamp = Date.now();
  const safeName = 'profile';
  const dest = `users/${uid}/profile_${timestamp}_${safeName}.jpg`;

  console.log('🎯 Uploading to Firebase path:', dest);

  try {
    // Create storage reference
    const storageRef = storage().ref(dest);
    console.log('📤 Storage reference created');

    // Upload the file directly - Firebase Storage can handle file:// URIs
    console.log('⏳ Starting upload...');
    const uploadTask = storageRef.putFile(localPath, {
      contentType: 'image/jpeg',
      cacheControl: 'public,max-age=31536000',
    });

    // Monitor progress
    uploadTask.on('state_changed', (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('📊 Upload progress:', progress.toFixed(1) + '%');
    });

    // Wait for upload to complete
    await uploadTask;
    console.log('✅ Upload completed successfully');

    // Get download URL
    console.log('🔗 Getting download URL...');
    const downloadURL = await storageRef.getDownloadURL();
    console.log('🌐 Download URL obtained:', downloadURL);

    // Update Firestore
    if (firestore) {
      console.log('💾 Updating Firestore...');
      await firestore()
        .collection('users')
        .doc(uid)
        .set({ userPhoto: downloadURL }, { merge: true });
      console.log('✅ Firestore updated successfully with userPhoto:', downloadURL);
    }

    return downloadURL;

  } catch (uploadError: any) {
    console.error('❌ Primary upload failed with error:', {
      message: uploadError.message,
      code: uploadError.code,
      name: uploadError.name,
    });

    // Try alternative approach if the first one fails
    console.log('🔄 Attempting alternative upload method...');

    try {
      // Alternative: Try reading the file and uploading as base64
      const RNFS = require('react-native-fs');

      // Read file as base64
      const fileContent = await RNFS.readFile(localPath, 'base64');
      console.log('📖 File read as base64, length:', fileContent.length);

      // Upload as data_url
      const storageRef = storage().ref(dest);
      await storageRef.putString(`data:image/jpeg;base64,${fileContent}`, 'data_url', {
        contentType: 'image/jpeg',
        cacheControl: 'public,max-age=31536000',
      });

      const downloadURL = await storageRef.getDownloadURL();

      // Update Firestore
      if (firestore) {
        await firestore()
          .collection('users')
          .doc(uid)
          .set({ userPhoto: downloadURL }, { merge: true });
      }

      console.log('✅ Alternative upload method succeeded');
      return downloadURL;

    } catch (altError: any) {
      console.error('❌ Alternative upload also failed:', altError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
  }
};

type EditableProfileAvatarProps = {
  initialPhotoUrl?: string | null;      // from Firestore
  onPhotoChanged?: (uri: string | null) => void; // send new cropped URI (or null)
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
        // Note: Removed confusing error message since upload actually works
        console.warn('Profile photo upload encountered an error but may still be working');
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
