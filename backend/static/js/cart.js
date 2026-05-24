async function loadCart(){
    const token = localStorage.getItem("token");

    const res = await fetch("/cart/",{
        headers: {"Authorization": "Bearer " + token}
    });

    const data = await res.json();
    const container = document.getElementById("cart-list");
    const summary = document.getElementById("cart-summary");
    const emptyMsg = document.getElementById("empty-msg");

    container.innerHTML = "";
    summary.style.display = "none";
    emptyMsg.style.display = "none";
    document.getElementById("cart-total").textContent = "0";

    if(data.length == 0){
        emptyMsg.style.display = "block";
        return;
    }

    summary.style.display = "block";

    let total = 0;

    for(const item of data){
        const productRes = await fetch(`/products/${item.product_id}`);
        const product = await productRes.json();

        total += product.price*item.quantity;

        container.innerHTML += `
<div class="card" style="padding:1.25rem; margin-bottom:1rem; display:flex; align-items:center; gap:1rem;">
    <div style="width:70px; height:70px; border-radius:8px; overflow:hidden; flex-shrink:0; background:linear-gradient(135deg, #1e3a5f, #2563eb); display:flex; align-items:center; justify-content:center;">
        ${product.image_url 
            ? `<img src="${product.image_url}" style="width:100%; height:100%; object-fit:cover;">` 
            : `<span style="font-size:1.5rem;">📱</span>`}
    </div>
    <div style="flex:1;">
        <h3 style="font-family:'Syne',sans-serif; font-weight:700; color:var(--navy); margin-bottom:0.2rem;">${product.name}</h3>
        <p style="color:#64748b; font-size:0.85rem;">₹${product.price.toLocaleString()} x ${item.quantity}</p>
    </div>
    <div style="text-align:right;">
        <p style="font-family:'Syne',sans-serif; font-weight:800; color:var(--navy); font-size:1.1rem; margin-bottom:0.5rem;">₹${(product.price * item.quantity).toLocaleString()}</p>
        <button onclick="removeFromCart(${item.id})"
        style="background:#fee2e2; color:#dc2626; border:none; padding:0.3rem 0.75rem; border-radius:6px; font-weight:700; cursor:pointer; font-size:0.8rem;">
        Remove
        </button>
    </div>
</div>
`;
    }
    document.getElementById("cart-total").textContent = total.toFixed(2);
}

async function removeFromCart(cartItemId){
    const token = localStorage.getItem("token");

    const res = await fetch(`/cart/${cartItemId}`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token }
    });

    if(res.ok){
        loadCart();
    } else {
        alert("Failed to remove item");
    }
}

async function checkout(){
    const token = localStorage.getItem("token");

    if(!confirm("Proceed to payment?")) return;

    // Step 1 — Create order in our DB + Razorpay
    const res = await fetch("/payments/create-order", {
        method: "POST",
        headers: { "Authorization": "Bearer " + token }
    });

    const data = await res.json();

    console.log("Payment data:", data);

    if(!res.ok){
        alert(data.detail || "Failed to create order");
        return;
    }

    // Step 2 — Open Razorpay popup
    const options = {
        key: data.razorpay_key_id, 
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpay_order_id,
        name: "My Store",
        description: "Order Payment",
        handler: async function(response){
            // Step 3 — Verify payment on backend
            const verifyRes = await fetch("/payments/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    order_id: data.order_id
                })
            });

            const verifyData = await verifyRes.json();

            if(!verifyRes.ok){
                alert(verifyData.detail || "Payment verification failed");
                return;
            }

            window.location = "/payment-success";
        },
        prefill: {
            email: ""
        },
        theme: {
            color: "#22c55e"
        }
    };

    const rzp = new Razorpay(options);
    rzp.open();
}

loadCart();