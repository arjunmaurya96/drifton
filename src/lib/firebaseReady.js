// Tiny check (no Firebase code) — lets the website load Firebase only when it is really needed.
export const firebaseReady = Boolean(import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID);
