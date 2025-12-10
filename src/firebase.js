// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBElDQeEAPmqm-IM9UXM9jBCMIpaK4CiZA",
  authDomain: "industrycsr.firebaseapp.com",
  databaseURL: "https://industrycsr-default-rtdb.firebaseio.com",
  projectId: "industrycsr",
  storageBucket: "industrycsr.firebasestorage.app",
  messagingSenderId: "734601453624",
  appId: "1:734601453624:web:b7c9735d23595b3390c6cd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

// Initialize Storage
export const storage = getStorage(app);

export default app;
