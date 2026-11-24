"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { firebasePublicConfig, isFirebaseClientConfigured } from "./config";

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseClientConfigured()) {
    throw new Error(
      "Firebase client: set NEXT_PUBLIC_FIREBASE_* in .env.local",
    );
  }
  return getApps().length ? getApp() : initializeApp(firebasePublicConfig);
}

export function getClientAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function getClientFirestore(): Firestore {
  return getFirestore(getFirebaseApp());
}