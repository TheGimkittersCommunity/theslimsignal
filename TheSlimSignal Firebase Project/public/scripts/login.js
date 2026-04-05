import { signInByEmailOrUsername, updateUserLastSeen } from './authService.js';

const loginForm = document.getElementById('login-form');

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const userInput = document.getElementById('login-identifier')?.value?.trim();
  const password = document.getElementById('login-password')?.value;

  if (!userInput || !password) {
    alert('Please enter both email/username and password.');
    return;
  }

  let userIp = 'unknown';
  try {
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    userIp = ipData.ip || userIp;
  } catch (err) {
    console.warn('IP lookup failed, continuing without it.', err);
  }

  try {
    const userCredential = await signInByEmailOrUsername(userInput, password);
    const user = userCredential.user;

    if (user?.uid) {
      await updateUserLastSeen(user.uid, userIp);
      window.location.href = '/index.html';
    } else {
      throw new Error('Logged in, but user details are unavailable.');
    }
  } catch (err) {
    console.error('Login failed', err);
    const code = err.code || '';
    let msg = err.message || 'Login failed. Please try again.';

    if (code === 'auth/wrong-password') msg = 'Incorrect password. Please try again.';
    else if (code === 'auth/user-not-found') msg = 'No account found with this email.';

    alert(msg);
  }
});
