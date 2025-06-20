const productList = document.getElementById("productList");
const categorySelect = document.getElementById("categorySelect");
const pagination = document.getElementById("pagination");

let products = [];
let currentPage = 1;
const pageSize = 4;

async function loadProducts() {
  const res = await fetch("../src/db.json");
  const data = await res.json();
  products = data.products;
  renderCategories();
  renderProducts();
}

function renderCategories() {
  const cats = [...new Set(products.map(p => p.category))];
  categorySelect.innerHTML = `<option value="">Tất cả</option>` + cats.map(c => `<option value="${c}">${c}</option>`).join("");
}



function renderProducts() {
  let filtered = products;
  const cat = categorySelect.value;
  const search = searchInput.value.trim().toLowerCase();
  if (cat) filtered = filtered.filter(p => p.category === cat);
  if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search));

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageProducts = filtered.slice(start, end);

  productList.innerHTML = pageProducts.map(p => `
    <div class="product">
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p>Giá: ${p.price}</p>
      <a href="product-detail.html?id=${p.id}">Xem chi tiết</a>
      <button onclick="addToCart('${p.id}')">Thêm vào giỏ</button>
    </div>
  `).join("");

  pagination.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += `<button ${i === currentPage ? "disabled" : ""} onclick="gotoPage(${i})">${i}</button>`;
  }
}

categorySelect.addEventListener("change", function() {
  currentPage = 1;
  renderProducts();
});

window.gotoPage = function(page) {
  currentPage = page;
  renderProducts();
};

window.addToCart = function(id) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const prod = products.find(p => p.id === id);
  const idx = cart.findIndex(item => item.id === id);
  if (idx > -1) {
    cart[idx].quantity += 1;
  } else {
    cart.push({ ...prod, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Đã thêm vào giỏ hàng!");
};

loadProducts();
