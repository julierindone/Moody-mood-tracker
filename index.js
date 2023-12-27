/* === Imports === */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"

/* === Firebase Setup === */
// #region

const firebaseConfig = {
  apiKey: "AIzaSyBBVp1L3Nvv5EvyoPbwMDugyDcc3zjAAzA",
  authDomain: "moody-b949c.firebaseapp.com",
  projectId: "moody-b949c",
  storageBucket: "moody-b949c.appspot.com"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
const db = getFirestore(app)
// #endregion

/* === UI === */

/* == UI - Elements == */
// #region
const viewLoggedOut = document.getElementById("logged-out-view")
const viewLoggedIn = document.getElementById("logged-in-view")

const signInWithGoogleButtonEl = document.getElementById("sign-in-with-google-btn")

const emailInputEl = document.getElementById("email-input")
const passwordInputEl = document.getElementById("password-input")

const signInButtonEl = document.getElementById("sign-in-btn")
const createAccountButtonEl = document.getElementById("create-account-btn")

const signOutButtonEl = document.getElementById("sign-out-btn")

const userProfilePictureEl = document.getElementById("user-profile-picture")
const userGreetingEl = document.getElementById("user-greeting")

const textareaEl = document.getElementById("post-input")
const postButtonEl = document.getElementById("post-btn")

// #endregion

/* == UI - Event Listeners == */
// #region

signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle)

signInButtonEl.addEventListener("click", authSignInWithEmail)
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail)

signOutButtonEl.addEventListener("click", authSignOut)
postButtonEl.addEventListener("click", postButtonPressed)
// #endregion


/* === Main Code === */

onAuthStateChanged(auth, (user) => {
  if (user) {
    showLoggedInView()
    showProfilePicture(userProfilePictureEl, user)
    showUserGreeting(userGreetingEl, user)
  } else {
    showLoggedOutView()
  }
})

/* === Functions === */

/* = Functions - Firebase - Authentication = */
// #region
function authSignInWithGoogle() {
  signInWithPopup(auth, provider)
    .then((result) => {
      console.log("Signed in with Google")
    }).catch((error) => {
      console.error(error.message)
    })
}

function authSignInWithEmail() {
  const email = emailInputEl.value
  const password = passwordInputEl.value
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user
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
      const user = userCredential.user;
      console.log(`user created`)
    })
    .catch((error) => {
      console.error(error.message)
    });
}

function authSignOut() {
  signOut(auth)
    .then(() => {
      // signout successful
      clearAuthFields()

    }).catch((error) => {
      console.error(error.message)
    })
}

/* = Functions - Firebase - Cloud Firestore = */

async function addPostToDB(postBody, user) {
  try {
    const docRef = await addDoc(collection(db, "posts"), {
      body: postBody,
      uid: user.uid,
      timestamp: serverTimestamp()
    })
    console.log("Document written with ID: ", docRef.id)
  } catch (error) {
    console.error(error.message);
  }
}

/* == Functions - UI Functions == */
// #region
function postButtonPressed() {
  const postBody = textareaEl.value
  const user = auth.currentUser

  if (postBody) {
    addPostToDB(postBody, user)
    clearInputField(textareaEl)
  }
}

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

function showProfilePicture(imgElement, user) {
  const photoURL = user.photoURL
  if (photoURL) {
    imgElement.src = photoURL
  }
  else {
    imgElement.src = "assets/images/default-profile-picture.jpeg"
  }
}

function showUserGreeting(element, user) {
  const displayName = user.displayName

  if (displayName) {
    const userFirstName = displayName.split(" ")[0]
    element.textContent = `How are you today, ${userFirstName}?`
  }
  else {
    element.textContent = `How are you today?`
  }
}
// #endregion
