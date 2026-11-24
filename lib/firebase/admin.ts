import {
  cert,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function serviceAccountFromEnv(): ServiceAccount | undefined {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw?.trim()) return undefined;
  return JSON.parse(raw) as ServiceAccount;
}

/** サーバー専用（route / Server Action / lib）。Client から import しない */
export function getAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const serviceAccount = serviceAccountFromEnv();

  if (serviceAccount) {
    return initializeApp({
      credential: cert(serviceAccount),
      projectId:
        projectId ??
        (typeof serviceAccount.projectId === "string"
          ? serviceAccount.projectId
          : undefined),
    });
  }

  if (projectId) {
    return initializeApp({ projectId });
  }

  throw new Error(
    "Firebase Admin: set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_PROJECT_ID",
  );
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getAdminApp());
}