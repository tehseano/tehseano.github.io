const museums = [
    "Demon God", "Koryeo", "Yamato", "Cathay", "Murika", 
    "Britland", "Kemet", "Hellas", "Bhrata", "Time Rift"
];
const promotions = {
    "": { multiplier: 1, wtadsCost: 0 },
    "Green": { multiplier: 1.06, wtadsCost: 25 },
    "Blue": { multiplier: 1.14, wtadsCost: 70 },
    "Purple": { multiplier: 1.22, wtadsCost: 140 },
    "Orange": { multiplier: 1.30, wtadsCost: 260 }
};
const museumItems = [
    { name: "the Curator's Helm", cost: 50000 },
    { name: "the 1st Crystal of Will", cost: 100000 },
    { name: "the 2nd Crystal of Will", cost: 100000 },
    { name: "Athena's Delight", cost: 200000 }
];
const museumCalculator = document.getElementById('museum-medal-calculator');
const museumMedalsTotal = document.getElementById('museum-medals-total');
const museumWtadsCost = document.getElementById('museum-wtads-cost');
const itemCheckboxes = document.getElementById('item-checkboxes');
const currentMedalsInput = document.getElementById('current-medals');
const medalsUsedPerResetInput = document.getElementById('medals-used-per-reset');
const itemPredictions = document.getElementById('item-predictions');
const resetButton = document.getElementById('reset-button');

let totalDailyMedals = 0;

function createMuseumRow(museum) {
    const row = document.createElement('div');
    row.className = 'museum-row';
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'museum-name';
    nameSpan.textContent = museum;
    
    // Create tooltip container
    const tooltipDiv = document.createElement('div');
    
    // Set classes based on museum name
    if (museum === 'Demon God') {
        tooltipDiv.className = 'tooltip tooltip-show tooltip-help tooltip-top';
    } else {
        tooltipDiv.className = 'tooltip tooltip-show tooltip-top';
    }
    
    const medalInput = document.createElement('input');
    medalInput.type = 'number';
    medalInput.className = 'medal-input';
    medalInput.placeholder = 'e.g. 123';
    medalInput.min = '0';
    medalInput.inputMode = 'numeric';
    medalInput.pattern = '[0-9]*';
    medalInput.value = getCookie(`${museum}-medals`) || '';
    medalInput.id = `${museum}-medals`;
    medalInput.addEventListener('input', () => {
        setCookie(`${museum}-medals`, medalInput.value);
        calculateMuseumTotals();
    });
    
    // Create tooltip image
    const tooltipImg = document.createElement('img');
    tooltipImg.src = "images/museum/museum_medals.png";
    tooltipImg.className = 'tooltip-img style4';
    tooltipImg.alt = 'Museum Medals';
    
    // Assemble tooltip
    tooltipDiv.appendChild(medalInput);
    tooltipDiv.appendChild(tooltipImg);
    
    const promotionSelect = document.createElement('select');
    promotionSelect.id = `${museum}-promotion`;
    promotionSelect.innerHTML = `
        <option value="">None</option>
        <option value="Green">Green</option>
        <option value="Blue">Blue</option>
        <option value="Purple">Purple</option>
        <option value="Orange">Orange</option>
    `;
    promotionSelect.value = getCookie(`${museum}-promotion`) || '';
    promotionSelect.addEventListener('change', () => {
        setCookie(`${museum}-promotion`, promotionSelect.value);
        calculateMuseumTotals();
    });
  
    promotionSelect.setAttribute('data-native-menu', 'true');
    
    row.appendChild(nameSpan);
    row.appendChild(tooltipDiv);
    row.appendChild(promotionSelect);
    
    return row;
}

function calculateMuseumTotals() {
    let totalWithPromotions = 0;
    let totalWithoutPromotions = 0;
    let totalWtadsCost = 0;
    let hasPromotion = false;

    museums.forEach(museum => {
        const medals = parseInt(document.getElementById(`${museum}-medals`).value) || '';
        const promotion = document.getElementById(`${museum}-promotion`).value;
        totalWithPromotions += medals * promotions[promotion].multiplier;
        totalWithoutPromotions += medals;
        totalWtadsCost += promotions[promotion].wtadsCost;
        if (promotion !== "") {
            hasPromotion = true;
        }
    });

    totalDailyMedals = totalWithPromotions;
    museumMedalsTotal.innerHTML = `<label>Total Daily Medals: ${Math.round(totalDailyMedals)}</label>`;

    const extraMedals = totalWithPromotions - totalWithoutPromotions;
    const wtadsCostPerMedal = extraMedals > 0 ? totalWtadsCost / extraMedals : 0;

    if (hasPromotion) {
        museumWtadsCost.innerHTML = `<label>Wtads/Medal: ${wtadsCostPerMedal.toFixed(2)}</label>`;
        museumWtadsCost.style.display = 'block';
    } else {
        museumWtadsCost.style.display = 'none';
    }

    calculateItemPredictions();
}

function createItemCheckboxes() {
    museumItems.forEach((item, index) => {
        const checkboxDiv = document.createElement('div');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `item-${index}`;
        checkbox.checked = getCookie(`item-${index}`) === 'true';
        checkbox.addEventListener('change', () => {
            setCookie(`item-${index}`, checkbox.checked);
            toggleNextCheckbox(checkbox);
        });
        
        const label = document.createElement('label');
        label.htmlFor = `item-${index}`;
        label.textContent = `Bought ${item.name}`;

        checkboxDiv.appendChild(checkbox);
        checkboxDiv.appendChild(label);
        itemCheckboxes.appendChild(checkboxDiv);

        if (index > 0 && !document.getElementById(`item-${index-1}`).checked) {
            checkboxDiv.style.display = 'none';
        }
    });
}

function toggleNextCheckbox(checkbox) {
    const currentIndex = parseInt(checkbox.id.split('-')[1]);
    const nextCheckbox = document.getElementById(`item-${currentIndex + 1}`);
    if (nextCheckbox) {
        nextCheckbox.parentElement.style.display = checkbox.checked ? 'block' : 'none';
    }
    calculateItemPredictions();
}

function calculateItemPredictions() {
    const currentMedals = parseInt(currentMedalsInput.value) || '';
    const medalsUsedPerReset = parseInt(medalsUsedPerResetInput.value) || '';
    const dailyNetMedals = totalDailyMedals - (medalsUsedPerReset / 3);

    itemPredictions.innerHTML = '';

    if (currentMedals === 0 && medalsUsedPerReset === 0 && totalDailyMedals === 0) {
        return; // Hide predictions if no data has been entered
    }

    let cumulativeCost = 0;
    let cumulativeDays = 0;

    museumItems.forEach((item, index) => {
        const checkbox = document.getElementById(`item-${index}`);
        if (!checkbox.checked) {
            cumulativeCost += item.cost;
            const daysUntilPurchase = Math.ceil((cumulativeCost - currentMedals) / dailyNetMedals);
            cumulativeDays += Math.max(0, daysUntilPurchase - cumulativeDays);

            if (cumulativeDays > 0 && isFinite(cumulativeDays)) {
                const purchaseDate = new Date();
                purchaseDate.setDate(purchaseDate.getDate() + cumulativeDays);
                const formattedDate = purchaseDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                const predictionText = `You'll unlock ${item.name} on ${formattedDate}`;
                const predictionElement = document.createElement('p');
                predictionElement.textContent = predictionText;
                itemPredictions.appendChild(predictionElement);
            }
        }
    });
}

function setCookie(name, value) {
    document.cookie = `${name}=${value}; path=/; max-age=31536000`; // expires in 1 year
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function resetAllData() {
    museums.forEach(museum => {
        document.getElementById(`${museum}-medals`).value = '';
        document.getElementById(`${museum}-promotion`).value = '';
        setCookie(`${museum}-medals`, '');
        setCookie(`${museum}-promotion`, '');
    });

    museumItems.forEach((_, index) => {
        const checkbox = document.getElementById(`item-${index}`);
        checkbox.checked = false;
        setCookie(`item-${index}`, false);
        if (index > 0) {
            checkbox.parentElement.style.display = 'none';
        }
    });

    currentMedalsInput.value = '';
    medalsUsedPerResetInput.value = '';
    setCookie('current-medals', '');
    setCookie('medals-used-per-reset', '');

    calculateMuseumTotals();
}

museums.forEach(museum => {
    museumCalculator.appendChild(createMuseumRow(museum));
});

createItemCheckboxes();

[currentMedalsInput, medalsUsedPerResetInput].forEach(input => {
    input.value = getCookie(input.id) || '';
    input.addEventListener('input', () => {
        setCookie(input.id, input.value);
        calculateItemPredictions();
    });
});

// Update the reset button event listener
resetButton.addEventListener('click', resetAllData);

calculateMuseumTotals();