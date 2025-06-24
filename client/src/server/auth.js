const API_URL = "http://localhost:3000/TaiKhoan";

// Đăng ký tài khoản mới
export async function register(TenTK, MatKhau, VaiTro = "user") {
  try {
    // Kiểm tra username đã tồn tại chưa (API)
    let res = await fetch(API_URL);
    let accounts = await res.json();
    if (accounts.some((acc) => acc.TenTK === TenTK)) {
      return { success: false, message: "Tên tài khoản đã tồn tại!" };
    }
    // Tạo MaTK mới
    const newId =
      accounts.length > 0
        ? (parseInt(accounts[accounts.length - 1].MaTK) + 1).toString()
        : "1";
    const newAccount = { MaTK: newId, TenTK, MatKhau, VaiTro };
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAccount),
    });
    return { success: true, message: "Đăng ký thành công!" };
  } catch (e) {
    // Fallback localStorage nếu không có API
    let accounts = JSON.parse(localStorage.getItem("TaiKhoan") || "[]");
    if (accounts.some((acc) => acc.TenTK === TenTK)) {
      return { success: false, message: "Tên tài khoản đã tồn tại!" };
    }
    const newId =
      accounts.length > 0
        ? (parseInt(accounts[accounts.length - 1].MaTK) + 1).toString()
        : "1";
    accounts.push({ MaTK: newId, TenTK, MatKhau, VaiTro });
    localStorage.setItem("TaiKhoan", JSON.stringify(accounts));
    return { success: true, message: "Đăng ký thành công (local)!" };
  }
}

// Đăng nhập
export async function login(TenTK, MatKhau) {
  try {
    let res = await fetch(
      API_URL +
        `?TenTK=${encodeURIComponent(TenTK)}&MatKhau=${encodeURIComponent(
          MatKhau
        )}`
    );
    let users = await res.json();
    if (users.length > 0) {
      saveSession(users[0]);
      return { success: true, user: users[0] };
    }
    return { success: false, message: "Sai tên đăng nhập hoặc mật khẩu!" };
  } catch (e) {
    let accounts = JSON.parse(localStorage.getItem("TaiKhoan") || "[]");
    let user = accounts.find(
      (acc) => acc.TenTK === TenTK && acc.MatKhau === MatKhau
    );
    if (user) {
      saveSession(user);
      return { success: true, user };
    }
    return { success: false, message: "Sai tên đăng nhập hoặc mật khẩu!" };
  }
}

// Quên mật khẩu
export async function forgotPassword(TenTK) {
  try {
    let res = await fetch(API_URL + `?TenTK=${encodeURIComponent(TenTK)}`);
    let users = await res.json();
    if (users.length > 0) {
      return { success: true, password: users[0].MatKhau };
    }
    return { success: false, message: "Không tìm thấy tài khoản!" };
  } catch (e) {
    let accounts = JSON.parse(localStorage.getItem("TaiKhoan") || "[]");
    let user = accounts.find((acc) => acc.TenTK === TenTK);
    if (user) {
      return { success: true, password: user.MatKhau };
    }
    return { success: false, message: "Không tìm thấy tài khoản!" };
  }
}

export function saveSession(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

export function getSession() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

export function clearSession() {
  localStorage.removeItem("currentUser");
}
