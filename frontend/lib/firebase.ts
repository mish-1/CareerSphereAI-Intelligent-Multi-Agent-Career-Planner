import { initializeApp, getApps } from "firebase/app";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseEnabled = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);

export function getFirebaseApp() {
  if (!firebaseEnabled) {
    return null;
  }

  if (!getApps().length) {
    return initializeApp(config);
  }

  return getApps()[0] ?? null;
}
