const [W, H] = [128, 96];

let p,
  capture,
  loaded = false;

function setup() {
  noCanvas();
  
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
  });
  capture.hide();
  setInterval(()=>console.log(frameRate()), 1000);
}

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
  let str = "";
    
  capture.loadPixels();
  
  const shape = window.asciiShape || 'rectangle';
  const patternName = window.asciiPattern || 'standard';
  const PIX = PIX_PATTERNS[patternName] || PIX_PATTERNS.standard;
  
  const centerX = capture.width / 2;
  const centerY = capture.height / 2;
  
  for (let j = 0; j < capture.height; ++j) {
    for (let i = 0; i < capture.width; ++i) {
      
      
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
      
      if (window.asciiFlipH) {
        srcX = capture.width - 1 - i;
      }
      if (window.asciiFlipV) {
        srcY = capture.height - 1 - j;
      }

      // Shape logic based on SCREEN coordinates (i,j) so the shape stays stable?
      // Or should the shape flip too? Usually filters flip the image content.
      // Let's use (i,j) for shape masking so the shape stays centered and oriented normally
      // while the video content inside flips.
      
      if (shape === 'circle') {
        const dx = i - centerX;
        const dy = j - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const radius = Math.min(capture.width, capture.height) / 2;
        shouldRender = distance <= radius;
      } else if (shape === 'square') {
        const size = Math.min(capture.width, capture.height);
        const offsetX = (capture.width - size) / 2;
        const offsetY = (capture.height - size) / 2;
        shouldRender = i >= offsetX && i < offsetX + size && j >= offsetY && j < offsetY + size;
      } else if (shape === 'triangle') {
        // Triangle pointing up (base at bottom)
        const height = capture.height;
        const relY = j; 
        const triangleWidth = (relY) * (capture.width / height);
        
        const leftBound = centerX - triangleWidth / 2;
        const rightBound = centerX + triangleWidth / 2;
        
        shouldRender = i >= leftBound && i <= rightBound;
      } else if (['diamond', 'pentagon', 'hexagon', 'octagon'].includes(shape)) {
        const radius = Math.min(capture.width, capture.height) / 2;
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
        const idx = (srcX + srcY*capture.width) * 4;
        const bri = (capture.pixels[idx] + capture.pixels[idx+1] + capture.pixels[idx+2]) / (3 * 255);
        
        const c = PIX[floor(bri*PIX.length)];
        // Use raw space for pre-formatted text
        str += (c == ' ' ? ' ' : c);
      } else {
        str += ' ';
      }
    }
    str += "\n";
  }
  p.html(str);
}
