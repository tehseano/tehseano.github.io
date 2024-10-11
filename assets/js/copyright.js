// copyright.js
function updateCopyright(elementId, customText) {
  const currentYear = new Date().getFullYear();
  const copyrightElement = document.getElementById(elementId);
  if (copyrightElement) {
    copyrightElement.innerHTML = `&copy; ${currentYear} ${customText}`;
  }
}

// Call this function when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  updateCopyright('copyright-year', 'SnailSmashers | Lorg Fries 3');
});