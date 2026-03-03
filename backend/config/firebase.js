const admin = require('firebase-admin');

// Initialize Firebase Admin
// In production, set FIREBASE_SERVICE_ACCOUNT env var with the JSON string
// For local dev, place serviceAccountKey.json in this folder
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
    try {
        serviceAccount = require('./serviceAccountKey.json');
    } catch (e) {
        console.error('⚠️  No Firebase credentials found!');
        console.error('   Set FIREBASE_SERVICE_ACCOUNT env var or place serviceAccountKey.json in config/');
        process.exit(1);
    }
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { admin, db };
