// Importa las funciones necesarias de Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";       // Importa Firestore
import { getStorage } from "firebase/storage"; 
import { getAuth } from 'firebase/auth';   
// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBNONgNVG8dJX-A52EAa_53RMvq3jO-Njg",
    authDomain: "extramuraleseb.firebaseapp.com",
    databaseURL: "https://extramuraleseb-default-rtdb.firebaseio.com",
    projectId: "extramuraleseb",
    storageBucket: "extramuraleseb.firebasestorage.app",
    messagingSenderId: "820740673971",
    appId: "1:820740673971:web:4658893d8b911182153bc6",
    measurementId: "G-DNDD5STTWP"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);


// Exporta los servicios que usarás
export const db = getFirestore(app); // Si usas Firestore
export const storage = getStorage(app); // Si usas Storage
export const auth = getAuth(app);

// Puedes exportar el app principal si lo necesitas en algún lugar
export default app;



