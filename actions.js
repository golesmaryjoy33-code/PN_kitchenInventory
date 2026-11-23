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
