// Config Menu Controller
document.addEventListener('DOMContentLoaded', () => {
  const configToggle = document.getElementById('config-toggle');
  const configMenu = document.getElementById('config-menu');
  const fontSizeSlider = document.getElementById('font-size');
  const lineHeightSlider = document.getElementById('line-height');
  const textColorPicker = document.getElementById('text-color');
  const bgColorPicker = document.getElementById('bg-color');
  const flipHCheckbox = document.getElementById('flip-h');
  const flipVCheckbox = document.getElementById('flip-v');
  const shapeSelect = document.getElementById('shape-select');
  const patternSelect = document.getElementById('pattern-select');
  const resetBtn = document.getElementById('reset-btn');
  
  const fontSizeValue = document.getElementById('font-size-value');
  const lineHeightValue = document.getElementById('line-height-value');
  const colorValue = document.getElementById('color-value');
  const bgColorValue = document.getElementById('bg-color-value');
  
  let menuOpen = false;
  
  // Default settings
  const defaults = {
    fontSize: 16,
    lineHeight: 6,
    textColor: '#00FF41',
    backgroundColor: '#000000',
    flipH: false,
    flipV: false,
    shape: 'rectangle',
    pattern: 'standard'
  };
  
  // Load settings from localStorage
  function loadSettings() {
    const saved = localStorage.getItem('asciiSettings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load settings:', e);
        return defaults;
      }
    }
    return defaults;
  }
  
  // Save settings to localStorage
  function saveSettings(settings) {
    localStorage.setItem('asciiSettings', JSON.stringify(settings));
  }
  
  // Apply settings to UI and ASCII
  function applySettings(settings) {
    fontSizeSlider.value = settings.fontSize;
    lineHeightSlider.value = settings.lineHeight;
    textColorPicker.value = settings.textColor;
    bgColorPicker.value = settings.backgroundColor || '#000000';
    flipHCheckbox.checked = settings.flipH || false;
    flipVCheckbox.checked = settings.flipV || false;
    shapeSelect.value = settings.shape;
    patternSelect.value = settings.pattern || 'standard';
    
    fontSizeValue.textContent = `${settings.fontSize}px`;
    lineHeightValue.textContent = `${settings.lineHeight}px`;
    colorValue.textContent = settings.textColor;
    bgColorValue.textContent = settings.backgroundColor || '#000000';
    
    updateAsciiStyle('fontSize', `${settings.fontSize}px`);
    updateAsciiStyle('lineHeight', `${settings.lineHeight}px`);
    updateAsciiStyle('color', settings.textColor);
    document.body.style.background = settings.backgroundColor || '#000000';
    
    // Expose settings to global scope for p5.js
    window.asciiShape = settings.shape;
    window.asciiPattern = settings.pattern || 'standard';
    window.asciiFlipH = settings.flipH || false;
    window.asciiFlipV = settings.flipV || false;
  }
  
  // Initialize with saved settings
  const savedSettings = loadSettings();
  applySettings(savedSettings);
  
  // Toggle menu - existing code...
  configToggle.addEventListener('click', () => {
    menuOpen = !menuOpen;
    if (menuOpen) {
      configMenu.style.transform = 'translateX(0)';
    } else {
      configMenu.style.transform = 'translateX(450px)';
    }
  });

  // Font Size Slider
  fontSizeSlider.addEventListener('input', (e) => {
    const value = e.target.value;
    fontSizeValue.textContent = `${value}px`;
    updateAsciiStyle('fontSize', `${value}px`);
    
    const settings = loadSettings();
    settings.fontSize = value;
    saveSettings(settings);
  });

  // Line Height Slider
  lineHeightSlider.addEventListener('input', (e) => {
    const value = e.target.value;
    lineHeightValue.textContent = `${value}px`;
    updateAsciiStyle('lineHeight', `${value}px`);
    
    const settings = loadSettings();
    settings.lineHeight = value;
    saveSettings(settings);
  });

  // Text Color Picker
  textColorPicker.addEventListener('input', (e) => {
    const value = e.target.value;
    colorValue.textContent = value;
    updateAsciiStyle('color', value);
    
    const settings = loadSettings();
    settings.textColor = value;
    saveSettings(settings);
  });

  // Background Color Picker
  bgColorPicker.addEventListener('input', (e) => {
    const value = e.target.value;
    bgColorValue.textContent = value;
    document.body.style.background = value;
    
    const settings = loadSettings();
    settings.backgroundColor = value;
    saveSettings(settings);
  });

  // Flip Horizontal Checkbox
  flipHCheckbox.addEventListener('change', (e) => {
    const checked = e.target.checked;
    window.asciiFlipH = checked;
    
    const settings = loadSettings();
    settings.flipH = checked;
    saveSettings(settings);
  });

  // Flip Vertical Checkbox
  flipVCheckbox.addEventListener('change', (e) => {
    const checked = e.target.checked;
    window.asciiFlipV = checked;
    
    const settings = loadSettings();
    settings.flipV = checked;
    saveSettings(settings);
  });

  // Shape selector
  shapeSelect.addEventListener('change', (e) => {
    const value = e.target.value;
    window.asciiShape = value;
    
    const settings = loadSettings();
    settings.shape = value;
    saveSettings(settings);
  });

  // Pattern selector
  patternSelect.addEventListener('change', (e) => {
    const value = e.target.value;
    window.asciiPattern = value;
    
    const settings = loadSettings();
    settings.pattern = value;
    saveSettings(settings);
  });
  
  // Reset button
  resetBtn.addEventListener('click', () => {
    applySettings(defaults);
    saveSettings(defaults);
  });
  
  // Update ASCII text style
  function updateAsciiStyle(property, value) {
    // Wait for p5.js to create the span element
    setTimeout(() => {
      const asciiSpan = document.querySelector('#ascii-container-p5 span');
      if (asciiSpan) {
        asciiSpan.style[property] = value;
      }
    }, 100);
  }
});
