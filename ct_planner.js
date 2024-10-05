// New variables for popup functionality
let popupMode = true; // Set to true for popup as default
let lastClickedId = null;

window.addEventListener('load', () => {
  const fixedContainer = document.querySelector('.fixed-container');
  const gridContainer = document.querySelector('.grid-container');
  const popupContainer = document.getElementById('popup-container');
  const popupDescription = document.getElementById('popup-description');

  const updateGridMargin = () => {
    const height = fixedContainer.offsetHeight;
    gridContainer.style.marginTop = `${height}px`;
  };

  updateGridMargin();
  window.addEventListener('resize', updateGridMargin); // Update on window resize

  // Initialize description mode
  initializeDescriptionMode();
});

const maxLevel = 5; // Maximum level for each image

function calculateTotals() {
  let totalBlue = 0;
  let totalPurple = 0;
  let totalOrange = 0;

  // Iterate through each grid item to calculate totals
  const gridItems = document.querySelectorAll('.grid-item'); // Get all grid items
  gridItems.forEach((gridItem) => {
    const colorClass = gridItem.classList[1]; // Get the color class
    const pointCost = parseInt(gridItem.getAttribute('data-point-cost')); // Get point cost from the data attribute
    const currentValue = gridItem.querySelector('.bullet.active') ? gridItem.querySelectorAll('.bullet.active').length : 0; // Count active bullets

    // Calculate total points for each color based on level and point cost
    const totalPoints = currentValue * pointCost;

    if (colorClass === 'blue') {
      totalBlue += totalPoints;
    } else if (colorClass === 'purple') {
      totalPurple += totalPoints;
    } else if (colorClass === 'orange') {
      totalOrange += totalPoints;
    }
  });

  document.getElementById('totalBlue').textContent = totalBlue;
  document.getElementById('totalPurple').textContent = totalPurple;
  document.getElementById('totalOrange').textContent = totalOrange;
}

function toggleValue(id) {
  const gridItem = document.querySelector(`.grid-item[data-id="${id}"]`);
  if (!gridItem) return; // Skip if the grid item doesn't exist

  const bullets = gridItem.querySelectorAll(`#level${id} .bullet`);
  let currentLevel = Array.from(bullets).filter(bullet => bullet.classList.contains('active')).length;
  const minusMode = document.getElementById('minusMode').checked;

  if (!minusMode && currentLevel < maxLevel) {
    currentLevel += 1;
  } else if (minusMode && currentLevel > 0) {
    currentLevel -= 1;
  }

  // Update bullets after calculating the current level
  updateBullets(id, currentLevel);
  updateDescription(id);
  calculateTotals();
}

function updateBullets(id, level) {
  let bullets = document.querySelectorAll(`#level${id} .bullet`);
  bullets.forEach((bullet, index) => {
    if (index < level) {
      bullet.classList.add('active');
    } else {
      bullet.classList.remove('active');
    }
  });
}

function updateDescription(id) {
  lastClickedId = id;
  let gridItem = document.querySelector(`.grid-item[data-id="${id}"]`);
  if (!gridItem) return; // Skip if the grid item doesn't exist

  // Get the level based on active bullets
  let level = gridItem.querySelectorAll('.bullet.active').length;

  let descriptions = [];

  // First dynamic value
  let baseValue1 = parseFloat(gridItem.getAttribute('data-base-value1')) || 0;
  let increment1 = parseFloat(gridItem.getAttribute('data-increment1')) || 0;
  let label1 = gridItem.getAttribute('data-label1') || '';
  let end1 = gridItem.getAttribute('data-end1') || '';
  let newValue1 = baseValue1 + (increment1 * level);

  let description1 = `${label1}${newValue1}${end1}`;
  descriptions.push(description1);

  // Update the first dynamic text
  let description1Element = gridItem.querySelector(`#description${id}_1`);
  if (description1Element) {
    description1Element.textContent = description1;
  }

  // Second dynamic value
  let baseValue2 = parseFloat(gridItem.getAttribute('data-base-value2')) || 0;
  let increment2 = parseFloat(gridItem.getAttribute('data-increment2')) || 0;
  let label2 = gridItem.getAttribute('data-label2') || '';
  let end2 = gridItem.getAttribute('data-end2') || '';
  let newValue2 = baseValue2 + (increment2 * level);

  // Update the second dynamic text if it should be shown
  let description2Element = gridItem.querySelector(`#description${id}_2`);
  if (description2Element) {
    const showSecondText = description2Element.getAttribute('data-show-second-text') === "true";
    if (showSecondText) {
      let description2 = `${label2}${newValue2}${end2}`;
      description2Element.textContent = description2;
      descriptions.push(description2);
    } else {
      description2Element.textContent = ''; // Clear if not shown
    }
  }

  // Third dynamic value
  let baseValue3 = parseFloat(gridItem.getAttribute('data-base-value3')) || 0;
  let increment3 = parseFloat(gridItem.getAttribute('data-base-value3')) || 0;
  let label3 = gridItem.getAttribute('data-label3') || '';
  let end3 = gridItem.getAttribute('data-end3') || '';
  let newValue3 = baseValue3 + (increment3 * level);

  // Update the third dynamic text if it should be shown
  let description3Element = gridItem.querySelector(`#description${id}_3`);
  if (description3Element) {
    const showThirdText = description3Element.getAttribute('data-show-third-text') === "true";
    if (showThirdText) {
      let description3 = `${label3}${newValue3}${end3}`;
      description3Element.textContent = description3;
      descriptions.push(description3);
    } else {
      description3Element.textContent = ''; // Clear if not shown
    }
  }

  // Update popup description with separator
  const popupDescription = document.getElementById('popup-description');
  popupDescription.textContent = descriptions.join(' | ');

  // Show/hide based on mode
  const popupContainer = document.getElementById('popup-container');
  if (popupMode) {
    popupContainer.style.display = 'block';
    gridItem.querySelectorAll('[id^="description"]').forEach(desc => {
      desc.classList.add('hide-description');
    });
  } else {
    popupContainer.style.display = 'none';
    gridItem.querySelectorAll('[id^="description"]').forEach(desc => {
      desc.classList.remove('hide-description');
    });
  }
}

// New function to toggle between popup and inline modes
function toggleDescriptionMode() {
  popupMode = !popupMode;
  const descriptions = document.querySelectorAll('[id^="description"]');
  const popupContainer = document.getElementById('popup-container');
  
  descriptions.forEach(desc => {
    desc.classList.toggle('hide-description', popupMode);
  });
  
  if (popupContainer) {
    popupContainer.style.display = popupMode ? 'block' : 'none';
  }
  
  // Update the current description
  if (lastClickedId) {
    updateDescription(lastClickedId);
  }
}

// New function to initialize description mode
function initializeDescriptionMode() {
  const descriptions = document.querySelectorAll('[id^="description"]');
  descriptions.forEach(desc => {
    desc.classList.toggle('hide-description', popupMode);
  });
  const popupContainer = document.getElementById('popup-container');
  popupContainer.style.display = popupMode ? 'block' : 'none';
}

// Initial update for all descriptions and calculations
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.grid-item').forEach((gridItem) => {
    const id = gridItem.getAttribute('data-id');
    if (id) {
      updateDescription(id);
    }
  });
  calculateTotals();
});