import branch from 'react-native-branch';
import { Share } from 'react-native';

export const shareDriftLink = async (docId: string, channel: string, title: string) => {
  try {
    // Create a Branch link
    const buo = await branch.createBranchUniversalObject('drift/' + docId, {
      title: `Join the drift: ${title}`,
      contentDescription: 'Dive into this ocean adventure!',
      contentMetadata: {
        customMetadata: {
          docId,
          channel,
        },
      },
    });

    const linkProperties = {
      feature: 'share',
      channel: 'app',
    };

    const controlParams = {
      $desktop_url: `https://tendaimurambidzi.github.io/AqualinkTindoe/drift?docId=${docId}&channel=${channel}`,
      $ios_url: 'https://apps.apple.com/app/your-app-id', // Replace with your App Store URL
      $android_url: 'https://play.google.com/store/apps/details?id=com.aqualink.tindo', // Replace with your Play Store URL
    };

    const { url } = await buo.generateShortUrl(linkProperties, controlParams);

    // Share the link
    await Share.share({
      message: `Check out this drift: ${url}`,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sharing drift link:', error);
    return { success: false, error };
  }
};