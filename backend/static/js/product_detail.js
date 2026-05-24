const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

function getTokenPayload(){
    const token = localStorage.getItem("token");
    if(!token) return null;
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch(e) { return null; }
}

async function loadProduct(){
    const res = await fetch(`/products/${productId}`);
    const p = await res.json();

    const payload = getTokenPayload();
    const isAdmin = payload?.role === "admin";

    const imageHtml = p.image_url
        ? `<img src="${p.image_url}" alt="${p.name}" style="width:100%; height:100%; object-fit:cover;">`
        : `<div style="width:100%; height:100%; background:linear-gradient(135deg, #1e3a5f, #2563eb); display:flex; align-items:center; justify-content:center; font-size:6rem;">📱</div>`;

    const actionButtons = isAdmin ? `
        <div style="display:flex; gap:1rem;">
            <button onclick="window.location='/edit-product-ui?id=${p.id}'"
            style="flex:1; background:var(--blue); color:white; padding:0.9rem; border:none; border-radius:8px; font-family:'Syne',sans-serif; font-weight:700; font-size:1rem; cursor:pointer;">
            ✏️ Edit Product
            </button>
            <button onclick="deleteProduct(${p.id})"
            style="flex:1; background:#ef4444; color:white; padding:0.9rem; border:none; border-radius:8px; font-family:'Syne',sans-serif; font-weight:700; font-size:1rem; cursor:pointer;">
            🗑️ Delete
            </button>
        </div>` 
    : payload ? `
        <button onclick="addToCart(${p.id})"
        style="width:100%; background:var(--orange); color:white; padding:1rem; border:none; border-radius:8px; font-family:'Syne',sans-serif; font-weight:700; font-size:1.1rem; cursor:pointer; transition: opacity 0.2s;"
        onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
        🛒 Add to Cart
        </button>`
    : `
        <a href="/login-ui"
        style="display:block; text-align:center; background:#64748b; color:white; padding:1rem; border-radius:8px; font-family:'Syne',sans-serif; font-weight:700; font-size:1.1rem; text-decoration:none;">
        Login to Buy
        </a>`;

    document.getElementById("product-detail").innerHTML = `
<div style="display:grid; grid-template-columns:1fr 1fr; gap:3rem; align-items:start;">

    <!-- Image -->
    <div style="border-radius:16px; overflow:hidden; height:420px; box-shadow: 0 8px 32px rgba(0,0,0,0.12);">
        ${imageHtml}
    </div>

    <!-- Details -->
    <div>
        <h1 style="font-family:'Syne',sans-serif; font-size:2rem; font-weight:800; color:var(--navy); margin-bottom:0.75rem; line-height:1.2;">${p.name}</h1>

        <p style="color:#64748b; font-size:1rem; line-height:1.7; margin-bottom:2rem;">${p.description}</p>

        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:2rem; padding:1.25rem; background:#f8fafc; border-radius:12px;">
            <div>
                <p style="color:#94a3b8; font-size:0.8rem; font-weight:600; margin-bottom:0.25rem;">PRICE</p>
                <span style="font-family:'Syne',sans-serif; font-size:2.2rem; font-weight:800; color:var(--orange);">₹${p.price.toLocaleString()}</span>
            </div>
            <div style="text-align:right;">
                <p style="color:#94a3b8; font-size:0.8rem; font-weight:600; margin-bottom:0.25rem;">AVAILABILITY</p>
                ${p.quantity > 0 
                    ? `<span style="background:#dcfce7; color:#16a34a; padding:4px 12px; border-radius:20px; font-weight:700; font-size:0.85rem;">✓ In Stock (${p.quantity})</span>`
                    : `<span style="background:#fee2e2; color:#dc2626; padding:4px 12px; border-radius:20px; font-weight:700; font-size:0.85rem;">Out of Stock</span>`
                }
            </div>
        </div>

        ${actionButtons}

    </div>
</div>
`;
 loadReviews();
}

async function addToCart(productId){
    const token = localStorage.getItem("token");
    const res = await fetch("/cart/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify({ product_id: productId, quantity: 1 })
    });
    const data = await res.json();
    if(!res.ok){ alert(data.detail || "Failed to add to cart"); return; }

    const btn = document.querySelector("button[onclick*='addToCart']");
    btn.textContent = "✅ Added to Cart!";
    btn.style.background = "#16a34a";
    setTimeout(() => {
        btn.textContent = "🛒 Add to Cart";
        btn.style.background = "var(--orange)";
    }, 2000);

    const badge = document.getElementById("cart-count");
    if(badge) badge.textContent = parseInt(badge.textContent || 0) + 1;
}

async function deleteProduct(id){
    const token = localStorage.getItem("token");
    if(!confirm("Delete this product?")) return;
    const res = await fetch(`/products/${id}`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token }
    });
    if(res.ok){ window.location = "/products-ui"; }
    else { alert("Delete failed"); }
}

loadProduct();

async function loadReviews(){
    const res = await fetch(`/reviews/${productId}`);
    const reviews = await res.json();

    const avgRes = await fetch(`/reviews/${productId}/average`);
    const avgData = await avgRes.json();

    const payload = getTokenPayload();
    const isCustomer = payload && payload.role === "customer";

    const starsHtml = (rating) => {
        return [1,2,3,4,5].map(s => 
            `<span style="color:${s <= rating ? '#f97316' : '#e2e8f0'}; font-size:1.2rem;">★</span>`
        ).join("");
    };

    const reviewsHtml = reviews.length === 0 
        ? `<p style="color:#94a3b8; text-align:center; padding:2rem;">No reviews yet. Be the first to review!</p>`
        : reviews.map(r => `
            <div style="padding:1.25rem 0; border-bottom:1px solid #f1f5f9;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                    <div>${starsHtml(r.rating)}</div>
                    <span style="color:#94a3b8; font-size:0.8rem;">${new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <p style="font-weight:700; font-size:0.85rem; color:var(--navy); margin-bottom:0.25rem;">${r.user_name || "Anonymous"}</p>
<p style="color:#475569; font-size:0.9rem; line-height:1.6;">${r.comment}</p>
            </div>
        `).join("");

    const addReviewHtml = isCustomer ? `
        <div style="margin-top:1.5rem; padding-top:1.5rem; border-top:2px solid #f1f5f9;">
            <h3 style="font-family:'Syne',sans-serif; font-weight:700; color:var(--navy); margin-bottom:1rem;">Write a Review</h3>
            
            <div style="display:flex; gap:0.5rem; margin-bottom:1rem;" id="star-selector">
                ${[1,2,3,4,5].map(s => `
                    <span onclick="selectStar(${s})" data-star="${s}"
                    style="font-size:2rem; cursor:pointer; color:#e2e8f0; transition:color 0.1s;">★</span>
                `).join("")}
            </div>

            <textarea id="review-comment" placeholder="Share your experience..."
            style="width:100%; border:2px solid #e2e8f0; padding:0.75rem; border-radius:8px; font-size:0.9rem; outline:none; resize:vertical; min-height:80px; box-sizing:border-box; font-family:'DM Sans',sans-serif;"
            onfocus="this.style.borderColor='var(--blue)'" onblur="this.style.borderColor='#e2e8f0'"></textarea>

            <button onclick="submitReview()"
            style="margin-top:0.75rem; background:var(--navy); color:white; padding:0.7rem 1.5rem; border:none; border-radius:8px; font-family:'Syne',sans-serif; font-weight:700; cursor:pointer;">
            Submit Review
            </button>
        </div>
    ` : payload ? `` : `
        <p style="margin-top:1rem; color:#64748b; font-size:0.9rem;">
            <a href="/login-ui" style="color:var(--blue); font-weight:700;">Login</a> to write a review
        </p>
    `;

    // Inject reviews section into page
    document.getElementById("product-detail").innerHTML += `
        <div style="margin-top:3rem;">
            <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem;">
                <h2 style="font-family:'Syne',sans-serif; font-size:1.5rem; font-weight:800; color:var(--navy);">Reviews</h2>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                    <span style="font-size:1.5rem; color:#f97316;">★</span>
                    <span style="font-family:'Syne',sans-serif; font-weight:700; font-size:1.1rem;">${avgData.average_rating}</span>
                    <span style="color:#94a3b8; font-size:0.85rem;">(${reviews.length} reviews)</span>
                </div>
            </div>
            <div class="card" style="padding:1.25rem;">
                ${reviewsHtml}
                ${addReviewHtml}
            </div>
        </div>
    `;
}

let selectedRating = 0;

function selectStar(star){
    selectedRating = star;
    document.querySelectorAll("#star-selector span").forEach(s => {
        s.style.color = parseInt(s.dataset.star) <= star ? '#f97316' : '#e2e8f0';
    });
}

async function submitReview(){
    if(selectedRating === 0){ alert("Please select a rating"); return; }
    const comment = document.getElementById("review-comment").value;
    if(!comment){ alert("Please write a comment"); return; }

    const token = localStorage.getItem("token");
    const res = await fetch(`/reviews/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify({ rating: selectedRating, comment: comment })
    });

    const data = await res.json();
    if(!res.ok){ alert(data.detail || "Failed to submit review"); return; }

    // Reload reviews
    selectedRating = 0;
    loadReviews();
}