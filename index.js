const [W, H] = [128, 96];

let p,
  capture,
  loaded = false;

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
  setInterval(()=>console.log(frameRate()), 1000);
}

window.asciiSource = window.asciiSource || 'camera';
window.asciiImage = null;
window.asciiImageSize = null;
window.setAsciiImage = (dataUrl) => {
  loadImage(dataUrl, (img) => {
    window.asciiImage = img;
    window.asciiImageSize = { width: img.width, height: img.height };
  });
};

const PIX_PATTERNS = {
  standard: '   `.,_;^+*LTt1jZkAdGgDRNW@',
  simple: ' .:-=+*#%@',
  minimal: ' .coCO',
  blocks: ' ░▒▓█',
  matrix: ' 10',
  crt: '  _-.=≡'
};
// const PIX = '     .-,_:~;*!"+=j7?Ltzsuo#XhZgEORMWB@';
// const PIX = '  `.,_;^+*LTtjkAGgRNW@';
// const PIX = '   `.,_;^+*LTt1jZkAdGgDRNW@';
// console.log(PIX);

function draw() {
  if (!loaded) return;
  const sourceMode = window.asciiSource || 'camera';
  const useImage = sourceMode === 'image' && window.asciiImage;
  let str = "";
    
  const gridWidth = capture.width;
  const gridHeight = capture.height;

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
  let PIX = PIX_PATTERNS[patternName] || PIX_PATTERNS.standard;
  if (patternName === 'custom') {
    const customPattern = window.asciiCustomPattern || '';
    const hasVisibleChars = customPattern.replace(/\s/g, '').length > 0;
    PIX = hasVisibleChars ? customPattern : PIX_PATTERNS.standard;
  }
  
  const centerX = gridWidth / 2;
  const centerY = gridHeight / 2;

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
  
  for (let j = 0; j < gridHeight; ++j) {
    for (let i = 0; i < gridWidth; ++i) {
      
      
      // Check if pixel should be rendered based on shape
      let shouldRender = true;
      
      // Apply flip transformations for rendering check
      // For shapes, we want them to stay in place relative to the canvas, 
      // but the image content inside might flip. 
      // Actually, typically "flip" means flipping everything.
      // Let's keep the coordinate system simple: i,j are screen coordinates.
      // We render to screen coordinate (i,j).
      // We sample color from transformed coordinate (srcX, srcY).
      
      let srcX = i;
      let srcY = j;
      let sampleValid = true;
      
      if (window.asciiFlipH) {
        srcX = gridWidth - 1 - i;
      }
      if (window.asciiFlipV) {
        srcY = gridHeight - 1 - j;
      }

      // Shape logic based on SCREEN coordinates (i,j) so the shape stays stable?
      // Or should the shape flip too? Usually filters flip the image content.
      // Let's use (i,j) for shape masking so the shape stays centered and oriented normally
      // while the video content inside flips.
      
      if (shape === 'circle') {
        const dx = i - centerX;
        const dy = j - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const radius = Math.min(gridWidth, gridHeight) / 2;
        shouldRender = distance <= radius;
      } else if (shape === 'square') {
        const size = Math.min(gridWidth, gridHeight);
        const offsetX = (gridWidth - size) / 2;
        const offsetY = (gridHeight - size) / 2;
        shouldRender = i >= offsetX && i < offsetX + size && j >= offsetY && j < offsetY + size;
      } else if (shape === 'triangle') {
        // Triangle pointing up (base at bottom)
        const height = gridHeight;
        const relY = j; 
        const triangleWidth = (relY) * (gridWidth / height);
        
        const leftBound = centerX - triangleWidth / 2;
        const rightBound = centerX + triangleWidth / 2;
        
        shouldRender = i >= leftBound && i <= rightBound;
      } else if (['diamond', 'pentagon', 'hexagon', 'octagon'].includes(shape)) {
        const radius = Math.min(gridWidth, gridHeight) / 2;
        const dx = i - centerX;
        const dy = j - centerY;
        
        let sides = 4;
        let rotation = 0; 
        
        if (shape === 'diamond') {
          const dist = Math.abs(dx) + Math.abs(dy);
          shouldRender = dist <= radius;
        } else {
          if (shape === 'pentagon') { sides = 5; rotation = -Math.PI / 2; }
          if (shape === 'hexagon') { sides = 6; rotation = Math.PI / 6; }
          if (shape === 'octagon') { sides = 8; rotation = Math.PI / 8; }
          
          let angle = Math.atan2(dy, dx) - rotation;
          const sectorAngle = (2 * Math.PI) / sides;
          angle = angle % sectorAngle;
          if (angle < 0) angle += sectorAngle;
          
          const polygonRadius = radius * Math.cos(sectorAngle / 2) / Math.cos(angle - sectorAngle / 2);
          const distance = Math.sqrt(dx * dx + dy * dy);
          shouldRender = distance <= polygonRadius;
        }
      }
      
      if (shouldRender) {
        let sampleX = srcX;
        let sampleY = srcY;

        if (useImage && imageMap) {
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

        if (!sampleValid) {
          str += ' ';
        } else {
          const idx = (sampleX + sampleY*source.width) * 4;
          const bri = (source.pixels[idx] + source.pixels[idx+1] + source.pixels[idx+2]) / (3 * 255);
          const safeIndex = Math.min(PIX.length - 1, Math.max(0, floor(bri * PIX.length)));
          const c = PIX[safeIndex];
          // Use raw space for pre-formatted text
          str += (c == ' ' ? ' ' : c);
        }
      } else {
        str += ' ';
      }
    }
    str += "\n";
  }
  p.html(str);
}
