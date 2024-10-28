// utils/firebaseService.js

const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} = require("firebase/storage");
const { initializeApp } = require("firebase/app");

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function uploadImages(files) {
  const urls = [];

  for (const file of files) {
    const storageRef = ref(storage, `equipment/${file.originalname}`);
    await uploadBytes(storageRef, file.buffer);
    const url = await getDownloadURL(storageRef);
    urls.push(url);
  }

  return urls;
}

module.exports = { uploadImages };
