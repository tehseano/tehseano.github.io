function calculateGearUpgradeCost(level) {
    const Y = level -1;
    return {
        glue: 500 + (225 * Y) + (25 * (Y * Y)),
        btads: (160 + (80 * Y) + (10 * (Y * Y))) * 1000
    };
}

function calculateBaseAowCost() {
    return {
        glue: 60,
        btads: 120000,
        orangeReagent: 0,
        eoh: 1,
        cow: 1,          // CoW only needed for base AoW
        heavenWings: 1,
        abyssWings: 1
    };
}

function calculateAowUpgradeCost(level) {
    const Y = level;
    return {
        glue: 60 + (35 * Y) + (5 * (Y * Y)),
        btads: (90 + (60 * Y) + (10 * (Y * Y))) * 1000,
        orangeReagent: 100 * Y,
        eoh: 1,
        cow: 0,          // No CoW needed for upgrades
        heavenWings: 1,
        abyssWings: 1
    };
}

function getAowChainRequirements(level) {
    if (level === 0) {
        return [0];
    }

    let chain = [level];
    for (let i = level - 1; i >= 0; i--) {
        chain.push(i);
    }
    return chain;
}

function calculateTotalAowCost(level) {
    let costs = {
        glue: 0,
        btads: 0,
        orangeReagent: 0,
        eoh: 0,
        cow: 0,
        heavenWings: 0,
        abyssWings: 0
    };

    const chain = getAowChainRequirements(level);

    for (let aowLevel of chain) {
        if (aowLevel === 0) {
            const baseCost = calculateBaseAowCost();
            Object.keys(costs).forEach(key => {
                costs[key] += baseCost[key];
            });
        } else {
            const upgradeCost = calculateAowUpgradeCost(aowLevel);
            Object.keys(costs).forEach(key => {
                costs[key] += upgradeCost[key];
            });
        }
    }

    return costs;
}

// New wing crafting related functions
const RECIPES = {
    heavenWings: {
        materials: {
            seethingBracelet: 1,
            icyBracelet: 1,
            heavenAmulet: 1
        },
        glue: 20,
        btads: 24000
    },
    abyssWings: {
        materials: {
            seethingBracelet: 1,
            icyBracelet: 1,
            abyssAmulet: 1
        },
        glue: 20,
        btads: 24000
    },
    seethingBracelet: {
        materials: {
            wizardRing: 1,
            crusaderRing: 1,
            rubyBrooch: 1
        },
        glue: 6,
        btads: 6000
    },
    icyBracelet: {
        materials: {
            wizardRing: 1,
            crusaderRing: 1,
            sapphireBrooch: 1
        },
        glue: 6,
        btads: 6000
    },
    wizardRing: {
        materials: {
            sorcererRing: 1,
            whitePearl: 1
        },
        glue: 2,
        btads: 2000
    },
    crusaderRing: {
        materials: {
            warriorRing: 1,
            blackPearl: 1
        },
        glue: 2,
        btads: 2000
    },
    sorcererRing: {
        materials: {
            flowerCrown: 1,
            woodenRing: 1
        },
        glue: 1,
        btads: 1000
    },
    warriorRing: {
        materials: {
            ironRing: 1,
            beastFang: 1
        },
        glue: 1,
        btads: 1000
    }
};

// Mapping for display names
const MATERIAL_NAMES = {
    seethingBracelet: "Seething Bracelet",
    icyBracelet: "Icy Bracelet",
    heavenAmulet: "Heaven Amulet",
    abyssAmulet: "Abyss Amulet",
    wizardRing: "Wizard Ring",
    crusaderRing: "Crusader Ring",
    rubyBrooch: "Ruby Brooch",
    sapphireBrooch: "Sapphire Brooch",
    sorcererRing: "Sorcerer Ring",
    warriorRing: "Warrior Ring",
    whitePearl: "White Pearl",
    blackPearl: "Black Pearl",
    flowerCrown: "Flower Crown",
    woodenRing: "Wooden Ring",
    ironRing: "Iron Ring",
    beastFang: "Beast Fang"
};

// Define display order (from top to bottom)
const MATERIAL_ORDER = [
    // Purple materials
    "seethingBracelet",
    "icyBracelet",
    "heavenAmulet",
    "abyssAmulet",
    // Blue materials
    "wizardRing",
    "crusaderRing",
    "rubyBrooch",
    "sapphireBrooch",
    // Green materials
    "sorcererRing",
    "warriorRing",
    "whitePearl",
    "blackPearl",
    // White materials
    "flowerCrown",
    "woodenRing",
    "ironRing",
    "beastFang"
];

function calculateTotalWingNeeds(heavenWingsNeeded, abyssWingsNeeded, inventory) {
    let needs = {
        materials: {},
        glue: 0,
        btads: 0
    };

    // Create a working copy of inventory that will be depleted as we calculate
    let availableInventory = { ...inventory };

    // First calculate how many of each wing type we actually need to craft
    const heavenWingsAvailable = availableInventory.heavenWings || 0;
    const abyssWingsAvailable = availableInventory.abyssWings || 0;
    const heavenWingsToCraft = Math.max(0, heavenWingsNeeded - heavenWingsAvailable);
    const abyssWingsToCraft = Math.max(0, abyssWingsNeeded - abyssWingsAvailable);

    if (heavenWingsToCraft === 0 && abyssWingsToCraft === 0) {
        return needs;
    }

    // Calculate total shared components needed
    const totalSeethingBraceletsNeeded = heavenWingsToCraft + abyssWingsToCraft;
    const totalIcyBraceletsNeeded = heavenWingsToCraft + abyssWingsToCraft;

    // Calculate seething bracelet needs
    const seethingNeeds = calculateCraftingNeeds('seethingBracelet', totalSeethingBraceletsNeeded, availableInventory);
    
    // Update available inventory after seething bracelet calculations
    Object.entries(seethingNeeds.materials).forEach(([material, amount]) => {
        availableInventory[material] = Math.max(0, (availableInventory[material] || 0) - amount);
    });

    // Calculate icy bracelet needs
    const icyNeeds = calculateCraftingNeeds('icyBracelet', totalIcyBraceletsNeeded, availableInventory);

    // Combine all costs
    needs.glue = seethingNeeds.glue + icyNeeds.glue;
    needs.btads = seethingNeeds.btads + icyNeeds.btads;

    // Add direct wing crafting costs
    needs.glue += heavenWingsToCraft * RECIPES.heavenWings.glue + abyssWingsToCraft * RECIPES.abyssWings.glue;
    needs.btads += heavenWingsToCraft * RECIPES.heavenWings.btads + abyssWingsToCraft * RECIPES.abyssWings.btads;

    // Combine all material needs
    needs.materials = { ...seethingNeeds.materials };
    Object.entries(icyNeeds.materials).forEach(([material, amount]) => {
        needs.materials[material] = (needs.materials[material] || 0) + amount;
    });

    // Add amulet requirements
    if (heavenWingsToCraft > 0) {
        needs.materials.heavenAmulet = heavenWingsToCraft;
    }
    if (abyssWingsToCraft > 0) {
        needs.materials.abyssAmulet = abyssWingsToCraft;
    }

    // Add bracelet totals
    if (totalSeethingBraceletsNeeded > 0) {
        needs.materials.seethingBracelet = totalSeethingBraceletsNeeded;
    }
    if (totalIcyBraceletsNeeded > 0) {
        needs.materials.icyBracelet = totalIcyBraceletsNeeded;
    }

    return needs;
}

function calculateCraftingNeeds(item, quantity, inventory) {
    let needs = {
        materials: {},
        glue: 0,
        btads: 0
    };

    if (!(item in RECIPES)) {
        return needs;
    }

    const recipe = RECIPES[item];
    const availableQuantity = inventory[item] || 0;
    const needToCraft = Math.max(0, quantity - availableQuantity);

    if (needToCraft === 0) {
        return needs;
    }

    needs.glue = recipe.glue * needToCraft;
    needs.btads = recipe.btads * needToCraft;

    for (const [material, amount] of Object.entries(recipe.materials)) {
        const totalNeeded = amount * needToCraft;
        const subNeeds = calculateCraftingNeeds(material, totalNeeded, inventory);
        
        // Add material itself to needs
        needs.materials[material] = totalNeeded;
        
        // Add sub-materials and their costs
        Object.entries(subNeeds.materials).forEach(([subMaterial, subAmount]) => {
            needs.materials[subMaterial] = (needs.materials[subMaterial] || 0) + subAmount;
        });
        
        needs.glue += subNeeds.glue;
        needs.btads += subNeeds.btads;
    }

    return needs;
}

function calculate() {
    const currentLevel = parseInt(document.getElementById('currentLevel').value);
    const targetLevel = parseInt(document.getElementById('targetLevel').value);
    const userMaterials = {
        glue: parseInt(document.getElementById('glue').value) || 0,
        btads: parseInt(document.getElementById('btads').value) || 0,
        orangeReagent: parseInt(document.getElementById('orangeReagent').value) || 0,
        eoh: parseInt(document.getElementById('eoh').value) || 0,
        cow: parseInt(document.getElementById('cow').value) || 0,
        heavenWings: parseInt(document.getElementById('heavenWings').value) || 0,
        abyssWings: parseInt(document.getElementById('abyssWings').value) || 0,
        // Add new material inputs
        seethingBracelet: parseInt(document.getElementById('seethingBracelet').value) || 0,
        icyBracelet: parseInt(document.getElementById('icyBracelet').value) || 0,  
        heavenAmulet: parseInt(document.getElementById('heavenAmulet').value) || 0,
        abyssAmulet: parseInt(document.getElementById('abyssAmulet').value) || 0,
        wizardRing: parseInt(document.getElementById('wizardRing').value) || 0,
        crusaderRing: parseInt(document.getElementById('crusaderRing').value) || 0,
        rubyBrooch: parseInt(document.getElementById('rubyBrooch').value) || 0,
        sapphireBrooch: parseInt(document.getElementById('sapphireBrooch').value) || 0,      
        sorcererRing: parseInt(document.getElementById('sorcererRing').value) || 0,
        warriorRing: parseInt(document.getElementById('warriorRing').value) || 0,
        whitePearl: parseInt(document.getElementById('whitePearl').value) || 0,
        blackPearl: parseInt(document.getElementById('blackPearl').value) || 0,
        flowerCrown: parseInt(document.getElementById('flowerCrown').value) || 0,
        woodenRing: parseInt(document.getElementById('woodenRing').value) || 0,
        ironRing: parseInt(document.getElementById('ironRing').value) || 0,
        beastFang: parseInt(document.getElementById('beastFang').value) || 0
    };

    if (targetLevel <= currentLevel || targetLevel > 9 || currentLevel < 0) {
        document.getElementById('results').innerHTML = '<div class="error">Please enter valid levels (current: 0-8, target: current+1 to 9)</div>';
        return;
    }

    let totalCosts = {
        glue: 0,
        btads: 0,
        orangeReagent: 0,
        eoh: 0,
        cow: 0,
        heavenWings: 0,
        abyssWings: 0
    };

    let breakdown = '<div class="breakdown"><h3>Cost Breakdown:</h3>';

    // Calculate for each level upgrade
    for (let level = currentLevel + 1; level <= targetLevel; level++) {
        const gearCost = calculateGearUpgradeCost(level);
        const aowCosts = calculateTotalAowCost(level - 1);

        breakdown += `<h4>Level +${level - 1} → +${level}:</h4>`;
        breakdown += `<p>Gear Upgrade: ${gearCost.glue.toLocaleString()} Glue, ${gearCost.btads.toLocaleString()} Btads</p>`;

        breakdown += '<div class="aow-chain">';
        breakdown += `<p>Required AoW (+${level - 1}) chain:</p>`;
        breakdown += `<p>- ${aowCosts.glue.toLocaleString()} Glue</p>`;
        breakdown += `<p>- ${aowCosts.btads.toLocaleString()} Btads</p>`;
        breakdown += `<p>- ${aowCosts.orangeReagent.toLocaleString()} Orange Reagent</p>`;
        breakdown += `<p>- ${aowCosts.eoh} EoH, ${aowCosts.cow} CoW</p>`;
        breakdown += `<p>- ${aowCosts.heavenWings} Heaven Wings, ${aowCosts.abyssWings} Abyss Wings</p>`;
        breakdown += '</div>';

        Object.keys(totalCosts).forEach(key => {
            if (key === 'glue' || key === 'btads') {
                totalCosts[key] += gearCost[key] + aowCosts[key];
            } else {
                totalCosts[key] += aowCosts[key];
            }
        });
    }

    // Calculate combined wing crafting needs
    const wingNeeds = calculateTotalWingNeeds(totalCosts.heavenWings, totalCosts.abyssWings, userMaterials);

    // Add wing crafting costs to totals
    totalCosts.glue += wingNeeds.glue;
    totalCosts.btads += wingNeeds.btads;

    // Add wing crafting breakdown
    if (wingNeeds.glue > 0) {
        breakdown += '<div class="crafting-breakdown"><h3>Wings Crafting Requirements:</h3>';
        breakdown += `<p>Total Cost: ${wingNeeds.glue.toLocaleString()} Glue, ${wingNeeds.btads.toLocaleString()} Btads</p>`;
        breakdown += '<p>Required materials:</p>';
        
        // Sort materials according to MATERIAL_ORDER and format names
        const sortedMaterials = Object.entries(wingNeeds.materials)
            .sort(([a], [b]) => {
                const indexA = MATERIAL_ORDER.indexOf(a);
                const indexB = MATERIAL_ORDER.indexOf(b);
                return indexA - indexB;
            });

        sortedMaterials.forEach(([material, amount]) => {
            const displayName = MATERIAL_NAMES[material] || material;
            const available = userMaterials[material] || 0;
            const needed = Math.max(0, amount - available);
            breakdown += `<p>- ${displayName}: ${amount} (Have: ${available}, Need: ${needed})</p>`;
        });
        
        breakdown += '</div>';
    }

    breakdown += '</div>';

    let resultsHTML = `<h2>Results for +${currentLevel} → +${targetLevel} Upgrade</h2>`;
    resultsHTML += '<h3>Total Required Materials:</h3>';
    resultsHTML += `<p>Glue: ${totalCosts.glue.toLocaleString()} (You have: ${userMaterials.glue.toLocaleString()}, Need: ${Math.max(0, totalCosts.glue - userMaterials.glue).toLocaleString()})</p>`;
    resultsHTML += `<p>Btads: ${totalCosts.btads.toLocaleString()} (You have: ${userMaterials.btads.toLocaleString()}, Need: ${Math.max(0, totalCosts.btads - userMaterials.btads).toLocaleString()})</p>`;
    resultsHTML += `<p>Orange Reagent: ${totalCosts.orangeReagent} (You have: ${userMaterials.orangeReagent}, Need: ${Math.max(0, totalCosts.orangeReagent - userMaterials.orangeReagent)})</p>`;
    resultsHTML += `<p>Eye of Horus: ${totalCosts.eoh} (You have: ${userMaterials.eoh}, Need: ${Math.max(0, totalCosts.eoh - userMaterials.eoh)})</p>`;
    resultsHTML += `<p>Crystal of Will: ${totalCosts.cow} (You have: ${userMaterials.cow}, Need: ${Math.max(0, totalCosts.cow - userMaterials.cow)})</p>`;
    resultsHTML += `<p>Heaven Wings: ${totalCosts.heavenWings} (You have: ${userMaterials.heavenWings}, Need: ${Math.max(0, totalCosts.heavenWings - userMaterials.heavenWings)})</p>`;
    resultsHTML += `<p>Abyss Wings: ${totalCosts.abyssWings} (You have: ${userMaterials.abyssWings}, Need: ${Math.max(0, totalCosts.abyssWings - userMaterials.abyssWings)})</p>`;

    resultsHTML += breakdown;

    document.getElementById('results').innerHTML = resultsHTML;
}