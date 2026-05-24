async function register(){
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if(!name || !email || !password){
        alert("All fields are required");
        return;
    }

    const res = await fetch("auth/register",{
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({name,email,password})
    });

    const data = await res.json();
    if(!res.ok){
        alert(data.detail || "Registeration Failed");
        return;
    }

    alert("Account created! Please login");
    window.location = "/login-ui";
}