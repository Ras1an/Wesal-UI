

window.addEventListener("DOMContentLoaded", function () {
  document.getElementById("signup-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const emailError = document.getElementById("email-error");
    const passwordError = document.getElementById("password-error");

    let valid = true;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      emailError.textContent = "Please enter a valid email address.";
      valid = false;
    } else {
      emailError.textContent = "";
    }

    // Password validation
    const passwordRules = [
      { regex: /.{8,}/, message: "at least 8 characters" },
      { regex: /[a-z]/, message: "one lowercase letter" },
      { regex: /[A-Z]/, message: "one uppercase letter" },
      { regex: /[0-9]/, message: "one number" },
      { regex: /[^A-Za-z0-9]/, message: "one special character" }
    ];

    const failedRules = passwordRules.filter(rule => !rule.regex.test(password));
    if (failedRules.length > 0) {
      passwordError.textContent = "Password must contain: " + failedRules.map(r => r.message).join(", ") + ".";
      valid = false;
    } else if (password !== confirmPassword) {
      passwordError.textContent = "Passwords do not match.";
      valid = false;
    } else {
      passwordError.textContent = "";
    }

    if (!valid) return;

    // Create object to send
    const userData = {
      Username: username,
      Email: email,
      Password: password
    };

    fetch("https://localhost:7204/api/Account/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(userData)
})
.then(response => {
  if (!response.ok) {
    throw new Error("Signup failed.");
  }
  return response.json();
})
.then(data => {
  console.log("Signup successful!", data);
  document.getElementById("signup-message").textContent = "Signup successful!";
  document.getElementById("signup-message").style.color = "green";
  sessionStorage.setItem('authToken', data.token);

  setTimeout(() => {
    window.location.href = "CreateProfile.html"; // Replace with your target page
  }, 1500); // 1.5 second delay
})



.catch(error => {
  console.error("Error:", error);
  document.getElementById("signup-message").textContent = "Signup failed. Please try again.";
  document.getElementById("signup-message").style.color = "red";
});

});
});




 window.addEventListener('load', () => {
    document.getElementById('favicon').href = 'favicon-active.png';
  });
