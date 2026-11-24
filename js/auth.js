
/* ========================================
   ROLE-BASED AUTHENTICATION
   STAFF VS COORDINATOR
   ======================================== */

function getUsers() {
    try {
        const list = JSON.parse(localStorage.getItem(USERS_KEY));
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/* ========================================
   REMOVE OLD DEMO ACCOUNTS
   ======================================== */

function removeOldDemoAccounts() {
    const demoUsernames = ["tina", "coord1", "coord2"];
    const users = getUsers();

    const filteredUsers = users.filter(user =>
        !user ||
        typeof user.username !== "string" ||
        !demoUsernames.includes(user.username.trim().toLowerCase())
    );

    if (filteredUsers.length !== users.length) {
        saveUsers(filteredUsers);
    }
}

/* ========================================
   LOGIN / SIGNUP TAB
   ======================================== */

function showAuthTab(which) {
    const isLogin = which === "login";

    document.getElementById("loginPanel").style.display =
        isLogin ? "block" : "none";

    document.getElementById("signupPanel").style.display =
        isLogin ? "none" : "block";

    document.getElementById("loginError").textContent = "";
    document.getElementById("signupError").textContent = "";
}

/* ========================================
   ROLE-BASED PERMISSIONS
   ======================================== */

function applyRolePermissions(user) {
    const isCoordinator = user.role === "coordinator";

    const staffElements = document.querySelectorAll(".staff-only");
    const rolePill = document.getElementById("rolePillBadge");
    const sidebarRoleBadge = document.getElementById("sidebarRoleBadge");
    const sidebarHelpText = document.getElementById("sidebarHelpText");

    if (isCoordinator) {
        staffElements.forEach(el => {
            el.style.display = "none";
        });

        if (rolePill) {
            rolePill.textContent = "Student Coordinator";
            rolePill.classList.add("coordinator");
        }

        if (sidebarRoleBadge) {
            sidebarRoleBadge.textContent = "Coordinator Station";
        }

        if (sidebarHelpText) {
            sidebarHelpText.textContent =
                "Log receipts & daily cooking usage.";
        }

        switchView("deliveries");

    } else {
        staffElements.forEach(el => {
            if (el.classList.contains("nav-link")) {
                el.style.display = "flex";
            } else {
                el.style.display = "";
            }
        });

        if (rolePill) {
            rolePill.textContent = "Kitchen Staff (Full Access)";
            rolePill.classList.remove("coordinator");
        }

        if (sidebarRoleBadge) {
            sidebarRoleBadge.textContent = "Smart Inventory System";
        }

        if (sidebarHelpText) {
            sidebarHelpText.textContent =
                "Simple Stock In & Out guide.";
        }

        switchView("dashboard");
    }
}

/* ========================================
   ENTER DASHBOARD
   ======================================== */

function enterDashboard(user) {
    currentLoggedInUser = user;

    const displayName = user.name || user.username;
    const initial = displayName.charAt(0).toUpperCase();

    document.getElementById("loginPage").style.display = "none";
    document.getElementById("dashboardApp").style.display = "flex";

    document.getElementById("userDisplay").textContent = displayName;
    document.getElementById("userAvatar").textContent = initial;

    document.getElementById("dropdownAvatar").textContent = initial;
    document.getElementById("dropdownFullName").textContent = displayName;

    document.getElementById("dropdownUsername").textContent =
        `@${user.username} (${user.role === "coordinator" ? "Coordinator" : "Staff"})`;

    if (typeof window.loadProfilePicture === "function") {
        window.loadProfilePicture(user.username);
    }

    document.getElementById("dashboardGreeting").textContent =
        `Welcome back, ${displayName}! 🌿`;

    sessionStorage.setItem(SESSION_KEY, user.username);

    refreshSystemData();
    applyRolePermissions(user);
}

/* ========================================
   PROFILE DROPDOWN
   ======================================== */

function initProfileDropdown() {
    const trigger = document.getElementById("userProfileTrigger");
    const dropdown = document.getElementById("profileDropdown");

    trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target) && !trigger.contains(e.target)) {
            dropdown.classList.remove("active");
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            dropdown.classList.remove("active");
        }
    });
}

/* ========================================
   SWITCH ACCOUNT
   ======================================== */

function switchAccount() {
    document.getElementById("profileDropdown").classList.remove("active");

    sessionStorage.removeItem(SESSION_KEY);
    currentLoggedInUser = null;

    document.getElementById("userAvatar").style.backgroundImage = "none";
    document.getElementById("dropdownAvatar").style.backgroundImage = "none";

    document.getElementById("userAvatar").textContent = "?";
    document.getElementById("dropdownAvatar").textContent = "?";

    document.getElementById("dropdownFullName").textContent = "";
    document.getElementById("dropdownUsername").textContent = "";

    document.getElementById("dashboardApp").style.display = "none";
    document.getElementById("loginPage").style.display = "grid";

    document.getElementById("username").value = "";
    document.getElementById("password").value = "";

    showAuthTab("login");

    document.getElementById("username").focus();

    showToast("Please log in using your registered account.");
}

/* ========================================
   REGISTER NEW STAFF
   ======================================== */

function registerNewStaff() {
    document.getElementById("profileDropdown").classList.remove("active");

    sessionStorage.removeItem(SESSION_KEY);
    currentLoggedInUser = null;

    document.getElementById("dashboardApp").style.display = "none";
    document.getElementById("loginPage").style.display = "grid";

    showAuthTab("signup");

    document.getElementById("signupName").focus();
}

/* ========================================
   LOGOUT
   ======================================== */

function triggerLogout() {
    document.getElementById("profileDropdown").classList.remove("active");

    // Clear only the active session.
    // Do not delete registered accounts.
    sessionStorage.removeItem(SESSION_KEY);
    currentLoggedInUser = null;

    document.getElementById("userAvatar").style.backgroundImage = "none";
    document.getElementById("dropdownAvatar").style.backgroundImage = "none";

    document.getElementById("userAvatar").textContent = "?";
    document.getElementById("dropdownAvatar").textContent = "?";

    document.getElementById("dropdownFullName").textContent = "";
    document.getElementById("dropdownUsername").textContent = "";

    document.getElementById("dashboardApp").style.display = "none";
    document.getElementById("loginPage").style.display = "grid";

    document.getElementById("username").value = "";
    document.getElementById("password").value = "";

    showAuthTab("login");

    document.getElementById("username").focus();

    showToast("Logged out successfully.");
}

/* ========================================
   INITIALIZE AUTHENTICATION
   ======================================== */

function initAuth() {

    // Remove previously saved demo accounts.
    removeOldDemoAccounts();

    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const logoutButton = document.getElementById("logoutButton");

    document.getElementById("goSignup").addEventListener("click", (e) => {
        e.preventDefault();
        showAuthTab("signup");
    });

    document.getElementById("goLogin").addEventListener("click", (e) => {
        e.preventDefault();
        showAuthTab("login");
    });

    /* SHOW / HIDE PASSWORD */

    [["togglePassword", "password"],
     ["toggleSignupPassword", "signupPassword"]].forEach(([btnId, inputId]) => {

        const btn = document.getElementById(btnId);
        const input = document.getElementById(inputId);

        if (!btn || !input) return;

        btn.addEventListener("click", () => {
            const isPass = input.type === "password";

            input.type = isPass ? "text" : "password";
            btn.textContent = isPass ? "Hide" : "Show";
        });
    });

    /* ========================================
       LOGIN VALIDATION
       ONLY REGISTERED USERS CAN LOGIN
       ======================================== */

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const errorBox = document.getElementById("loginError");

        const usernameInput = document
            .getElementById("username")
            .value.trim().toLowerCase();

        const passwordInput = document
            .getElementById("password")
            .value;

        // Check empty fields
        if (!usernameInput || !passwordInput) {
            errorBox.textContent =
                "Please enter both your username and password.";
            return;
        }

        // Get saved registered accounts
        const users = getUsers();

        // Find registered username
        const user = users.find(u =>
            u &&
            typeof u.username === "string" &&
            u.username.trim().toLowerCase() === usernameInput
        );

        // Reject unregistered username
        if (!user) {
            errorBox.textContent =
                "Account not found. Please register first.";

            document.getElementById("password").value = "";
            return;
        }

        // Check password
        if (
            typeof user.password !== "string" ||
            user.password !== passwordInput
        ) {
            errorBox.textContent =
                "Incorrect password. Please try again.";

            document.getElementById("password").value = "";
            return;
        }

        // Successful login
        errorBox.textContent = "";

        document.getElementById("username").value = "";
        document.getElementById("password").value = "";

        enterDashboard(user);

        showToast(`Logged in as ${user.name || user.username}!`);
    });

    /* ========================================
       ACCOUNT REGISTRATION
       REGISTER ONLY ONCE
       ======================================== */

    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const errorBox = document.getElementById("signupError");

        const name = document.getElementById("signupName").value.trim();

        const role = document.getElementById("signupRole").value;

        const username = document
            .getElementById("signupUsername")
            .value.trim().toLowerCase();

        const password = document.getElementById("signupPassword").value;

        const confirm = document.getElementById("signupConfirm").value;

        // Validate name
        if (!name) {
            errorBox.textContent = "Please enter your full name.";
            return;
        }

        // Validate username
        if (!/^[a-z0-9_]{3,}$/.test(username)) {
            errorBox.textContent =
                "Username must be at least 3 characters (letters, numbers, underscore).";
            return;
        }

        // Validate password
        if (password.length < 6) {
            errorBox.textContent =
                "Password must be at least 6 characters.";
            return;
        }

        // Confirm password
        if (password !== confirm) {
            errorBox.textContent = "Passwords do not match.";
            return;
        }

        // Check if username is already registered
        const users = getUsers();

        const existingUser = users.find(u =>
            u &&
            typeof u.username === "string" &&
            u.username.trim().toLowerCase() === username
        );

        if (existingUser) {
            // Do not register the same account again.
            showAuthTab("login");

            document.getElementById("loginError").textContent =
                "This account is already registered. Please log in instead.";

            document.getElementById("username").value = "";
            document.getElementById("password").value = "";

            return;
        }

        // Create new registered account
        const newUser = {
            username: username,
            name: name,
            password: password,
            role: role
        };

        users.push(newUser);

        // Save account permanently in localStorage
        saveUsers(users);

        // Clear registration form
        signupForm.reset();

        errorBox.textContent = "";

        // Return to login
        showAuthTab("login");

        // Keep login fields empty
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";

        document.getElementById("username").focus();

        showToast(`Account created for ${name}! Please log in.`);
    });

    /* LOGOUT BUTTON */

    logoutButton.addEventListener("click", triggerLogout);

    /* ========================================
       SESSION HANDLING
       ======================================== */

    const activeSessionUser = sessionStorage.getItem(SESSION_KEY);

    if (activeSessionUser) {

        const found = getUsers().find(u =>
            u &&
            typeof u.username === "string" &&
            u.username.toLowerCase() === activeSessionUser.toLowerCase()
        );

        if (found) {
            enterDashboard(found);
            return;
        }

        sessionStorage.removeItem(SESSION_KEY);
    }

    /* INITIAL LOGIN PAGE */

    document.getElementById("loginPage").style.display = "grid";
    document.getElementById("dashboardApp").style.display = "none";

    document.getElementById("username").value = "";
    document.getElementById("password").value = "";

    showAuthTab("login");
}

/* ========================================
   CLEAR LOGIN FIELDS ON PAGE LOAD
   ======================================== */

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
});
