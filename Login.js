window.addEventListener("DOMContentLoaded", function () {
  document.getElementById("login-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const usernameError = document.getElementById("username-error");
    const passwordError = document.getElementById("password-error");
    const loginMessage = document.getElementById("login-message");

    // Reset error messages
    usernameError.textContent = "";
    passwordError.textContent = "";
    loginMessage.textContent = "";

    let valid = true;
    if (!username) {
      usernameError.textContent = "Username is required.";
      valid = false;
    }

    if (!password) {
      passwordError.textContent = "Password is required.";
      valid = false;
    }

    if (!valid) return;

    const loginData = {
      Username: username,
      Password: password
    };

    fetch("https://localhost:7204/api/Account/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(loginData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Invalid username or password.");
      }
      return response.json();
    })
    .then(data => {
      console.log("Login successful!", data);
      loginMessage.textContent = "Login successful!";
      loginMessage.style.color = "green";
      sessionStorage.setItem("authToken", data.token);

      setTimeout(() => {
        window.location.href = "/html/index.html"; // Change to your actual page
      }, 1000);
    })
    .catch(error => {
      console.error("Error:", error);
      loginMessage.textContent = error.message || "Login failed. Please try again.";
      loginMessage.style.color = "red";
    });
  });
});


 window.addEventListener('load', () => {
    document.getElementById('favicon').href = 'favicon-active.png';
  });

