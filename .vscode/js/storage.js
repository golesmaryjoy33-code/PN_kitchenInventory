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
