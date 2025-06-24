import { register } from "../server/auth.js";

document
  .getElementById("registerForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      alert("Please enter all required information!");
      return;
    }

    // Check if there is already an admin account
    let role = "user";
    try {
      let res = await fetch("http://localhost:3000/TaiKhoan");
      let accounts = await res.json();
      if (!accounts.some((acc) => acc.VaiTro === "admin")) {
        role = "admin";
      }
    } catch {
      let accounts = JSON.parse(localStorage.getItem("TaiKhoan") || "[]");
      if (!accounts.some((acc) => acc.VaiTro === "admin")) {
        role = "admin";
      }
    }

    // Register with determined role
    const result = await register(username, password, role);
    if (result.success) {
      alert(`Registration successful! Your role is: ${role}. Please login.`);
      window.location.href = "login.html";
    } else {
      alert(result.message);
    }
  });
alert(`Đăng ký thành công! Vai trò của bạn là: ${role}. Vui lòng đăng nhập.`);
window.location.href = "login.html";
