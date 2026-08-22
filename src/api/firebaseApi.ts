import { GoogleAuthProvider, signInWithPopup, signOut, User } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { UserProfile, HistoryRecord } from "../types";

export async function loginWithGoogleApi(): Promise<{ user: User; accessToken: string | null }> {
  if (!auth) {
    throw new Error("Firebase Auth chưa được khởi tạo.");
  }

  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/calendar.events");

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const accessToken = credential?.accessToken || null;

  return {
    user: result.user,
    accessToken
  };
}

export async function logoutApi(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

export async function saveUserProfileToFirestore(userId: string, profile: UserProfile): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, "users", userId, "profile", "info"), {
    ...profile,
    updatedAt: serverTimestamp()
  });
}

export async function fetchUserProfileFromFirestore(userId: string): Promise<UserProfile | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, "users", userId, "profile", "info"));
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
}

export async function saveRecordToFirestore(userId: string, record: HistoryRecord): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, "users", userId, "records", record.id), {
    ...record,
    createdAt: serverTimestamp()
  });
}
