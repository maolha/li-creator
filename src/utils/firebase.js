import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDGlDKIiPX59we3hOnNGEU_yoxXpzD4o8Y",
  authDomain: "li-creator.firebaseapp.com",
  projectId: "li-creator",
  storageBucket: "li-creator.firebasestorage.app",
  messagingSenderId: "144446658339",
  appId: "1:144446658339:web:ee6b35f657be96ac7c9e96",
  measurementId: "G-5R3DH3JEZM",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

// ── Auth ──
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  // Create/update user profile on first login
  const userRef = doc(db, "users", result.user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      createdAt: serverTimestamp(),
      profile: {
        linkedinHeadline: "",
        linkedinAbout: "",
        products: "",
        goals: "",
        brands: [],
        historyEnabled: true,
      },
      apiKey: "",
    });
  }
  return result.user;
}

export async function logOut() {
  await signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// ── User Profile ──
export async function getUserProfile(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data() : null;
}

export async function updateUserProfile(uid, data) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, data);
}

export async function saveApiKeyToFirebase(uid, encryptedKey) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { apiKey: encryptedKey });
}

export async function getApiKeyFromFirebase(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data().apiKey || "" : "";
}

// ── Creation History ──
export async function saveCreation(uid, creation) {
  const colRef = collection(db, "users", uid, "creations");
  return addDoc(colRef, {
    ...creation,
    createdAt: serverTimestamp(),
  });
}

export async function getCreations(uid, count = 50) {
  const colRef = collection(db, "users", uid, "creations");
  const q = query(colRef, orderBy("createdAt", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function renameCreation(uid, creationId, title) {
  const docRef = doc(db, "users", uid, "creations", creationId);
  await updateDoc(docRef, { title });
}

export async function deleteCreation(uid, creationId) {
  const docRef = doc(db, "users", uid, "creations", creationId);
  await deleteDoc(docRef);
}
