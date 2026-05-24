const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

async function loadProduct(){

    const res = await fetch(`/products/${productId}`);
    const p = await res.json();

    document.getElementById("name").value = p.name;
    document.getElementById("desc").value = p.description;
    document.getElementById("price").value = p.price;
    document.getElementById("qty").value = p.quantity;
    document.getElementById("image_url").value = p.image_url || "";
}

async function updateProduct(){
    const token = localStorage.getItem("token");

    const product = {
        name: document.getElementById("name").value,
        description: document.getElementById("desc").value,
        price: parseFloat(document.getElementById("price").value),
        quantity: parseInt(document.getElementById("qty").value),
        image_url: document.getElementById("image_url").value || null
    }
    console.log("Sending product:", product);
    const res = await fetch(`/products/${productId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify(product)
    });

    const data = await res.json();

    if(!res.ok){
        alert(data.detail || "Update failed");
        return;
    }

    window.location = "/products-ui";
}

loadProduct();