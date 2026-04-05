---
name: "TheSlimSignal Firebase project instructions"
description: "Strong, reusable project conventions for Copilot Chat in this repository. Use for frontend and backend task generation."
applyTo: "public/scripts/**", "functions/**"

# Rules

1. Always follow existing workspace instructions at `.github/copilot-instructions.md`.
2. Frontend JS in `public/scripts/` must use Firebase modular SDK imports (v9+ style) from CDN as in `firebaseConfig.js`; do not add Node-specific packages or require a build step.
3. Keep UI routing behavior aligned with `firebase.json` rewrites (`/c/**`, `/t/**`, `/about`, `/privacy`, `/tos`).
4. Backend `functions/` code uses Node 24 and TypeScript. Use `npm --prefix functions run build` before testing and `firebase deploy --only functions` for deployment.
5. Do not include credentials or service account keys in source; use dynamic `firebaseConfig` patterns.
6. For Firestore schema changes, update both `firestore.rules` and `firestore.indexes.json` and keep rules scoped by user ID for writes.

# Guidance for new tasks

- Start by mapping feature flows to existing files (e.g., new topic UI uses `public/scripts/newTopic.js`, post creation uses `public/scripts/newPost.js`).
- Prefer minimal changes in this small project: patch existing functions and reused components in `public/components`.
- For bug fixes, include user-facing behavior, Auth state, and Firestore read/write assurance.
