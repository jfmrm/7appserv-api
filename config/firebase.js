import admin from "firebase-admin";

const serviceAccount = require(process.env.FIREBASE_ADMIN_CERT_PATH);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_USER_POOL_URL
});

export const Firebase = admin;
