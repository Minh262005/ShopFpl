const API_URL = "http://localhost:3000/DanhMuc";

// Lấy danh mục từ db.json qua API hoặc localStorage
async function getCategories() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error();
        return await res.json();
    } catch {
        return JSON.parse(localStorage.getItem("DanhMuc") || "[]");
    }
}

// Lưu danh mục vào localStorage (chỉ fallback)
async function saveCategories(categories) {
    localStorage.setItem("DanhMuc", JSON.stringify(categories));
}

// Hiển thị tất cả danh mục
async function renderCategories() {
    const tbody = document.getElementById("category-table-body");
    if (!tbody) return;
    const categories = await getCategories();
    tbody.innerHTML = "";
    categories.forEach(cat => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${cat.MaDM}</td>
            <td>${cat.TenDM}</td>
            <td>
                <button class="btn" onclick="editCategory('${cat.MaDM}')">Edit</button>
                <button class="btn" onclick="deleteCategory('${cat.MaDM}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Thêm mới danh mục
window.addCategory = async function(e) {
    e.preventDefault();
    const nameInput = document.getElementById("category-name");
    const name = nameInput.value.trim();
    if (!name) {
        alert("Category name cannot be empty!");
        nameInput.focus();
        return;
    }
    if (!/^[\w\s-]+$/.test(name)) {
        alert("Category name can only contain letters, numbers, spaces, hyphens or underscores!");
        nameInput.focus();
        return;
    }
    let categories = await getCategories();
    if (categories.some(cat => cat.TenDM.toLowerCase() === name.toLowerCase())) {
        alert("Category name already exists!");
        nameInput.focus();
        return;
    }
    // Tạo MaDM mới
    const newId = (categories.length > 0 ? (parseInt(categories[categories.length-1].MaDM)+1).toString() : "1");
    const newCat = { MaDM: newId, TenDM: name };
    try {
        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newCat)
        });
    } catch {
        categories.push(newCat);
        saveCategories(categories);
    }
    nameInput.value = "";
    renderCategories();
    alert("Category added successfully!");
};

// Sửa danh mục
window.editCategory = async function(MaDM) {
    let categories = await getCategories();
    const cat = categories.find(c => c.MaDM === MaDM);
    if (!cat) return;
    document.getElementById("category-name").value = cat.TenDM;
    document.getElementById("category-id").value = cat.MaDM;
    document.getElementById("add-btn").style.display = "none";
    document.getElementById("update-btn").style.display = "inline-block";
    document.getElementById("cancel-btn").style.display = "inline-block";
};

// Cập nhật danh mục
window.updateCategory = async function(e) {
    e.preventDefault();
    const id = document.getElementById("category-id").value;
    const nameInput = document.getElementById("category-name");
    const name = nameInput.value.trim();
    if (!name) {
        alert("Category name cannot be empty!");
        nameInput.focus();
        return;
    }
    if (!/^[\w\s-]+$/.test(name)) {
        alert("Category name can only contain letters, numbers, spaces, hyphens or underscores!");
        nameInput.focus();
        return;
    }
    let categories = await getCategories();
    if (categories.some(cat => cat.TenDM.toLowerCase() === name.toLowerCase() && cat.MaDM !== id)) {
        alert("Category name already exists!");
        nameInput.focus();
        return;
    }
    try {
        await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ MaDM: id, TenDM: name })
        });
    } catch {
        const idx = categories.findIndex(c => c.MaDM === id);
        if (idx !== -1) {
            categories[idx].TenDM = name;
            saveCategories(categories);
        }
    }
    renderCategories();
    alert("Category updated successfully!");
    // Reset form
    document.getElementById("category-name").value = "";
    document.getElementById("category-id").value = "";
    document.getElementById("add-btn").style.display = "inline-block";
    document.getElementById("update-btn").style.display = "none";
    document.getElementById("cancel-btn").style.display = "none";
};

// Hủy sửa
window.cancelEditCategory = function() {
    document.getElementById("category-name").value = "";
    document.getElementById("category-id").value = "";
    document.getElementById("add-btn").style.display = "inline-block";
    document.getElementById("update-btn").style.display = "none";
    document.getElementById("cancel-btn").style.display = "none";
};

// Xóa danh mục
window.deleteCategory = async function(MaDM) {
    if (!confirm("Are you sure you want to delete this category?")) return;
    let categories = await getCategories();
    try {
        await fetch(`${API_URL}/${MaDM}`, { method: "DELETE" });
    } catch {
        categories = categories.filter(c => c.MaDM !== MaDM);
        saveCategories(categories);
    }
    renderCategories();
    alert("Category deleted!");
};

// Khởi tạo
document.addEventListener("DOMContentLoaded", function() {
    renderCategories();
document.getElementById("add-btn").onclick = addCategory;
document.getElementById("update-btn").onclick = updateCategory;
document.getElementById("cancel-btn").onclick = cancelEditCategory;
    document.getElementById("add-btn").onclick = addCategory;
    document.getElementById("update-btn").onclick = updateCategory;
    document.getElementById("cancel-btn").onclick = cancelEditCategory;
});
