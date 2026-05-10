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

function installProductCardLiftStyles() {
  if (typeof document === "undefined" || document.getElementById("product-card-lift-styles")) return;

  const style = document.createElement("style");
  style.id = "product-card-lift-styles";
  style.textContent = `
    .product-card {
      position: relative;
      transform: translateY(0) scale(1);
      will-change: transform, box-shadow, border-color;
      transition:
        transform 180ms ease,
        box-shadow 180ms ease,
        border-color 180ms ease;
      -webkit-tap-highlight-color: transparent;
    }
    .product-card:hover {
      border-color: rgba(201,151,42,0.42);
      box-shadow: 0 18px 34px rgba(0,0,0,0.46), 0 0 28px rgba(201,151,42,0.18);
      transform: translateY(-8px) scale(1.015);
    }
    .product-card:active {
      border-color: rgba(201,151,42,0.5);
      box-shadow: 0 12px 24px rgba(0,0,0,0.42), 0 0 18px rgba(201,151,42,0.16);
      transform: translateY(-4px) scale(1.008);
      transition-duration: 90ms;
    }
    .product-card:hover .product-card-img img,
    .product-card:hover h3 {
      opacity: 0.92;
      transition: opacity 0.18s;
    }
    @media (hover: none) and (pointer: coarse) {
      .product-card:hover {
        border-color: var(--border);
        box-shadow: none;
        transform: translateY(0) scale(1);
      }
      .product-card:active,
      .product-card.is-pressing {
        border-color: rgba(201,151,42,0.5);
        box-shadow: 0 14px 28px rgba(0,0,0,0.44), 0 0 20px rgba(201,151,42,0.16);
        transform: translateY(-6px) scale(1.012);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .product-card {
        transition: border-color 120ms ease, box-shadow 120ms ease;
      }
      .product-card:hover,
      .product-card:active,
      .product-card.is-pressing {
        transform: none;
      }
    }
  `;
  document.head.appendChild(style);
}

installProductCardLiftStyles();

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
 * validateImageFile — checks that a file is an image and under 10MB.
 * Throws a user-friendly Error if validation fails.
 * @param {File} file
 */
function validateImageFile(file) {
  if (!file.type.startsWith('image/')) throw new Error('Only image files are accepted.');
  if (file.size > 10 * 1024 * 1024) throw new Error('File must be under 10MB.');
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
    validateImageFile(generatedFile);
    const gRef = ref(storage, "submissions/" + Date.now() + "_gen_" + generatedFile.name);
    await uploadBytes(gRef, generatedFile);
    generatedImageURL = await getDownloadURL(gRef);
  }

  if (patchFile) {
    validateImageFile(patchFile);
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
 * uploadProduct — uploads a completed keychain photo and prepends it to the queue
 */
export async function uploadProduct(name, status, file) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const safeName = name.replace(/[^a-zA-Z0-9_-]/g, "_");
  const storageRef = ref(storage, `products/${safeName}_${Date.now()}.${ext}`);
  await uploadBytes(storageRef, file);
  const img = await getDownloadURL(storageRef);
  const currentItems = await loadQueue();
  const newItem = { name, status, img };
  await saveQueue([newItem, ...currentItems]);
  return newItem;
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

const PRODUCT_PHOTOS_DOC = doc(db, "config", "productPhotos");
const HIDDEN_PRODUCTS_DOC = doc(db, "config", "hiddenProducts");
const HERO_IMAGE_DOC = doc(db, "config", "heroImage");

/**
 * loadProductPhotos — returns map of { productId: photoURL }
 */
export async function loadProductPhotos() {
  const snap = await getDoc(PRODUCT_PHOTOS_DOC);
  return snap.exists() ? snap.data() : {};
}

/**
 * loadHiddenProducts — returns array of hidden product IDs
 */
export async function loadHiddenProducts() {
  const snap = await getDoc(HIDDEN_PRODUCTS_DOC);
  return snap.exists() ? (snap.data().items || []) : [];
}

/**
 * saveHiddenProducts — saves array of hidden product IDs
 */
export async function saveHiddenProducts(ids) {
  await setDoc(HIDDEN_PRODUCTS_DOC, { items: ids });
}

/**
 * loadHeroImage — returns hero logo URL or empty string
 */
export async function loadHeroImage() {
  const snap = await getDoc(HERO_IMAGE_DOC);
  return snap.exists() ? (snap.data().url || "") : "";
}

/**
 * uploadHeroImage — uploads logo to Storage and saves URL to Firestore
 */
export async function uploadHeroImage(file) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const storageRef = ref(storage, `hero/logo_${Date.now()}.${ext}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  await setDoc(HERO_IMAGE_DOC, { url });
  return url;
}

/**
 * uploadProductPhoto — uploads file to Storage and saves URL to Firestore
 * @param {string} productId
 * @param {File} file
 * @returns {Promise<string>} download URL
 */
export async function uploadProductPhoto(productId, file) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const storageRef = ref(storage, `product-photos/${productId}_${Date.now()}.${ext}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  await setDoc(PRODUCT_PHOTOS_DOC, { [productId]: url }, { merge: true });
  return url;
}

const SHOPIFY_LINKS_DOC = doc(db, "config", "shopifyLinks");

/**
 * loadShopifyLinks — returns map of { productId: shopifyProductUrl }
 */
export async function loadShopifyLinks() {
    const snap = await getDoc(SHOPIFY_LINKS_DOC);
    return snap.exists() ? snap.data() : {};
}

/**
 * saveShopifyLinks — saves map of { productId: shopifyProductUrl }
 */
export async function saveShopifyLinks(links) {
    await setDoc(SHOPIFY_LINKS_DOC, links);
}
