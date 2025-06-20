import { login } from "../server/auth.js";

// DOM handler
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Please enter your username and password.");
    return;
  }

  // Gọi hàm login từ server/auth.js (ưu tiên kiểm tra db.json nếu có API)
  const result = await login(username, password);
  if (result.success) {
    // Đảm bảo lưu user object đầy đủ (bao gồm VaiTro)
    localStorage.setItem('currentUser', JSON.stringify(result.user));
    alert("Login successful!");
    window.location.href = "index.html";
  } else {
    alert(result.message || "Incorrect username or password!");
  }
});
