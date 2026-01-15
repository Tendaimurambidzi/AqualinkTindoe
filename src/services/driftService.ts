import functions from '@react-native-firebase/functions';
import { Share } from 'react-native';

export const shareDriftLink = async (docId: string, channel: string, title: string) => {
  try {
    // Call Firebase Function to generate link
    const result = await functions().httpsCallable('generateShareLink')({
      docId,
      channel,
      title,
    });

    const link = result.data.link;

    // Share the link
    await Share.share({
      message: `Check out this drift: ${link}`,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sharing drift link:', error);
    return { success: false, error };
  }
};