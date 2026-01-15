// One-time script to add username_lc field to all existing users
const admin = require('firebase-admin');
const serviceAccount = require('../firebase/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateAllUsers() {
  try {
    console.log('Fetching all users...');
    const usersSnapshot = await db.collection('users').get();
    console.log(`Found ${usersSnapshot.size} users`);
    
    const batch = db.batch();
    let count = 0;
    let batchCount = 0;
    
    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      let username = data.username || data.displayName || '';
      
      // Remove leading / or @
      username = username.replace(/^[@\/]/, '');
      
      const username_lc = username.toLowerCase();
      
      if (data.username_lc !== username_lc) {
        batch.update(doc.ref, { username_lc });
        count++;
        console.log(`${doc.id}: ${username} -> ${username_lc}`);
        
        // Firestore batch limit is 500
        if (count % 450 === 0) {
          console.log(`Committing batch ${++batchCount}...`);
          await batch.commit();
        }
      }
    }
    
    if (count % 450 !== 0) {
      console.log(`Committing final batch...`);
      await batch.commit();
    }
    
    console.log(`\nUpdated ${count} users with username_lc field`);
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    process.exit(0);
  }
}

updateAllUsers();
