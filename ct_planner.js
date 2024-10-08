// Global variables
let descriptionMode = true; // Controls whether descriptions are shown in a popup or inline
let lastClickedId = null; // Stores the ID of the last clicked grid item
let firstItemClicked = false; // Tracks if any grid item has been clicked
let toastActive = false; // Track if a toast is currently active
let initialLoad = true; // New variable to track initial page load
const maxLevel = 5; // Maximum level for each talent

// Main initialization when the page loads
window.addEventListener('load', () => {
  const fixedContainer = document.querySelector('.fixed-container');
  const gridContainer = document.querySelector('.grid-container');
  const toastContainer = document.getElementById('toast-container');
  const toastDescription = document.getElementById('toast-description');
  const resetButton = document.getElementById('resetButton');

  // Reset button
  resetButton.addEventListener('click', resetAllValues);

  // Function to update the margin of the grid container based on the fixed container's height
  const updateGridMargin = () => {
    const height = fixedContainer.offsetHeight;
    gridContainer.style.marginTop = `${height}px`;
  };

  updateGridMargin();
  window.addEventListener('resize', updateGridMargin); // Update margin on window resize

  // Set up the initial description mode
  initializeDescriptionMode();

  // Add click event listeners to all grid items
  const gridItems = document.querySelectorAll('.grid-item');
  gridItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const id = item.getAttribute('data-id');
      toggleValue(id);
    });
  });

  // Set up event listeners for edit mode and popup mode toggles
  const editModeButton = document.getElementById('editMode');
  const descriptionModeButton = document.getElementById('descriptionMode');

  editModeButton.addEventListener('click', () => {
    editModeButton.classList.toggle('active');
    const isActive = editModeButton.classList.contains('active');
    updateToastMessage(`Edit mode ${isActive ? 'on' : 'off'}`, 2000);
  });

  descriptionModeButton.addEventListener('click', toggleDescriptionMode);

  // Set initialLoad to false after all initial descriptions are set
  setTimeout(() => {
    initialLoad = false;
  }, 100);
});

// Reset Button
function resetAllValues() {
  const gridItems = document.querySelectorAll('.grid-item');
  gridItems.forEach((gridItem) => {
    const id = gridItem.getAttribute('data-id');
    updateBullets(id, 0);
  });
  calculateTotals();
  
  // Reset edit mode if it's active
  const editModeButton = document.getElementById('editMode');
  if (editModeButton.classList.contains('active')) {
    editModeButton.classList.remove('active');
  }

  // Display reset message as a toast notification
  updateToastMessage("Talents reset successfully!", 3000);
}

function updateToastMessage(message, duration = 3000) {
  const toastContainer = document.getElementById('toast-container');
  const toastDescription = document.getElementById('toast-description');
  
  toastDescription.textContent = message;
  
  if (toastActive) {
    // If a toast is already active, just update the content and reset the timer
    clearTimeout(toastContainer.hideTimeout);
  } else {
    // If no toast is active, show it with animation
    toastContainer.classList.add('show');
    toastActive = true;
  }
  
  // Set a new timeout to hide the popup
  toastContainer.hideTimeout = setTimeout(() => {
    toastContainer.classList.remove('show');
    // Add a timeout to reset toastActive after the animation completes
    setTimeout(() => {
      toastActive = false;
    }, 300); // This should match the transition duration in CSS
  }, duration);
}

// Function to toggle the value (level) of a grid item
function toggleValue(id) {
  const gridItem = document.querySelector(`.grid-item[data-id="${id}"]`);
  if (!gridItem) return;

  const bullets = gridItem.querySelectorAll(`#level${id} .bullet`);
  let currentLevel = Array.from(bullets).filter(bullet => bullet.classList.contains('active')).length;
  const editMode = document.getElementById('editMode').classList.contains('active');

  // Increment or decrement the level based on edit mode and current level
  if (!editMode && currentLevel < maxLevel) {
    currentLevel += 1;
  } else if (editMode && currentLevel > 0) {
    currentLevel -= 1;
  }

  updateBullets(id, currentLevel);
  updateDescription(id);
  calculateTotals();
}

// Function to calculate and update the total points for each color
function calculateTotals() {
  let totalBlue = 0;
  let totalPurple = 0;
  let totalOrange = 0;

  const gridItems = document.querySelectorAll('.grid-item');
  gridItems.forEach((gridItem) => {
    const colorClass = gridItem.classList[1];
    const pointCost = parseInt(gridItem.getAttribute('data-point-cost'));
    const currentValue = gridItem.querySelector('.bullet.active') ? gridItem.querySelectorAll('.bullet.active').length : 0;

    const totalPoints = currentValue * pointCost;

    // Add points to the corresponding color total
    if (colorClass === 'blue') {
      totalBlue += totalPoints;
    } else if (colorClass === 'purple') {
      totalPurple += totalPoints;
    } else if (colorClass === 'orange') {
      totalOrange += totalPoints;
    }
  });

  // Update the displayed totals
  document.getElementById('totalBlue').textContent = totalBlue;
  document.getElementById('totalPurple').textContent = totalPurple;
  document.getElementById('totalOrange').textContent = totalOrange;
}

// Function to update the bullet (level) display for a grid item
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

// Function to update the description for a grid item
function updateDescription(id) {
  lastClickedId = id;
  firstItemClicked = true;
  let gridItem = document.querySelector(`.grid-item[data-id="${id}"]`);
  if (!gridItem) return;

  let level = gridItem.querySelectorAll('.bullet.active').length;
  let descriptions = [];

  // Calculate and update descriptions for up to three values
  for (let i = 1; i <= 3; i++) {
    let baseValue = parseFloat(gridItem.getAttribute(`data-base-value${i}`)) || 0;
    let increment = parseFloat(gridItem.getAttribute(`data-increment${i}`)) || 0;
    let label = gridItem.getAttribute(`data-label${i}`) || '';
    let end = gridItem.getAttribute(`data-end${i}`) || '';
    let newValue = baseValue + (increment * level);

    let description = `${label}${newValue}${end}`;
    let descriptionElement = gridItem.querySelector(`#description${id}_${i}`);
    
    if (descriptionElement) {
      const showText = descriptionElement.getAttribute(`data-show-${i === 1 ? 'first' : i === 2 ? 'second' : 'third'}-text`) === "true";
      if (showText || i === 1) {
        descriptionElement.textContent = description;
        descriptions.push(description);
      } else {
        descriptionElement.textContent = '';
      }
    }
  }

  // Update popup message as a toast notification only if descriptionMode is true and it's not the initial load
  if (descriptionMode && !initialLoad) {
    updateToastMessage(descriptions.join(' | '));
  }

  // Update inline descriptions visibility based on description mode
  const descriptionContainer = gridItem.querySelector('.description-container');
  if (descriptionContainer) {
    descriptionContainer.classList.toggle('hide-description', descriptionMode);
  }

  // Update all grid items' descriptions visibility
  document.querySelectorAll('.grid-item .description-container').forEach(container => {
    container.classList.toggle('hide-description', descriptionMode);
  });
}

// Function to toggle between popup and inline description modes
function toggleDescriptionMode() {
  descriptionMode = !descriptionMode;
  const descriptionContainers = document.querySelectorAll('.description-container');
  const descriptionModeButton = document.getElementById('descriptionMode');
  
  descriptionContainers.forEach(container => {
    container.classList.toggle('hide-description', descriptionMode);
  });
  
  // Toggle the active class on the button
  descriptionModeButton.classList.toggle('active', descriptionMode);
  
  // Update the toast message
  updateToastMessage(`Description mode ${descriptionMode ? 'off' : 'on'}`, 2000);
  
  // Update the button image
  const buttonImage = descriptionModeButton.querySelector('.toggle-image');
  buttonImage.src = descriptionMode ? 'btn_list_on.png' : 'btn_list_off.png';
  buttonImage.alt = descriptionMode ? 'Show All Text On' : 'Show All Text Off';
}

// Function to initialize the description mode
function initializeDescriptionMode() {
  const descriptionContainers = document.querySelectorAll('.description-container');
  descriptionContainers.forEach(container => {
    container.classList.toggle('hide-description', descriptionMode);
  });
}

// Initial update for all descriptions and calculations when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeDescriptionMode();
  document.querySelectorAll('.grid-item').forEach((gridItem) => {
    const id = gridItem.getAttribute('data-id');
    if (id) {
      updateDescription(id);
    }
  });
  calculateTotals();
});