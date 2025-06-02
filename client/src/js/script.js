// Firebase App Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js";
import {
  getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, writeBatch, Timestamp
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDe8FZMZB8htHAKWQjJHHmGUOljj2vfsF0", // Replace with your actual API key if different
  authDomain: "web-fpl.firebaseapp.com",
  projectId: "web-fpl",
  storageBucket: "web-fpl.appspot.com", // Corrected: .appspot.com for storageBucket typically
  messagingSenderId: "861800599758",
  appId: "1:861800599758:web:bbfc64768be1225fbc009f",
  measurementId: "G-4D7F70TSJK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Navbar, Search, Cart toggle (basic functionality from original concept)
let navbar = document.querySelector('.navbar');
document.querySelector('#menu-btn').onclick = () =>{
    navbar.classList.toggle('active');
    searchForm.classList.remove('active');
    cartItem.classList.remove('active');
}

let searchForm = document.querySelector('.search-form');
document.querySelector('#search-btn').onclick = () =>{
    searchForm.classList.toggle('active');
    navbar.classList.remove('active');
    cartItem.classList.remove('active');
}

let cartItem = document.querySelector('.cart-items-container');
document.querySelector('#cart-btn').onclick = () =>{
    cartItem.classList.toggle('active');
    navbar.classList.remove('active');
    searchForm.classList.remove('active');
}

window.onscroll = () =>{
    navbar.classList.remove('active');
    searchForm.classList.remove('active');
    cartItem.classList.remove('active');
}


// ------------------- ADMIN CRUD -------------------
const adminProductFormContainer = document.getElementById('admin-product-form-container');
const productFormTitle = adminProductFormContainer ? adminProductFormContainer.querySelector('.form-title') : null;
const productIdField = document.getElementById('product-id');
const productNameInput = document.getElementById('product-name-input');
const productPriceInput = document.getElementById('product-price-input');
const productImageInput = document.getElementById('product-image-input');
const productCategoryInput = document.getElementById('product-category-input'); // Thêm dòng này
const saveProductBtn = document.getElementById('save-product-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const showAddProductFormBtn = document.getElementById('show-add-product-form-btn');

function showProductForm(mode = 'add', productData = null) {
    if (!adminProductFormContainer) return;
    adminProductFormContainer.style.display = 'block';
    if (mode === 'edit' && productData) {
        productFormTitle.textContent = 'Edit Product';
        productIdField.value = productData.id;
        productNameInput.value = productData.name;
        productPriceInput.value = productData.price;
        productImageInput.value = productData.image;
        productCategoryInput.value = productData.category || ''; // Thêm dòng này
        cancelEditBtn.style.display = 'inline-block';
    } else {
        productFormTitle.textContent = 'Add New Product';
        productIdField.value = '';
        productNameInput.value = '';
        productPriceInput.value = '';
        productImageInput.value = '';
        productCategoryInput.value = ''; // Thêm dòng này
        cancelEditBtn.style.display = 'none';
    }
}

function resetProductForm() {
    if (!adminProductFormContainer) return;
    adminProductFormContainer.style.display = 'none';
    productFormTitle.textContent = 'Add/Edit Product';
    productIdField.value = '';
    productNameInput.value = '';
    productPriceInput.value = '';
    productImageInput.value = '';
    productCategoryInput.value = ''; // Thêm dòng này
    cancelEditBtn.style.display = 'none';
}

if (showAddProductFormBtn) showAddProductFormBtn.addEventListener('click', () => showProductForm('add'));
if (saveProductBtn) saveProductBtn.addEventListener('click', handleProductFormSubmit);
if (cancelEditBtn) cancelEditBtn.addEventListener('click', resetProductForm);


async function handleProductFormSubmit() {
    const name = productNameInput.value.trim();
    const price = parseFloat(productPriceInput.value);
    const image = productImageInput.value.trim();
    const category = productCategoryInput.value.trim(); // Thêm dòng này
    const currentId = productIdField.value;

    if (!name || isNaN(price) || price <= 0 || !image || !category) {
        alert("Vui lòng nhập đầy đủ và hợp lệ thông tin sản phẩm (tên, giá > 0, URL hình ảnh, danh mục).");
        return;
    }

    const productData = { name, price, image, category }; // Thêm category

    try {
        if (currentId) {
            const productRef = doc(db, 'products', currentId);
            await updateDoc(productRef, productData);
            alert("Đã cập nhật sản phẩm thành công!");
        } else {
            await addDoc(collection(db, "products"), productData);
            alert("Sản phẩm đã được thêm thành công!");
        }
        loadAdminProducts();
        resetProductForm();
    } catch (error) {
        console.error("Lỗi khi lưu sản phẩm: ", error);
        alert("Đã xảy ra lỗi khi lưu sản phẩm. Vui lòng thử lại.");
    }
}

async function loadAdminProducts() {
    const tableBody = document.querySelector('.admin-product-table tbody');
    if (!tableBody) return;
    tableBody.innerHTML = ''; // Clear existing rows

    try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${docSnap.id.substring(0, 6)}...</td>
                <td><img src="${data.image}" alt="${data.name}" style="width: 50px; height: 50px; object-fit: cover;"></td>
                <td>${data.name}</td>
                <td>₹${data.price.toFixed(2)}</td>
                <td>${data.category || ''}</td>
                <td>
                    <button class="btn small-btn" onclick="editProduct('${docSnap.id}')">Edit</button>
                    <button class="btn small-btn delete-btn" onclick="deleteProduct('${docSnap.id}')">Delete</button>
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
window.editProduct = async function(id) {
    try {
        const productRef = doc(db, 'products', id);
        const docSnap = await getDoc(productRef);
        if (docSnap.exists()) {
            const productData = { id: docSnap.id, ...docSnap.data() };
            showProductForm('edit', productData);
            // Scroll to form for better UX
            adminProductFormContainer.scrollIntoView({ behavior: 'smooth' });
        } else {
            alert("Không tìm thấy sản phẩm để chỉnh sửa.");
        }
    } catch (error) {
        console.error("Lỗi khi lấy sản phẩm để sửa: ", error);
        alert("Không thể tải thông tin sản phẩm để sửa.");
    }
}

window.deleteProduct = async function(id) {
    if (confirm("Bạn có chắc muốn xoá sản phẩm này?")) {
        try {
            await deleteDoc(doc(db, "products", id));
            alert("Đã xoá sản phẩm thành công!");
            loadAdminProducts();
        } catch (error) {
            console.error("Lỗi khi xoá sản phẩm: ", error);
            alert("Đã xảy ra lỗi khi xoá sản phẩm.");
        }
    }
}

// ------------------- USER PRODUCTS -------------------
async function loadUserProducts() {
    const container = document.querySelector('.products .box-container');
    if (!container) return;
    container.innerHTML = ''; // Clear existing products

    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const box = document.createElement('div');
            box.className = 'box';
            box.setAttribute('data-category', data.category || 'all');
            box.innerHTML = `
                <div class="icons">
                    <a href="#" class="fas fa-shopping-cart product-cart-icon"></a>
                    <a href="#" class="fas fa-heart"></a>
                    <a href="product-detail.html?name=${encodeURIComponent(data.name)}&price=${encodeURIComponent(data.price)}&image=${encodeURIComponent(data.image)}&description=${encodeURIComponent(data.description || '')}" class="fas fa-eye"></a>
                </div>
                <div class="image">
                    <img src="${data.image}" alt="${data.name}">
                </div>
                <div class="content">
                    <h3>${data.name}</h3>
                    <div class="stars">
                        ${'<i class="fas fa-star"></i>'.repeat(Math.floor(data.rating || 4))}${(data.rating || 4) % 1 !== 0 ? '<i class="fas fa-star-half-alt"></i>' : ''}
                    </div>
                    <div class="price">₹${data.price.toFixed(2)}</div>
                </div>
            `;
            const addToCartBtn = box.querySelector('.product-cart-icon');
            addToCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                addToCart({ ...data, id: docSnap.id });
            });
            container.appendChild(box);
        });
    } catch (error) {
        console.error("Lỗi khi tải sản phẩm người dùng: ", error);
    }
}

// ------------------- CART + ORDER -------------------
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(product) {
    const existingProduct = cart.find(p => p.id === product.id);
    if (existingProduct) {
        existingProduct.quantity = (existingProduct.quantity || 1) + 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`Đã thêm ${product.name} vào giỏ hàng!`);
    renderCart();
}

function renderCart() {
    const cartContainer = document.querySelector(".cart-items-container");
    if (!cartContainer) return;
    cartContainer.innerHTML = ''; // Clear previous items
    let subtotal = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="color: var(--black); text-align: center; padding: 2rem;">Giỏ hàng của bạn trống.</p>';
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
                <div class="price">₹${item.price.toFixed(2)} x ${item.quantity}</div>
            </div>
        `;
        cartContainer.appendChild(cartItemDiv);
    });

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-cart-item-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            removeCartItem(parseInt(this.dataset.index));
        });
    });

    const checkoutBtn = document.createElement("a");
    checkoutBtn.href = "#thank-you"; // Will be handled by JS
    checkoutBtn.className = "btn";
    checkoutBtn.textContent = `Thanh toán ngay (₹${subtotal.toFixed(2)})`;
    checkoutBtn.style.width = '100%';
    checkoutBtn.style.textAlign = 'center';

    checkoutBtn.onclick = (e) => {
        e.preventDefault(); // Prevent default anchor behavior
        if (cart.length > 0) {
            createOrderFromCart();
        } else {
            alert("Giỏ hàng trống!");
        }
    };
    cartContainer.appendChild(checkoutBtn);
}

function removeCartItem(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
}

async function createOrderFromCart() {
    if (cart.length === 0) {
        alert("Giỏ hàng trống!");
        return;
    }

    // TODO: Replace hardcoded customer details with dynamic data (e.g., from auth or a form)
    const order = {
        customer_name: "Minh (Test Customer)",
        customer_address: "Hà Nội (Test Address)",
        customer_email: "minh_test@example.com",
        customer_phone_number: "0123456789",
        items: cart.map(item => ({ productId: item.id, name: item.name, quantity: item.quantity, unit_price: item.price })),
        total_amount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        created_date: Timestamp.now(), // Use Firestore Timestamp
        status: "pending" // e.g., pending, processing, shipped, delivered
    };

    try {
        const orderRef = await addDoc(collection(db, "orders"), order);
        // Optional: Save order details in a subcollection if very complex,
        // but for now, items are included in the main order document.
        // Example if using subcollection (batch write for items):
        // const batch = writeBatch(db);
        // cart.forEach(item => {
        //   const detailRef = doc(collection(db, "orders", orderRef.id, "details"));
        //   batch.set(detailRef, {
        //     product_id: item.id,
        //     product_name: item.name, // Good to store name for historical orders
        //     quantity: item.quantity,
        //     unit_price: item.price
        //   });
        // });
        // await batch.commit();

        alert("Đơn hàng đã được tạo thành công!");
        localStorage.removeItem("cart");
        cart = [];
        renderCart(); // Re-render empty cart
        cartItem.classList.remove('active'); // Close cart sidebar
        showThankYouPage(orderRef.id);

    } catch (error) {
        console.error("Lỗi khi tạo đơn hàng: ", error);
        alert("Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại.");
    }
}

function showThankYouPage(orderId) {
    const thankYouSection = document.getElementById("thank-you");
    const orderIdElement = document.getElementById("thank-you-order-id");

    if (orderIdElement) {
        orderIdElement.textContent = `Order ID: #${orderId}`;
    }
    if (thankYouSection) {
        thankYouSection.style.display = 'flex'; 
        thankYouSection.scrollIntoView({ behavior: 'smooth' });
    }
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    if(continueShoppingBtn) {
        continueShoppingBtn.onclick = (e) => {
            e.preventDefault();
            thankYouSection.style.display = 'none';
            window.location.hash = '#home'; 
        };
    }
}

function setupMenuAddToCartButtons() {
    document.querySelectorAll('.add-to-cart-btn-menu').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const name = this.dataset.name;
            const price = parseFloat(this.dataset.price);
            const image = this.dataset.image;
            // For menu items, we might not have a Firestore ID readily available unless they are also "products"
            // For simplicity, using a generated ID or just the name as a temporary ID if not linking to 'products' collection
            const id = `menu_${name.replace(/\s+/g, '_')}`;
            addToCart({ id, name, price, image });
        });
    });
}


// ------------------- INIT -------------------
window.onload = function () {
    loadUserProducts();
    if (document.querySelector('.admin-product-table tbody')) {
        loadAdminProducts();
        resetProductForm();
    }
    renderCart();
    setupMenuAddToCartButtons();
};

// Function to handle login (client-side simulation)
function loginUser(username) {
    localStorage.setItem('loggedInUser', username); // Store username in local storage
    checkLoginStatus(); // Update UI
}

// Function to handle logout
function logoutUser() {
    localStorage.removeItem('loggedInUser'); // Remove user from local storage
    checkLoginStatus(); // Update UI
    window.location.href = 'index.html'; // Redirect to home page after logout
}

// Function to check login status and update UI
function checkLoginStatus() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    const authLink = document.getElementById('authLink'); // The login/profile link in navbar

    if (authLink) { // Ensure the element exists
        if (loggedInUser) {
            // User is logged in
            authLink.href = '#'; // Or a profile page link like 'profile.html'
            authLink.textContent = `Hi, ${loggedInUser}`;

            // Add a logout button/functionality (example: a separate logout button, or a dropdown)
            // For simplicity, let's add a click event for logout if the user clicks "Hi, User"
            authLink.onclick = (e) => {
                e.preventDefault(); // Prevent default link behavior
                if (confirm('Are you sure you want to log out?')) {
                    logoutUser();
                }
            };
        } else {
            // User is not logged in
            authLink.href = 'login.html';
            authLink.textContent = 'login';
            authLink.onclick = null; // Remove the click handler if not logged in
        }
    }
}

// --- Event Listeners and Initial Checks ---

// Call checkLoginStatus when the script loads
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();

    // Handle Login Form Submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form submission

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (username && password) { 
                alert('Login successful! Welcome, ' + username);
                loginUser(username); 
                window.location.href = 'index.html'; 
            } else {
                alert('Please enter username and password.');
            }
        });
    }

    // Handle Register Form Submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form submission

            const regUsername = document.getElementById('regUsername').value;
            const regEmail = document.getElementById('regEmail').value;
            const regPassword = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (regPassword !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            // --- IMPORTANT: In a real application, you'd send this data to a server to create a new user ---
            // For this client-side example, we'll just acknowledge registration
            if (regUsername && regEmail && regPassword) {
                alert('Registration successful for ' + regUsername + '! You can now log in.');
                window.location.href = 'login.html'; // Redirect to login page
            } else {
                alert('Please fill in all registration fields.');
            }
        });
    }

    // --- Existing script.js functionalities (keep these if they are present) ---
    // Example: For menu button, search button, cart button
    let navbar = document.querySelector('.navbar');
    document.querySelector('#menu-btn').onclick = () => {
        navbar.classList.toggle('active');
        searchForm.classList.remove('active');
        cartItem.classList.remove('active');
    }

    let searchForm = document.querySelector('.search-form');
    document.querySelector('#search-btn').onclick = () => {
        searchForm.classList.toggle('active');
        navbar.classList.remove('active');
        cartItem.classList.remove('active');
    }

    let cartItem = document.querySelector('.cart-items-container');
    document.querySelector('#cart-btn').onclick = () => {
        cartItem.classList.toggle('active');
        navbar.classList.remove('active');
        searchForm.classList.remove('active');
    }

    window.onscroll = () => {
        navbar.classList.remove('active');
        searchForm.classList.remove('active');
        cartItem.classList.remove('active');
    }

    // Product and Menu functionality (assuming you have a products array and cart functionality)
    // Add these back if they were part of your original script.js
    // let products = []; // Assuming you have a products array loaded here or from a JSON
    // let cart = []; // Assuming you have a cart array

    // Example of adding to cart from menu
    document.querySelectorAll('.add-to-cart-btn-menu').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const name = e.target.dataset.name;
            const price = parseFloat(e.target.dataset.price);
            const image = e.target.dataset.image;
            addToCart({ name, price, image, quantity: 1 });
            updateCartDisplay();
        });
    });

    function addToCart(item) {
        const existingItem = cart.find(cartItem => cartItem.name === item.name);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push(item);
        }
        saveCart();
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function loadCart() {
        const storedCart = localStorage.getItem('cart');
        cart = storedCart ? JSON.parse(storedCart) : [];
    }

    function updateCartDisplay() {
        const cartItemsContainer = document.querySelector('.cart-items-container');
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="cart-item">No items in cart.</div>';
            return;
        }
        cart.forEach(item => {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            cartItemDiv.innerHTML = `
                <span class="fas fa-times" data-name="${item.name}"></span>
                <img src="${item.image}" alt="${item.name}">
                <div class="content">
                    <h3>${item.name}</h3>
                    <div class="price">₹${item.price.toFixed(2)}/- x ${item.quantity}</div>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
        });

        cartItemsContainer.querySelectorAll('.fa-times').forEach(removeBtn => {
            removeBtn.addEventListener('click', (e) => {
                const nameToRemove = e.target.dataset.name;
                removeFromCart(nameToRemove);
                updateCartDisplay();
            });
        });

        // Add a checkout button (example)
        const checkoutBtn = document.createElement('a');
        checkoutBtn.href = '#';
        checkoutBtn.classList.add('btn');
        checkoutBtn.textContent = 'checkout now';
        checkoutBtn.style.marginTop = '1rem';
        checkoutBtn.style.display = 'block';
        cartItemsContainer.appendChild(checkoutBtn);
    }

    function removeFromCart(name) {
        cart = cart.filter(item => item.name !== name);
        saveCart();
    }

    loadCart();
    updateCartDisplay();
});

// Assuming your products section needs dynamic loading and pagination
// Example product data (replace with your actual data, potentially from a server)
const allProducts = [
    { name: 'Coffee Beans - Arabica', price: 150.00, oldPrice: 180.00, image: 'img/product-1.png', category: 'beans' },
    { name: 'Coffee Beans - Robusta', price: 120.00, oldPrice: 140.00, image: 'img/product-2.png', category: 'beans' },
    { name: 'Coffee Powder', price: 80.00, oldPrice: 95.00, image: 'img/product-3.png', category: 'powder' },
    { name: 'Coffee Mug', price: 50.00, oldPrice: 60.00, image: 'img/product-4.png', category: 'accessories' },
    { name: 'Coffee Grinder', price: 300.00, oldPrice: 350.00, image: 'img/product-5.png', category: 'accessories' },
    { name: 'Cold Brew Maker', price: 200.00, oldPrice: 230.00, image: 'img/product-6.png', category: 'accessories' },
    { name: 'Espresso Machine', price: 1500.00, oldPrice: 1800.00, image: 'img/product-7.png', category: 'machines' },
    { name: 'French Press', price: 100.00, oldPrice: 120.00, image: 'img/product-8.png', category: 'accessories' },
    { name: 'Flavored Syrup', price: 70.00, oldPrice: 80.00, image: 'img/product-9.png', category: 'ingredients' },
];

const productsPerPage = 6;
let currentPage = 1;
let currentCategory = 'all';

function displayProducts(productsToDisplay, page) {
    const productContainer = document.querySelector('.products .box-container');
    productContainer.innerHTML = '';
    const start = (page - 1) * productsPerPage;
    const end = start + productsPerPage;
    const paginatedProducts = productsToDisplay.slice(start, end);

    paginatedProducts.forEach(product => {
        const productBox = document.createElement('div');
        productBox.classList.add('box');
        productBox.setAttribute('data-category', product.category); // Add category for filtering
        productBox.innerHTML = `
            <div class="icons">
                <a href="#" class="fas fa-shopping-cart add-to-cart-btn-product" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}"></a>
                <a href="#" class="fas fa-heart"></a>
                <a href="#" class="fas fa-eye"></a>
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
                <div class="price">₹${product.price.toFixed(2)} <span>${product.oldPrice.toFixed(2)}</span></div>
            </div>
        `;
        productContainer.appendChild(productBox);
    });

    // Add event listeners for "add to cart" buttons in products section
    productContainer.querySelectorAll('.add-to-cart-btn-product').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const name = e.target.dataset.name;
            const price = parseFloat(e.target.dataset.price);
            const image = e.target.dataset.image;
            addToCart({ name, price, image, quantity: 1 });
            updateCartDisplay();
        });
    });
}

function setupPagination(productsToDisplay) {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';
    const pageCount = Math.ceil(productsToDisplay.length / productsPerPage);

    for (let i = 1; i <= pageCount; i++) {
        const button = document.createElement('button');
        button.classList.add('btn', 'page-btn');
        if (i === currentPage) {
            button.classList.add('active');
        }
        button.textContent = i;
        button.addEventListener('click', () => {
            currentPage = i;
            displayProducts(productsToDisplay, currentPage);
            updatePaginationButtons();
        });
        paginationContainer.appendChild(button);
    }
}

function updatePaginationButtons() {
    document.querySelectorAll('.page-btn').forEach(button => {
        if (parseInt(button.textContent) === currentPage) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

function setupProductFilters() {
    const filterContainer = document.querySelector('.product-filters');
    const categories = ['all', ...new Set(allProducts.map(p => p.category))]; // Get unique categories

    filterContainer.innerHTML = ''; // Clear existing buttons
    categories.forEach(category => {
        const button = document.createElement('button');
        button.classList.add('btn', 'filter-btn');
        if (category === currentCategory) {
            button.classList.add('active');
        }
        button.textContent = category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' '); // Capitalize and format
        button.dataset.category = category;
        button.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentCategory = category;
            currentPage = 1; // Reset to first page on filter change
            filterAndDisplayProducts();
        });
        filterContainer.appendChild(button);
    });
}

function filterAndDisplayProducts() {
    let filteredProducts = allProducts;
    if (currentCategory !== 'all') {
        filteredProducts = allProducts.filter(product => product.category === currentCategory);
    }
    displayProducts(filteredProducts, currentPage);
    setupPagination(filteredProducts);
}

// Initial load for products
document.addEventListener('DOMContentLoaded', () => {
    setupProductFilters(); // Setup filters first
    filterAndDisplayProducts(); // Then display products based on initial filter
});