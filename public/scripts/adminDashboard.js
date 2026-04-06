import { auth, db } from './firebaseConfig.js';
import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';

export async function loadAdminUsers() {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  const roles = ['administrator', 'moderator'];
  const q = query(collection(db, 'users'), where('role', 'in', roles));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function loadUserModerationTasks() {
  const q = query(collection(db, 'users'), where('isBanned', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

window.loadAdminUsers = loadAdminUsers;
window.loadUserModerationTasks = loadUserModerationTasks;
