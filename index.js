/* === Imports === */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"

/* === Firebase Setup === */

const firebaseConfig = {
  apiKey: "AIzaSyBBVp1L3Nvv5EvyoPbwMDugyDcc3zjAAzA",
  authDomain: "moody-b949c.firebaseapp.com",
  projectId: "moody-b949c",
  storageBucket: "moody-b949c.appspot.com",
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)

/* === UI === */

/* == UI - Elements == */

const viewLoggedOut = document.getElementById("logged-out-view")
const viewLoggedIn = document.getElementById("logged-in-view")

const signInWithGoogleButtonEl = document.getElementById("sign-in-with-google-btn")

const emailInputEl = document.getElementById("email-input")
const passwordInputEl = document.getElementById("password-input")

const signInButtonEl = document.getElementById("sign-in-btn")
const createAccountButtonEl = document.getElementById("create-account-btn")

const signOutButtonEl = document.getElementById("sign-out-btn")

/* == UI - Event Listeners == */

signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle)

signInButtonEl.addEventListener("click", authSignInWithEmail)
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail)

signOutButtonEl.addEventListener("click", authSignOut)

/* === Main Code === */

showLoggedOutView()

/* === Functions === */

/* = Functions - Firebase - Authentication = */

function authSignInWithGoogle() {
  console.log("Sign in with Google")
}

function authSignInWithEmail() {
  const email = emailInputEl.value
  const password = passwordInputEl.value
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      //Signed in
      const user = userCredential.user
      showLoggedInView()
    })
    .catch((error) => {
      console.error(error.message)
    })
}

function authCreateAccountWithEmail() {
  const email = emailInputEl.value
  const password = passwordInputEl.value

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up 
      const user = userCredential.user;
      console.log(`user created`)
      showLoggedInView()
      // ...
    })
    .catch((error) => {
      console.error(error.message)
      // ..
    });

  console.log("Sign up with email and password")
}

function authSignOut() {
  signOut(auth)
    .then(() => {
      // signout successful
      showLoggedOutView()
      clearAuthFields()

    }).catch((error) => {
      console.error(error.message)
    })
}

/* == Functions - UI Functions == */

function showLoggedOutView() {
  hideView(viewLoggedIn)
  showView(viewLoggedOut)
}

function showLoggedInView() {
  hideView(viewLoggedOut)
  showView(viewLoggedIn)
}

function showView(view) {
  view.style.display = "flex"
}

function hideView(view) {
  view.style.display = "none"
}

function clearInputField(field) {
  field.value = ""
}
function clearAuthFields() {
  clearInputField(emailInputEl)
  clearInputField(passwordInputEl)
}