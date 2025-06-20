const PRODUCT_API_URL = "http://localhost:3000/products";
const CATEGORY_API_URL = "http://localhost:3000/DanhMuc";

// Lấy danh sách sản phẩm từ db.json qua API hoặc localStorage
async function getProducts() {
    try {
        const res = await fetch(PRODUCT_API_URL);
        if (!res.ok) throw new Error();
        return await res.json();
    } catch {
        return JSON.parse(localStorage.getItem("products") || "[]");
    }
}
function saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
}
// Lấy danh mục
async function getCategories() {
    try {
        const res = await fetch(CATEGORY_API_URL);
        if (!res.ok) throw new Error();
        return await res.json();
    } catch {
        return JSON.parse(localStorage.getItem("DanhMuc") || "[]");
    }
}
// Hiển thị danh mục cho select
async function renderCategoryOptions() {
    const select = document.getElementById("product-category");
    if (!select) return;
    const categories = await getCategories();
    select.innerHTML = '<option value="">--Select category--</option>';
    categories.forEach(cat => {
        select.innerHTML += `<option value="${cat.id}">${cat.TenDM}</option>`;
    });
}
// Hiển thị tất cả sản phẩm
async function renderProducts() {
    const tbody = document.getElementById("product-table-body");
    if (!tbody) return;
    const products = await getProducts();
    const categories = await getCategories();
    tbody.innerHTML = "";
    products.forEach(prod => {
        const cat = categories.find(c => c.id === prod.category);
        const catName = cat ? cat.TenDM : "";
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${prod.id}</td>
            <td>${prod.name}</td>
            <td><img src="${prod.image}" alt="" style="width:50px;height:50px;object-fit:cover;"></td>
            <td>${prod.price}</td>
            <td>${prod.description}</td>
            <td>${catName}</td>
            <td>
                <button class="btn" onclick="editProduct('${prod.id}')">Edit</button>
                <button class="btn" onclick="deleteProduct('${prod.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
// Thêm mới sản phẩm
window.addProduct = async function(e) {
    e.preventDefault();
    const nameInput = document.getElementById("product-name");
    const imageInput = document.getElementById("product-image");
    const priceInput = document.getElementById("product-price");
    const descInput = document.getElementById("product-desc");
    const catSelect = document.getElementById("product-category");
    const name = nameInput.value.trim();
    const image = imageInput.value.trim();
    const price = parseFloat(priceInput.value);
    const description = descInput.value.trim();
    const category = catSelect.value;
    if (!name || !image || !description || !category) {
        alert("Please fill in all fields!");
        return;
    }
    if (!/^[\w\s-]+$/.test(name)) {
        alert("Product name can only contain letters, numbers, spaces, hyphens or underscores!");
        nameInput.focus();
        return;
    }
    if (isNaN(price) || price <= 0) {
        alert("Price must be greater than 0!");
        priceInput.focus();
        return;
    }
    let products = await getProducts();
    if (products.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        alert("Product name already exists!");
        nameInput.focus();
        return;
    }
    // Tạo id mới (auto-increment hoặc random)
    const newId = (products.length > 0 ? (parseInt(products[products.length-1].id)+1).toString() : "1");
    const newProd = {
        id: newId,
        name,
        image,
        price,
        description,
        category
    };
    try {
        await fetch(PRODUCT_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newProd)
        });
    } catch {
        products.push(newProd);
        saveProducts(products);
    }
    nameInput.value = imageInput.value = priceInput.value = descInput.value = "";
    catSelect.value = "";
    renderProducts();
    alert("Product added successfully!");
};
// Sửa sản phẩm
window.editProduct = async function(id) {
    let products = await getProducts();
    const prod = products.find(p => p.id == id);
    if (!prod) return;
    document.getElementById("product-id").value = prod.id;
    document.getElementById("product-name").value = prod.name;
    document.getElementById("product-image").value = prod.image;
    document.getElementById("product-price").value = prod.price;
    document.getElementById("product-desc").value = prod.description;
    document.getElementById("product-category").value = prod.category;
    document.getElementById("add-product-btn").style.display = "none";
    document.getElementById("update-product-btn").style.display = "inline-block";
    document.getElementById("cancel-product-btn").style.display = "inline-block";
};
// Cập nhật sản phẩm
window.updateProduct = async function(e) {
    e.preventDefault();
    const id = document.getElementById("product-id").value;
    const nameInput = document.getElementById("product-name");
    const imageInput = document.getElementById("product-image");
    const priceInput = document.getElementById("product-price");
    const descInput = document.getElementById("product-desc");
    const catSelect = document.getElementById("product-category");
    const name = nameInput.value.trim();
    const image = imageInput.value.trim();
    const price = parseFloat(priceInput.value);
    const description = descInput.value.trim();
    const category = catSelect.value;
    if (!name || !image || !description || !category) {
        alert("Please fill in all fields!");
        return;
    }
    if (!/^[\w\s-]+$/.test(name)) {
        alert("Product name can only contain letters, numbers, spaces, hyphens or underscores!");
        nameInput.focus();
        return;
    }
    if (isNaN(price) || price <= 0) {
        alert("Price must be greater than 0!");
        priceInput.focus();
        return;
    }
    let products = await getProducts();
    if (products.some(p => p.name.toLowerCase() === name.toLowerCase() && p.id != id)) {
        alert("Product name already exists!");
        nameInput.focus();
        return;
    }
    const newProd = {
        id,
        name,
        image,
        price,
        description,
        category
    };
    try {
        await fetch(`${PRODUCT_API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newProd)
        });
    } catch {
        const idx = products.findIndex(p => p.id == id);
        if (idx !== -1) {
            products[idx] = newProd;
            saveProducts(products);
        }
    }
    renderProducts();
    alert("Product updated successfully!");
    // Reset form
    document.getElementById("product-id").value = "";
    nameInput.value = imageInput.value = priceInput.value = descInput.value = "";
    catSelect.value = "";
    document.getElementById("add-product-btn").style.display = "inline-block";
    document.getElementById("update-product-btn").style.display = "none";
    document.getElementById("cancel-product-btn").style.display = "none";
};
// Hủy sửa
window.cancelEditProduct = function() {
    document.getElementById("product-id").value = "";
    document.getElementById("product-name").value = "";
    document.getElementById("product-image").value = "";
    document.getElementById("product-price").value = "";
    document.getElementById("product-desc").value = "";
    document.getElementById("product-category").value = "";
    document.getElementById("add-product-btn").style.display = "inline-block";
    document.getElementById("update-product-btn").style.display = "none";
    document.getElementById("cancel-product-btn").style.display = "none";
};
// Xóa sản phẩm
window.deleteProduct = async function(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    let products = await getProducts();
    try {
        await fetch(`${PRODUCT_API_URL}/${id}`, { method: "DELETE" });
    } catch {
        products = products.filter(p => p.id != id);
        saveProducts(products);
    }
    renderProducts();
    alert("Product deleted!");
};
// Khởi tạo
document.addEventListener("DOMContentLoaded", function() {
    renderCategoryOptions();
    renderProducts();
document.getElementById("add-product-btn").onclick = addProduct;
document.getElementById("update-product-btn").onclick = updateProduct;
document.getElementById("cancel-product-btn").onclick = cancelEditProduct;
    document.getElementById("add-product-btn").onclick = addProduct;
    document.getElementById("update-product-btn").onclick = updateProduct;
    document.getElementById("cancel-product-btn").onclick = cancelEditProduct;
});
