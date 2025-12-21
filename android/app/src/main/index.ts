// @ts-nocheck
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";

initializeApp();
const db = getFirestore();
const msg = getMessaging();

// ---- helper: write ping + push ----
async function sendPing(toUid: string, data: {
  type: "splash" | "echo" | "follow" | "mention" | "system" | "message",
  fromUid: string,
  fromName?: string,
  fromPhoto?: string,
  waveId?: string,
  text?: string,
  aggKey?: string
}) {
  // settings check
  const settingsSnap = await db.doc(`users/${toUid}`).get();
  const settings = settingsSnap.get("settings.notifications") || {};
  if (settings[data.type] === false) return;

  // create ping doc
  const pingRef = db.collection(`users/${toUid}/pings`).doc();
  const createdAt = new Date();
  await pingRef.set({ ...data, createdAt, read: false });

  // unread counter
  await db.doc(`users/${toUid}`).set({
    counters: { unreadPings: (settingsSnap.get("counters.unreadPings") || 0) + 1 },
  }, { merge: true });

  // fetch device tokens
  const devicesSnap = await db.collection(`users/${toUid}/devices`).get();
  const tokens = devicesSnap.docs.map((d) => d.get("fcmToken")).filter(Boolean);
  if (!tokens.length) return;

  // push payload
  const titleMap: any = {
    splash: "New Splash",
    echo: "New Echo",
    hug: "New Hug",
    follow: "New Crew Member",
    mention: "You were mentioned",
    message: `New message from ${data.fromName || "someone"}`,
    system: "Notice",
  };
  const title = titleMap[data.type] || "Update";
  const body =
    data.type === "splash" && data.fromName ? `${data.fromName} splashed your wave` : 
    data.type === "echo" && data.fromName ? `${data.fromName} echoed: ${data.text ?? ""}`.trim() :
    data.type === "hug" && data.fromName ? `${data.fromName} hugged your vibe` :
    data.type === "message" ? data.text ?? "You have a new message" :
    data.type === "follow" && data.fromName ? `${data.fromName} joined your crew` :
    data.type === "mention" && data.fromName ? `${data.fromName} mentioned you` :
    data.text || "Open Pings";

  await msg.sendEachForMulticast({
    tokens,
    notification: { title, body },
    data: {
      pingType: data.type,
      waveId: data.waveId || "",
      fromUid: data.fromUid,
      pingId: pingRef.id,
      route: "Pings", // so the app can navigate on tap
    },
    android: { priority: "high" },
  });
}

// ---- triggers (adapt paths to your schema) ----

// Splash (like) created - handled by Firebase Functions
// export const onSplashCreate = onDocumentCreated("waves/{waveId}/splashes/{splashId}", async (event) => {
//   const splash = event.data?.data();
//   if (!splash) return;
//   // Get wave owner
//   const waveSnap = await db.doc(`waves/${event.params.waveId}`).get();
//   const toUid = waveSnap.get("ownerUid");
//   if (!toUid || toUid === splash.userUid) return;

//   await sendPing(toUid, {
//     type: "splash",
//     fromUid: splash.userUid,
//     fromName: splash.userName,
//     fromPhoto: splash.userPhoto,
//     waveId: event.params.waveId,
//     aggKey: `wave:${event.params.waveId}:splash`,
//   });
// });

// Echo (comment) created - handled by Firebase Functions
// export const onEchoCreate = onDocumentCreated("waves/{waveId}/echoes/{echoId}", async (event) => {
//   const echo = event.data?.data();
//   if (!echo) return;
//   const waveSnap = await db.doc(`waves/${event.params.waveId}`).get();
//   const toUid = waveSnap.get("ownerUid");
//   if (!toUid || toUid === echo.userUid) return;

//   await sendPing(toUid, {
//     type: "echo",
//     fromUid: echo.userUid,
//     fromName: echo.userName,
//     fromPhoto: echo.userPhoto,
//     waveId: event.params.waveId,
//     text: echo.text?.slice(0, 120) ?? "",
//   });
// });

// Follow created
export const onFollowCreate = onDocumentCreated("follows/{toUid}/followers/{fromUid}", async (event) => {
  const toUid = event.params.toUid;
  const follower = event.data?.data();
  if (!follower) return;
  await sendPing(toUid, {
    type: "follow",
    fromUid: event.params.fromUid,
    fromName: follower.userName,
    fromPhoto: follower.userPhoto,
  });
});

// Direct Message created
export const onMessageCreate = onDocumentCreated("users/{toUid}/messages/{messageId}", async (event) => {
  const message = event.data?.data();
  if (!message) return;
  const toUid = event.params.toUid;
  if (!toUid || toUid === message.fromUid) return;

  await sendPing(toUid, {
    type: "message",
    fromUid: message.fromUid,
    fromName: message.fromName,
    fromPhoto: message.fromPhoto,
    text: message.text?.slice(0, 120) ?? "",
  });
});

// Mention created (e.g. in a reply or direct message)
export const onMentionCreate = onDocumentCreated("users/{toUid}/mentions/{mentionId}", async (event) => {
  const mention = event.data?.data();
  if (!mention) return;
  const toUid = event.params.toUid;
  if (!toUid || toUid === mention.fromUid) return;

  await sendPing(toUid, {
    type: "message", // Use 'message' type for DMs
    fromUid: mention.fromUid,
    fromName: mention.fromName,
    fromPhoto: mention.fromPhoto,
    text: mention.text?.slice(0, 120) ?? "",
  });
});

// Optional: clean up old pings (e.g., 90 days)
export const cleanupOldPings = onSchedule("every 24 hours", async () => {
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const users = await db.collection("users").get();
  for (const u of users.docs) {
    const snaps = await db.collection(`users/${u.id}/pings`)
        .where("createdAt", "<", new Date(cutoff))
        .limit(300).get();
    const batch = db.batch();
    snaps.docs.forEach((d) => batch.delete(d.ref));
    if (!snaps.empty) await batch.commit();
  }
});
