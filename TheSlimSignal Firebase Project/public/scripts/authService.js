import { auth, db } from './firebaseConfig.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js';
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';

export async function signUpNewUser({ email, password }) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  return user;
}
export async function createUserProfile(user, username, userIp = 'unknown') {
  await setDoc(doc(db, 'users', user.uid), {
    username: username,
    displayName: '',
    email: user.email,
    createdAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
    pronouns: '',
    bio: '',
    photoURL: '',
    role: 'member',
    postCount: 0,
    isSuspended: false,
    isSilenced: false,
    lastIP: userIp
  });
}

export async function signInByEmailOrUsername(userInput, password) {
  let loginEmail = userInput;

  if (!userInput.includes('@')) {
    const userQuery = await getDocs(
      query(collection(db, 'users'), where('username', '==', userInput), limit(1))
    );

    if (userQuery.empty) {
      throw new Error('No account found with that username.');
    }

    loginEmail = userQuery.docs[0].data().email;
  }

  return await signInWithEmailAndPassword(auth, loginEmail, password);
}

export async function signOutUser() {
  return await signOut(auth);
}

export function listenAuthState(onChange) {
  return onAuthStateChanged(auth, onChange);
}

export async function updateUserLastSeen(userId, userIp = 'unknown') {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    lastSeen: serverTimestamp(),
    lastIP: userIp
  });
}
