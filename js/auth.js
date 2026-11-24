/* ========================================
   ROLE-BASED AUTHENTICATION (STAFF VS COORDINATOR)
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

function ensureDefaultUsers() {
    const users = getUsers();
    const defaults = [
        { username: "tina", name: "Ate Tina", password: "pn12345", role: "staff" },
        { username: "coord1", name: "1st Year Coordinator", password: "pn12345", role: "coordinator" },
        { username: "coord2", name: "2nd Year Coordinator", password: "pn12345", role: "coordinator" }
    ];

    let changed = false;
    defaults.forEach(def => {
        const existing = users.find(u => u.username === def.username);
        if (!existing) {
            users.push(def);
            changed = true;
        } else if (!existing.role) {
            existing.role = def.role;
            changed = true;
        }
    });

    if (changed) saveUsers(users);
}

function showAuthTab(which) {
    const isLogin = which === "login";
    document.getElementById("loginPanel").style.display = isLogin ? "block" : "none";
    document.getElementById("signupPanel").style.display = isLogin ? "none" : "block";
    document.getElementById("loginError").textContent = "";
    document.getElementById("signupError").textContent = "";
}

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
        if (sidebarRoleBadge) sidebarRoleBadge.textContent = "Coordinator Station";
        if (sidebarHelpText) sidebarHelpText.textContent = "Log receipts & daily cooking usage.";
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
        if (sidebarRoleBadge) sidebarRoleBadge.textContent = "Smart Inventory System";
        if (sidebarHelpText) sidebarHelpText.textContent = "Simple Stock In & Out guide.";
        switchView("dashboard");
    }
}

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
    document.getElementById("dropdownUsername").textContent = `@${user.username} (${user.role === "coordinator" ? "Coordinator" : "Staff"})`;
    
    // Load the profile picture belonging to the logged-in account
if (typeof window.loadProfilePicture === "function") {
    window.loadProfilePicture(user.username);
}


    document.getElementById("dashboardGreeting").textContent = `Welcome back, ${displayName}! 🌿`;
    sessionStorage.setItem(SESSION_KEY, user.username);

    refreshSystemData();
    applyRolePermissions(user);
}

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

function switchAccount() {
    document.getElementById("profileDropdown").classList.remove("active");
    sessionStorage.removeItem(SESSION_KEY);
    currentLoggedInUser = null;
    // Reset the displayed profile
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
    showToast("Log in as Ate Tina or Student Coordinator.");
}

function registerNewStaff() {
    document.getElementById("profileDropdown").classList.remove("active");
    sessionStorage.removeItem(SESSION_KEY);
    currentLoggedInUser = null;
    document.getElementById("dashboardApp").style.display = "none";
    document.getElementById("loginPage").style.display = "grid";
    showAuthTab("signup");
    document.getElementById("signupName").focus();
}

function triggerLogout() {
    document.getElementById("profileDropdown").classList.remove("active");
    sessionStorage.removeItem(SESSION_KEY);
    currentLoggedInUser = null;
    // Reset the displayed profile
document.getElementById("userAvatar").style.backgroundImage = "none";
document.getElementById("dropdownAvatar").style.backgroundImage = "none";

document.getElementById("userAvatar").textContent = "?";
document.getElementById("dropdownAvatar").textContent = "?";

document.getElementById("dropdownFullName").textContent = "";
document.getElementById("dropdownUsername").textContent = "";
    document.getElementById("dashboardApp").style.display = "none";
    document.getElementById("loginPage").style.display = "grid";
    showAuthTab("login");
    showToast("Logged out successfully.");
}

function initAuth() {
    ensureDefaultUsers();

    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const logoutButton = document.getElementById("logoutButton");

    document.getElementById("goSignup").addEventListener("click", (e) => { e.preventDefault(); showAuthTab("signup"); });
    document.getElementById("goLogin").addEventListener("click", (e) => { e.preventDefault(); showAuthTab("login"); });

    [["togglePassword", "password"], ["toggleSignupPassword", "signupPassword"]].forEach(([btnId, inputId]) => {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(inputId);
        if (!btn || !input) return;
        btn.addEventListener("click", () => {
            const isPass = input.type === "password";
            input.type = isPass ? "text" : "password";
            btn.textContent = isPass ? "Hide" : "Show";
        });
    });

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        ensureDefaultUsers();
        const usernameInput = document.getElementById("username").value.trim().toLowerCase();
        const passwordInput = document.getElementById("password").value;

        const user = getUsers().find(u => u.username.toLowerCase() === usernameInput && u.password === passwordInput);

        if (user) {
            document.getElementById("loginError").textContent = "";
            enterDashboard(user);
            showToast(`Logged in as ${user.name}!`);
        } else {
            document.getElementById("loginError").textContent = "Invalid username or password. Please check and try again.";
        }
    });

    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const errorBox = document.getElementById("signupError");
        const name = document.getElementById("signupName").value.trim();
        const role = document.getElementById("signupRole").value;
        const username = document.getElementById("signupUsername").value.trim().toLowerCase();
        const password = document.getElementById("signupPassword").value;
        const confirm = document.getElementById("signupConfirm").value;

        if (!name) {
            errorBox.textContent = "Please enter your full name.";
            return;
        }
        if (!/^[a-z0-9_]{3,}$/.test(username)) {
            errorBox.textContent = "Username must be at least 3 characters (letters, numbers, underscore).";
            return;
        }
        if (password.length < 6) {
            errorBox.textContent = "Password must be at least 6 characters.";
            return;
        }
        if (password !== confirm) {
            errorBox.textContent = "Passwords do not match.";
            return;
        }

        const users = getUsers();
        if (users.some(u => u.username.toLowerCase() === username)) {
            errorBox.textContent = "That username is already registered.";
            return;
        }

        const newUser = { username, name, password, role };
        users.push(newUser);
        saveUsers(users);

        signupForm.reset();
        errorBox.textContent = "";
        showAuthTab("login");
        document.getElementById("username").value = username;
        document.getElementById("password").value = password;
        showToast(`Account created for ${name}! Click Log In.`);
    });

    logoutButton.addEventListener("click", triggerLogout);

    const activeSessionUser = sessionStorage.getItem(SESSION_KEY);
    if (activeSessionUser) {
        const found = getUsers().find(u => u.username.toLowerCase() === activeSessionUser.toLowerCase());
        if (found) {
            enterDashboard(found);
            return;
        }
    }

    document.getElementById("loginPage").style.display = "grid";
    document.getElementById("dashboardApp").style.display = "none";
    showAuthTab("login");
}
