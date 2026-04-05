import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";

// Example: verifyRecaptcha function
export const verifyRecaptcha = onRequest(
  { maxInstances: 10, memory: "256MiB", timeoutSeconds: 30 },
  async (req, res) => {
    logger.info("verifyRecaptcha called", { method: req.method, body: req.body });

    // Your verification logic goes here, e.g. call Google reCAPTCHA API
    // const token = req.body.token;
    // const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=SECRET_KEY&response=${token}`, { method: 'POST' });
    // const data = await response.json();
    // res.json(data);

    res.json({ success: true }); // placeholder
  }
);

// Example of another simple function
export const helloWorld = onRequest(
  { maxInstances: 5 },
  (req, res) => {
    logger.info("Hello logs!", { structuredData: true });
    res.send("Hello from Firebase Functions v4+!");
  }
);