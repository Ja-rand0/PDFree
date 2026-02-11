// Theme Switcher

// Apply theme immediately on load to avoid FOUC
(function() {
  const savedTheme = localStorage.getItem('pdfree-theme') || 'modern2030';
  document.documentElement.setAttribute('data-theme', savedTheme);
})();

function initThemeSwitcher() {
  const themes = ['retro95', 'modern2030'];

  // Load saved theme or default to retro95
  let currentTheme = localStorage.getItem('pdfree-theme') || 'modern2030';
  applyTheme(currentTheme);

  // Theme switcher button click
  document.getElementById('themeBtn').addEventListener('click', () => {
    // Toggle between themes
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    currentTheme = themes[nextIndex];

    applyTheme(currentTheme);
    localStorage.setItem('pdfree-theme', currentTheme);
  });
}

function applyTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);

  // Update button text
  const themeBtn = document.getElementById('themeBtn');
  if (themeName === 'retro95') {
    themeBtn.textContent = '🎨 Style: Retro';
  } else if (themeName === 'modern2030') {
    themeBtn.textContent = '🎨 Style: Modern';
  }
}
