const helpModeToggle = document.getElementById('helpModeToggle');
const helpTooltips = document.querySelectorAll('.tooltip-help');
let helpMode = false;

function toggleHelpMode() {
    helpMode = !helpMode;
    helpModeToggle.classList.toggle('active', helpMode);
    helpTooltips.forEach(tooltip => tooltip.classList.toggle('active', helpMode));
}

function handleTouchEnd(event) {
    event.preventDefault();
    toggleHelpMode();
    // Remove focus from the button
    helpModeToggle.blur();
}

// For non-touch devices
helpModeToggle.addEventListener('click', (event) => {
    event.preventDefault();
    toggleHelpMode();
});

// For touch devices
helpModeToggle.addEventListener('touchend', handleTouchEnd);

// Remove the active state when the button loses focus
helpModeToggle.addEventListener('blur', () => {
    if (!helpMode) {
        helpModeToggle.classList.remove('active');
    }
});

// Prevent default touch behavior to avoid any sticky hover effects
document.addEventListener('touchstart', () => {}, true);