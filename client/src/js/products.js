const productList = document.getElementById("productList");
const categorySelect = document.getElementById("categorySelect");
const pagination = document.getElementById("pagination");

// Thêm ô tìm kiếm sản phẩm
const searchInput = document.createElement("input");
searchInput.type = "text";
searchInput.placeholder = "Search product name...";
searchInput.style =
  "margin:12px 0;padding:8px 12px;width:220px;border-radius:6px;border:1px solid #ccc;font-size:1em;";
categorySelect.parentNode.insertBefore(searchInput, categorySelect.nextSibling);

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
  const cats = [...new Set(products.map((p) => p.category))];
  categorySelect.innerHTML =
    `<option value="">Tất cả</option>` +
    cats.map((c) => `<option value="${c}">${c}</option>`).join("");
}

function createUpdateButton(product) {
  return `<button class="btn" style="width:auto;padding:4px 12px;" onclick="updateProductPrompt('${product.id}')">Update</button>`;
}

window.updateProductPrompt = function (id) {
  const prod = products.find((p) => p.id === id);
  if (!prod) return;
  const newName = prompt("Update product name:", prod.name);
  if (newName === null) return;
  const newPrice = prompt("Update price:", prod.price);
  if (newPrice === null) return;
  const newDesc = prompt("Update description:", prod.description);
  if (newDesc === null) return;
  const newImage = prompt("Update image URL:", prod.image);
  if (newImage === null) return;
  const newCategory = prompt("Update category:", prod.category);
  if (newCategory === null) return;

  fetch(`http://localhost:3000/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...prod,
      name: newName,
      price: parseFloat(newPrice),
      description: newDesc,
      image: newImage,
      category: newCategory,
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    })
    .then(() => {
      alert("Product updated!");
      loadProducts();
    })
    .catch(() => alert("Update failed!"));
};

function renderProducts() {
  let filtered = products;
  const cat = categorySelect.value;
  const search = searchInput.value.trim().toLowerCase();
  if (cat) filtered = filtered.filter((p) => p.category === cat);
  if (search)
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(search));

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageProducts = filtered.slice(start, end);

  productList.innerHTML = pageProducts
    .map(
      (p) => `
    <div class="product">
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p>Giá: ${p.price}</p>
      <a href="product-detail.html?id=${p.id}">Xem chi tiết</a>
      <button onclick="addToCart('${p.id}')">Thêm vào giỏ</button>
      ${createUpdateButton(p)}
    </div>
  `
    )
    .join("");

  pagination.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += `<button ${
      i === currentPage ? "disabled" : ""
    } onclick="gotoPage(${i})">${i}</button>`;
  }
}

categorySelect.addEventListener("change", function () {
  currentPage = 1;
  renderProducts();
});

window.gotoPage = function (page) {
  currentPage = page;
  renderProducts();
};

window.addToCart = function (id) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const prod = products.find((p) => p.id === id);
  const idx = cart.findIndex((item) => item.id === id);
  if (idx > -1) {
    cart[idx].quantity += 1;
  } else {
    cart.push({ ...prod, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Đã thêm vào giỏ hàng!");
};

searchInput.addEventListener("input", function () {
  currentPage = 1;
  renderProducts();
});

loadProducts();
