window.addEventListener('load', () => {
  const fixedContainer = document.querySelector('.fixed-container');
  const gridContainer = document.querySelector('.grid-container');

  const updateGridMargin = () => {
    const height = fixedContainer.offsetHeight;
    gridContainer.style.marginTop = `${height}px`;
  };

  updateGridMargin();
  window.addEventListener('resize', updateGridMargin); // Update on window resize
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
    let gridItem = document.querySelector(`.grid-item[data-id="${id}"]`);
    if (!gridItem) return; // Skip if the grid item doesn't exist

    // Get the level based on active bullets
    let level = gridItem.querySelectorAll('.bullet.active').length;

    // First dynamic value
    let baseValue1 = parseFloat(gridItem.getAttribute('data-base-value1')) || 0;
    let increment1 = parseFloat(gridItem.getAttribute('data-increment1')) || 0;
    let label1 = gridItem.getAttribute('data-label1') || '';
    let end1 = gridItem.getAttribute('data-end1') || '';
    let newValue1 = baseValue1 + (increment1 * level);

    // Update the first dynamic text
    let description1 = gridItem.querySelector(`#description${id}_1`);
    if (description1) {
        description1.textContent = `${label1}${newValue1}${end1}`;
    }

    // Second dynamic value
    let baseValue2 = parseFloat(gridItem.getAttribute('data-base-value2')) || 0;
    let increment2 = parseFloat(gridItem.getAttribute('data-increment2')) || 0;
    let label2 = gridItem.getAttribute('data-label2') || '';
    let end2 = gridItem.getAttribute('data-end2') || '';
    let newValue2 = baseValue2 + (increment2 * level);

    // Update the second dynamic text if it should be shown
    let description2 = gridItem.querySelector(`#description${id}_2`);
    if (description2) {
        const showSecondText = description2.getAttribute('data-show-second-text') === "true";
        if (showSecondText) {
            description2.textContent = `${label2}${newValue2}${end2}`;
        } else {
            description2.textContent = ''; // Clear if not shown
        }
    }

    // Check for third dynamic values
    let baseValue3 = parseFloat(gridItem.getAttribute('data-base-value3')) || 0;
    let increment3 = parseFloat(gridItem.getAttribute('data-increment3')) || 0;
    let label3 = gridItem.getAttribute('data-label3') || '';
    let end3 = gridItem.getAttribute('data-end3') || '';
    let newValue3 = baseValue3 + (increment3 * level);

    // Update the third dynamic text if it should be shown
    let description3 = gridItem.querySelector(`#description${id}_3`);
    if (description3) {
        const showThirdText = description3.getAttribute('data-show-third-text') === "true";
        if (showThirdText) {
            description3.textContent = `${label3}${newValue3}${end3}`;
        } else {
            description3.textContent = ''; // Clear if not shown
        }
    }
}
// Initial update for all descriptions and calculations
document.querySelectorAll('.grid-item').forEach((gridItem) => {
  const id = gridItem.getAttribute('data-id');
  if (id) {
    updateDescription(id);
  }
});
calculateTotals();