document.addEventListener('DOMContentLoaded', () => {
    const adminProductFormContainer = document.getElementById('admin-product-form-container');
    const showAddProductFormBtn = document.getElementById('show-add-product-form-btn');
    const saveProductBtn = document.getElementById('save-product-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const productIdInput = document.getElementById('product-id');
    const productNameInput = document.getElementById('product-name-input');
    const productPriceInput = document.getElementById('product-price-input');
    const productImageInput = document.getElementById('product-image-input');
    const productCategoryInput = document.getElementById('product-category-input');
    const adminProductTableBody = document.querySelector('.admin-product-table tbody');

    // Dummy product data (replace with actual backend storage in a real application)
    let products = [
        { id: 1, name: "Special Blend Coffee", price: 120.00, image: "img/product1.jpg", category: "coffee-beans" },
        { id: 2, name: "Espresso Roast", price: 150.00, image: "img/product2.jpg", category: "coffee-beans" },
        { id: 3, name: "Coffee Mug Set", price: 80.00, image: "img/product3.jpg", category: "merchandise" },
        { id: 4, name: "French Press", price: 200.00, image: "img/product4.jpg", category: "equipment" },
        { id: 5, name: "Cold Brew Maker", price: 180.00, image: "img/product5.jpg", category: "equipment" },
        { id: 6, name: "Reusable Coffee Cup", price: 45.00, image: "img/product6.jpg", category: "merchandise" }
    ];

    let nextProductId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

    // Function to render products in the admin table
    function renderAdminProducts() {
        adminProductTableBody.innerHTML = ''; // Clear existing rows
        products.forEach(product => {
            const row = adminProductTableBody.insertRow();
            row.dataset.id = product.id; // Store ID on the row

            row.innerHTML = `
                <td>${product.id}</td>
                <td><img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover;"></td>
                <td>${product.name}</td>
                <td>₹${product.price.toFixed(2)}</td>
                <td>${product.category}</td>
                <td>
                    <button class="btn edit-btn" data-id="${product.id}">Edit</button>
                    <button class="btn delete-btn" data-id="${product.id}">Delete</button>
                </td>
            `;
        });
        attachAdminEventListeners();
    }

    // Function to attach event listeners to edit/delete buttons
    function attachAdminEventListeners() {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.onclick = (e) => editProduct(e.target.dataset.id);
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.onclick = (e) => deleteProduct(e.target.dataset.id);
        });
    }

    // Show add/edit product form
    showAddProductFormBtn.onclick = () => {
        adminProductFormContainer.style.display = 'block';
        clearForm();
        cancelEditBtn.style.display = 'none'; // Hide cancel button initially
    };

    // Save product (add or update)
    saveProductBtn.onclick = () => {
        const id = productIdInput.value ? parseInt(productIdInput.value) : null;
        const name = productNameInput.value.trim();
        const price = parseFloat(productPriceInput.value);
        const image = productImageInput.value.trim();
        const category = productCategoryInput.value.trim();

        if (!name || isNaN(price) || price <= 0 || !image || !category) {
            alert('Please fill in all product fields correctly.');
            return;
        }

        if (id) {
            // Update existing product
            const index = products.findIndex(p => p.id === id);
            if (index !== -1) {
                products[index] = { id, name, price, image, category };
            }
        } else {
            // Add new product
            const newProduct = { id: nextProductId++, name, price, image, category };
            products.push(newProduct);
        }

        renderAdminProducts();
        adminProductFormContainer.style.display = 'none';
        clearForm();
        alert('Product saved successfully!');
    };

    // Edit product
    function editProduct(id) {
        const productToEdit = products.find(p => p.id === parseInt(id));
        if (productToEdit) {
            productIdInput.value = productToEdit.id;
            productNameInput.value = productToEdit.name;
            productPriceInput.value = productToEdit.price;
            productImageInput.value = productToEdit.image;
            productCategoryInput.value = productToEdit.category;
            adminProductFormContainer.style.display = 'block';
            cancelEditBtn.style.display = 'inline-block'; // Show cancel button when editing
        }
    }

    // Cancel editing
    cancelEditBtn.onclick = () => {
        adminProductFormContainer.style.display = 'none';
        clearForm();
        cancelEditBtn.style.display = 'none';
    };

    // Delete product
    function deleteProduct(id) {
        if (confirm('Are you sure you want to delete this product?')) {
            products = products.filter(p => p.id !== parseInt(id));
            renderAdminProducts();
            alert('Product deleted successfully!');
        }
    }

    // Clear form fields
    function clearForm() {
        productIdInput.value = '';
        productNameInput.value = '';
        productPriceInput.value = '';
        productImageInput.value = '';
        productCategoryInput.value = '';
    }

    // Initial render when the admin page loads
    renderAdminProducts();

    // --- You might want to remove these if your main script.js handles them for admin.html ---
    // Example: Toggle navbar, search form, cart items - keep if you want them on admin page
    let navbar = document.querySelector('.navbar');
    document.querySelector('#menu-btn').onclick = () => {
        navbar.classList.toggle('active');
        // searchForm.classList.remove('active');
        // cartItem.classList.remove('active');
    }
    // --- End of potential removal ---

});