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
  const patternAnimateToggle = document.getElementById('pattern-animate-toggle');
  const patternSpeedSlider = document.getElementById('pattern-speed');
  const scatterToggle = document.getElementById('scatter-toggle');
  const scatterAmountSlider = document.getElementById('scatter-amount');
  const scatterDistanceSlider = document.getElementById('scatter-distance');
  const brightOnlyToggle = document.getElementById('bright-only-toggle');
  const brightThresholdSlider = document.getElementById('bright-threshold');
  const densitySlider = document.getElementById('density');
  const glitchToggle = document.getElementById('glitch-toggle');
  const glitchRowToggle = document.getElementById('glitch-row-toggle');
  const glitchRateSlider = document.getElementById('glitch-rate');
  const glitchIntensitySlider = document.getElementById('glitch-intensity');
  const glitchArtifactsAmountSlider = document.getElementById('glitch-artifacts-amount');
  const glitchArtifactsSizeSlider = document.getElementById('glitch-artifacts-size');
  const mouseAvoidToggle = document.getElementById('mouse-avoid-toggle');
  const customPatternWrapper = document.getElementById('custom-pattern-wrapper');
  const customPatternInput = document.getElementById('custom-pattern');
  const cameraTab = document.getElementById('tab-camera');
  const imageTab = document.getElementById('tab-image');
  const imageUploadPanel = document.getElementById('image-upload-panel');
  const imageUploadInput = document.getElementById('image-upload');
  const imageEmptyMessage = document.getElementById('image-empty-message');
  const resetBtn = document.getElementById('reset-btn');
  const exportBtn = document.getElementById('export-btn');
  
  const fontSizeValue = document.getElementById('font-size-value');
  const lineHeightValue = document.getElementById('line-height-value');
  const colorValue = document.getElementById('color-value');
  const bgColorValue = document.getElementById('bg-color-value');
  const densityValue = document.getElementById('density-value');
  const patternSpeedValue = document.getElementById('pattern-speed-value');
  const scatterAmountValue = document.getElementById('scatter-amount-value');
  const scatterDistanceValue = document.getElementById('scatter-distance-value');
  const brightThresholdValue = document.getElementById('bright-threshold-value');
  const glitchRateValue = document.getElementById('glitch-rate-value');
  const glitchIntensityValue = document.getElementById('glitch-intensity-value');
  const glitchArtifactsAmountValue = document.getElementById('glitch-artifacts-amount-value');
  const glitchArtifactsSizeValue = document.getElementById('glitch-artifacts-size-value');
  
  let menuOpen = false;
  let sourceMode = 'camera';
  let hasImage = false;
  let hasCameraAccess = false;
  const SOURCE_KEY = 'asciiSourceMode';
  
  // Default settings
  const defaults = {
    fontSize: 16,
    lineHeight: 6,
    textColor: '#00FF41',
    backgroundColor: '#000000',
    flipH: false,
    flipV: false,
    shape: 'rectangle',
    pattern: 'standard',
    patternAnimate: false,
    patternSpeed: 6,
    scatter: false,
    scatterAmount: 20,
    scatterDistance: 60,
    brightOnly: false,
    brightThreshold: 60,
    density: 100,
    glitch: false,
    glitchRow: false,
    glitchRate: 50,
    glitchIntensity: 50,
    glitchArtifactsAmount: 20,
    glitchArtifactsSize: 3,
    mouseAvoid: true,
    customPattern: ''
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

  function loadStoredSource() {
    const savedSource = localStorage.getItem(SOURCE_KEY);
    return savedSource || 'camera';
  }

  function saveStoredSource(mode) {
    localStorage.setItem(SOURCE_KEY, mode);
  }

  function clearStoredImage() {
    localStorage.removeItem('asciiImageData');
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
    patternAnimateToggle.checked = settings.patternAnimate || false;
    patternSpeedSlider.value = settings.patternSpeed ?? 6;
    scatterToggle.checked = settings.scatter || false;
    scatterAmountSlider.value = settings.scatterAmount ?? 20;
    scatterDistanceSlider.value = settings.scatterDistance ?? 60;
    brightOnlyToggle.checked = settings.brightOnly || false;
    brightThresholdSlider.value = settings.brightThreshold ?? 60;
    densitySlider.value = settings.density ?? 100;
    glitchToggle.checked = settings.glitch || false;
    glitchRowToggle.checked = settings.glitchRow || false;
    glitchRateSlider.value = settings.glitchRate ?? 50;
    glitchIntensitySlider.value = settings.glitchIntensity ?? 50;
    glitchArtifactsAmountSlider.value = settings.glitchArtifactsAmount ?? 20;
    glitchArtifactsSizeSlider.value = settings.glitchArtifactsSize ?? 3;
    mouseAvoidToggle.checked = settings.mouseAvoid ?? true;
    customPatternInput.value = settings.customPattern || '';
    updateCustomPatternVisibility(settings.pattern || 'standard');
    
    fontSizeValue.textContent = `${settings.fontSize}px`;
    lineHeightValue.textContent = `${settings.lineHeight}px`;
    colorValue.textContent = settings.textColor;
    bgColorValue.textContent = settings.backgroundColor || '#000000';
    densityValue.textContent = `${settings.density ?? 100}%`;
    patternSpeedValue.textContent = `${settings.patternSpeed ?? 6}s`;
    scatterAmountValue.textContent = `${settings.scatterAmount ?? 20}%`;
    scatterDistanceValue.textContent = `${settings.scatterDistance ?? 60}%`;
    brightThresholdValue.textContent = `${settings.brightThreshold ?? 60}%`;
    glitchRateValue.textContent = `${settings.glitchRate ?? 50}%`;
    glitchIntensityValue.textContent = `${settings.glitchIntensity ?? 50}%`;
    glitchArtifactsAmountValue.textContent = `${settings.glitchArtifactsAmount ?? 20}%`;
    glitchArtifactsSizeValue.textContent = `${settings.glitchArtifactsSize ?? 3}`;
    
    applyFontMetrics(settings);
    updateAsciiStyle('color', settings.textColor);
    document.body.style.background = settings.backgroundColor || '#000000';
    
    // Expose settings to global scope for p5.js
    window.asciiShape = settings.shape;
    window.asciiPattern = settings.pattern || 'standard';
    window.asciiCustomPattern = settings.customPattern || '';
    window.asciiFlipH = settings.flipH || false;
    window.asciiFlipV = settings.flipV || false;
    window.asciiPatternAnimate = settings.patternAnimate || false;
    window.asciiPatternSpeed = settings.patternSpeed ?? 6;
    window.asciiScatter = settings.scatter || false;
    window.asciiScatterAmount = settings.scatterAmount ?? 20;
    window.asciiScatterDistance = settings.scatterDistance ?? 60;
    window.asciiBrightOnly = settings.brightOnly || false;
    window.asciiBrightThreshold = settings.brightThreshold ?? 60;
    window.asciiDensity = settings.density ?? 100;
    window.asciiGlitch = settings.glitch || false;
    window.asciiGlitchRow = settings.glitchRow || false;
    window.asciiGlitchRate = settings.glitchRate ?? 50;
    window.asciiGlitchIntensity = settings.glitchIntensity ?? 50;
    window.asciiGlitchArtifactsAmount = settings.glitchArtifactsAmount ?? 20;
    window.asciiGlitchArtifactsSize = settings.glitchArtifactsSize ?? 3;
    window.asciiMouseAvoid = settings.mouseAvoid ?? true;
  }
  
  // Initialize with saved settings
  const savedSettings = loadSettings();
  applySettings(savedSettings);
  const savedSource = loadStoredSource();
  clearStoredImage();
  setActiveTab(savedSource);
  hasCameraAccess = Boolean(window.asciiCameraReady);
  updateExportVisibility();

  window.addEventListener('ascii-camera-status', (event) => {
    hasCameraAccess = Boolean(event?.detail?.ready);
    updateExportVisibility();
  });

  window.addEventListener('ascii-image-status', (event) => {
    hasImage = Boolean(event?.detail?.ready);
    imageEmptyMessage.classList.toggle('hidden', hasImage);
    updateExportVisibility();
  });
  
  // Toggle menu - existing code...
  configToggle.addEventListener('click', () => {
    menuOpen = !menuOpen;
    if (menuOpen) {
      configMenu.classList.add('is-open');
      const openIcon = document.getElementById('settings-icon-open');
      const closeIcon = document.getElementById('settings-icon-close');
      if (openIcon && closeIcon) {
        openIcon.classList.add('opacity-0', 'scale-75');
        openIcon.classList.remove('opacity-100', 'scale-100');
        closeIcon.classList.remove('hidden');
        requestAnimationFrame(() => {
          closeIcon.classList.add('opacity-100', 'scale-100');
          closeIcon.classList.remove('opacity-0', 'scale-75');
        });
      }
      configToggle.setAttribute('aria-label', 'Close settings');
    } else {
      configMenu.classList.remove('is-open');
      const openIcon = document.getElementById('settings-icon-open');
      const closeIcon = document.getElementById('settings-icon-close');
      if (openIcon && closeIcon) {
        closeIcon.classList.add('opacity-0', 'scale-75');
        closeIcon.classList.remove('opacity-100', 'scale-100');
        openIcon.classList.remove('hidden');
        requestAnimationFrame(() => {
          openIcon.classList.add('opacity-100', 'scale-100');
          openIcon.classList.remove('opacity-0', 'scale-75');
        });
        setTimeout(() => {
          if (!menuOpen) {
            closeIcon.classList.add('hidden');
          }
        }, 200);
      }
      configToggle.setAttribute('aria-label', 'Settings');
    }
  });

  // Font Size Slider
  fontSizeSlider.addEventListener('input', (e) => {
    const value = e.target.value;
    fontSizeValue.textContent = `${value}px`;
    
    const settings = loadSettings();
    settings.fontSize = value;
    saveSettings(settings);
    applyFontMetrics(settings);
  });

  // Line Height Slider
  lineHeightSlider.addEventListener('input', (e) => {
    const value = e.target.value;
    lineHeightValue.textContent = `${value}px`;
    
    const settings = loadSettings();
    settings.lineHeight = value;
    saveSettings(settings);
    applyFontMetrics(settings);
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
    updateCustomPatternVisibility(value);
    
    const settings = loadSettings();
    settings.pattern = value;
    saveSettings(settings);
  });

  patternAnimateToggle.addEventListener('change', (e) => {
    const checked = e.target.checked;
    window.asciiPatternAnimate = checked;

    const settings = loadSettings();
    settings.patternAnimate = checked;
    saveSettings(settings);
  });

  patternSpeedSlider.addEventListener('input', (e) => {
    const value = Number(e.target.value);
    patternSpeedValue.textContent = `${value}s`;
    window.asciiPatternSpeed = value;

    const settings = loadSettings();
    settings.patternSpeed = value;
    saveSettings(settings);
  });

  scatterToggle.addEventListener('change', (e) => {
    const checked = e.target.checked;
    window.asciiScatter = checked;

    const settings = loadSettings();
    settings.scatter = checked;
    saveSettings(settings);
  });

  scatterAmountSlider.addEventListener('input', (e) => {
    const value = Number(e.target.value);
    scatterAmountValue.textContent = `${value}%`;
    window.asciiScatterAmount = value;

    const settings = loadSettings();
    settings.scatterAmount = value;
    saveSettings(settings);
  });

  scatterDistanceSlider.addEventListener('input', (e) => {
    const value = Number(e.target.value);
    scatterDistanceValue.textContent = `${value}%`;
    window.asciiScatterDistance = value;

    const settings = loadSettings();
    settings.scatterDistance = value;
    saveSettings(settings);
  });

  brightOnlyToggle.addEventListener('change', (e) => {
    const checked = e.target.checked;
    window.asciiBrightOnly = checked;

    const settings = loadSettings();
    settings.brightOnly = checked;
    saveSettings(settings);
  });

  brightThresholdSlider.addEventListener('input', (e) => {
    const value = Number(e.target.value);
    brightThresholdValue.textContent = `${value}%`;
    window.asciiBrightThreshold = value;

    const settings = loadSettings();
    settings.brightThreshold = value;
    saveSettings(settings);
  });

  densitySlider.addEventListener('input', (e) => {
    const value = Number(e.target.value);
    densityValue.textContent = `${value}%`;
    window.asciiDensity = value;

    const settings = loadSettings();
    settings.density = value;
    saveSettings(settings);
    applyFontMetrics(settings);
  });

  // Glitch toggle
  glitchToggle.addEventListener('change', (e) => {
    const checked = e.target.checked;
    window.asciiGlitch = checked;

    const settings = loadSettings();
    settings.glitch = checked;
    saveSettings(settings);
  });

  glitchRowToggle.addEventListener('change', (e) => {
    const checked = e.target.checked;
    window.asciiGlitchRow = checked;

    const settings = loadSettings();
    settings.glitchRow = checked;
    saveSettings(settings);
  });

  glitchRateSlider.addEventListener('input', (e) => {
    const value = Number(e.target.value);
    glitchRateValue.textContent = `${value}%`;
    window.asciiGlitchRate = value;

    const settings = loadSettings();
    settings.glitchRate = value;
    saveSettings(settings);
  });

  glitchIntensitySlider.addEventListener('input', (e) => {
    const value = Number(e.target.value);
    glitchIntensityValue.textContent = `${value}%`;
    window.asciiGlitchIntensity = value;

    const settings = loadSettings();
    settings.glitchIntensity = value;
    saveSettings(settings);
  });

  glitchArtifactsAmountSlider.addEventListener('input', (e) => {
    const value = Number(e.target.value);
    glitchArtifactsAmountValue.textContent = `${value}%`;
    window.asciiGlitchArtifactsAmount = value;

    const settings = loadSettings();
    settings.glitchArtifactsAmount = value;
    saveSettings(settings);
  });

  glitchArtifactsSizeSlider.addEventListener('input', (e) => {
    const value = Number(e.target.value);
    glitchArtifactsSizeValue.textContent = `${value}`;
    window.asciiGlitchArtifactsSize = value;

    const settings = loadSettings();
    settings.glitchArtifactsSize = value;
    saveSettings(settings);
  });

  mouseAvoidToggle.addEventListener('change', (e) => {
    const checked = e.target.checked;
    window.asciiMouseAvoid = checked;

    const settings = loadSettings();
    settings.mouseAvoid = checked;
    saveSettings(settings);
  });

  // Tabs
  function setActiveTab(mode) {
    sourceMode = mode;
    window.asciiSource = mode;
    saveStoredSource(mode);
    if (mode === 'image') {
      cameraTab.classList.remove('is-active');
      imageTab.classList.add('is-active');
      imageUploadPanel.classList.remove('hidden');
      imageEmptyMessage.classList.toggle('hidden', hasImage);
    } else {
      imageTab.classList.remove('is-active');
      cameraTab.classList.add('is-active');
      imageUploadPanel.classList.add('hidden');
    }
    updateExportVisibility();
  }

  cameraTab.addEventListener('click', () => setActiveTab('camera'));
  imageTab.addEventListener('click', () => setActiveTab('image'));

  imageUploadInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      hasImage = false;
      imageEmptyMessage.classList.remove('hidden');
      updateExportVisibility();
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setActiveTab('image');
    hasImage = true;
    imageEmptyMessage.classList.add('hidden');
    updateExportVisibility();
    if (window.setAsciiImage) {
      window.setAsciiImage(objectUrl, { revokeUrl: objectUrl });
    } else {
      URL.revokeObjectURL(objectUrl);
    }
  });

  // Custom pattern input
  customPatternInput.addEventListener('input', (e) => {
    const value = e.target.value;
    window.asciiCustomPattern = value;

    const settings = loadSettings();
    settings.customPattern = value;
    saveSettings(settings);
  });
  
  // Reset button
  resetBtn.addEventListener('click', () => {
    applySettings(defaults);
    saveSettings(defaults);
  });

  // Export ASCII image
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const canvas = renderAsciiToCanvas();
      if (!canvas) return;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const link = document.createElement('a');
      link.download = `ascii-export-${timestamp}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }
  
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

  function applyFontMetrics(settings) {
    const density = Math.max(10, Math.min(100, Number(settings.density ?? 100)));
    const scale = 1 + (1 - density / 100) * 0.8;
    const baseFontSize = Number(settings.fontSize || 16);
    const baseLineHeight = Number(settings.lineHeight || 6);
    const fontSize = Math.max(4, Math.round(baseFontSize * scale));
    const lineHeight = Math.max(2, Math.round(baseLineHeight * scale));
    updateAsciiStyle('fontSize', `${fontSize}px`);
    updateAsciiStyle('lineHeight', `${lineHeight}px`);
  }

  function updateCustomPatternVisibility(pattern) {
    if (pattern === 'custom') {
      customPatternWrapper.classList.remove('hidden');
    } else {
      customPatternWrapper.classList.add('hidden');
    }
  }

  function updateExportVisibility() {
    if (!exportBtn) return;
    const shouldHide = (sourceMode === 'image' && !hasImage) || !hasCameraAccess;
    exportBtn.classList.toggle('invisible', shouldHide);
    exportBtn.setAttribute('aria-hidden', shouldHide ? 'true' : 'false');
  }

  function renderAsciiToCanvas() {
    const asciiSpan = document.querySelector('#ascii-container-p5 span');
    if (!asciiSpan) return null;
    const asciiText = asciiSpan.textContent || '';
    if (!asciiText.trim()) return null;

    const lines = asciiText.replace(/\n$/, '').split('\n');
    const style = window.getComputedStyle(asciiSpan);
    const fontSize = parseFloat(style.fontSize) || 16;
    const lineHeightValue = parseFloat(style.lineHeight);
    const lineHeight = Number.isFinite(lineHeightValue) ? lineHeightValue : fontSize * 1.2;
    const fontFamily = style.fontFamily || 'Courier, monospace';
    const textColor = style.color || '#00FF41';
    const bgColor = window.getComputedStyle(document.body).backgroundColor || '#000000';
    const padding = Math.max(8, Math.round(fontSize * 0.75));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.font = `${fontSize}px ${fontFamily}`;

    let maxWidth = 0;
    for (const line of lines) {
      const width = ctx.measureText(line).width;
      if (width > maxWidth) maxWidth = width;
    }

    canvas.width = Math.ceil(maxWidth + padding * 2);
    canvas.height = Math.ceil(lines.length * lineHeight + padding * 2);

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.textBaseline = 'top';

    lines.forEach((line, index) => {
      ctx.fillText(line, padding, padding + index * lineHeight);
    });

    return canvas;
  }
});
