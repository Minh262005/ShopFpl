import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.0firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.0firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyBkLG95I6MhevBGJ9_3TF2bWkmwRlDit2A",
  authDomain: "coffe-shop-28ebc.firebaseapp.com",
  projectId: "coffe-shop-28ebc",
  storageBucket: "coffe-shop-28ebc.firebasestorage.app",
  messagingSenderId: "805219914608",
  appId: "1:805219914608:web:f347f5a1bd7af71b2fb5b5",
  measurementId: "G-LYQJW2WQ6E",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
export default { app, analytics, auth, db };
