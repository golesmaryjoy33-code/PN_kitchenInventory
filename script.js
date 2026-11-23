/* ========================================
   PN KITCHEN - ROLE-BASED SMART INVENTORY ENGINE
   - Ate Tina (Staff): Full Access + Weekly Report Printing + Simple Budget
   - Student Coordinators (1st Yr & 2nd Yr): Deliveries & Book Out Usage Only
   - Everything seamlessly connected to Inventory, Budget & Weekly Reports
   ======================================== */

const INVENTORY_KEY = "pnKitchenInventory";
const SUPPLIERS_KEY = "pnKitchenSuppliersData";
const MENU_1_3_KEY = "pnKitchenMenu13Data";
const MENU_2_4_KEY = "pnKitchenMenu24Data";
const DELIVERIES_KEY = "pnKitchenDeliveriesData";
const USAGE_LOGS_KEY = "pnKitchenUsageLogsData";
const WEEKLY_BUDGET_KEY = "pnKitchenWeeklyBudget";
const USERS_KEY = "pnKitchenUsers";
const SESSION_KEY = "pnKitchenSession";

let activeWeekCycle = "1_3";
let currentLoggedInUser = null;

// CONSTANT OFFICIAL WEEKLY MENUS
const DEFAULT_MENU_1_3 = [
    {
        day: "SATURDAY",
        breakfast: ["APPLE", "SUNNY-SIDE UP EGG", "RICE", "ENERGEN"],
        lunch: ["FISH ESCABECHE", "RICE", "BANANA"],
        dinner: ["TAUGUE WITH CARROTS AND CABBAGE", "RICE", "WATERMELON"],
        snack: "SOPAS / LUGAW"
    },
    {
        day: "SUNDAY",
        breakfast: ["BANANA", "POTATO WITH EGG", "RICE", "MILK"],
        lunch: ["CHICKEN AFRITADA", "RICE", "WATERMELON"],
        dinner: ["UTAN BISAYA", "DRIED FISH", "RICE", "ORANGE"],
        snack: "BANANACUE"
    },
    {
        day: "MONDAY",
        breakfast: ["ORANGE", "KOREAN EGG ROLL", "RICE", "MILO"],
        lunch: ["PORKCHOP GUISADO", "RICE", "PINEAPPLE"],
        dinner: ["EGGPLANT WITH EGGS", "RICE", "APPLE"],
        snack: "ASSORTED BISCUITS"
    },
    {
        day: "TUESDAY",
        breakfast: ["WATERMELON", "BOILED EGGS", "RICE", "ENERGEN"],
        lunch: ["PORK MENUDO", "RICE", "APPLE"],
        dinner: ["CHOPSUEY", "RICE", "BANANA"],
        snack: "CHAMPORADO"
    },
    {
        day: "WEDNESDAY",
        breakfast: ["PINEAPPLE", "EGG OMELETTE WITH GINILING", "RICE", "MILK"],
        lunch: ["CHICKEN ADOBO", "SAUTEED VEGETABLES", "RICE", "ORANGE"],
        dinner: ["MONGGO SOUP WITH DRIED FISH", "RICE", "WATERMELON"],
        snack: "GINATAANG BILO-BILO"
    },
    {
        day: "THURSDAY",
        breakfast: ["APPLE", "SARDINES WITH TOMATOES AND EGG", "RICE"],
        lunch: ["BURGER STEAK WITH MORINGA AND MUSHROOMS", "RICE", "BANANA"],
        dinner: ["BAGUIO BEANS WITH MINCED PORK", "RICE", "ORANGE"],
        snack: "TURON"
    },
    {
        day: "FRIDAY",
        breakfast: ["BANANA", "EGG WITH TOMATO", "RICE"],
        lunch: ["FRIED FISH", "PINAKBET", "RICE", "ORANGE"],
        dinner: ["SARI-SARI WITH FISH FLAKES", "RICE", "APPLE"],
        snack: "PAN DE SAL"
    }
];

const DEFAULT_MENU_2_4 = [
    {
        day: "SATURDAY",
        breakfast: ["AMPALAYA WITH EGG", "RICE", "RIPE PAPAYA", "ENERGEN"],
        lunch: ["MEATBALLS", "RICE", "APPLE"],
        dinner: ["UTAN BISAYA", "DRIED FISH", "RICE", "BANANA"],
        snack: "SOPAS / LUGAW"
    },
    {
        day: "SUNDAY",
        breakfast: ["SOTANGHON GUISADO", "RICE", "ORANGE", "MILK"],
        lunch: ["TINOLANG MANOK", "RICE", "BANANA"],
        dinner: ["LUMPIA WITH VEGGIES", "RICE", "RIPE PAPAYA"],
        snack: "BANANACUE"
    },
    {
        day: "MONDAY",
        breakfast: ["SARDINES WITH EGG", "RICE", "PINEAPPLE", "MILO"],
        lunch: ["PORKCHOP GUISADO", "RICE", "RIPE PAPAYA"],
        dinner: ["TINUN-ANG KALABASA", "DRIED FISH", "RICE", "WATERMELON"],
        snack: "ASSORTED BISCUITS"
    },
    {
        day: "TUESDAY",
        breakfast: ["TOMATO WITH EGG AND CABBAGE", "RICE", "BANANA", "ENERGEN"],
        lunch: ["CHICKEN AFRITADA", "RICE", "GRAPES"],
        dinner: ["CHOPSUEY", "RICE", "PINEAPPLE"],
        snack: "CHAMPORADO"
    },
    {
        day: "WEDNESDAY",
        breakfast: ["SCRAMBLED EGG", "RICE", "RIPE PAPAYA", "MILK"],
        lunch: ["PORK MENUDO", "RICE", "WATERMELON"],
        dinner: ["MONGGO BEAN SOUP", "RICE", "GRAPES"],
        snack: "GINATAANG BILO-BILO"
    },
    {
        day: "THURSDAY",
        breakfast: ["EGG OMELETTE & GROUND PORK", "RICE", "GRAPES", "MILO"],
        lunch: ["FRIED FISH AND VEGGIES", "RICE", "BANANA"],
        dinner: ["STRING BEANS GUISADO", "RICE", "ORANGE"],
        snack: "TURON"
    },
    {
        day: "FRIDAY",
        breakfast: ["SAYOTE WITH EGG", "RICE", "WATERMELON", "ENERGEN"],
        lunch: ["FISH PAKSIW AND VEGGIES", "RICE", "ORANGE"],
        dinner: ["PAKBET", "RICE", "APPLE"],
        snack: "PAN DE SAL"
    }
];

function formatDateTime(d) {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
        " · " +
        d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDateOnly(dateStr) {
    if (!dateStr) return formatDateTime(new Date());
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCustomDateTime(dateStr, timeStr) {
    const d = dateStr ? new Date(dateStr + "T00:00:00") : new Date();
    const formattedDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    if (!timeStr) return formattedDate;
    const [hours, minutes] = timeStr.split(":");
    const timeObj = new Date();
    timeObj.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    const formattedTime = timeObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    return `${formattedDate} · ${formattedTime}`;
}

function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
}

function formatQtyWithUnit(qty, unit) {
    const whole = Math.round(qty);
    const cleanUnit = (unit || "").trim();
    return cleanUnit ? `${whole} ${escapeHTML(cleanUnit)}` : `${whole}`;
}

// LOCALSTORAGE LOAD & SAVE ENGINE
function getSavedInventory() {
    try {
        const list = JSON.parse(localStorage.getItem(INVENTORY_KEY));
        if (Array.isArray(list) && list.length > 0) return list;
    } catch {}
    // Helpful starter kitchen items so coordinators can log deliveries right away
    const starter = [
        { id: 101, name: "Rice (Sack / Kg)", category: "Dry Goods and Grains", qty: 50, unit: "kg", cost: 52.00 },
        { id: 102, name: "Fresh Eggs", category: "Eggs", qty: 120, unit: "pcs", cost: 9.00 },
        { id: 103, name: "Carrots", category: "Vegetables", qty: 10, unit: "kg", cost: 85.00 },
        { id: 104, name: "Cabbage", category: "Vegetables", qty: 8, unit: "kg", cost: 70.00 },
        { id: 105, name: "Chicken Meat", category: "Meat & Poultry", qty: 15, unit: "kg", cost: 195.00 },
        { id: 106, name: "Cooking Oil", category: "Oils, Fats, and Condiments", qty: 10, unit: "L", cost: 110.00 }
    ];
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(starter));
    return starter;
}
function saveInventory() { localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory)); }

function getSavedWeeklyBudget() {
    const raw = localStorage.getItem(WEEKLY_BUDGET_KEY);
    if (raw === null) return 15000;
    const val = parseFloat(raw);
    return isNaN(val) ? 0 : val;
}
function saveWeeklyBudget(val) {
    localStorage.setItem(WEEKLY_BUDGET_KEY, String(val));
}

function getSavedSuppliers() {
    try {
        return JSON.parse(localStorage.getItem(SUPPLIERS_KEY)) || [
            { id: 1, name: "Carbon Suki Vegetables", city: "Cebu City", contact: "Ate Rosa", phone: "0917-111-2233" },
            { id: 2, name: "Taboan Dried Fish & Grains", city: "Cebu City", contact: "Kuya Bert", phone: "0918-444-5566" },
            { id: 3, name: "Mandaue Poultry & Meat Suki", city: "Mandaue City", contact: "Nanay Belen", phone: "0920-777-8899" }
        ];
    } catch { return []; }
}
function saveSuppliers(list) { localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(list)); }

function getSavedDeliveries() {
    try { return JSON.parse(localStorage.getItem(DELIVERIES_KEY)) || []; }
    catch { return []; }
}
function saveDeliveries() { localStorage.setItem(DELIVERIES_KEY, JSON.stringify(deliveries)); }

function getSavedUsageLogs() {
    try { return JSON.parse(localStorage.getItem(USAGE_LOGS_KEY)) || []; }
    catch { return []; }
}
function saveUsageLogs() { localStorage.setItem(USAGE_LOGS_KEY, JSON.stringify(usageLogs)); }

function getSavedMenu13() {
    try {
        const parsed = JSON.parse(localStorage.getItem(MENU_1_3_KEY));
        if (Array.isArray(parsed) && parsed.length === 7) return parsed;
    } catch {}
    localStorage.setItem(MENU_1_3_KEY, JSON.stringify(DEFAULT_MENU_1_3));
    return JSON.parse(JSON.stringify(DEFAULT_MENU_1_3));
}
function saveMenu13() { localStorage.setItem(MENU_1_3_KEY, JSON.stringify(menu13)); }

function getSavedMenu24() {
    try {
        const parsed = JSON.parse(localStorage.getItem(MENU_2_4_KEY));
        if (Array.isArray(parsed) && parsed.length === 7) return parsed;
    } catch {}
    localStorage.setItem(MENU_2_4_KEY, JSON.stringify(DEFAULT_MENU_2_4));
    return JSON.parse(JSON.stringify(DEFAULT_MENU_2_4));
}
function saveMenu24() { localStorage.setItem(MENU_2_4_KEY, JSON.stringify(menu24)); }

let inventory = getSavedInventory();
let suppliersList = getSavedSuppliers();
let menu13 = getSavedMenu13();
let menu24 = getSavedMenu24();
let deliveries = getSavedDeliveries();
let usageLogs = getSavedUsageLogs();
let weeklyBudget = getSavedWeeklyBudget();

// DOM LOAD INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
    initAuth();
    initProfileDropdown();
    initNavigation();
    initForms();
    setDefaultDates();
    refreshSystemData();
});

function setDefaultDates() {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const currentTimeStr = now.toTimeString().slice(0, 5);

    const delivDateInput = document.getElementById("delivDate");
    const expDateInput = document.getElementById("expDate");
    const usageDateInput = document.getElementById("usageDateInput");
    const usageTimeInput = document.getElementById("usageTimeInput");

    if (delivDateInput) delivDateInput.value = todayStr;
    if (expDateInput) expDateInput.value = todayStr;
    if (usageDateInput) usageDateInput.value = todayStr;
    if (usageTimeInput) usageTimeInput.value = currentTimeStr;
}

function openDeliveryModal() {
    setDefaultDates();
    const recSelect = document.getElementById("delivReceivedBy");
    if (recSelect && currentLoggedInUser) {
        if (currentLoggedInUser.username === "coord1") recSelect.value = "1st Year Coordinator";
        else if (currentLoggedInUser.username === "coord2") recSelect.value = "2nd Year Coordinator";
        else if (currentLoggedInUser.role === "coordinator") {
            const label = currentLoggedInUser.name;
            if (!Array.from(recSelect.options).some(o => o.value === label)) {
                const opt = document.createElement("option");
                opt.value = label;
                opt.textContent = label;
                recSelect.prepend(opt);
            }
            recSelect.value = label;
        } else {
            recSelect.value = "Ate Tina (Head Cook)";
        }
    }
    openModal("addDeliveryModal");
}

function openBookOutModal() {
    setDefaultDates();
    const defaultLogger = currentLoggedInUser ? currentLoggedInUser.name : "Kitchen Staff";
    const loggedByInput = document.getElementById("usageLoggedByInput");
    if (loggedByInput) loggedByInput.value = defaultLogger;
    openModal("bookOutUsageModal");
}

function openSetBudgetModal() {
    const input = document.getElementById("weeklyBudgetInput");
    if (input) {
        input.value = weeklyBudget > 0 ? weeklyBudget : "";
    }
    openModal("setBudgetModal");
    setTimeout(() => { if (input) input.focus(); }, 50);
}

/* ========================================
   SIMPLIFIED KITCHEN INVENTORY METRICS
   ======================================== */
function computeSimpleMetrics() {
    const currentStockValue = inventory.reduce((sum, item) => sum + (Math.round(item.qty) * item.cost), 0);

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyPurchases = deliveries.filter(d => {
        const delDate = new Date(d.rawDate || Date.now());
        return delDate >= sevenDaysAgo;
    }).reduce((sum, d) => sum + d.cost, 0);

    const remainingBudget = weeklyBudget - weeklyPurchases;

    return {
        currentStockValue,
        weeklyPurchases,
        remainingBudget
    };
}

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

/* ========================================
   NAVIGATION & MENU SWITCHER
   ======================================== */
function initNavigation() {
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            switchView(link.getAttribute("data-view"));
        });
    });

    document.getElementById("openHelpBtn").addEventListener("click", () => openModal("helpModal"));
}

function switchView(viewId) {
    // Enforce coordinator restriction on view switch
    if (currentLoggedInUser && currentLoggedInUser.role === "coordinator") {
        if (viewId !== "deliveries" && viewId !== "book-usage") {
            viewId = "deliveries";
        }
    }

    document.querySelectorAll(".app-view").forEach(v => v.classList.remove("active"));
    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));

    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) targetView.classList.add("active");

    const activeLink = document.querySelector(`.nav-link[data-view="${viewId}"]`);
    if (activeLink) activeLink.classList.add("active");

    const viewTitles = {
        "dashboard": "🍳 &nbsp; DASHBOARD",
        "inventory": "🔪 &nbsp; INVENTORY",
        "deliveries": "🚚 &nbsp; DELIVERIES (RECEIPT LOGGING)",
        "book-usage": "🥄 &nbsp; BOOK OUT USAGE",
        "transactions": "🧾 &nbsp; WEEKLY REPORTS",
        "expenses": "💰 &nbsp; BUDGET & COSTING",
        "menu-planner": "🍽️ &nbsp; WEEKLY MENU",
        "guidelines": "📜 &nbsp; KITCHEN GUIDELINES",
        "suppliers": "🏪 &nbsp; SUKI SUPPLIERS"
    };
    document.getElementById("currentViewTitle").innerHTML = viewTitles[viewId] || "🍳 &nbsp; PN KITCHEN";

    if (viewId === "inventory") renderInventoryTable();
    if (viewId === "dashboard") renderRiceCookerStock();
    if (viewId === "book-usage") renderUsageLogsTable();
    if (viewId === "deliveries") renderDeliveriesTable();
    if (viewId === "menu-planner") renderWeeklyMenuTable();
    if (viewId === "expenses") renderExpensesCalculations();
    if (viewId === "transactions") renderTransactionsHistory();
}

function switchMenuCycle(cycleVal) {
    activeWeekCycle = cycleVal;
    document.getElementById("menuTitleDisplay").textContent = cycleVal === "1_3" ? "MENU WEEK 1 & 3" : "MENU WEEK 2 & 4";
    renderWeeklyMenuTable();
}

function printWeeklyReport() {
    window.print();
}

/* ========================================
   DATA REFRESH ENGINE (CONNECTS EVERYTHING)
   ======================================== */
function refreshSystemData() {
    updateDashboardMetrics();
    renderRiceCookerStock();
    renderInventoryTable();
    renderDeliveriesTable();
    renderUsageLogsTable();
    populateSelectDropdowns();
    renderWeeklyMenuTable();
    renderExpensesCalculations();
    renderTransactionsHistory();
    renderSuppliersTable();
}

function updateDashboardMetrics() {
    const totalItems = inventory.reduce((sum, i) => sum + Math.round(i.qty), 0);
    const metrics = computeSimpleMetrics();

    document.getElementById("statTotalItems").textContent = totalItems;
    document.getElementById("statInventoryValue").textContent = `₱${metrics.currentStockValue.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    
    const remEl = document.getElementById("statRemainingBudget");
    remEl.textContent = `₱${metrics.remainingBudget.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    remEl.style.color = metrics.remainingBudget < 0 ? "var(--red)" : "var(--deep-sky)";

    document.getElementById("statBudgetSubtitle").textContent = `Budget: ₱${weeklyBudget.toLocaleString()} − Receipts: ₱${metrics.weeklyPurchases.toLocaleString()}`;
}

function renderRiceCookerStock() {
    const outOfStock = inventory.filter(i => Math.round(i.qty) === 0).length;
    const inStock = inventory.filter(i => Math.round(i.qty) > 0).length;
    const totalTypes = inventory.length;

    const percent = totalTypes > 0 ? Math.round((inStock / totalTypes) * 100) : 0;

    const fillEl = document.getElementById("cookerFillLevel");
    const countEl = document.getElementById("cookerInStockCount");
    const badgeEl = document.getElementById("cookerPercentBadge");
    const legInEl = document.getElementById("legendInStock");
    const legOutEl = document.getElementById("legendOutStock");

    if (fillEl) fillEl.style.height = `${percent}%`;
    if (countEl) countEl.textContent = inStock;
    if (badgeEl) badgeEl.textContent = `${percent}% Full`;
    if (legInEl) legInEl.textContent = inStock;
    if (legOutEl) legOutEl.textContent = outOfStock;
}

/* ========================================
   TABLE RENDERERS
   ======================================== */
function renderInventoryTable() {
    const tbody = document.getElementById("inventoryTableBody");
    const search = document.getElementById("inventorySearch").value.toLowerCase();
    const cat = document.getElementById("inventoryCategoryFilter").value;

    tbody.innerHTML = "";
    let filteredTotalValue = 0;

    inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search);
        const matchesCat = cat === "ALL" || item.category === cat;
        return matchesSearch && matchesCat;
    }).forEach(item => {
        const wholeQty = Math.round(item.qty);
        const itemTotalVal = wholeQty * item.cost;
        filteredTotalValue += itemTotalVal;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><b>${escapeHTML(item.name)}</b></td>
            <td>${escapeHTML(item.category)}</td>
            <td>${formatQtyWithUnit(wholeQty, item.unit)}</td>
            <td>₱${item.cost.toFixed(2)}</td>
            <td><b>₱${itemTotalVal.toLocaleString(undefined, {minimumFractionDigits: 2})}</b></td>
            <td>
                <button onclick="quickDeduct(${item.id})" title="Deduct 1" style="padding: 4px 8px; background: var(--light-sky); color: var(--deep-sky); font-weight: bold;">-1</button>
                <button onclick="deleteIngredient(${item.id})" title="Delete" style="color:var(--red); background:none; margin-left: 6px;">🗑</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (!tbody.children.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#8b909a;">No ingredients found. Add one above!</td></tr>`;
    }

    const totalEl = document.getElementById("inventoryTableTotalValue");
    if (totalEl) {
        totalEl.textContent = `₱${filteredTotalValue.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    }
}

function renderUsageLogsTable() {
    const tbody = document.getElementById("usageLogsTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    usageLogs.forEach(u => {
        const costUsed = typeof u.costUsed === "number" ? u.costUsed : (Math.round(u.qtyUsed) * (u.unitCost || 0));
        tbody.innerHTML += `
            <tr>
                <td>${escapeHTML(u.date)}</td>
                <td><b>${escapeHTML(u.ingredientName)}</b></td>
                <td><span style="color:var(--red); font-weight:bold;">-${formatQtyWithUnit(u.qtyUsed, u.unit)}</span></td>
                <td><b>₱${costUsed.toLocaleString(undefined, {minimumFractionDigits: 2})}</b></td>
                <td>${formatQtyWithUnit(u.remainingQty, u.unit)}</td>
                <td><span class="badge coord">${escapeHTML(u.user || 'Kitchen Staff')}</span></td>
            </tr>
        `;
    });

    if (!usageLogs.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#8b909a;">No usage logged yet. Click "Book Out Ingredients" above.</td></tr>`;
    }
}

function renderDeliveriesTable() {
    const tbody = document.getElementById("deliveriesTableBody");
    const dashList = document.getElementById("dashboardDeliveriesList");

    tbody.innerHTML = "";
    dashList.innerHTML = "";

    deliveries.forEach((d, index) => {
        const recNo = d.receiptNo ? `<b>${escapeHTML(d.receiptNo)}</b>` : `<span style="color:var(--muted);">—</span>`;
        const recBy = d.receivedBy ? escapeHTML(d.receivedBy) : "Kitchen Staff";

        tbody.innerHTML += `
            <tr>
                <td>${escapeHTML(d.date)}</td>
                <td>${recNo}</td>
                <td><b>${escapeHTML(d.supplier)}</b></td>
                <td>${escapeHTML(d.items)}</td>
                <td><b>₱${d.cost.toLocaleString(undefined, {minimumFractionDigits: 2})}</b></td>
                <td><span class="badge coord">${recBy}</span></td>
                <td><span class="badge ready">${escapeHTML(d.status)}</span></td>
            </tr>
        `;

        if (index < 3) {
            dashList.innerHTML += `
                <div style="padding:7px 0; border-bottom:1px solid var(--border); font-size: 12px;">
                    <small style="color:var(--muted);">${escapeHTML(d.date)} · ${recBy}</small><br>
                    <strong>${escapeHTML(d.supplier)}</strong> (${escapeHTML(d.items)}) — <span style="color:var(--accent); font-weight:bold;">₱${d.cost.toLocaleString()}</span>
                </div>
            `;
        }
    });

    if (!deliveries.length) {
        dashList.innerHTML = `<p style="color:var(--muted); padding:10px; font-size:12px;">No deliveries logged yet.</p>`;
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#8b909a;">No delivery receipts recorded yet. Click "+ Log Delivery Receipt" above.</td></tr>`;
    }
}

// WEEKLY REPORTS (TRANSACTIONS)
function getTransactionWeekLabel(dateValue) {
    const date = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
        return "Date not specified";
    }
    const weekNumber = Math.ceil(date.getDate() / 7);
    return `WEEK ${weekNumber} — ${date.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric"
    }).toUpperCase()}`;
}

function renderTransactionsHistory() {
    const container = document.getElementById("transactionsHistoryContainer");
    if (!container) return;

    if (!Array.isArray(deliveries) || deliveries.length === 0) {
        container.innerHTML = `
            <div class="table-card" style="padding: 28px; text-align: center; color: var(--muted);">
                <div style="font-size: 32px; margin-bottom: 8px;">🧾</div>
                <strong>No weekly delivery receipts recorded yet.</strong>
                <p style="font-size: 12px; margin-top: 6px;">
                    Once student coordinators log delivery receipts, they will automatically appear here grouped by week for Ate Tina's report.
                </p>
            </div>
        `;
        return;
    }

    const groupedTransactions = {};
    deliveries.forEach((delivery) => {
        const dateValue = delivery.rawDate || "";
        const groupLabel = getTransactionWeekLabel(dateValue);
        if (!groupedTransactions[groupLabel]) {
            groupedTransactions[groupLabel] = [];
        }
        groupedTransactions[groupLabel].push(delivery);
    });

    container.innerHTML = Object.entries(groupedTransactions)
        .map(([weekLabel, records]) => {
            const weeklyTotal = records.reduce((sum, record) => {
                const amount = Number(record.cost);
                return sum + (Number.isFinite(amount) ? amount : 0);
            }, 0);

            const rows = records.map((record) => {
                const amount = Number(record.cost);
                const formattedCost = Number.isFinite(amount)
                    ? amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : "0.00";

                return `
                    <tr>
                        <td>${escapeHTML(record.date || record.rawDate || "—")}</td>
                        <td><b>${escapeHTML(record.receiptNo || "—")}</b></td>
                        <td><strong>${escapeHTML(record.supplier || "—")}</strong></td>
                        <td>${escapeHTML(record.items || "Item details unavailable")}</td>
                        <td>${escapeHTML(record.receivedBy || "Kitchen Staff")}</td>
                        <td><b>₱${formattedCost}</b></td>
                    </tr>
                `;
            }).join("");

            return `
                <div class="table-card" style="margin-bottom: 20px; overflow: hidden;">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; padding-bottom:14px; margin-bottom:12px; border-bottom:1px solid var(--border);">
                        <div>
                            <h3 style="margin:0; color:var(--deep-sky);">${weekLabel}</h3>
                            <small style="color:var(--muted);">
                                ${records.length} receipt${records.length === 1 ? "" : "s"} logged · Prepared by: Ate Tina (PN Kitchen)
                            </small>
                        </div>
                        <div style="text-align:right;">
                            <small style="display:block; color:var(--muted);">WEEKLY RECEIPTS TOTAL</small>
                            <strong style="color:var(--accent); font-size:16px;">
                                ₱${weeklyTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </strong>
                        </div>
                    </div>

                    <div style="overflow-x:auto;">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Delivery Date</th>
                                    <th>Receipt #</th>
                                    <th>Suki Supplier</th>
                                    <th>Items Received</th>
                                    <th>Received By</th>
                                    <th>Amount (₱)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rows}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }).join("");
}

function renderWeeklyMenuTable() {
    const tbody = document.getElementById("weeklyMenuTableBody");
    const overview = document.getElementById("dashboardMenuOverview");
    const fruitsEl = document.getElementById("fruitsList");
    const snacksEl = document.getElementById("snacksList");

    if (!tbody) return;
    tbody.innerHTML = "";
    if (overview) overview.innerHTML = "";

    const activeMenuData = activeWeekCycle === "1_3" ? menu13 : menu24;

    activeMenuData.forEach(m => {
        tbody.innerHTML += `
            <tr>
                <td><b>${m.day}</b></td>
                <td>${m.breakfast.join("<br>")}</td>
                <td>${m.lunch.join("<br>")}</td>
                <td>${m.dinner.join("<br>")}</td>
            </tr>
        `;

        if (overview) {
            overview.innerHTML += `
                <div style="padding:6px 0; border-bottom:1px solid var(--border); font-size:11px;">
                    <b style="color:var(--deep-sky);">${m.day}:</b> ${m.lunch[0]} / ${m.dinner[0]}
                </div>
            `;
        }
    });

    if (fruitsEl) fruitsEl.textContent = "APPLE, ORANGE, PINEAPPLE, WATERMELON, BANANA, GRAPES, RIPE PAPAYA";
    if (snacksEl) snacksEl.innerHTML = activeMenuData.map(m => `<div><b>${m.day}:</b> ${m.snack || 'SOPAS / LUGAW'}</div>`).join("");
}

function renderExpensesCalculations() {
    const m = computeSimpleMetrics();

    document.getElementById("plannedWeeklyBudget").textContent = `₱${weeklyBudget.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    document.getElementById("weeklySpendCalc").textContent = `₱${m.weeklyPurchases.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    
    const remBudgetEl = document.getElementById("remainingWeeklyBudget");
    const remCardEl = document.getElementById("remainingBudgetCard");
    remBudgetEl.textContent = `₱${m.remainingBudget.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    
    if (m.remainingBudget < 0) {
        remBudgetEl.style.color = "var(--red)";
        remCardEl.style.borderLeftColor = "var(--red)";
        document.getElementById("budgetFormulaDisplay").textContent = `⚠️ Over budget by ₱${Math.abs(m.remainingBudget).toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    } else {
        remBudgetEl.style.color = "var(--deep-sky)";
        remCardEl.style.borderLeftColor = "#10b981";
        document.getElementById("budgetFormulaDisplay").textContent = `₱${weeklyBudget.toLocaleString()} − ₱${m.weeklyPurchases.toLocaleString()} = ₱${m.remainingBudget.toLocaleString()}`;
    }

    const tbody = document.getElementById("expensesTableBody");
    tbody.innerHTML = "";
    deliveries.forEach(d => {
        tbody.innerHTML += `
            <tr>
                <td>${escapeHTML(d.date)}</td>
                <td><b>${escapeHTML(d.receiptNo || "—")}</b></td>
                <td>${escapeHTML(d.supplier)}</td>
                <td>${escapeHTML(d.items)}</td>
                <td>${escapeHTML(d.receivedBy || "Kitchen Staff")}</td>
                <td><b>₱${d.cost.toLocaleString(undefined, {minimumFractionDigits: 2})}</b></td>
            </tr>
        `;
    });

    if (!deliveries.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#8b909a;">No delivery receipts or expenses logged yet.</td></tr>`;
    }
}

function renderSuppliersTable() {
    const tbody = document.getElementById("suppliersTableBody");
    tbody.innerHTML = "";

    suppliersList.forEach(sup => {
        tbody.innerHTML += `
            <tr>
                <td><b>${escapeHTML(sup.name)}</b></td>
                <td>${escapeHTML(sup.city || "N/A")}</td>
                <td>${escapeHTML(sup.contact || "N/A")}</td>
                <td>${escapeHTML(sup.phone || "N/A")}</td>
                <td>
                    <button onclick="deleteSupplier(${sup.id})" style="color:var(--red); background:none;">🗑</button>
                </td>
            </tr>
        `;
    });

    if (!suppliersList.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#8b909a;">No suppliers registered yet.</td></tr>`;
    }
}

/* ========================================
   DYNAMIC SUPPLIER HANDLER & DROPDOWNS
   ======================================== */
function handleSupplierSelectChange(selectElem) {
    const customGroup = document.getElementById("customSupplierGroup");
    const customName = document.getElementById("customSupplierInput");
    const customCity = document.getElementById("customSupplierCity");

    if (selectElem.value === "__ADD_NEW__") {
        customGroup.style.display = "block";
        customName.setAttribute("required", "true");
        customCity.setAttribute("required", "true");
        customName.focus();
    } else {
        customGroup.style.display = "none";
        customName.removeAttribute("required");
        customCity.removeAttribute("required");
    }
}

function populateSelectDropdowns() {
    const delivSelect = document.getElementById("delivIngredient");
    const usageSelect = document.getElementById("usageIngredientSelect");
    const supplierSelect = document.getElementById("delivSupplier");

    [delivSelect, usageSelect].forEach(selectEl => {
        if (!selectEl) return;
        const prevVal = selectEl.value;
        selectEl.innerHTML = "";

        if (!inventory.length) {
            selectEl.innerHTML = `<option value="">No items available</option>`;
        } else {
            inventory.forEach(i => {
                selectEl.innerHTML += `<option value="${i.id}">${escapeHTML(i.name)} (${formatQtyWithUnit(i.qty, i.unit)} @ ₱${i.cost.toFixed(2)})</option>`;
            });
            if (prevVal) selectEl.value = prevVal;
        }
    });

    if (supplierSelect) {
        const selectedVal = supplierSelect.value;
        supplierSelect.innerHTML = `<option value="" disabled selected>-- Choose Suki Supplier --</option>`;

        suppliersList.forEach(sup => {
            supplierSelect.innerHTML += `<option value="${escapeHTML(sup.name)}">${escapeHTML(sup.name)} (${escapeHTML(sup.city || 'Local')})</option>`;
        });

        supplierSelect.innerHTML += `<option value="__ADD_NEW__">+ Add New Suki Supplier...</option>`;

        if (selectedVal && selectedVal !== "__ADD_NEW__") {
            supplierSelect.value = selectedVal;
        }
    }
}

/* ========================================
   MODALS, ACTIONS & FORMS
   ======================================== */
function initForms() {
    // 0. SET WEEKLY BUDGET FORM
    document.getElementById("setBudgetForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const rawVal = document.getElementById("weeklyBudgetInput").value;
        const newBudget = parseFloat(rawVal);
        if (isNaN(newBudget) || newBudget < 0) {
            showToast("Please enter a valid weekly budget amount.");
            return;
        }
        weeklyBudget = newBudget;
        saveWeeklyBudget(weeklyBudget);
        closeModal("setBudgetModal");
        showToast(`Weekly budget saved: ₱${weeklyBudget.toLocaleString(undefined, {minimumFractionDigits: 2})}`);
        refreshSystemData();
    });

    // 1. ADD INGREDIENT FORM
    document.getElementById("addIngredientForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const wholeQty = parseInt(document.getElementById("newIngQty").value, 10);
        if (isNaN(wholeQty) || wholeQty < 0) {
            showToast("Please enter a valid whole number quantity.");
            return;
        }

        const newIng = {
            id: Date.now(),
            name: document.getElementById("newIngName").value.trim(),
            category: document.getElementById("newIngCategory").value,
            qty: wholeQty,
            unit: document.getElementById("newIngUnit").value.trim(),
            cost: parseFloat(document.getElementById("newIngCost").value)
        };

        inventory.push(newIng);
        saveInventory();
        closeModal("addIngredientModal");
        showToast(`Added ${newIng.name} to inventory!`);
        e.target.reset();
        refreshSystemData();
    });

    // 2. LOG DELIVERY RECEIPT FORM (CONNECTS TO INVENTORY, BUDGET & WEEKLY REPORTS)
    document.getElementById("addDeliveryForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const ingId = parseInt(document.getElementById("delivIngredient").value, 10);
        if (!ingId) return;

        let supplierSelect = document.getElementById("delivSupplier");
        let supplierName = supplierSelect.value;
        const delivDateVal = document.getElementById("delivDate").value;
        const receiptNo = document.getElementById("delivReceiptNo").value.trim();
        const receivedBy = document.getElementById("delivReceivedBy").value;

        if (supplierName === "__ADD_NEW__") {
            const customName = document.getElementById("customSupplierInput").value.trim();
            const customCity = document.getElementById("customSupplierCity").value.trim();

            if (customName) {
                const newSupObj = {
                    id: Date.now(),
                    name: customName,
                    city: customCity || "Unspecified",
                    contact: "Added via Delivery",
                    phone: "N/A"
                };
                suppliersList.push(newSupObj);
                saveSuppliers(suppliersList);
                supplierName = customName;
            }
        }

        if (!supplierName) {
            showToast("Please select a valid supplier.");
            return;
        }

        const qtyAdded = parseInt(document.getElementById("delivQty").value, 10);
        if (isNaN(qtyAdded) || qtyAdded <= 0) {
            showToast("Please enter a valid whole number quantity.");
            return;
        }
        const cost = parseFloat(document.getElementById("delivCost").value);

        const ing = inventory.find(i => i.id === ingId);
        if (ing) {
            ing.qty = Math.round(ing.qty) + qtyAdded;
            saveInventory();
        }

        const itemLabel = ing 
            ? `${ing.name} (${qtyAdded}${ing.unit ? " " + ing.unit : ""})` 
            : "Supplies";

        deliveries.unshift({
            id: Date.now(),
            rawDate: delivDateVal || new Date().toISOString().split("T")[0],
            date: formatDateOnly(delivDateVal),
            receiptNo: receiptNo || `REC-${String(Date.now()).slice(-4)}`,
            supplier: supplierName,
            items: itemLabel,
            cost: cost,
            receivedBy: receivedBy,
            status: "Received"
        });

        saveDeliveries();
        closeModal("addDeliveryModal");
        showToast(`Receipt logged by ${receivedBy}! Stock & Weekly Report updated.`);

        e.target.reset();
        setDefaultDates();
        document.getElementById("customSupplierGroup").style.display = "none";
        refreshSystemData();
    });

    // 3. LOG MANUAL EXPENSE FORM
    document.getElementById("addExpenseForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const expDateVal = document.getElementById("expDate").value;
        const receiptNo = document.getElementById("expReceiptNo").value.trim();
        const supplier = document.getElementById("expSupplier").value.trim();
        const items = document.getElementById("expItems").value.trim();
        const amount = parseFloat(document.getElementById("expAmount").value);

        deliveries.unshift({
            id: Date.now(),
            rawDate: expDateVal || new Date().toISOString().split("T")[0],
            date: formatDateOnly(expDateVal),
            receiptNo: receiptNo || "EXP",
            supplier: supplier,
            items: items,
            cost: amount,
           receivedBy: currentLoggedInUser ? currentLoggedInUser.name : "Ate Tina",
            status: "Paid"
        });

        saveDeliveries();
        closeModal("addExpenseModal");
        showToast("Logged expense successfully!");
        e.target.reset();
        setDefaultDates();
        refreshSystemData();
    });

    // 4. ADD SUPPLIER FORM
    document.getElementById("addSupplierForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("supName").value.trim();
        const city = document.getElementById("supCity").value.trim();
        const contact = document.getElementById("supContact").value.trim();
        const phone = document.getElementById("supPhone").value.trim();

        if (suppliersList.some(s => s.name.toLowerCase() === name.toLowerCase())) {
            showToast("A supplier with this name already exists.");
            return;
        }

        suppliersList.push({
            id: Date.now(),
            name: name,
            city: city,
            contact: contact || "N/A",
            phone: phone || "N/A"
        });

        saveSuppliers(suppliersList);
        closeModal("addSupplierModal");
        showToast(`Suki Supplier "${name}" saved!`);
        e.target.reset();
        refreshSystemData();
    });

    // 5. EDIT WEEKLY MENU FORM
    document.getElementById("planMenuForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const targetCycle = document.getElementById("menuCycleTarget").value;
        const day = document.getElementById("menuDaySelect").value;
        const meal = document.getElementById("menuMealSelect").value;
        const rawText = document.getElementById("menuItemsInput").value;
        const items = rawText.split(/,|\n/).map(s => s.trim().toUpperCase()).filter(Boolean);

        const targetList = targetCycle === "1_3" ? menu13 : menu24;
        let dayObj = targetList.find(m => m.day === day);
        if (!dayObj) {
            dayObj = { day, breakfast: [], lunch: [], dinner: [], snack: "" };
            targetList.push(dayObj);
        }

        if (meal === "snack") {
            dayObj.snack = items.join(" / ");
        } else {
            dayObj[meal] = items;
        }

        if (targetCycle === "1_3") saveMenu13();
        else saveMenu24();

        closeModal("planMenuModal");
        showToast(`Updated ${meal.toUpperCase()} for ${day}!`);
        e.target.reset();
        refreshSystemData();
    });

    // 6. BOOK OUT KITCHEN USAGE FORM (CONNECTS TO INVENTORY)
    document.getElementById("bookOutUsageForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const ingId = parseInt(document.getElementById("usageIngredientSelect").value, 10);
        const qtyUsed = parseInt(document.getElementById("usageQtyInput").value, 10);
        const dateVal = document.getElementById("usageDateInput").value;
        const timeVal = document.getElementById("usageTimeInput").value;
        const loggedByVal = document.getElementById("usageLoggedByInput").value.trim();

        if (isNaN(qtyUsed) || qtyUsed <= 0) {
            showToast("Please enter a valid whole number quantity.");
            return;
        }

        const ing = inventory.find(i => i.id === ingId);
        if (ing) {
            const currentWholeQty = Math.round(ing.qty);
            if (qtyUsed > currentWholeQty) {
                showToast(`Cannot deduct ${qtyUsed}! Only ${currentWholeQty}${ing.unit ? " " + ing.unit : ""} left in stock.`);
                return;
            }
            ing.qty = currentWholeQty - qtyUsed;
            saveInventory();

            const costUsed = qtyUsed * ing.cost;

            usageLogs.unshift({
                id: Date.now(),
                date: formatCustomDateTime(dateVal, timeVal),
                ingredientName: ing.name,
                qtyUsed: qtyUsed,
                unit: ing.unit || "",
                unitCost: ing.cost,
                costUsed: costUsed,
                remainingQty: ing.qty,
                user: loggedByVal || (currentLoggedInUser ? currentLoggedInUser.name : "Kitchen Staff")
            });
            saveUsageLogs();

            showToast(`Booked out ${qtyUsed}${ing.unit ? " " + ing.unit : ""} of ${ing.name}! Inventory updated.`);
        }

        closeModal("bookOutUsageModal");
        e.target.reset();
        setDefaultDates();
        refreshSystemData();
    });
}

function quickDeduct(id) {
    const item = inventory.find(i => i.id === id);
    if (item && Math.round(item.qty) > 0) {
        item.qty = Math.round(item.qty) - 1;
        saveInventory();

        usageLogs.unshift({
            id: Date.now(),
            date: formatDateTime(new Date()),
            ingredientName: item.name,
            qtyUsed: 1,
            unit: item.unit || "",
            unitCost: item.cost,
            costUsed: item.cost,
            remainingQty: item.qty,
            user: currentLoggedInUser ? currentLoggedInUser.name : "Ate Tina"
        });
        saveUsageLogs();

        showToast(`Deducted 1 from ${item.name}`);
        refreshSystemData();
    }
}

function deleteIngredient(id) {
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    if (!confirm(`Delete "${item.name}" from inventory?`)) return;
    inventory = inventory.filter(i => i.id !== id);
    saveInventory();
    showToast("Ingredient deleted.");
    refreshSystemData();
}

function deleteSupplier(id) {
    const sup = suppliersList.find(s => s.id === id);
    if (!sup) return;
    if (!confirm(`Remove "${sup.name}" from approved suppliers?`)) return;
    suppliersList = suppliersList.filter(s => s.id !== id);
    saveSuppliers(suppliersList);
    showToast("Supplier removed.");
    refreshSystemData();
}

function openModal(id) { document.getElementById(id).classList.add("active"); }
function closeModal(id) { document.getElementById(id).classList.remove("active"); }

function showToast(message) {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}