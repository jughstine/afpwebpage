import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, deleteDoc, addDoc, query, where, orderBy, Timestamp, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, deleteUser } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDsyk_8UEvXjLbqzlHnpafyBwFrAU7Z3EE",
    authDomain: "afppgmc-82e1e.firebaseapp.com",
    projectId: "afppgmc-82e1e",
    storageBucket: "afppgmc-82e1e.appspot.com",
    messagingSenderId: "887190525745",
    appId: "1:887190525745:web:d73eb6c173f1817a21c210",
    measurementId: "G-GMGN94TNJ3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth, collection, getDocs, doc, getDoc, updateDoc, deleteDoc, addDoc, query, where, orderBy, Timestamp, writeBatch, deleteUser };
