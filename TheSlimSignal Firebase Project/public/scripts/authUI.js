import { signUpNewUser, signInByEmailOrUsername, updateUserLastSeen, signOutUser, listenAuthState } from './authService.js';
import { auth } from './firebaseConfig.js';

const authContainer = document.getElementById('authContainer');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const toggleToSignup = document.getElementById('toggle-to-signup');
const toggleToLogin = document.getElementById('toggle-to-login');
const closeAuthBtn = document.getElementById('close-auth-btn');
const closeAuthBtn2 = document.getElementById('close-auth-btn2');
const authBtn = document.getElementById('auth-btn');
const signoutBtn = document.getElementById('signout-btn');

// UI buttons that show/hide based on auth state
const profileBtn = document.getElementById('profile-btn');
const newTopicBtn = document.getElementById('newTopic-btn');
const newPostBtn = document.getElementById('newPost-btn');

// Toggle between login and signup forms
toggleToSignup?.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.classList.add('hidden');
  signupForm.classList.remove('hidden');
});

toggleToLogin?.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.classList.remove('hidden');
  signupForm.classList.add('hidden');
});

// Close auth dialog
closeAuthBtn?.addEventListener('click', () => authContainer?.close());
closeAuthBtn2?.addEventListener('click', () => authContainer?.close());

// Open auth dialog
authBtn?.addEventListener('click', () => authContainer?.showModal());

// Sign out
signoutBtn?.addEventListener('click', async () => {
  try {
    await signOutUser();
    window.location.reload();
  } catch (err) {
    alert('Could not sign out. Please try again.');
  }
});

// Login form submission
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const identifier = document.getElementById('login-identifier')?.value?.trim();
  const password = document.getElementById('login-password')?.value;

  if (!identifier || !password) {
    alert('Please fill in all fields.');
    return;
  }

  let userIp = 'unknown';
  try {
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    userIp = ipData.ip || userIp;
  } catch (err) {
    // IP lookup failed, continue
  }

  try {
    const userCredential = await signInByEmailOrUsername(identifier, password);
    if (userCredential.user?.uid) {
      await updateUserLastSeen(userCredential.user.uid, userIp);
      authContainer?.close();
      loginForm.reset();
      location.reload();
    }
  } catch (err) {
    const msg = err.message || 'Login failed. Please try again.';
    alert(msg);
  }
});

// Signup form submission
signupForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signup-email')?.value?.trim();
  const username = document.getElementById('signup-username')?.value?.trim();
  const password = document.getElementById('signup-password')?.value;

  if (!email || !username || !password) {
    alert('Please fill in all fields.');
    return;
  }

  let userIp = 'unknown';
  try {
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    userIp = ipData.ip || userIp;
  } catch (err) {
    // IP lookup failed, continue
  }

  try {
    await signUpNewUser({ email, username, password, userIp });
    authContainer?.close();
    signupForm.reset();
    location.reload();
  } catch (err) {
    alert(err.message || 'Signup failed. Please try again.');
  }
});

// Listen to auth state and update UI
listenAuthState((user) => {
  if (user) {
    // User is logged in
    authBtn.style.display = 'none';
    profileBtn.style.display = 'block';
    newTopicBtn.style.display = 'block';
    newPostBtn.style.display = 'block';
    signoutBtn.style.display = 'block';
  } else {
    // User is logged out
    authBtn.style.display = 'block';
    profileBtn.style.display = 'none';
    newTopicBtn.style.display = 'none';
    newPostBtn.style.display = 'none';
    signoutBtn.style.display = 'none';
  }
});
