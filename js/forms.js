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
