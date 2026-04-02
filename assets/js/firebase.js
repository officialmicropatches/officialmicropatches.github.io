/**
 * firebase.js — All Firebase logic for MicroPatches
 *
 * Firebase API keys in client-side code are normal and expected for Firebase
 * web apps. Security is enforced through Firebase Security Rules in the
 * Firebase Console. Ensure Firestore rules require authentication for write
 * operations or restrict writes to specific collections. Storage rules should
 * restrict file types and sizes.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  query,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBJD5r0KmlqygWAa0rT17dWplXQQ96IeW4",
  authDomain: "patch-559c8.firebaseapp.com",
  projectId: "patch-559c8",
  storageBucket: "patch-559c8.firebasestorage.app",
  messagingSenderId: "584233188985",
  appId: "1:584233188985:web:7be3979a2ad505bc711ea8",
  measurementId: "G-WCE9XXHF2F"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const storage = getStorage(app);

const QUEUE_DOC = doc(db, "config", "queue");

/**
 * loadQueue — loads queue items from Firestore
 * @returns {Promise<Array>} array of { name, status, img }
 */
export async function loadQueue() {
  try {
    const snap = await getDoc(QUEUE_DOC);
    if (snap.exists()) {
      return snap.data().items || [];
    }
    return [];
  } catch (err) {
    throw err;
  }
}

/**
 * saveQueue — saves queue array to Firestore
 * @param {Array} items — array of { name, status, img }
 */
export async function saveQueue(items) {
  await setDoc(QUEUE_DOC, { items });
}

/**
 * addSubmission — uploads files to Storage, saves submission to Firestore,
 * appends new entry to the live queue
 * @param {Object} data — { name, email, phone, agency, description }
 * @param {File|null} generatedFile — preferred digital/vector file
 * @param {File|null} patchFile — physical patch photo
 */
export async function addSubmission(data, generatedFile, patchFile) {
  let generatedImageURL = "";
  let patchPhotoURL = "";

  if (generatedFile) {
    const gRef = ref(storage, "submissions/" + Date.now() + "_gen_" + generatedFile.name);
    await uploadBytes(gRef, generatedFile);
    generatedImageURL = await getDownloadURL(gRef);
  }

  if (patchFile) {
    const pRef = ref(storage, "submissions/" + Date.now() + "_patch_" + patchFile.name);
    await uploadBytes(pRef, patchFile);
    patchPhotoURL = await getDownloadURL(pRef);
  }

  const submission = {
    name: data.name,
    email: data.email,
    phone: data.phone || "",
    agency: data.agency,
    description: data.description,
    generatedImageURL,
    patchPhotoURL,
    submittedAt: new Date().toISOString()
  };

  await addDoc(collection(db, "submissions"), submission);

  // Append to live queue
  const currentItems = await loadQueue();
  const newItem = {
    name: data.agency,
    status: "Queued",
    img: patchPhotoURL || generatedImageURL || ""
  };
  await saveQueue([...currentItems, newItem]);
}

/**
 * loadSubmissions — returns all submissions ordered by submittedAt desc
 * @returns {Promise<Array>}
 */
export async function loadSubmissions() {
  const q = query(collection(db, "submissions"), orderBy("submittedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
