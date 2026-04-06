// Import the necessary Firebase modules directly from CDN URLs
// Check the latest stable version on the Firebase documentation or a CDN like jsDelivr or unpkg.
// self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app-check.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyAGjUuPhteH1bxXPXQpB7sEJnY06F-3eOo",
  authDomain: "theslimsignal.firebaseapp.com",
  projectId: "theslimsignal",
  storageBucket: "theslimsignal.firebasestorage.app",
  messagingSenderId: "952041919295",
  appId: "1:952041919295:web:c00255a8080d3b6655b98a",
  measurementId: "G-NRSW6FH88Q"
};

// 1. Initialize Firebase App and store the instance
const app = initializeApp(firebaseConfig);

// 2. Initialize App Check with your reCAPTCHA v3 site key
let appCheck;
try {
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6Ldqh6MsAAAAAJ-eiBbGiw8eWylwFajvUA0fP3XN'),
    isTokenAutoRefreshEnabled: true
  });
} catch (error) {
  console.warn('App Check initialization failed:', error);
}

// 3. Get references to Firebase services using the modular approach
const auth = getAuth(app);
const db = getFirestore(app);

// Export these for other modules to use
export { app, auth, db, appCheck, firebaseConfig };

export async function getRecaptchaToken(actionName) {
    return new Promise((resolve) => {
        grecaptcha.ready(() => {
            grecaptcha.execute('6Ldqh6MsAAAAAJ-eiBbGiw8eWylwFajvUA0fP3XN', { action: actionName })
                .then(token => resolve(token));
        });
    });
}