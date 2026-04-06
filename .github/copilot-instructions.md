---
name: "TheSlimSignal Firebase Project Workspace Instructions"
description: "Workspace-level guidance for GitHub Copilot Chat in this Firebase project. Use these rules as the first context source for new tasks."
---

# Overview

TheSlimSignal is a Firebase-hosted single-page app with a serverless backend in Cloud Functions. Use this document as the first reference for architecture, conventions, and common commands.

## Project structure

- `firebase.json`: hosting, rewrites, firestore rules/indexes, auth providers
- `firestore.rules`, `firestore.indexes.json`: Firestore security rules and indexes
- `public/`: static frontend with HTML, CSS, and JS modules
- `public/scripts/`: app source (login, signup, newPost, resources, etc.)
- `functions/`: Cloud Functions code and `package.json` (Node 24, TypeScript compilation)

## Tech stack

- Firebase Hosting, Auth, Firestore, Functions
- Frontend uses Firebase JS SDK via CDN modules (modular v12+)
- Backend uses `firebase-functions`, `firebase-admin`, `express`, TypeScript

## Key entry points

- `public/scripts/firebaseConfig.js`: app initialization, auth/firestore/app-check setup
- `public/index.html` + routes in `firebase.json` rewrites (`/c/**`, `/t/**`, etc.)
- `functions/package.json` scripts for build/deploy/emulator

## Common workflow commands

Use from repo root, or `functions/` for backend-specific actions.

- `npm --prefix functions run build`
- `npm --prefix functions run serve`
- `npm --prefix functions run shell`
- `npm --prefix functions run deploy`
- `npm --prefix functions run logs`
- `firebase deploy --only hosting,firestore` (if needed at root)

## Copilot behavior guidance

- Follow existing patterns: modular Firebase SDK, plain JS in `public/scripts`, `firebase.json` rewrite-based SPA routing
- Avoid introducing back-end-only Node modules into frontend bundle
- Respect static caching headers already configured for JS/CSS
- Do not leak credentials: `firebaseConfig` API key is public value; no service account JSON in repo

## Task-specific hints

### Frontend fixes
- Check `public/scripts/` files for only client code
- Preserve `initializeApp`, `appCheck`, `getAuth`, `getFirestore` usage
- Keep HTML components (`public/components/`) consistent with current style

### Backend / Functions
- Source lives in `functions/src` or `functions/lib` depending on build (currently only compiled `lib/index.js` exists)
- Use `npm --prefix functions run build` before local emulator or deploy

### Firestore security and indexes
- Use `firestore.rules` and `firestore.indexes.json` in sync with data model updates
- Keep rules tight around user IDs and published content rules

## When to use this instruction file

- Creating or reviewing feature changes in this workspace
- Writing new automation, tests, or CI steps for this project
- Implementing app behaviors tied to Firebase service restrictions

## Example prompt triggers

- "Use repo conventions to…"
- "In this Firebase app, implement…"
- "Respect the existing `public/scripts` modular pattern while…"

## Next customization ideas

1. `/create-instructions` for `public/scripts/*.js` tasks (file-level applyTo)
2. `/create-agents` for multi-step flows (emulator + deploy + smoke test)
3. `/create-prompt` to insert new Firestore rules safely
