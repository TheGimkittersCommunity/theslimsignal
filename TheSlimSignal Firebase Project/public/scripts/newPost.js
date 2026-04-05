import { getPermissions, loadPosts } from './resources.js';
import { getUserProfile } from './userProfiles.js';
import { auth, db } from './firebaseConfig.js';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  increment
} from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';

const newPostForm = document.getElementById('newPostForm');

document.addEventListener('DOMContentLoaded', async () => {
  const dialog = document.getElementById('newPostContainer');
  const openBtn = document.getElementById('newPost-btn');
  const cancelBtn = document.getElementById('cancelPost-btn');

  if (openBtn && dialog && cancelBtn) {
    const { isStaff, isSuspended, isSilenced } = await getPermissions();
    if (!isStaff && (isSuspended || isSilenced)) {
      openBtn.style.display = 'none';
    }

    openBtn.addEventListener('click', () => dialog.showModal());

    cancelBtn.addEventListener('click', () => {
      dialog.close();
      newPostForm?.reset();
    });
  }
});

newPostForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const topicId = document.getElementById('topicId')?.value;
  const content = document.getElementById('postContent')?.value.trim();
  const user = auth.currentUser;

  if (!user) {
    alert('Please log in to reply.');
    return;
  }

  if (!topicId || !content) {
    alert('Please provide topic and content.');
    return;
  }

  const { isStaff, isSuspended, isSilenced } = await getPermissions();
  if (!isStaff && (isSuspended || isSilenced)) {
    alert('Your account is currently restricted from posting.');
    return;
  }

  try {
    const profile = await getUserProfile(user.uid);
    const authorName = profile?.displayName || profile?.username || user.email || 'Anonymous';

    await addDoc(collection(db, 'posts'), {
      topicId,
      authorId: user.uid,
      authorName,
      body: content,
      createdAt: serverTimestamp(),
      appearDeleted: false
    });

    const topicRef = doc(db, 'topics', topicId);
    await updateDoc(topicRef, {
      lastReplyAt: serverTimestamp(),
      replyCount: increment(1)
    });

    document.getElementById('newPostContainer')?.close();
    newPostForm.reset();

    if (typeof loadPosts === 'function') {
      loadPosts(topicId);
    }
  } catch (error) {
    console.error('Reply failed:', error);

    if (error.code === 'permission-denied') {
      alert('Permission Denied: Your account is restricted or this topic is in a private category.');
    } else {
      alert('Could not post reply: ' + error.message);
    }
  }
});