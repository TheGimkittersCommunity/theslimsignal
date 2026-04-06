import { auth, db } from './firebaseConfig.js';
import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';

export async function getUserProfile(uid) {
  if (!uid) return null;
  const profileRef = doc(db, 'users', uid);
  const snap = await getDoc(profileRef);
  return snap.exists() ? {id: snap.id, ...snap.data()} : null;
}

export async function updateUserProfile(uid, updates) {
  if (!uid || !updates) throw new Error('Missing uid or updates');
  const profileRef = doc(db, 'users', uid);
  await updateDoc(profileRef, updates);
}

export async function ensureAuthProfile() {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return getUserProfile(currentUser.uid);
}

// Optional: expose to global for now
window.getUserProfile = getUserProfile;
window.updateUserProfile = updateUserProfile;
window.ensureAuthProfile = ensureAuthProfile;
