async function Login(){
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch("/auth/login",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({email,password})
    });

    const data = await res.json();
    if(!res.ok){
        alert(data.detail || "login failed");
        return;
    }

    if(data.access_token){
        localStorage.setItem("token",data.access_token);
    }

    alert("Login successfull");

    window.location="/products-ui";
}