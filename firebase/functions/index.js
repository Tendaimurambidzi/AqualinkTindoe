const functions = require('firebase-functions');
const admin = require('firebase-admin');
const shortid = require('shortid');

admin.initializeApp();

exports.generateShareLink = functions.https.onCall(async (data, context) => {
  const { docId, channel, title } = data;

  // Generate short ID
  const shortId = shortid.generate();

  // Store in Firestore
  await admin.firestore().collection('shareLinks').doc(shortId).set({
    docId,
    channel,
    title,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Return the short link
  const link = `https://tendaimurambidzi.github.io/AqualinkTindoe/share/${shortId}`;
  return { link };
});

exports.getShareLink = functions.https.onRequest(async (req, res) => {
  const shortId = req.path.split('/')[2]; // Assuming /share/:shortId

  const doc = await admin.firestore().collection('shareLinks').doc(shortId).get();
  if (!doc.exists) {
    res.status(404).send('Link not found');
    return;
  }

  const { docId, channel, title } = doc.data();

  // Check user agent to determine device
  const userAgent = req.headers['user-agent'] || '';
  const isMobile = /android|iphone|ipad|ipod/i.test(userAgent);

  if (isMobile) {
    // Redirect to app store or deep link
    // For simplicity, redirect to website with params
    res.redirect(`https://tendaimurambidzi.github.io/AqualinkTindoe/drift?docId=${docId}&channel=${channel}`);
  } else {
    // Desktop: show web page
    res.redirect(`https://tendaimurambidzi.github.io/AqualinkTindoe/drift?docId=${docId}&channel=${channel}`);
  }
});