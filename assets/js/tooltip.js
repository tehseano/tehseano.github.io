const helpModeToggle = document.getElementById('helpModeToggle');
const helpTooltips = document.querySelectorAll('.tooltip-help');
let helpMode = false;

function toggleHelpMode() {
    helpMode = !helpMode;
    helpModeToggle.classList.toggle('active');
    helpTooltips.forEach(tooltip => tooltip.classList.toggle('active', helpMode));
}

helpModeToggle.addEventListener('click', toggleHelpMode);