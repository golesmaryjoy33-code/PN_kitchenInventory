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
