/* === Imports === */
// #region

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
  onSnapshot,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
// #endregion

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

const allFilterButtonEl = document.getElementById("all-filter-btn")
const filterButtonEls = document.getElementsByClassName("filter-btn")

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

for (let filterButtonEl of filterButtonEls) {
  filterButtonEl.addEventListener("click", selectFilter)
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
    updateFilterButtonStyle(allFilterButtonEl)
    fetchAllPosts(user)
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
// #region

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

function fetchInRealtimeAndRenderPostsFromDB(query, user) {
  onSnapshot(query, (querySnapshot) => {
    clearAll(postsEl)

    querySnapshot.forEach((doc) => {
      renderPost(postsEl, doc.data())
    })
  })
}

function fetchTodayPosts(user) {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  const postsRef = collection(db, collectionName)

  const q = query(postsRef, where("uid", "==", user.uid),
                            where("timestamp", ">=", startOfDay),
                            where("timestamp", "<=", endOfDay),
                            orderBy("timestamp", "desc"))

  fetchInRealtimeAndRenderPostsFromDB(q, user)
}

function fetchWeekPosts(user) {
  const startOfWeek = new Date()
  startOfWeek.setHours(0, 0, 0, 0)
  
  if (startOfWeek.getDate() === 0) { // if today is Sunday
    startOfWeek.setDate(startOfWeek.getDate - 6)
  } else {
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1)
  }

  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  const postsRef = collection(db, collectionName)

  const q = query(postsRef, where("uid", "==", user.uid),
                            where("timestamp", ">=", startOfWeek),
                            where("timestamp", "<=", endOfDay),
                            orderBy("timestamp", "desc"))

  fetchInRealtimeAndRenderPostsFromDB(q, user)
}

function fetchMonthPosts(user) {
  const startOfMonth = new Date()
  startOfMonth.setHours(0, 0, 0, 0)
  startOfMonth.setDate(1)

  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  const postsRef = collection(db, collectionName)

  const q = query(postsRef, where("uid", "==", user.uid),
                            where("timestamp", ">=", startOfMonth),
                            where("timestamp", "<=", endOfDay),
                            orderBy("timestamp", "desc"))

  fetchInRealtimeAndRenderPostsFromDB(q, user)
}

function fetchAllPosts(user) {
      const postsRef = collection(db, collectionName)

      const q = query(postsRef, where("uid", "==", user.uid),
                                orderBy("timestamp", "desc"))
    
      fetchInRealtimeAndRenderPostsFromDB(q, user)
}
// #endregion

/* == Functions - UI Functions == */
// #region

function renderPost(postsEl, postData) {
  /* <div class="post">All code for the post goes here</div> */
  const postDiv = document.createElement("div")
  postDiv.className = "post"

  // put the header and paragraph inside the postDiv
  postDiv.appendChild(createPostHeader(postData))
  postDiv.appendChild(createPostBody(postData))

  // Add the post to the posts section of the app.
  postsEl.append(postDiv)
}

function createPostHeader(postData) {
  /* <div class="header"> </div> */
  let headerDiv = document.createElement("div")
  headerDiv.className = "header"

  /* <h3>${displayDate(postData.timestamp)}</h3> */
  const headerDate = document.createElement("h3")
  headerDate.textContent = displayDate(postData.timestamp)
  headerDiv.appendChild(headerDate)

  /* <img src="assets/emojis/${postData.mood}.png"> */
  const moodImg = document.createElement("img")
  moodImg.src = `assets/emojis/${postData.mood}.png`
  headerDiv.appendChild(moodImg)

  return headerDiv
}

function createPostBody(postData) {
  /* <p>${replaceNewlinesWithBrTags(postData.body)}</p> */
  const postBody = document.createElement("p")
  postBody.innerHTML = replaceNewlinesWithBrTags(postData.body)
  
  return postBody
}



function replaceNewlinesWithBrTags(inputString) {
  inputString = inputString.replaceAll(/\n/g, "<br>")
  return inputString
}

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
  if (!firebaseDate) {
    return "Date processing..."
  }

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

// #endregion

/* == Functions - UI Functions - Mood == */
// #region
function selectMood(event) {
  const selectedMoodEmojiElementId = event.currentTarget.id

  // Incr size of chosen; gray out others
  changeMoodsStyleAfterSelection(selectedMoodEmojiElementId, moodEmojiEls)

  const chosenMoodValue = returnMoodValueFromElementId(selectedMoodEmojiElementId)
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

/* == Functions - UI Functions - Date Filters == */
// #region

function resetAllFilterButtons(allFilterButtons) {
  for (let filterButtonEl of allFilterButtons) {
      filterButtonEl.classList.remove("selected-filter")
  }
}

function updateFilterButtonStyle(element) {
  element.classList.add("selected-filter")
}

function fetchPostsFromPeriod(period, user) {
  if (period === "today") {
    fetchTodayPosts(user)
  }
  else if (period === "week") {
    fetchWeekPosts(user)
  }
  else if (period === "month") {
    fetchMonthPosts(user)
  }
  else {
    fetchAllPosts(user)
  }
}

function selectFilter(event) {
  const user = auth.currentUser
  
  const selectedFilterElementId = event.target.id
  
  const selectedFilterPeriod = selectedFilterElementId.split("-")[0]
  
  const selectedFilterElement = document.getElementById(selectedFilterElementId)
  
  resetAllFilterButtons(filterButtonEls)
  
  updateFilterButtonStyle(selectedFilterElement)

  fetchPostsFromPeriod(selectedFilterPeriod, user)
}
// #endregion
