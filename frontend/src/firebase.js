// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAhxsA1z63IKV17CDuzQ90JdYmhqPbwlCk",
    authDomain: "financeapp-a2cdf.firebaseapp.com",
    projectId: "financeapp-a2cdf",
    storageBucket: "financeapp-a2cdf.appspot.com",
    messagingSenderId: "438970051712",
    appId: "1:438970051712:web:89027db6d08290fe934a65"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
