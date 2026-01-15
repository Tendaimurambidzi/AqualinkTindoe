import dynamicLinks from '@react-native-firebase/dynamic-links';
import { Share } from 'react-native';

export const shareDriftLink = async (docId: string, channel: string, title: string) => {
  try {
    // Create a dynamic link
    const link = await dynamicLinks().buildShortLink({
      link: `https://tendaimurambidzi.github.io/AqualinkTindoe/drift?docId=${docId}&channel=${channel}`,
      domainUriPrefix: 'https://aqualinktindoe.page.link', // Your Firebase Dynamic Links domain
      android: {
        packageName: 'com.aqualink.tindo', // Your Android package name
      },
      ios: {
        bundleId: 'com.aqualink.tindo', // Your iOS bundle ID
      },
      social: {
        title: `Join the drift: ${title}`,
        descriptionText: 'Dive into this ocean adventure!',
      },
    });

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