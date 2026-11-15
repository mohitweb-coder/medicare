
// Get HTML elements
const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

// Switch between Login and Registration
document.getElementById("show-register").addEventListener("click", function(e) {
    e.preventDefault();

    loginSection.classList.add("hidden");
    registerSection.classList.remove("hidden");

    clearMessages();
});

document.getElementById("show-login").addEventListener("click", function(e) {
    e.preventDefault();

    registerSection.classList.add("hidden");
    loginSection.classList.remove("hidden");

    clearMessages();
});

// Show / Hide Password
document.querySelectorAll(".toggle-password").forEach(button => {
    button.addEventListener("click", function() {

        const input = document.getElementById(this.dataset.target);

        if (input.type === "password") {
            input.type = "text";
            this.textContent = "Hide";
        } else {
            input.type = "password";
            this.textContent = "Show";
        }
    });
});

// Get registered admins
function getAdmins() {
    try {
        return JSON.parse(localStorage.getItem("medicare_admins")) || [];
    } catch {
        return [];
    }
}

// Show messages
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);

    element.textContent = message;
    element.className = "message " + type;
}

function clearMessages() {
    document.querySelectorAll(".message").forEach(element => {
        element.textContent = "";
        element.className = "message";
    });
}

// Registration
registerForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim().toLowerCase();
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (password.length < 6) {
        showMessage("register-message", "Password must be at least 6 characters.", "error");
        return;
    }

    if (password !== confirmPassword) {
        showMessage("register-message", "Passwords do not match!", "error");
        return;
    }

    const admins = getAdmins();

    const existingAdmin = admins.find(admin => admin.email === email);

    if (existingAdmin) {
        showMessage("register-message", "This email is already registered!", "error");
        return;
    }

    const newAdmin = {
        name: name,
        email: email,
        password: password
    };

    admins.push(newAdmin);

    localStorage.setItem("medicare_admins", JSON.stringify(admins));

    showMessage("register-message", "Registration successful! Please login.", "success");

    registerForm.reset();

    setTimeout(() => {
        registerSection.classList.add("hidden");
        loginSection.classList.remove("hidden");

        document.getElementById("login-email").value = email;

        clearMessages();
    }, 1500);
});

// Login
loginForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;

    const admins = getAdmins();

    const admin = admins.find(user =>
        user.email === email && user.password === password
    );

    if (!admin) {
        showMessage("login-message", "Invalid email or password!", "error");
        return;
    }

    // Save login session
    sessionStorage.setItem("medicare_session", JSON.stringify({
        name: admin.name,
        email: admin.email
    }));

    showMessage("login-message", "Login successful! Opening dashboard...", "success");

    setTimeout(() => {
        window.location.href = "dashboard.html";
    }, 800);
});
