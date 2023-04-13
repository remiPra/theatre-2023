// src/firebase.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';


// Remplacez les valeurs ci-dessous par celles de votre propre projet Firebase theatre 2023
const firebaseConfig = {
    apiKey: "AIzaSyAtlXjXEKbw14e_T85y675enTrU_H4FT6Q",
    authDomain: "projet-theatre-2023.firebaseapp.com",
    projectId: "projet-theatre-2023",
    storageBucket: "projet-theatre-2023.appspot.com",
    messagingSenderId: "619195056822",
    appId: "1:619195056822:web:5fa48681c1f94329e69c17",
    measurementId: "G-DR7NBJZBNT"
};

// test
// const firebaseConfig = {
//     apiKey: "AIzaSyBevXWEnyUVlnsFVE5SMHzeECw4Lw2-Cx0",
//     authDomain: "projet-theatre-test-2023.firebaseapp.com",
//     projectId: "projet-theatre-test-2023",
//     storageBucket: "projet-theatre-test-2023.appspot.com",
//     messagingSenderId: "763834218878",
//     appId: "1:763834218878:web:e9fe9610ea5ebc873d9b2f",
//     measurementId: "G-60F0HM8DHD"
//   };
  // const firebaseConfig = {
  //   apiKey: "AIzaSyBV9eMeA5BH13OUhQAFqWPvr_ADkqnG3PU",
  //   authDomain: "projet-test-theatre-seco.firebaseapp.com",
  //   projectId: "projet-test-theatre-seco",
  //   storageBucket: "projet-test-theatre-seco.appspot.com",
  //   messagingSenderId: "187067275747",
  //   appId: "1:187067275747:web:b5dfb7540229d2f63928d6",
  //   measurementId: "G-9H79MS8FNM"
  // };

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);

// Exporter les services que vous souhaitez utiliser
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();
