let page = 1;
const limit = 8;
let searchTimeout = null;

function getTokenPayload(){
    const token = localStorage.getItem("token");
    if(!token) return null;
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch(e) { return null; }
}

async function loadProducts(){
    const payload = getTokenPayload();
    const isAdmin = payload?.role === "admin";

    const search = document.getElementById("search-input")?.value || "";
    const sort = document.getElementById("sort-select")?.value || "";

    const res = await fetch(`/products?page=${page}&limit=${limit}&search=${search}&sort=${sort}`);
    const data = await res.json();

    const container = document.getElementById("product-list");
    container.innerHTML = "";

    document.getElementById("page-info").textContent = `Page ${page}`;

    if(data.length === 0){
        container.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:4rem; color:#94a3b8;">
                <div style="font-size:3rem; margin-bottom:1rem;">📦</div>
                <p style="font-size:1.1rem; font-weight:600;">No products found</p>
            </div>`;
        return;
    }

    data.forEach(p => {
        const imageHtml = p.image_url
            ? `<img src="${p.image_url}" alt="${p.name}" style="width:100%; height:200px; object-fit:cover;">`
            : `<div style="width:100%; height:200px; background:linear-gradient(135deg, #1e3a5f, #2563eb); display:flex; align-items:center; justify-content:center; font-size:3rem;">📱</div>`;

        const adminButtons = `
            <button onclick="editProduct(${p.id})"
            style="flex:1; background:var(--blue); color:white; border:none; padding:0.6rem; border-radius:6px; font-weight:700; cursor:pointer; font-family:'Syne',sans-serif; font-size:0.85rem;">
            ✏️ Edit
            </button>
            <button onclick="deleteProduct(${p.id})"
            style="flex:1; background:#ef4444; color:white; border:none; padding:0.6rem; border-radius:6px; font-weight:700; cursor:pointer; font-family:'Syne',sans-serif; font-size:0.85rem;">
            🗑️ Delete
            </button>`;

        const customerButton = `
            <button onclick="addToCart(${p.id})"
            style="width:100%; background:var(--orange); color:white; border:none; padding:0.7rem; border-radius:6px; font-weight:700; cursor:pointer; font-family:'Syne',sans-serif; font-size:0.9rem; transition: opacity 0.2s;"
            onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
            🛒 Add to Cart
            </button>`;

        const guestButton = `
            <a href="/login-ui"
            style="display:block; width:100%; background:#64748b; color:white; border:none; padding:0.7rem; border-radius:6px; font-weight:700; cursor:pointer; font-family:'Syne',sans-serif; font-size:0.9rem; text-align:center; text-decoration:none;">
            Login to Buy
            </a>`;

        const actionButtons = isAdmin
            ? `<div style="display:flex; gap:0.5rem;">${adminButtons}</div>`
            : payload
                ? customerButton
                : guestButton;

        container.innerHTML += `
<div class="card" style="display:flex; flex-direction:column; height:100%;">
    ${imageHtml}
    <div style="padding:1.25rem; style="padding:1.25rem; display:flex; flex-direction:column; flex:1;">
        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:0.5rem;">

           <a href="/product/${p.id}?id=${p.id}" style="font-family:'Syne',sans-serif; font-weight:700; font-size:1rem; color:var(--navy); line-height:1.3; text-decoration:none; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:block;">${p.name}</a>
            <span style="background:#eff6ff; color:var(--blue); padding:2px 8px; border-radius:4px; font-size:0.75rem; font-weight:700; white-space:nowrap; margin-left:0.5rem;">
                Qty: ${p.quantity}
            </span>
        </div>
        <p style="color:#64748b; font-size:0.85rem; margin-bottom:1rem; line-height:1.5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${p.description}</p>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <span style="font-family:'Syne',sans-serif; font-size:1.3rem; font-weight:800; color:var(--navy);">₹${p.price.toLocaleString()}</span>
        </div>
       <div style="margin-top:auto;">
    ${actionButtons}
</div>
    </div>
</div>`;
    });
}

function searchProducts(){
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        page = 1;
        loadProducts();
    }, 400);
}

async function nextPage(){
    const search = document.getElementById("search-input")?.value || "";
    const sort = document.getElementById("sort-select")?.value || "";
    const res = await fetch(`/products?page=${page+1}&limit=${limit}&search=${search}&sort=${sort}`);
    const data = await res.json();
    if(data.length === 0){ alert("No more products"); return; }
    page++;
    loadProducts();
}

function prevPage(){
    if(page > 1){ page--; loadProducts(); }
}

async function deleteProduct(id){
    const token = localStorage.getItem("token");
    if(!confirm("Delete this product?")) return;
    const res = await fetch(`/products/${id}`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token }
    });
    const data = await res.json();
    if(!res.ok){ alert(data.detail || "Delete failed"); return; }
    loadProducts();
}

function editProduct(id){
    window.location = `/edit-product-ui?id=${id}`;
}

async function addToCart(productId){
    const token = localStorage.getItem("token");
    if(!token){ window.location = "/login-ui"; return; }
    const res = await fetch("/cart/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify({ product_id: productId, quantity: 1 })
    });
    const data = await res.json();
    if(!res.ok){ alert(data.detail || "Failed to add to cart"); return; }

    // Update cart badge
    const badge = document.getElementById("cart-count");
    if(badge) badge.textContent = parseInt(badge.textContent || 0) + 1;

    // Show subtle feedback
    const btn = event.target;
    btn.textContent = "✅ Added!";
    setTimeout(() => btn.textContent = "🛒 Add to Cart", 1500);
}

loadProducts();