const [W, H] = [128, 96];

let p,
  capture,
  loaded = false;
let asciiBounds = null;
let mouseGrid = { x: null, y: null, active: false };
let scatterParticles = [];

function updateAsciiBounds() {
  const span = document.querySelector('#ascii-container-p5 span');
  if (span) {
    const rect = span.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      asciiBounds = rect;
      return;
    }
  }
  const container = document.getElementById('ascii-container-p5');
  if (!container) return;
  const rect = container.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    asciiBounds = rect;
  }
}

function setup() {
  noCanvas();
  window.asciiCameraReady = false;
  
  // Create container div
  const container = createDiv('');
  container.id('ascii-container-p5'); // Changed ID to avoid conflict
  
  // Create span inside container
  p = createElement("span");
  p.parent(container);
  
  capture = createCapture(VIDEO, () => {
    capture.size(W, H);
    console.log("preload", capture.width, capture.height);
    loaded = true;
    window.asciiCameraReady = true;
    window.dispatchEvent(new CustomEvent('ascii-camera-status', { detail: { ready: true } }));
  });
  capture.hide();
  if (capture && capture.elt) {
    capture.elt.onloadedmetadata = () => {
      if (!window.asciiCameraReady) {
        window.asciiCameraReady = true;
        window.dispatchEvent(new CustomEvent('ascii-camera-status', { detail: { ready: true } }));
      }
    };
    capture.elt.onerror = () => {
      window.asciiCameraReady = false;
      window.dispatchEvent(new CustomEvent('ascii-camera-status', { detail: { ready: false } }));
    };
  }
  updateAsciiBounds();
  window.addEventListener('resize', updateAsciiBounds);
  window.addEventListener('mousemove', (event) => {
    updateAsciiBounds();
    if (!asciiBounds) return;
    const x = event.clientX - asciiBounds.left;
    const y = event.clientY - asciiBounds.top;
    if (x < 0 || y < 0 || x > asciiBounds.width || y > asciiBounds.height) {
      mouseGrid.active = false;
      return;
    }
    mouseGrid.active = true;
    mouseGrid.x = x;
    mouseGrid.y = y;
  });
  window.addEventListener('mouseleave', () => {
    mouseGrid.active = false;
  });
  setInterval(()=>console.log(frameRate()), 1000);
}

window.asciiSource = window.asciiSource || 'camera';
window.asciiImage = null;
window.asciiImageSize = null;
window.setAsciiImage = (dataUrl, options = {}) => {
  const revokeUrl = options.revokeUrl;
  loadImage(
    dataUrl,
    (img) => {
      window.asciiImage = img;
      window.asciiImageSize = { width: img.width, height: img.height };
      if (revokeUrl) {
        URL.revokeObjectURL(revokeUrl);
      }
      window.dispatchEvent(new CustomEvent('ascii-image-status', { detail: { ready: true } }));
    },
    () => {
      window.asciiImage = null;
      if (revokeUrl) {
        URL.revokeObjectURL(revokeUrl);
      }
      window.dispatchEvent(new CustomEvent('ascii-image-status', { detail: { ready: false } }));
    }
  );
};

const PIX_PATTERNS = {
  standard: '   `.,_;^+*LTt1jZkAdGgDRNW@',
  simple: ' .:-=+*#%@',
  minimal: ' .coCO',
  blocks: ' ░▒▓█',
  matrix: ' 10',
  crt: '  _-.=≡'
};
const GLITCH_COLORS = ['#0a0c21', '#e503a2', '#00ffff'];
const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
};

function escapeHtmlChar(char) {
  return HTML_ESCAPE_MAP[char] || char;
}

function isInsideShape(i, j, shape, centerX, centerY, gridWidth, gridHeight) {
  if (shape === 'circle') {
    const dx = i - centerX;
    const dy = j - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = Math.min(gridWidth, gridHeight) / 2;
    return distance <= radius;
  }
  if (shape === 'square') {
    const size = Math.min(gridWidth, gridHeight);
    const offsetX = (gridWidth - size) / 2;
    const offsetY = (gridHeight - size) / 2;
    return i >= offsetX && i < offsetX + size && j >= offsetY && j < offsetY + size;
  }
  if (shape === 'triangle') {
    const height = gridHeight;
    const relY = j;
    const triangleWidth = (relY) * (gridWidth / height);
    const leftBound = centerX - triangleWidth / 2;
    const rightBound = centerX + triangleWidth / 2;
    return i >= leftBound && i <= rightBound;
  }
  if (['diamond', 'pentagon', 'hexagon', 'octagon'].includes(shape)) {
    const radius = Math.min(gridWidth, gridHeight) / 2;
    const dx = i - centerX;
    const dy = j - centerY;

    let sides = 4;
    let rotation = 0;
    if (shape === 'diamond') {
      const dist = Math.abs(dx) + Math.abs(dy);
      return dist <= radius;
    }
    if (shape === 'pentagon') { sides = 5; rotation = -Math.PI / 2; }
    if (shape === 'hexagon') { sides = 6; rotation = Math.PI / 6; }
    if (shape === 'octagon') { sides = 8; rotation = Math.PI / 8; }

    let angle = Math.atan2(dy, dx) - rotation;
    const sectorAngle = (2 * Math.PI) / sides;
    angle = angle % sectorAngle;
    if (angle < 0) angle += sectorAngle;

    const polygonRadius = radius * Math.cos(sectorAngle / 2) / Math.cos(angle - sectorAngle / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= polygonRadius;
  }
  return true;
}
// const PIX = '     .-,_:~;*!"+=j7?Ltzsuo#XhZgEORMWB@';
// const PIX = '  `.,_;^+*LTtjkAGgRNW@';
// const PIX = '   `.,_;^+*LTt1jZkAdGgDRNW@';
// console.log(PIX);

function draw() {
  if (!loaded) return;
  const sourceMode = window.asciiSource || 'camera';
  const useImage = sourceMode === 'image' && window.asciiImage;
  if (!asciiBounds || frameCount % 20 === 0) {
    updateAsciiBounds();
  }
  let str = "";
    
  const gridWidth = capture.width;
  const gridHeight = capture.height;
  const patternAnimate = Boolean(window.asciiPatternAnimate);
  const patternSpeed = Math.max(2, Number(window.asciiPatternSpeed ?? 6));
  const glitchEnabled = Boolean(window.asciiGlitch);
  const glitchRowEnabled = Boolean(window.asciiGlitchRow);
  let glitchRowShift = null;
  let glitchRowDrop = null;
  let glitchRowStrong = null;
  let glitchRowTint = null;
  const glitchRate = Number(window.asciiGlitchRate ?? 50) / 100;
  const glitchIntensity = Number(window.asciiGlitchIntensity ?? 50) / 100;
  const glitchArtifactsAmount = Math.max(0, Math.min(1, Number(window.asciiGlitchArtifactsAmount ?? 20) / 100));
  const glitchArtifactsSize = Math.max(1, Math.round(Number(window.asciiGlitchArtifactsSize ?? 3)));
  const glitchColorChance = glitchEnabled ? (0.05 + 0.35 * glitchIntensity) : 0;
  const density = Math.max(0.1, Math.min(1, Number(window.asciiDensity ?? 100) / 100));
  const scatterEnabled = Boolean(window.asciiScatter);
  const scatterAmount = Math.max(0, Math.min(1, Number(window.asciiScatterAmount ?? 20) / 100));
  const scatterSpawnBase = scatterEnabled ? (1 + Math.round(scatterAmount * 6)) : 0;
  const scatterDistance = Math.max(0.2, Math.min(1.2, Number(window.asciiScatterDistance ?? 60) / 100));
  const scatterMargin = scatterEnabled ? Math.round(Math.max(gridWidth, gridHeight) * scatterDistance) : 0;
  const totalWidth = gridWidth + scatterMargin * 2;
  const totalHeight = gridHeight + scatterMargin * 2;
  const mouseAvoidEnabled = Boolean(window.asciiMouseAvoid) && mouseGrid.active && asciiBounds;
  const mouseRadius = 8 + 20 * glitchIntensity;
  const mouseForce = 1 + 6 * glitchIntensity;
  const mouseGridX = mouseAvoidEnabled ? (mouseGrid.x / asciiBounds.width) * gridWidth : null;
  const mouseGridY = mouseAvoidEnabled ? (mouseGrid.y / asciiBounds.height) * gridHeight : null;
  const mouseHoleRadius = mouseAvoidEnabled ? (3 + 8 * glitchIntensity) : 0;

  if (glitchEnabled) {
    glitchRowShift = new Array(gridHeight);
    glitchRowDrop = new Array(gridHeight);
    glitchRowStrong = new Array(gridHeight);
    glitchRowTint = new Array(gridHeight);
    for (let j = 0; j < gridHeight; j += 1) {
      const intensityBoost = 0.25 + 0.75 * glitchIntensity;
      if (random() < Math.min(1, glitchRate * intensityBoost)) {
        const wave = Math.sin((j / gridHeight) * 12 + frameCount * 0.12) * (1 + 3 * glitchIntensity);
        const noiseDrift = (noise(j * 0.15, frameCount * 0.08) - 0.5) * (6 + 16 * glitchIntensity);
        let shift = Math.round(wave + noiseDrift);
        if (random() < 0.06 + 0.2 * glitchIntensity) {
          const burst = 6 + 18 * glitchIntensity;
          shift += Math.round(random(-burst, burst));
        }
        glitchRowShift[j] = shift;
        glitchRowDrop[j] = random() < (0.02 + 0.12 * glitchIntensity);
      } else {
        glitchRowShift[j] = 0;
        glitchRowDrop[j] = false;
      }
      if (glitchRowEnabled) {
        const strongChance = (0.1 + 0.35 * glitchIntensity) * (0.6 + glitchRate);
        glitchRowStrong[j] = random() < strongChance;
        glitchRowTint[j] = glitchRowStrong[j] && random() < (0.25 + 0.35 * glitchIntensity)
          ? GLITCH_COLORS[Math.floor(random(GLITCH_COLORS.length))]
          : null;
      }
    }
  }

  let glitchArtifactMap = null;
  if (glitchEnabled && glitchArtifactsAmount > 0) {
    const size = glitchArtifactsSize;
    const maxBlocks = Math.max(1, Math.floor((gridWidth * gridHeight) / (size * size)));
    const baseBlocks = Math.max(1, Math.round(maxBlocks * 0.04));
    const intensityBoost = 0.4 + 0.6 * glitchIntensity;
    const blockCount = Math.min(maxBlocks, Math.max(0, Math.round(baseBlocks * glitchArtifactsAmount * intensityBoost)));
    const dxRange = 2 + 10 * glitchIntensity;
    const dyRange = 1 + 7 * glitchIntensity;
    const dropChance = 0.02 + 0.22 * glitchArtifactsAmount;
    glitchArtifactMap = new Map();

    for (let b = 0; b < blockCount; b += 1) {
      const startX = Math.floor(random(gridWidth));
      const startY = Math.floor(random(gridHeight));
      const dx = Math.round(random(-dxRange, dxRange));
      const dy = Math.round(random(-dyRange, dyRange));
      const tint = random() < (0.2 + 0.5 * glitchIntensity)
        ? GLITCH_COLORS[Math.floor(random(GLITCH_COLORS.length))]
        : null;

      for (let by = 0; by < size; by += 1) {
        for (let bx = 0; bx < size; bx += 1) {
          const px = startX + bx;
          const py = startY + by;
          if (px >= 0 && px < gridWidth && py >= 0 && py < gridHeight) {
            glitchArtifactMap.set(`${px},${py}`, {
              dx,
              dy,
              drop: random() < dropChance,
              tint
            });
          }
        }
      }
    }
  }

  if (sourceMode === 'image' && !window.asciiImage) {
    for (let j = 0; j < gridHeight; ++j) {
      str += ' '.repeat(gridWidth);
      str += "\n";
    }
    p.html(str);
    return;
  }

  const source = useImage ? window.asciiImage : capture;
  source.loadPixels();
  
  const shape = window.asciiShape || 'rectangle';
  const patternName = window.asciiPattern || 'standard';
  const customPattern = window.asciiCustomPattern || '';
  const hasCustomPattern = customPattern.replace(/\s/g, '').length > 0;
  const basePatternNames = Object.keys(PIX_PATTERNS);
  const patternNames = hasCustomPattern ? basePatternNames.concat('custom') : basePatternNames;
  let PIX = PIX_PATTERNS[patternName] || PIX_PATTERNS.standard;
  if (patternName === 'custom' && hasCustomPattern) {
    PIX = customPattern;
  }
  let PIX_ALT = PIX;
  let patternBlend = 0;
  if (patternAnimate && patternNames.length > 1) {
    const phase = (millis() / 1000) / patternSpeed;
    const idx = Math.floor(phase) % patternNames.length;
    const nextIdx = (idx + 1) % patternNames.length;
    const currentName = patternNames[idx];
    const nextName = patternNames[nextIdx];
    const currentPattern = currentName === 'custom' ? customPattern : PIX_PATTERNS[currentName];
    const nextPattern = nextName === 'custom' ? customPattern : PIX_PATTERNS[nextName];
    if (currentPattern && nextPattern) {
      PIX = currentPattern;
      PIX_ALT = nextPattern;
      patternBlend = phase - Math.floor(phase);
    }
  }
  
  const centerX = gridWidth / 2;
  const centerY = gridHeight / 2;
  const shapeMask = (i, j) => {
    if (i < 0 || j < 0 || i >= gridWidth || j >= gridHeight) return false;
    return isInsideShape(i, j, shape, centerX, centerY, gridWidth, gridHeight);
  };

  let scatterMap = null;
  if (scatterEnabled) {
    const maxParticles = Math.floor(60 + scatterAmount * 180);
    if (scatterParticles.length > maxParticles) {
      scatterParticles = scatterParticles.slice(scatterParticles.length - maxParticles);
    }

    for (let s = 0; s < scatterSpawnBase; s += 1) {
      let attempts = 0;
      let sx = Math.floor(random(gridWidth));
      let sy = Math.floor(random(gridHeight));
      while (attempts < 12 && !shapeMask(sx, sy)) {
        sx = Math.floor(random(gridWidth));
        sy = Math.floor(random(gridHeight));
        attempts += 1;
      }
      const dx = sx - centerX;
      const dy = sy - centerY;
      const angle = Math.atan2(dy, dx) + random(-0.7, 0.7);
      const speed = 0.4 + scatterAmount * 2.4 + scatterDistance * 2.2;
      const life = Math.floor(30 + random(35 + scatterAmount * 40 + scatterDistance * 140));
      const patternForScatter = PIX.replace(/\s/g, '') || PIX_PATTERNS.standard.replace(/\s/g, '');
      const char = patternForScatter[Math.floor(random(patternForScatter.length))] || '*';
      scatterParticles.push({
        x: sx,
        y: sy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        char
      });
    }

    const nextParticles = [];
    scatterMap = new Map();
    for (const particle of scatterParticles) {
      const nx = particle.x + particle.vx;
      const ny = particle.y + particle.vy;
      const life = particle.life - 1;
      if (
        life > 0 &&
        nx >= -scatterMargin &&
        ny >= -scatterMargin &&
        nx < gridWidth + scatterMargin &&
        ny < gridHeight + scatterMargin
      ) {
        const px = Math.round(nx);
        const py = Math.round(ny);
        if (!shapeMask(px, py)) {
          scatterMap.set(`${px},${py}`, particle.char);
        }
        nextParticles.push({
          ...particle,
          x: nx,
          y: ny,
          life
        });
      }
    }
    scatterParticles = nextParticles;
  }

  let imageMap = null;
  if (useImage) {
    const imgW = source.width;
    const imgH = source.height;
    const scale = Math.min(gridWidth / imgW, gridHeight / imgH);
    const renderW = Math.floor(imgW * scale);
    const renderH = Math.floor(imgH * scale);
    const offsetX = Math.floor((gridWidth - renderW) / 2);
    const offsetY = Math.floor((gridHeight - renderH) / 2);
    imageMap = { imgW, imgH, renderW, renderH, offsetX, offsetY };
  }
  
  for (let j = 0; j < totalHeight; ++j) {
    for (let i = 0; i < totalWidth; ++i) {
      const screenX = i - scatterMargin;
      const screenY = j - scatterMargin;
      
      
      // Check if pixel should be rendered based on shape
      let shouldRender = true;
      
      // Apply flip transformations for rendering check
      // For shapes, we want them to stay in place relative to the canvas, 
      // but the image content inside might flip. 
      // Actually, typically "flip" means flipping everything.
      // Let's keep the coordinate system simple: i,j are screen coordinates.
      // We render to screen coordinate (i,j).
      // We sample color from transformed coordinate (srcX, srcY).
      
      let srcX = screenX;
      let srcY = screenY;
      let sampleValid = true;
      
      if (window.asciiFlipH) {
        srcX = gridWidth - 1 - screenX;
      }
      if (window.asciiFlipV) {
        srcY = gridHeight - 1 - screenY;
      }

      // Shape logic based on SCREEN coordinates (i,j) so the shape stays stable?
      // Or should the shape flip too? Usually filters flip the image content.
      // Let's use (i,j) for shape masking so the shape stays centered and oriented normally
      // while the video content inside flips.
      
      shouldRender = shapeMask(screenX, screenY);
      
      if (shouldRender) {
        let sampleX = srcX;
        let sampleY = srcY;
        let artifactTint = null;
        let rowTint = null;

        if (mouseAvoidEnabled) {
          const dx = screenX - mouseGridX;
          const dy = screenY - mouseGridY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= mouseHoleRadius) {
            str += ' ';
            continue;
          }
          if (distance > 0 && distance < mouseRadius) {
            const push = (1 - distance / mouseRadius) * mouseForce;
            const ux = dx / distance;
            const uy = dy / distance;
            sampleX = Math.min(gridWidth - 1, Math.max(0, Math.round(sampleX + ux * push)));
            sampleY = Math.min(gridHeight - 1, Math.max(0, Math.round(sampleY + uy * push)));
          }
        }

        if (glitchEnabled && screenY >= 0 && screenY < gridHeight) {
          const shift = glitchRowShift[screenY] || 0;
          sampleX = (sampleX + shift + gridWidth) % gridWidth;
          if (glitchRowDrop[screenY] && (i % 3 === 0 || i % 7 === 0)) {
            str += ' ';
            continue;
          }
        }

        if (glitchEnabled && glitchRowEnabled && screenY >= 0 && screenY < gridHeight && glitchRowStrong && glitchRowStrong[screenY]) {
          const baseShift = glitchRowShift[screenY] || 0;
          const smear = Math.round(baseShift * (2 + 3 * glitchIntensity)) || Math.round(random(-6, 6));
          sampleX = (sampleX + smear + gridWidth) % gridWidth;
          rowTint = glitchRowTint ? glitchRowTint[screenY] : null;
          if (random() < (0.05 + 0.15 * glitchIntensity)) {
            str += ' ';
            continue;
          }
        }

        if (glitchArtifactMap && screenX >= 0 && screenX < gridWidth && screenY >= 0 && screenY < gridHeight) {
          const artifactCell = glitchArtifactMap.get(`${screenX},${screenY}`);
          if (artifactCell) {
            if (artifactCell.drop) {
              str += ' ';
              continue;
            }
            sampleX = Math.min(gridWidth - 1, Math.max(0, Math.round(sampleX + artifactCell.dx)));
            sampleY = Math.min(gridHeight - 1, Math.max(0, Math.round(sampleY + artifactCell.dy)));
            artifactTint = artifactCell.tint || null;
          }
        }

        if (useImage && imageMap) {
          if (sampleX < 0 || sampleY < 0 || sampleX >= gridWidth || sampleY >= gridHeight) {
            sampleValid = false;
          }
          const { imgW, imgH, renderW, renderH, offsetX, offsetY } = imageMap;
          const withinX = sampleX >= offsetX && sampleX < offsetX + renderW;
          const withinY = sampleY >= offsetY && sampleY < offsetY + renderH;
          if (withinX && withinY) {
            const relX = (sampleX - offsetX) / renderW;
            const relY = (sampleY - offsetY) / renderH;
            sampleX = Math.min(imgW - 1, Math.floor(relX * imgW));
            sampleY = Math.min(imgH - 1, Math.floor(relY * imgH));
          } else {
            sampleValid = false;
          }
        }

        const sourceWidth = useImage && imageMap ? imageMap.imgW : gridWidth;
        const sourceHeight = useImage && imageMap ? imageMap.imgH : gridHeight;
        if (!sampleValid || sampleX < 0 || sampleY < 0 || sampleX >= sourceWidth || sampleY >= sourceHeight) {
          str += ' ';
        } else {
          const idx = (sampleX + sampleY*source.width) * 4;
          const r = source.pixels[idx];
          const g = source.pixels[idx + 1];
          const b = source.pixels[idx + 2];
          const bri = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
          const brightOnly = window.asciiBrightOnly === true;
          const brightThreshold = Math.max(0, Math.min(1, Number(window.asciiBrightThreshold ?? 60) / 100));
          if (brightOnly && bri < brightThreshold) {
            str += ' ';
            continue;
          }
          const safeIndex = Math.min(PIX.length - 1, Math.max(0, floor(bri * PIX.length)));
          const patternChoice = patternBlend > 0
            ? (noise(screenX * 0.18, screenY * 0.18, frameCount * 0.02) < patternBlend ? PIX_ALT : PIX)
            : PIX;
          let c = patternChoice[safeIndex] || ' ';
          if (c !== ' ' && density < 1 && random() > density) {
            c = ' ';
          }
          const escaped = escapeHtmlChar(c);
          const darkBoost = glitchEnabled ? (0.5 + (1 - bri) * 0.9 * glitchIntensity) : 1;
          if (glitchEnabled && rowTint && c !== ' ') {
            str += `<span style="color:${rowTint}">${escaped}</span>`;
          } else if (glitchEnabled && artifactTint && c !== ' ') {
            str += `<span style="color:${artifactTint}">${escaped}</span>`;
          } else if (glitchEnabled && random() < glitchColorChance * darkBoost && screenY >= 0 && screenY < gridHeight && glitchRowShift[screenY]) {
            const color = GLITCH_COLORS[Math.floor(random(GLITCH_COLORS.length))];
            str += `<span style="color:${color}">${escaped}</span>`;
          } else {
            // Use raw space for pre-formatted text
            str += (c == ' ' ? ' ' : escaped);
          }
        }
      } else {
        if (scatterEnabled && scatterMap) {
          const key = `${screenX},${screenY}`;
          if (scatterMap.has(key)) {
            const scatterChar = escapeHtmlChar(scatterMap.get(key));
            str += scatterChar;
          } else {
            str += ' ';
          }
        } else {
          str += ' ';
        }
      }
    }
    str += "\n";
  }
  p.html(str);
}
