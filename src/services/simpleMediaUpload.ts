// Simple, Reliable Media Upload Service
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export interface SimpleMedia {
  uri: string;
  fileName?: string | null;
  type?: string | null; // e.g. "image/jpeg" or "video/mp4"
}

interface UploadResult {
  downloadUrl: string;
  storagePath: string;
}

/**
 * Simple, reliable media upload function
 * Uploads media to Firebase Storage and returns download URL
 */
export const uploadMediaToStorage = async (
  media: SimpleMedia,
  userId: string
): Promise<UploadResult> => {
  try {
    // Validate inputs
    if (!media?.uri) {
      throw new Error('Media URI is required');
    }
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = media.fileName?.split('.').pop() || 
                          (media.type?.includes('video') ? 'mp4' : 'jpg');
    const fileName = `${userId}_${timestamp}_${randomId}.${fileExtension}`;
    
    // Create storage reference
    const storageRef = storage().ref(`media/${userId}/${fileName}`);
    
    console.log('Starting media upload:', {
      fileName,
      mediaType: media.type,
      fileSize: 'Unknown'
    });

    // Upload file to Firebase Storage
    const uploadTask = await storageRef.putFile(media.uri, {
      contentType: media.type || 'application/octet-stream'
    });

    console.log('Upload completed successfully:', uploadTask.metadata);

    // Get download URL
    const downloadUrl = await storageRef.getDownloadURL();

    return {
      downloadUrl,
      storagePath: storageRef.fullPath
    };

  } catch (error) {
    console.error('Media upload failed:', error);
    throw new Error(`Failed to upload media: ${error.message}`);
  }
};

/**
 * Simple post creation with media
 */
export const createPostWithMedia = async (
  media: SimpleMedia | null,
  caption: string,
  authorName?: string,
  destination?: 'public' | 'fleet' | 'private',
  fleetId?: string | null,
  fleetName?: string | null,
  privateRecipientUids?: string[] | null
) => {
  try {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('User must be authenticated');
    }

    let mediaUrl = '';
    let mediaType = '';
    let storagePath = '';

    // Upload media if provided
    if (media && media.uri) {
      const uploadResult = await uploadMediaToStorage(media, user.uid);
      mediaUrl = uploadResult.downloadUrl;
      mediaType = media.type || '';
      storagePath = uploadResult.storagePath;
    }

    // Create post document
    const postRef = await firestore().collection('waves').add({
      authorUid: user.uid,
      authorName: authorName || user.displayName || 'Anonymous',
      caption: caption.trim(),
      media: mediaUrl ? {
        uri: mediaUrl,
        type: mediaType,
        storagePath: storagePath
      } : null,
      mediaItems: mediaUrl ? [{
        uri: mediaUrl,
        type: mediaType
      }] : null,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
      counts: {
        hugs: 0,
        echoes: 0,
        splashes: 0
      },
      audience: destination === 'fleet' ? 'fleet' : destination === 'private' ? 'private' : 'public',
      isPublic: destination === 'public',
      fleetId: destination === 'fleet' ? fleetId || null : null,
      fleetName: destination === 'fleet' ? fleetName || null : null,
      privateRecipientUids: destination === 'private' ? privateRecipientUids : null,
      isActive: true
    });

    console.log('Post created successfully:', postRef.id);

    return {
      id: postRef.id,
      media: mediaUrl ? {
        uri: mediaUrl,
        type: mediaType,
        storagePath: storagePath
      } : null,
      mediaItems: mediaUrl ? [{
        uri: mediaUrl,
        type: mediaType
      }] : null,
      caption: caption.trim(),
      authorName: authorName || user.displayName || 'Anonymous',
      authorUid: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
      counts: {
        hugs: 0,
        echoes: 0,
        splashes: 0
      },
      audience: destination === 'fleet' ? 'fleet' : destination === 'private' ? 'private' : 'public',
      isPublic: destination === 'public',
      fleetId: destination === 'fleet' ? fleetId || null : null,
      fleetName: destination === 'fleet' ? fleetName || null : null,
      privateRecipientUids: destination === 'private' ? privateRecipientUids : null,
      isActive: true
    };

  } catch (error) {
    console.error('Post creation failed:', error);
    throw new Error(`Failed to create post: ${error.message}`);
  }
};

/**
 * Delete media from storage
 */
export const deleteMediaFromStorage = async (storagePath: string): Promise<void> => {
  try {
    const storageRef = storage().ref(storagePath);
    await storageRef.delete();
    console.log('Media deleted successfully:', storagePath);
  } catch (error) {
    console.error('Failed to delete media:', error);
    throw new Error(`Failed to delete media: ${error.message}`);
  }
};

/**
 * Update post with new media
 */
export const updatePostMedia = async (
  postId: string,
  newMedia: SimpleMedia | null,
  userId: string
) => {
  try {
    const postRef = firestore().collection('waves').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      throw new Error('Post not found');
    }

    const postData = postDoc.data();
    
    // Delete old media if exists
    if (postData?.media?.storagePath) {
      await deleteMediaFromStorage(postData.media.storagePath);
    }

    let mediaUrl = '';
    let mediaType = '';
    let storagePath = '';

    // Upload new media if provided
    if (newMedia && newMedia.uri) {
      const uploadResult = await uploadMediaToStorage(newMedia, userId);
      mediaUrl = uploadResult.downloadUrl;
      mediaType = newMedia.type || '';
      storagePath = uploadResult.storagePath;
    }

    // Update post
    await postRef.update({
      media: mediaUrl ? {
        uri: mediaUrl,
        type: mediaType,
        storagePath: storagePath
      } : null,
      mediaItems: mediaUrl ? [{
        uri: mediaUrl,
        type: mediaType
      }] : null,
      updatedAt: firestore.FieldValue.serverTimestamp()
    });

    console.log('Post media updated successfully:', postId);

  } catch (error) {
    console.error('Failed to update post media:', error);
    throw new Error(`Failed to update post media: ${error.message}`);
  }
};

export default {
  uploadMediaToStorage,
  createPostWithMedia,
  deleteMediaFromStorage,
  updatePostMedia
};
