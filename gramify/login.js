// const db = firebase.firestore();

// document.getElementById("loginBtn").addEventListener("click", async () => {
//   const username = document.getElementById("username").value.trim();
//   const password = document.getElementById("password").value.trim();

//   if (!username || !password) {
//     alert("Please enter both username and password.");
//     return;
//   }

//   try {
//     // Query the users collection where the username matches
//     const snapshot = await db.collection("users").where("username", "==", username).get();

//     if (snapshot.empty) {
//       alert("Username not found.");
//       return;
//     }

//     let matchedUser = null;

//     snapshot.forEach(doc => {
//       const userData = doc.data();
//       if (userData.password === password) {
//         matchedUser = userData;
//       }
//     });

//     if (matchedUser) {
//       alert("✅ Login successful!");
//       localStorage.setItem("loggedInPhone", matchedUser.phone); // Store phone to reuse
//       window.location.href = "feed.html";
//     } else {
//       alert("Incorrect password.");
//     }

//   } catch (error) {
//     console.error("Login error:", error);
//     alert("Something went wrong. Try again.");
//   }
  
// });


// login.js
const db = firebase.firestore();

document.getElementById("loginBtn").addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    return alert("Please enter both username and password.");
  }

  try {
    const snapshot = await db.collection("users").where("username", "==", username).get();

    if (snapshot.empty) {
      return alert("❌ Username not found.");
    }

    let foundUser = null;
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.password === password) {
        foundUser = data;
      }
    });

    if (foundUser) {
      localStorage.setItem("currentUserPhone", foundUser.phone);
      alert("✅ Login successful!");
      window.location.href = "feed.html"; // ✅ This is the redirect
    } else {
      alert("Incorrect password.");
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("Something went wrong. Try again.");
  }
});
