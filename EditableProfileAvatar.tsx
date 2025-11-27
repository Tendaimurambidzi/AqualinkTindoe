import React, { useState } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import ImageCropPicker, {
  Image as CropImage,
} from 'react-native-image-crop-picker';

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

      // 1️⃣ Upload croppedUri to Firebase Storage here if you want
      // const downloadUrl = await uploadProfilePhotoToFirebase(croppedUri);

      const finalUri = croppedUri; // or downloadUrl after upload

      setPhotoUrl(finalUri);
      onPhotoChanged?.(finalUri);
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
      // 2️⃣ Optional: delete from Storage here if you stored it there
      // await deleteProfilePhotoFromFirebase(photoUrl);

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
