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
