import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, query, where, getDocs, collection } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

document.getElementById('loginButton').addEventListener('click', async function() {
    var username = document.getElementById("usernameInput").value;
    var password = document.getElementById("passwordInput").value;

    const accountsRef = collection(db, "accounts");
    const q = query(accountsRef, where("email", "==", username));
    const querySnapshot = await getDocs(q);

    let isAuthenticated = false;
    let fullName = '';
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.password === password) {
            isAuthenticated = true;
            fullName = data.fullName;
        }
    });

    if (isAuthenticated) {
        sessionStorage.setItem("fullName", fullName);
        window.location.href = "../dashboard/dashboard.html";
    } else {
        alert("Invalid username or password. Please try again.");
    }
});

const form = [...document.querySelector('.form').children];

form.forEach((item, i) => {
    setTimeout(() => {
        item.style.opacity = 1;
    }, i * 100);
});