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
