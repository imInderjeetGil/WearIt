function requireAuth(){

    const token = localStorage.getItem("token");

    if(!token){
        alert("Login required");
        window.location = "/login-ui";
    }

}