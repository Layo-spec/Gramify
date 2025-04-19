// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyDOE9D88xrVn3UZKLlPeNJT7_LzZvTnxYA",
  authDomain: "gramify-31432.firebaseapp.com",
  projectId: "gramify-31432",
  storageBucket: "gramify-31432.appspot.com",
  messagingSenderId: "433332533057",
  appId: "1:433332533057:web:cbab71ca12b4e19d1913c0"
};
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();

let currentUserPhone = "";

// 🔐 Check Auth State
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    currentUserPhone = user.phoneNumber;
    document.getElementById('appSection').style.display = 'block';
    document.getElementById('profilePhone').textContent = `Phone: ${currentUserPhone}`;
    loadCircleAndPosts(currentUserPhone);
  }
});

// --- Post Logic ---
let posts = [];
let circleMap = {};

function loadPostsForUser(phoneNumber) {
  db.collection('posts')
    .orderBy('timestamp', 'desc')
    .get()
    .then(snapshot => {
      posts = snapshot.docs.map(doc => doc.data());
      renderPosts(phoneNumber);
    });
}

function loadCircleAndPosts(phoneNumber) {
  db.collection('circles')
    .where('owner', '==', phoneNumber)
    .get()
    .then(snapshot => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        circleMap[phoneNumber] = data.friends;
      } else {
        circleMap[phoneNumber] = [];
      }
      loadPostsForUser(phoneNumber);
      renderCircleUI(phoneNumber);
    });
}

function renderCircleUI(phoneNumber) {
  const list = document.getElementById('circleList');
  list.innerHTML = '';
  const friends = circleMap[phoneNumber] || [];

  friends.forEach(friend => {
    const li = document.createElement('li');
    li.textContent = friend;
    list.appendChild(li);
  });
}

function addToCircle() {
  const friend = document.getElementById('newFriend').value.trim();
  if (!friend || !currentUserPhone) return;

  const ref = db.collection('circles').where('owner', '==', currentUserPhone);
  ref.get().then(snapshot => {
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const friends = doc.data().friends || [];
      if (!friends.includes(friend)) {
        friends.push(friend);
        doc.ref.update({ friends }).then(() => {
          alert('Added to circle!');
          circleMap[currentUserPhone] = friends;
          renderCircleUI(currentUserPhone);
          loadPostsForUser(currentUserPhone);
        });
      }
    } else {
      db.collection('circles').add({
        owner: currentUserPhone,
        friends: [friend]
      }).then(() => {
        alert('Created new circle and added friend!');
        circleMap[currentUserPhone] = [friend];
        renderCircleUI(currentUserPhone);
        loadPostsForUser(currentUserPhone);
      });
    }
  });

  document.getElementById('newFriend').value = '';
}

function renderPosts(phoneNumber) {
  const feed = document.getElementById('feed');
  feed.innerHTML = '';
  const allowed = circleMap[phoneNumber] || [];

  posts
    .filter(post => allowed.includes(post.userPhone))
    .forEach(post => {
      const postDiv = document.createElement('div');
      postDiv.className = 'post';
      postDiv.innerHTML = `
        <h3>${post.userPhone}</h3>
        <p>${post.content}</p>
        <img src="${post.image}" alt="Post image">
      `;
      feed.appendChild(postDiv);
    });
}

function showProfile() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const phone = user.phoneNumber;
  document.getElementById('profilePhone').textContent = `Phone: ${phone}`;

  db.collection('users').doc(phone).get().then(doc => {
    if (doc.exists && doc.data().avatar) {
      const avatarUrl = doc.data().avatar;
      const avatar = document.getElementById('profileAvatar');
      avatar.src = avatarUrl;
      avatar.style.display = 'block';
    }
  });

  function logout() {
    firebase.auth().signOut().then(() => {
      window.location.href = "login.html";
    });
  }
  

  const container = document.getElementById('myPosts');
  container.innerHTML = '<p>Loading your posts...</p>';

  db.collection('posts')
    .where('userPhone', '==', phone)
    .orderBy('timestamp', 'desc')
    .onSnapshot(snapshot => {
      const posts = snapshot.docs.map(doc => doc.data());
      document.getElementById('profilePostCount').textContent = `Posts: ${posts.length}`;

      container.innerHTML = '';
      posts.forEach(post => {
        const div = document.createElement('div');
        div.className = 'post';
        div.innerHTML = `
          <p>${post.content}</p>
          <img src="${post.image}" alt="Post image">
        `;
        container.appendChild(div);
      });
    });

  document.getElementById('appSection').style.display = 'none';
  document.getElementById('profileSection').style.display = 'block';
}

function goBackToFeed() {
  document.getElementById('profileSection').style.display = 'none';
  document.getElementById('appSection').style.display = 'block';
}

async function uploadAvatar() {
  const input = document.getElementById('avatarInput');
  const file = input.files[0];
  const formData = new FormData();
  formData.append('image', file);

  fetch('http://127.0.0.1:5001/upload-avatar', {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.url) {
        const imageUrl = data.url;
        const user = firebase.auth().currentUser;
        if (user) {
          db.collection('users').doc(user.phoneNumber).set({
            avatar: imageUrl
          }, { merge: true });
          document.getElementById('profileAvatar').src = imageUrl;
          alert("Avatar uploaded successfully!");
        }
      } else {
        alert("Upload failed: " + (data.error || "Unknown error"));
      }
    });
}

document.getElementById('newPostForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const content = document.getElementById('content').value;
  const image = document.getElementById('image').value;

  db.collection('posts').add({
    content,
    image,
    userPhone: currentUserPhone,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    alert("Post added!");
    loadPostsForUser(currentUserPhone);
    e.target.reset();
  });
});
