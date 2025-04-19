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
  
  let selectedImage = null;
  const currentUserPhone = localStorage.getItem("currentUserPhone");
  
  if (!currentUserPhone) {
    alert("Please log in first.");
    window.location.href = "login.html";
  }
  
  const dropzone = document.getElementById("dropzone");
  const imageInput = document.getElementById("imageInput");
  const previewImage = document.getElementById("previewImage");
  const form = document.getElementById("newPostForm");
  const submitBtn = document.getElementById("submitBtn");
  
  dropzone.addEventListener("click", () => imageInput.click());
  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });
  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover");
  });
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    handleImage(e.dataTransfer.files[0]);
  });
  imageInput.addEventListener("change", (e) => {
    handleImage(e.target.files[0]);
  });
  
  function handleImage(file) {
    if (!file) return;
    selectedImage = file;
    console.log("Selected image:", file.name); // ✅ debug log
  
    const reader = new FileReader();
    reader.onload = function (e) {
      previewImage.src = e.target.result;
      previewImage.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
  
  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const contentInput = document.getElementById("content");
    const content = contentInput.value.trim();
  
    if (!content || !selectedImage) {
      alert("Please enter content and select an image.");
      return;
    }
  
    submitBtn.disabled = true;
    submitBtn.textContent = "Posting...";
  
    const formData = new FormData();
    formData.append("image", selectedImage);
  
    try {
      const res = await fetch("http://127.0.0.1:5001/upload-avatar", {
        method: "POST",
        body: formData
      });
  
      const data = await res.json();
  
      if (data.url) {
        await db.collection("posts").add({
          content,
          image: data.url,
          userPhone: currentUserPhone,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
  
        // ✅ Show toast
        const toast = document.getElementById("toast");
        toast.classList.add("show");
  
        // ✅ Reset form
        contentInput.value = "";
        imageInput.value = "";
        previewImage.src = "";
        previewImage.style.display = "none";
        selectedImage = null;
  
        setTimeout(() => {
          toast.classList.remove("show");
          window.location.href = "profile.html";
        }, 1500);
      } else {
        alert("Image upload failed.");
      }
    } catch (err) {
      alert("Error: " + err.message);
      console.error(err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Post";
    }
  });
  
  