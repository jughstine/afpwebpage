    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
    import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
   
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
    export { db };
    