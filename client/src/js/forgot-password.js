import { forgotPassword } from "../server/auth.js";

document
  .getElementById("forgotForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();

    if (!username) {
      document.getElementById("result").textContent =
        "Vui lòng nhập tên tài khoản!";
      return;
    }

    // Gọi hàm forgotPassword từ server/auth.js
    const result = await forgotPassword(username);
    const resultDiv = document.getElementById("result");
    if (result.success) {
      resultDiv.textContent = `Mật khẩu của bạn là: ${result.password}`;
    } else {
      resultDiv.textContent = result.message || "Không tìm thấy tài khoản!";
    }
  });
