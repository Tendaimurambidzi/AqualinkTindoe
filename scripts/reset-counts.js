const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../firebase/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://drift-3d6b0-default-rtdb.firebaseio.com'
});

const db = admin.firestore();

async function resetCounts() {
  console.log('Starting count reset...');

  try {
    // Reset all user stats (splashesMade and hugsMade to 0, keep other stats)
    console.log('Resetting user stats...');
    const usersSnapshot = await db.collection('users').get();

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const currentStats = userData.stats || {};

      await userDoc.ref.update({
        stats: {
          ...currentStats,
          splashesMade: 0,
          hugsMade: 0,
          // Keep other stats like hugsWithdrawn, etc.
        }
      });
      console.log(`Reset stats for user: ${userDoc.id}`);
    }

    // Reset all wave counts (splashes, hugs, regularSplashes to 0, keep echoes and other counts)
    console.log('Resetting wave counts...');
    const wavesSnapshot = await db.collection('waves').get();

    for (const waveDoc of wavesSnapshot.docs) {
      const waveData = waveDoc.data();
      const currentCounts = waveData.counts || {};

      await waveDoc.ref.update({
        counts: {
          ...currentCounts,
          splashes: 0,
          hugs: 0,
          regularSplashes: 0,
          echoes: 0,
          // Reset echoes to 0 as well
        }
      });
      console.log(`Reset counts for wave: ${waveDoc.id}`);
    }

    // Delete all splash documents from waves/{waveId}/splashes collections
    console.log('Deleting all splash records...');
    for (const waveDoc of wavesSnapshot.docs) {
      const splashesSnapshot = await waveDoc.ref.collection('splashes').get();
      const batch = db.batch();

      splashesSnapshot.docs.forEach((splashDoc) => {
        batch.delete(splashDoc.ref);
      });

      if (splashesSnapshot.docs.length > 0) {
        await batch.commit();
        console.log(`Deleted ${splashesSnapshot.docs.length} splashes for wave: ${waveDoc.id}`);
      }
    }

    // Delete all echo documents from waves/{waveId}/echoes collections
    console.log('Deleting all echo records...');
    for (const waveDoc of wavesSnapshot.docs) {
      const echoesSnapshot = await waveDoc.ref.collection('echoes').get();
      const batch = db.batch();

      echoesSnapshot.docs.forEach((echoDoc) => {
        batch.delete(echoDoc.ref);
      });

      if (echoesSnapshot.docs.length > 0) {
        await batch.commit();
        console.log(`Deleted ${echoesSnapshot.docs.length} echoes for wave: ${waveDoc.id}`);
      }
    }

    console.log('Count reset completed successfully!');
  } catch (error) {
    console.error('Error resetting counts:', error);
  }
}

resetCounts().then(() => {
  console.log('Script finished.');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});