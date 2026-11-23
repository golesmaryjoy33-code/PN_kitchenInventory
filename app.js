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

