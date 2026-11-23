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
