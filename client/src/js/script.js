// Navbar, Search, Cart toggle
let navbar = document.querySelector(".navbar");
let searchForm = document.querySelector(".search-form");
let cartItem = document.querySelector(".cart-items-container"); // This is the off-canvas cart

document.querySelector("#menu-btn").onclick = () => {
  navbar.classList.toggle("active");
  searchForm.classList.remove("active");
  cartItem.classList.remove("active");
};

document.querySelector("#search-btn").onclick = () => {
  searchForm.classList.toggle("active");
  navbar.classList.remove("active");
  cartItem.classList.remove("active");
};

document.querySelector("#cart-btn").onclick = () => {
  cartItem.classList.toggle("active");
  navbar.classList.remove("active");
  searchForm.classList.remove("active");
  // Khi mở off-canvas cart, render lại nó
  renderCart();
};

window.onscroll = () => {
  navbar.classList.remove("active");
  searchForm.classList.remove("active");
  cartItem.classList.remove("active");
};

// ------------------- UTILITY FUNCTION -------------------
const API_BASE_URL = ""; // Đảm bảo URL này khớp với JSON Server của bạn

async function fetchData(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      // Log chi tiết lỗi từ server nếu có
      const errorText = await response.text();
      console.error(
        `HTTP error! Status: ${response.status}, Response: ${errorText}`
      );
      throw new Error(
        `HTTP error! Status: ${response.status}, Message: ${errorText}`
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error; // Re-throw the error to be caught by the caller
  }
}

// ------------------- ADMIN CRUD -------------------
const adminProductFormContainer = document.getElementById(
  "admin-product-form-container"
);
const productFormTitle = adminProductFormContainer
  ? adminProductFormContainer.querySelector(".form-title")
  : null;
const productIdField = document.getElementById("product-id");
const productNameInput = document.getElementById("product-name-input");
const productPriceInput = document.getElementById("product-price-input");
const productImageInput = document.getElementById("product-image-input");
const productCategoryInput = document.getElementById("product-category-input");
const saveProductBtn = document.getElementById("save-product-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const showAddProductFormBtn = document.getElementById(
  "show-add-product-form-btn"
);

function showProductForm(mode = "add", productData = null) {
  if (!adminProductFormContainer) return;
  adminProductFormContainer.style.display = "block";
  if (mode === "edit" && productData) {
    productFormTitle.textContent = "Edit Product";
    productIdField.value = productData.id;
    productNameInput.value = productData.name;
    productPriceInput.value = productData.price;
    productImageInput.value = productData.image;
    productCategoryInput.value = productData.category || "";
    cancelEditBtn.style.display = "inline-block";
  } else {
    productFormTitle.textContent = "Add New Product";
    productIdField.value = "";
    productNameInput.value = "";
    productPriceInput.value = "";
    productImageInput.value = "";
    productCategoryInput.value = "";
    cancelEditBtn.style.display = "none";
  }
}

function resetProductForm() {
  if (!adminProductFormContainer) return;
  adminProductFormContainer.style.display = "none";
  productFormTitle.textContent = "Add/Edit Product";
  productIdField.value = "";
  productNameInput.value = "";
  productPriceInput.value = "";
  productImageInput.value = "";
  productCategoryInput.value = "";
  cancelEditBtn.style.display = "none";
}

if (showAddProductFormBtn)
  showAddProductFormBtn.addEventListener("click", () => showProductForm("add"));
if (saveProductBtn)
  saveProductBtn.addEventListener("click", handleProductFormSubmit);
if (cancelEditBtn) cancelEditBtn.addEventListener("click", resetProductForm);

async function handleProductFormSubmit() {
  const name = productNameInput.value.trim();
  const price = parseFloat(productPriceInput.value);
  const image = productImageInput.value.trim();
  const category = productCategoryInput.value.trim();
  const currentId = productIdField.value;

  if (!name || isNaN(price) || price <= 0 || !image || !category) {
    alert(
      "Vui lòng nhập đầy đủ và hợp lệ thông tin sản phẩm (tên, giá > 0, URL hình ảnh, danh mục)."
    );
    return;
  }

  const productData = { name, price, image, category };

  try {
    if (currentId) {
      // Edit existing product
      await fetchData(`${API_BASE_URL}/products/${currentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      alert("Đã cập nhật sản phẩm thành công!");
    } else {
      // Add new product
      await fetchData(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      alert("Sản phẩm đã được thêm thành công!");
    }
    loadAdminProducts(); // Tải lại sản phẩm cho trang admin
    loadMenuProducts(); // Tải lại sản phẩm cho trang menu chính
    loadProductsForProductsSection(); // Tải lại sản phẩm cho section 'products' (nếu có)
    resetProductForm();
  } catch (error) {
    console.error("Lỗi khi lưu sản phẩm: ", error);
    alert("Đã xảy ra lỗi khi lưu sản phẩm. Vui lòng thử lại.");
  }
}

async function loadAdminProducts() {
  const tableBody = document.querySelector(".admin-product-table tbody");
  if (!tableBody) return;
  tableBody.innerHTML = ""; // Clear existing rows

  try {
    const products = await fetchData(`${API_BASE_URL}/products`);
    products.forEach((product) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${
                  product.id ? product.id.substring(0, 6) + "..." : "N/A"
                }</td>
                <td><img src="${product.image}" alt="${
        product.name
      }" style="width: 50px; height: 50px; object-fit: cover;"></td>
                <td>${product.name}</td>
                <td>₹${product.price.toFixed(2)}</td>
                <td>${product.category || ""}</td>
                <td>
                    <button class="btn small-btn" onclick="editProduct('${
                      product.id
                    }')">Edit</button>
                    <button class="btn small-btn delete-btn" onclick="deleteProduct('${
                      product.id
                    }')">Delete</button>
                </td>
            `;
      tableBody.appendChild(tr);
    });
  } catch (error) {
    console.error("Lỗi khi tải sản phẩm admin: ", error);
    // Optionally display an error message in the UI
  }
}

// Make editProduct and deleteProduct globally accessible for inline onclick
window.editProduct = async function (id) {
  try {
    const product = await fetchData(`${API_BASE_URL}/products/${id}`);
    showProductForm("edit", product);
    adminProductFormContainer.scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm để sửa: ", error);
    alert("Không thể tải thông tin sản phẩm để sửa.");
  }
};

window.deleteProduct = async function (id) {
  if (confirm("Bạn có chắc muốn xoá sản phẩm này?")) {
    try {
      await fetchData(`${API_BASE_URL}/products/${id}`, { method: "DELETE" });
      alert("Đã xoá sản phẩm thành công!");
      loadAdminProducts(); // Tải lại sản phẩm cho trang admin
      loadMenuProducts(); // Tải lại sản phẩm cho trang menu chính
      loadProductsForProductsSection(); // Tải lại sản phẩm cho section 'products' (nếu có)
    } catch (error) {
      console.error("Lỗi khi xoá sản phẩm: ", error);
      alert("Đã xảy ra lỗi khi xoá sản phẩm.");
    }
  }
};

// ------------------- Load products for the main menu section -------------------
async function loadMenuProducts(search = "") {
  const menuProductContainer = document.getElementById(
    "menu-product-container"
  );
  if (!menuProductContainer) return;

  menuProductContainer.innerHTML = "";

  try {
    const products = await fetchData(`${API_BASE_URL}/products`);
    let filtered = products;
    if (search) {
      filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          (p.description && p.description.toLowerCase().includes(search))
      );
    }

    if (filtered.length === 0) {
      menuProductContainer.innerHTML =
        '<p style="text-align: center; color: var(--black);">No products found.</p>';
      return;
    }

    filtered.forEach((product) => {
      const productBox = document.createElement("div");
      productBox.classList.add("box");
      productBox.setAttribute("data-category", product.category || "general");
      productBox.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <div class="price">
                    $${product.price.toFixed(2)}
                    ${
                      product.originalPrice
                        ? `<span>${product.originalPrice.toFixed(2)}</span>`
                        : ""
                    }
                </div>
                <a href="#" class="btn add-to-cart-btn-menu"
                    data-id="${product.id}"
                    data-name="${product.name}"
                    data-price="${product.price}"
                    data-image="${product.image}">
                    add to cart
                </a>
                <a href="product-detail.html?id=${product.id}" class="btn">
                    view details
                </a>
            `;
      menuProductContainer.appendChild(productBox);
    });

    setupMenuAddToCartButtons();
  } catch (error) {
    console.error("Lỗi khi tải sản phẩm cho menu chính:", error);
    menuProductContainer.innerHTML =
      '<p style="text-align: center; color: red;">Cannot load products. Please check JSON Server!</p>';
  }
}

// ------------------- USER PRODUCTS (Section 'products' với phân trang và lọc) -------------------
const productsPerPage = 6;
let currentPage = 1;
let currentCategory = "all";
let allProductsData = []; // Mảng này sẽ lưu trữ tất cả sản phẩm từ JSON Server

async function loadProductsForProductsSection() {
  try {
    allProductsData = await fetchData(`${API_BASE_URL}/products`);
    setupProductFilters(allProductsData);
    filterAndDisplayProducts(allProductsData);
  } catch (error) {
    console.error("Lỗi khi tải sản phẩm cho section 'products':", error);
    const productContainer = document.querySelector(".products .box-container");
    if (productContainer) {
      productContainer.innerHTML =
        '<p style="text-align: center; color: red;">Không thể tải sản phẩm cho mục này.</p>';
    }
  }
}

function displayProducts(productsToDisplay, page) {
  const productContainer = document.querySelector(".products .box-container");
  if (!productContainer) return;
  productContainer.innerHTML = "";
  const start = (page - 1) * productsPerPage;
  const end = start + productsPerPage;
  const paginatedProducts = productsToDisplay.slice(start, end);

  if (paginatedProducts.length === 0) {
    productContainer.innerHTML =
      '<p style="text-align: center; color: var(--black);">Không có sản phẩm nào phù hợp.</p>';
    return;
  }

  paginatedProducts.forEach((product) => {
    const productBox = document.createElement("div");
    productBox.classList.add("box");
    productBox.setAttribute("data-category", product.category);
    productBox.innerHTML = `
            <div class="icons">
                <a href="#" class="fas fa-shopping-cart add-to-cart-btn-product"
                    data-id="${product.id}"
                    data-name="${product.name}"
                    data-price="${product.price}"
                    data-image="${product.image}">
                </a>
                <a href="#" class="fas fa-heart"></a>
                <a href="product-detail.html?id=${
                  product.id
                }" class="fas fa-eye"></a>
            </div>
            <div class="image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="content">
                <h3>${product.name}</h3>
                <div class="stars">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star-half-alt"></i>
                </div>
                <div class="price">
                    ₹${product.price.toFixed(2)}
                    ${
                      product.originalPrice
                        ? `<span>${product.originalPrice.toFixed(2)}</span>`
                        : ""
                    }
                </div>
            </div>
        `;
    productContainer.appendChild(productBox);
  });

  // Add event listeners for "add to cart" buttons in products section
  productContainer
    .querySelectorAll(".add-to-cart-btn-product")
    .forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const id = button.dataset.id;
        const name = button.dataset.name;
        const price = parseFloat(button.dataset.price);
        const image = button.dataset.image;
        addToCart({ id, name, price, image, quantity: 1 });
      });
    });
}

function setupPagination(productsToDisplay) {
  const paginationContainer = document.querySelector(".pagination");
  if (!paginationContainer) return;
  paginationContainer.innerHTML = "";
  const pageCount = Math.ceil(productsToDisplay.length / productsPerPage);

  for (let i = 1; i <= pageCount; i++) {
    const button = document.createElement("button");
    button.classList.add("btn", "page-btn");
    if (i === currentPage) {
      button.classList.add("active");
    }
    button.textContent = i;
    button.addEventListener("click", () => {
      currentPage = i;
      displayProducts(productsToDisplay, currentPage);
      updatePaginationButtons();
    });
    paginationContainer.appendChild(button);
  }
}

function updatePaginationButtons() {
  document.querySelectorAll(".page-btn").forEach((button) => {
    if (parseInt(button.textContent) === currentPage) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}

function setupProductFilters(productsSource) {
  const filterContainer = document.querySelector(".product-filters");
  if (!filterContainer) return;

  const categories = [
    "all",
    ...new Set(productsSource.map((p) => p.category).filter(Boolean)),
  ];

  filterContainer.innerHTML = "";
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.classList.add("btn", "filter-btn");
    if (category === currentCategory) {
      button.classList.add("active");
    }
    button.textContent =
      category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ");
    button.dataset.category = category;
    button.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-btn")
        .forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      currentCategory = category;
      currentPage = 1;
      filterAndDisplayProducts(productsSource);
    });
    filterContainer.appendChild(button);
  });
}

function filterAndDisplayProducts(productsSource) {
  let filteredProducts = productsSource;
  if (currentCategory !== "all") {
    filteredProducts = productsSource.filter(
      (product) => product.category === currentCategory
    );
  }
  displayProducts(filteredProducts, currentPage);
  setupPagination(filteredProducts);
}

// ------------------- CART + ORDER -------------------
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(product) {
  const existingProduct = cart.find((p) => p.id === product.id);
  if (existingProduct) {
    existingProduct.quantity = (existingProduct.quantity || 1) + 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`Đã thêm ${product.name} vào giỏ hàng!`);
  renderCart(); // Gọi renderCart để cập nhật hiển thị giỏ hàng pop-up
  // Nếu bạn đang ở trang cart.html, nó cũng sẽ được cập nhật nhờ renderCartPage()
}

// Global renderCart function (for off-canvas cart in header)
function renderCart() {
  const cartContainer = document.querySelector(".cart-items-container");
  if (!cartContainer) return;
  cartContainer.innerHTML = ""; // Clear previous items
  let subtotal = 0;

  if (cart.length === 0) {
    cartContainer.innerHTML =
      '<p style="color: var(--black); text-align: center; padding: 2rem;">Giỏ hàng của bạn trống.</p>';
    return;
  }

  cart.forEach((item, index) => {
    subtotal += item.price * item.quantity;
    const cartItemDiv = document.createElement("div");
    cartItemDiv.className = "cart-item";
    cartItemDiv.innerHTML = `
            <span class="fas fa-times remove-cart-item-btn" data-index="${index}"></span>
            <img src="${item.image}" alt="${item.name}">
            <div class="content">
                <h3>${item.name}</h3>
                <div class="price">₹${item.price.toFixed(2)} x ${
      item.quantity
    }</div>
            </div>
        `;
    cartContainer.appendChild(cartItemDiv);
  });

  // Add event listeners to remove buttons
  cartContainer.querySelectorAll(".remove-cart-item-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      removeCartItem(parseInt(this.dataset.index));
    });
  });

  const checkoutBtn = document.createElement("a");
  checkoutBtn.href = "cart.html"; // Điều hướng đến trang giỏ hàng chi tiết
  checkoutBtn.className = "btn";
  checkoutBtn.textContent = `Xem giỏ hàng (₹${subtotal.toFixed(2)})`; // Thay đổi text thành "Xem giỏ hàng"
  checkoutBtn.style.width = "100%";
  checkoutBtn.style.textAlign = "center";
  checkoutBtn.style.marginTop = "1rem"; // Thêm khoảng cách

  cartContainer.appendChild(checkoutBtn);
}

function removeCartItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart(); // Cập nhật giỏ hàng pop-up
  if (document.getElementById("cart-items-table-body")) {
    // Nếu đang ở trang cart.html
    renderCartPage(); // Cập nhật bảng giỏ hàng trên trang đó
  }
}

// Hàm createOrderFromCart đã được chỉnh sửa để nhận tên khách hàng
async function createOrderFromCart(customerName) {
  if (cart.length === 0) {
    alert("Giỏ hàng trống!");
    return;
  }

  const order = {
    customer_name: customerName, // Lấy tên khách hàng từ tham số
    customer_address: "Hà Nội (Test Address)", // Placeholder, có thể thêm input
    customer_email: "minh_test@example.com", // Placeholder, có thể thêm input
    customer_phone_number: "0123456789", // Placeholder, có thể thêm input
    items: cart.map((item) => ({
      productId: item.id,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
    })),
    total_amount: cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ),
    created_date: new Date().toISOString(),
    status: "pending",
  };

  try {
    const newOrder = await fetchData(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });

    // Đã xóa alert("Đơn hàng đã được tạo thành công!"); ở đây
    // Vì showThankYouPage sẽ hiển thị thông báo chi tiết hơn

    localStorage.removeItem("cart"); // Xóa giỏ hàng sau khi đặt thành công
    cart = []; // Reset giỏ hàng trong bộ nhớ
    renderCart(); // Cập nhật lại giỏ hàng pop-up (sẽ hiển thị trống)

    showThankYouPage(newOrder.id, customerName); // Gọi hàm hiển thị trang cảm ơn ngay lập tức
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng: ", error);
    alert(
      "Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại. Chi tiết lỗi: " +
        error.message
    );
  }
}

// Hàm hiển thị trang cảm ơn (ĐỊNH NGHĨA DUY NHẤT TẠI ĐÂY)
function showThankYouPage(orderId, customerName = "bạn") {
  const thankYouSection = document.getElementById("thank-you");
  const orderIdElement = document.getElementById("thank-you-order-id");
  const thankYouCustomerNameElement = document.getElementById(
    "thank-you-customer-name"
  );

  // Nếu không tìm thấy phần thank-you, có thể đang ở trang khác không có nó
  if (!thankYouSection) {
    // Có thể redirect về trang chủ và hiển thị alert nếu không có phần thank-you
    alert(
      `Cảm ơn ${customerName}! Đơn hàng #${orderId} của bạn đã được đặt thành công.`
    );
    window.location.href = "index.html#home";
    return;
  }

  if (orderIdElement) {
    orderIdElement.textContent = `Mã đơn hàng của bạn: #${orderId}`;
  }
  if (thankYouCustomerNameElement) {
    thankYouCustomerNameElement.textContent = customerName;
  }

  // Ẩn bảng giỏ hàng và tóm tắt khi hiển thị trang cảm ơn (áp dụng cho cart.html)
  const cartPageContainer = document.querySelector(
    ".cart-page .cart-table-container"
  );
  const cartSummary = document.querySelector(".cart-page .cart-summary");
  if (cartPageContainer) cartPageContainer.style.display = "none";
  if (cartSummary) cartSummary.style.display = "none";

  thankYouSection.style.display = "flex"; // Hiển thị phần cảm ơn
  thankYouSection.scrollIntoView({ behavior: "smooth" }); // Cuộn đến đó

  const continueShoppingBtn = document.getElementById("continue-shopping-btn");
  if (continueShoppingBtn) {
    continueShoppingBtn.onclick = (e) => {
      e.preventDefault();
      thankYouSection.style.display = "none";
      // Điều hướng về trang chủ
      window.location.href = "index.html#home";
    };
  }
}

// Hàm để render giỏ hàng trên trang cart.html (Chỉ được gọi nếu đang ở cart.html)
// Quan trọng: Hàm này được đặt trong window để có thể gọi từ onclick trong HTML của cart.html
window.renderCartPage = () => {
  const cartTableBody = document.getElementById("cart-items-table-body");
  const cartSubtotalElement = document.getElementById("cart-subtotal");
  const cartTotalElement = document.getElementById("cart-total");
  const proceedToCheckoutBtn = document.getElementById("proceed-to-checkout");
  const customerNameInput = document.getElementById("customer-name-input");

  if (
    !cartTableBody ||
    !cartSubtotalElement ||
    !cartTotalElement ||
    !proceedToCheckoutBtn ||
    !customerNameInput
  ) {
    // Các phần tử này chỉ tồn tại trên cart.html. Nếu không có, không làm gì.
    return;
  }

  // Đảm bảo phần thank-you ẩn khi tải lại trang giỏ hàng
  const thankYouSection = document.getElementById("thank-you");
  if (thankYouSection) thankYouSection.style.display = "none";

  // Hiển thị lại bảng giỏ hàng và tóm tắt nếu chúng bị ẩn trước đó
  const cartTableContainer = document.querySelector(
    ".cart-page .cart-table-container"
  );
  const cartSummary = document.querySelector(".cart-page .cart-summary");
  if (cartTableContainer) cartTableContainer.style.display = "block";
  if (cartSummary) cartSummary.style.display = "block";

  cartTableBody.innerHTML = "";
  let subtotal = 0;

  if (cart.length === 0) {
    cartTableBody.innerHTML = `<tr><td colspan="5" class="empty-cart-message">Giỏ hàng của bạn trống.</td></tr>`;
    cartSubtotalElement.textContent = "₹0.00";
    cartTotalElement.textContent = "₹0.00";
    proceedToCheckoutBtn.disabled = true;
    proceedToCheckoutBtn.style.opacity = "0.7";
    proceedToCheckoutBtn.style.cursor = "not-allowed";
    customerNameInput.disabled = true;
    customerNameInput.style.opacity = "0.7";
    return;
  } else {
    proceedToCheckoutBtn.disabled = false;
    proceedToCheckoutBtn.style.opacity = "1";
    proceedToCheckoutBtn.style.cursor = "pointer";
    customerNameInput.disabled = false;
    customerNameInput.style.opacity = "1";
  }

  cart.forEach((item, index) => {
    subtotal += item.price * item.quantity;
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>
                <img src="${item.image}" alt="${
      item.name
    }" class="cart-item-image">
                <br>${item.name}
            </td>
            <td>₹${item.price.toFixed(2)}</td>
            <td>
                <div class="quantity-controls">
                    <button onclick="updateCartQuantity(${index}, -1)">-</button>
                    <input type="number" value="${
                      item.quantity
                    }" min="1" onchange="updateCartQuantityInput(${index}, this.value)">
                    <button onclick="updateCartQuantity(${index}, 1)">+</button>
                </div>
            </td>
            <td>₹${(item.price * item.quantity).toFixed(2)}</td>
            <td>
                <button class="remove-item-btn" onclick="removeCartItemPage(${index})">Remove</button>
            </td>
        `;
    cartTableBody.appendChild(tr);
  });

  cartSubtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
  cartTotalElement.textContent = `₹${subtotal.toFixed(2)}`;

  proceedToCheckoutBtn.onclick = (e) => {
    e.preventDefault();
    if (cart.length > 0) {
      const customerName = customerNameInput.value.trim();
      if (!customerName) {
        alert("Vui lòng nhập tên của bạn để hoàn tất đơn hàng.");
        customerNameInput.focus();
        return;
      }
      createOrderFromCart(customerName);
    } else {
      alert("Giỏ hàng trống!");
    }
  };
};

// Functions to update cart quantity on the cart page (These need to be global for onclick)
window.updateCartQuantity = (index, change) => {
  if (cart[index]) {
    cart[index].quantity += change;
    if (cart[index].quantity < 1) {
      cart[index].quantity = 1;
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCartPage(); // Re-render the cart page
    renderCart(); // Also update the small off-canvas cart
  }
};

window.updateCartQuantityInput = (index, value) => {
  let newQuantity = parseInt(value);
  if (isNaN(newQuantity) || newQuantity < 1) {
    newQuantity = 1;
  }
  if (cart[index]) {
    cart[index].quantity = newQuantity;
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCartPage(); // Re-render the cart page
    renderCart(); // Also update the small off-canvas cart
  }
};

window.removeCartItemPage = (index) => {
  if (confirm("Bạn có chắc muốn xoá sản phẩm này?")) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCartPage(); // Re-render the cart page
    renderCart(); // Also update the small off-canvas cart
  }
};

function setupMenuAddToCartButtons() {
  document.querySelectorAll(".add-to-cart-btn-menu").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const id = this.dataset.id;
      const name = this.dataset.name;
      const price = parseFloat(this.dataset.price);
      const image = this.dataset.image;
      addToCart({ id, name, price, image });
    });
  });
}

// ------------------- LOGIN/LOGOUT -------------------
function loginUser(username) {
  let accounts = JSON.parse(localStorage.getItem("TaiKhoan") || "null");
  let user = null;
  if (accounts) {
    user = accounts.find((acc) => acc.TenTK === username);
  }
  if (!user) return;
  localStorage.setItem("currentUser", JSON.stringify(user));
  checkLoginStatus();
}

function logoutUser() {
  localStorage.removeItem("currentUser");
  checkLoginStatus();
  window.location.href = "index.html";
}

function checkLoginStatus() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const authLink = document.getElementById("authLink");
  const adminLink = document.getElementById("adminLink");

  if (authLink) {
    if (currentUser && currentUser.TenTK) {
      authLink.href = "#";
      authLink.textContent = `Hi, ${currentUser.TenTK}`;
      authLink.onclick = (e) => {
        e.preventDefault();
        if (confirm("Bạn có chắc muốn đăng xuất?")) {
          logoutUser();
        }
      };
    } else {
      authLink.href = "login.html";
      authLink.textContent = "login";
      authLink.onclick = null;
    }
  }
  // Ẩn/hiện link admin dựa vào VaiTro
  if (adminLink) {
    if (currentUser && currentUser.VaiTro === "admin") {
      adminLink.style.display = "";
    } else {
      adminLink.style.display = "none";
    }
  }
}

// ------------------- INIT -------------------
window.onload = function () {
  setupMenuProductSearch();
  loadMenuProducts();
  if (document.querySelector(".admin-product-table tbody")) {
    loadAdminProducts();
    resetProductForm();
  }
  loadProductsForProductsSection();
  checkLoginStatus();

  // Để đảm bảo trang cảm ơn ẩn đi khi tải trang cart.html lần đầu
  // (trừ khi nó được show bởi showThankYouPage)
  const thankYouSection = document.getElementById("thank-you");
  if (thankYouSection) {
    thankYouSection.style.display = "none";
  }
};

// --- Event Listeners and Initial Checks for Login/Register Forms ---
document.addEventListener("DOMContentLoaded", () => {
  checkLoginStatus(); // Gọi lại để đảm bảo trạng thái login được hiển thị chính xác

  // Handle Login Form Submission (for login.html)
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      if (username && password) {
        // Lấy danh sách tài khoản từ localStorage hoặc db.json
        let accounts = JSON.parse(localStorage.getItem("TaiKhoan") || "null");
        if (!accounts) {
          try {
            const res = await fetch("src/db.json");
            const data = await res.json();
            accounts = data.TaiKhoan || [];
          } catch {}
        }
        const user =
          accounts &&
          accounts.find(
            (acc) => acc.TenTK === username && acc.MatKhau === password
          );
        if (user) {
          alert("Đăng nhập thành công! Chào mừng, " + username);
          localStorage.setItem("currentUser", JSON.stringify(user));
          window.location.href = "index.html";
        } else {
          alert("Sai tên đăng nhập hoặc mật khẩu!");
        }
      } else {
        alert("Vui lòng nhập tên người dùng và mật khẩu.");
      }
    });
  }

  // Handle Register Form Submission (for register.html)
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const regUsername = document.getElementById("regUsername").value;
      const regEmail = document.getElementById("regEmail").value;
      const regPassword = document.getElementById("regPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (regPassword !== confirmPassword) {
        alert("Mật khẩu không khớp!");
        return;
      }

      if (regUsername && regEmail && regPassword) {
        alert(
          "Đăng ký thành công cho " +
            regUsername +
            "! Bạn có thể đăng nhập ngay bây giờ."
        );
        window.location.href = "login.html"; // Redirect to login page
      } else {
        alert("Vui lòng điền đầy đủ các trường đăng ký.");
      }
    });
  }

  // Nếu đang ở cart.html, hãy gọi renderCartPage() để hiển thị bảng giỏ hàng
  if (document.getElementById("cart-items-table-body")) {
    renderCartPage();
  }
});

// --- PRODUCT SEARCH (for menu section) ---
function setupMenuProductSearch() {
  const menuContainer = document.getElementById("menu-product-container");
  if (!menuContainer) return;
}
