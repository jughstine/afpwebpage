// Import the necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, deleteDoc, addDoc, query, where} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Firebase configuration object containing keys and identifiers for your Firebase project
const firebaseConfig = {
    apiKey: "AIzaSyDsyk_8UEvXjLbqzlHnpafyBwFrAU7Z3EE",
    authDomain: "afppgmc-82e1e.firebaseapp.com",
    projectId: "afppgmc-82e1e",
    storageBucket: "afppgmc-82e1e.appspot.com",
    messagingSenderId: "887190525745",
    appId: "1:887190525745:web:d73eb6c173f1817a21c210",
    measurementId: "G-GMGN94TNJ3"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore and export it
const db = getFirestore(app);

export { db, getDocs, collection, doc, updateDoc, deleteDoc, addDoc, query, where, getDoc };
