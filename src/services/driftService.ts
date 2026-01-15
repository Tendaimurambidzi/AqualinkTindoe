import { Share } from 'react-native';

export const shareDriftLink = async (docId: string, channel: string, title: string) => {
  try {
    const link = `https://tendaimurambidzi.github.io/AqualinkTindoe/drift?docId=${docId}&channel=${channel}`;

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