const admin = require('firebase-admin');
admin.initializeApp();

exports.updateUsernames = async (req, res) => {
  const usersRef = admin.firestore().collection('users');
  const snapshot = await usersRef.get();
  const batch = admin.firestore().batch();

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.username) {
      const usernameLc = data.username.toLowerCase();
      batch.update(doc.ref, { username_lc: usernameLc });
    }
  });

  await batch.commit();
  res.send('All usernames updated!');
};
