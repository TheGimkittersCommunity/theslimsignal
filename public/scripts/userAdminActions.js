import { db } from './firebaseConfig.js';
import { doc, updateDoc } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';

export async function banUser(userId) {
  await updateDoc(doc(db, 'users', userId), { isBanned: true });
}

export async function unbanUser(userId) {
  await updateDoc(doc(db, 'users', userId), { isBanned: false });
}

export async function silenceUser(userId) {
  await updateDoc(doc(db, 'users', userId), { isSilenced: true });
}

export async function unsilenceUser(userId) {
  await updateDoc(doc(db, 'users', userId), { isSilenced: false });
}

window.banUser = banUser;
window.unbanUser = unbanUser;
window.silenceUser = silenceUser;
window.unsilenceUser = unsilenceUser;
