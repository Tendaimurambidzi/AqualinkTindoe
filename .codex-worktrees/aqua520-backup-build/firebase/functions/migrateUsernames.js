// Deploy this as a one-time callable function to migrate usernames
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.migrateUsernames = functions.https.onRequest(async (req, res) => {
  try {
    const db = admin.firestore();
    console.log('Fetching all users...');
    
    const usersSnapshot = await db.collection('users').get();
    console.log(`Found ${usersSnapshot.size} users`);
    
    let updated = 0;
    let skipped = 0;
    
    // Process in batches of 500 (Firestore limit)
    const batches = [];
    let currentBatch = db.batch();
    let operationCount = 0;
    
    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      let username = data.username || data.displayName || '';
      
      // Remove leading / or @
      username = username.replace(/^[@\/]/, '');
      const username_lc = username.toLowerCase();
      
      if (data.username_lc !== username_lc) {
        currentBatch.update(doc.ref, { username_lc });
        operationCount++;
        updated++;
        
        if (operationCount === 500) {
          batches.push(currentBatch.commit());
          currentBatch = db.batch();
          operationCount = 0;
        }
      } else {
        skipped++;
      }
    }
    
    // Commit remaining operations
    if (operationCount > 0) {
      batches.push(currentBatch.commit());
    }
    
    // Wait for all batches to complete
    await Promise.all(batches);
    
    const result = {
      success: true,
      totalUsers: usersSnapshot.size,
      updated,
      skipped,
      message: `Updated ${updated} users, skipped ${skipped} users`
    };
    
    console.log(result);
    res.json(result);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
