const cartDiv = document.getElementById("cartList");
const checkoutBtn = document.getElementById("checkoutBtn");
const cartTotalDiv = document.getElementById("cartTotal");

function renderCart() {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  if (cart.length === 0) {
    cartDiv.innerHTML = `<div class="empty-cart">Giỏ hàng trống!</div>`;
    cartTotalDiv.textContent = "";
    checkoutBtn.style.display = "none";
    return;
  }
  let total = 0;
  cartDiv.innerHTML = `
    <table class="cart-table">
      <thead>
        <tr>
          <th>Ảnh</th>
          <th>Tên sản phẩm</th>
          <th>Giá</th>
          <th>Số lượng</th>
          <th>Thành tiền</th>
          <th>Xóa</th>
        </tr>
      </thead>
      <tbody>
        ${cart.map(item => {
          const itemTotal = item.price * item.quantity;
          total += itemTotal;
          return `
            <tr>
              <td><img src="${item.image || 'img/menu1.jpg'}" alt="${item.name}"></td>
              <td>${item.name}</td>
              <td>${item.price.toLocaleString()}</td>
              <td>${item.quantity}</td>
              <td>${itemTotal.toLocaleString()}</td>
              <td><button class="btn" style="width:auto;padding:4px 12px;" onclick="removeFromCart('${item.id}')">Xóa</button></td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
  cartTotalDiv.textContent = `Tổng tiền: ${total.toLocaleString()} VNĐ`;
  checkoutBtn.style.display = "inline-block";
}

window.removeFromCart = function(id) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart = cart.filter(item => item.id !== id);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
};

checkoutBtn.onclick = function() {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  // Lưu thống kê cho admin
  let thongke = JSON.parse(localStorage.getItem("thongke") || "{}");
  cart.forEach(item => {
    // Thống kê số lượng sản phẩm
    thongke[item.id] = thongke[item.id] || { name: item.name, SoLuong: 0, DoanhThu: 0 };
    thongke[item.id].SoLuong += item.quantity;
    thongke[item.id].DoanhThu += item.price * item.quantity;
  });
  localStorage.setItem("thongke", JSON.stringify(thongke));
  // Xóa giỏ hàng và chuyển trang cảm ơn
  localStorage.removeItem("cart");
  window.location.href = "thankyou.html";
};

renderCart();
