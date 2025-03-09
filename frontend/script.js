const apiUrl = "http://localhost:3000";

// Toggle Login/Signup
function toggleSignup() {
    document.getElementById("login-box").style.display = "none";
    document.getElementById("signup-box").style.display = "block";
}
function toggleLogin() {
    document.getElementById("signup-box").style.display = "none";
    document.getElementById("login-box").style.display = "block";
}

// Login Function
function login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    fetch(apiUrl + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", username);
            window.location.href = "dashboard.html";
        } else {
            alert("Invalid credentials!");
        }
    });
}

// Signup Function
function signup() {
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;

    fetch(apiUrl + "/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        toggleLogin();
    });
}
