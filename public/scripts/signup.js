import { signUpNewUser } from './authService.js';
import { getRecaptchaToken } from './firebaseConfig.js';
  
async function handleSignup() {
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
    console.warn('Could not fetch IP address', err);
  }

  try {
    const token = await getRecaptchaToken();

    const verifyRes = await fetch("https://nam5-theslimsignal.cloudfunctions.net/verifyRecaptcha", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token })
    });

    const verifyData = await verifyRes.json();

    if (!verifyData.success || verifyData.score < 0.5) {
      alert("reCAPTCHA failed. Please try again.");
      return;
    }

    const user = await signUpNewUser({ email, password });
    await createUserProfile({ user, username, userIp });
    window.location.href = '/index.html';

  } catch (err) {
    console.error('Signup failed', err);
    alert(err.message || 'Signup failed. Please try again.');
  }
} 

window.handleSignup = handleSignup;