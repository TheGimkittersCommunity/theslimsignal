import { signOutUser } from './authService.js';

const signoutBtn = document.getElementById('signout-btn');

signoutBtn?.addEventListener('click', async () => {
  try {
    await signOutUser();
    console.log('User signed out');
    window.location.reload();
  } catch (err) {
    console.error('Sign-out error:', err);
    alert('Could not sign out. Please try again.');
  }
});