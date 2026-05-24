async function loadOrders(){
    const token = localStorage.getItem("token");
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    const isAdmin = payload.role === "admin";

    document.getElementById("page-title").textContent = isAdmin ? "All Orders" : "My Orders";

    const url = isAdmin ? "/orders/all" : "/orders/my-orders";

    const res = await fetch(url, {
        headers: { "Authorization": "Bearer " + token }
    });

    const data = await res.json();
    const container = document.getElementById("orders-list");
    const emptyMsg = document.getElementById("empty-msg");

    container.innerHTML = "";

    if(data.length === 0){
        emptyMsg.style.display = "block";
        return;
    }

    for(const order of data){
        const itemsHtml = await Promise.all(order.items.map(async item => {
            const productRes = await fetch(`/products/${item.product_id}`);
            const product = await productRes.json();
            return `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem 0; border-bottom:1px solid #f1f5f9;">
                    <div style="display:flex; align-items:center; gap:0.75rem;">
                        <div style="width:40px; height:40px; border-radius:6px; overflow:hidden; background:linear-gradient(135deg, #1e3a5f, #2563eb); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            ${product.image_url 
                                ? `<img src="${product.image_url}" style="width:100%; height:100%; object-fit:cover;">` 
                                : `<span style="font-size:1rem;">📱</span>`}
                        </div>
                        <div>
                            <p style="font-weight:600; font-size:0.9rem; color:var(--navy);">${product.name}</p>
                            <p style="color:#94a3b8; font-size:0.8rem;">Qty: ${item.quantity}</p>
                        </div>
                    </div>
                    <span style="font-family:'Syne',sans-serif; font-weight:700; color:var(--navy);">₹${(item.price * item.quantity).toLocaleString()}</span>
                </div>
            `;
        }));

        const statusClass = order.status === 'paid' ? 'badge-paid' : order.status === 'cancelled' ? 'badge-cancelled' : 'badge-pending';

        container.innerHTML += `
<div class="card" style="margin-bottom:1.5rem; overflow:hidden;">
    <div style="background:var(--navy); padding:1rem 1.25rem; display:flex; justify-content:space-between; align-items:center;">
        <div>
            <span style="font-family:'Syne',sans-serif; font-weight:700; color:white; font-size:0.95rem;">Order #${order.id}</span>
            <p style="color:#94a3b8; font-size:0.75rem; margin-top:2px;">${new Date(order.created_at).toLocaleString()}</p>
        </div>
        <span class="${statusClass}">${order.status.toUpperCase()}</span>
    </div>
    <div style="padding:1.25rem;">
        ${itemsHtml.join("")}
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem; padding-top:1rem; border-top:2px solid #f1f5f9;">
            <span style="color:#64748b; font-size:0.9rem;">Total Amount</span>
            <span style="font-family:'Syne',sans-serif; font-size:1.2rem; font-weight:800; color:var(--orange);">₹${order.total_amount.toLocaleString()}</span>
        </div>
    </div>
</div>
`;
    }
}

loadOrders();