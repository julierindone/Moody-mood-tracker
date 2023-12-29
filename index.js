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
  serverTimestamp,
  onSnapshot
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

const moodEmojiEls = document.getElementsByClassName("mood-emoji-btn")
const textareaEl = document.getElementById("post-input")
const postButtonEl = document.getElementById("post-btn")

const postsEl = document.getElementById("posts")

// #endregion

/* == UI - Event Listeners == */
// #region

signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle)

signInButtonEl.addEventListener("click", authSignInWithEmail)
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail)

signOutButtonEl.addEventListener("click", authSignOut)
postButtonEl.addEventListener("click", postButtonPressed)
for (let moodEmojiEl of moodEmojiEls) {
  moodEmojiEl.addEventListener("click", selectMood)
}

// #endregion

/* === State === */
let moodState = 0

/* === Global Constants === */

const collectionName = "posts"


/* === Main Code === */

onAuthStateChanged(auth, (user) => {
  if (user) {
    showLoggedInView()
    showProfilePicture(userProfilePictureEl, user)
    showUserGreeting(userGreetingEl, user)
    fetchInRealtimeAndRenderPostsFromDB()
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
// #endregion

/* = Functions - Firebase - Cloud Firestore = */

async function addPostToDB(postBody, user) {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      body: postBody,
      uid: user.uid,
      timestamp: serverTimestamp(),
      mood: moodState
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

  if (postBody && moodState) {
    addPostToDB(postBody, user)
    clearInputField(textareaEl)
    resetAllMoodElements(moodEmojiEls)
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

function clearAll(element) {
  element.innerHTML = ""
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

function displayDate(firebaseDate) {
  const date = firebaseDate.toDate()
  
  const day = date.getDate()
  const year = date.getFullYear()
  
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const month = monthNames[date.getMonth()]

  let hours = date.getHours()
  let minutes = date.getMinutes()
  hours = hours < 10 ? "0" + hours : hours
  minutes = minutes < 10 ? "0" + minutes : minutes

  return `${day} ${month} ${year} - ${hours}:${minutes}`
}

function fetchInRealtimeAndRenderPostsFromDB() {
  onSnapshot(collection(db, collectionName), (querySnapshot) => {
    clearAll(postsEl)

    querySnapshot.forEach((doc) => {
    renderPost(postsEl, doc.data())
    })
  })
}

function renderPost(postsEl, postData) {
  postsEl.innerHTML +=
  `
  <div class="post">
    <div class="header">
      <h3>${displayDate(postData.timestamp)}</h3>
      <img src="assets/emojis/${postData.mood}.png">
    </div>
    <p>${replaceNewlinesWithBrTags(postData.body)}.</p>
  </div>
  `
}

function replaceNewlinesWithBrTags(inputString) {
  inputString = inputString.replaceAll(/\n/g, "<br>")
  return inputString
}

// #endregion

/* == Functions - UI Functions - Mood == */
// #region
function selectMood(event) {
  const selectedMoodEmojiElementId = event.currentTarget.id
  console.log("selectedMoodEmojiElementId: ", selectedMoodEmojiElementId)
  
  // Incr size of chosen; gray out others
  changeMoodsStyleAfterSelection(selectedMoodEmojiElementId, moodEmojiEls)

  const chosenMoodValue = returnMoodValueFromElementId(selectedMoodEmojiElementId)
console.log(`chosenMoodValue = ${chosenMoodValue}`)

  moodState = chosenMoodValue
}

function changeMoodsStyleAfterSelection(selectedMoodEmojiElementId, allMoodElements) {
  for (let moodEmojiEl of moodEmojiEls) {
    if (selectedMoodEmojiElementId === moodEmojiEl.id) {
      moodEmojiEl.classList.remove("unselected-emoji")
      moodEmojiEl.classList.add("selected-emoji")
    }
    else {
      moodEmojiEl.classList.remove("selected-emoji")
      moodEmojiEl.classList.add("unselected-emoji")
    }
  }
}

function resetAllMoodElements(allMoodElements) {
  for (let moodEmojiEl of allMoodElements) {
    moodEmojiEl.classList.remove("selected-emoji")
    moodEmojiEl.classList.remove("unselected-emoji")
  }
  moodState = 0
}

function returnMoodValueFromElementId(elementId) {
  return Number(elementId.slice(5))
}

// #endregion
