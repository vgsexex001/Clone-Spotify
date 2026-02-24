const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// ─── Setup directories ────────────────────────────────────────
const dirs = [
  'public/images/covers',
  'public/images/artists',
  'public/images/now-playing',
  'public/images/ui',
];
dirs.forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

// ─── Helpers ──────────────────────────────────────────────────

function createGradient(ctx, w, h, colors, angle = 135) {
  const rad = (angle * Math.PI) / 180;
  const x1 = w / 2 - Math.cos(rad) * w / 2;
  const y1 = h / 2 - Math.sin(rad) * h / 2;
  const x2 = w / 2 + Math.cos(rad) * w / 2;
  const y2 = h / 2 + Math.sin(rad) * h / 2;
  const grad = ctx.createLinearGradient(x1, y1, x2, y2);
  colors.forEach((color, i) => grad.addColorStop(i / (colors.length - 1), color));
  return grad;
}

function addNoise(ctx, w, h, opacity = 0.04) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 255 * opacity;
    d[i] = Math.min(255, Math.max(0, d[i] + n));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n));
  }
  ctx.putImageData(imageData, 0, 0);
}

function addVignette(ctx, w, h, strength = 0.4) {
  const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.75);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawHeart(ctx, cx, cy, size) {
  ctx.beginPath();
  const topY = cy - size * 0.35;
  ctx.moveTo(cx, cy + size * 0.45);
  ctx.bezierCurveTo(cx - size * 0.6, cy + size * 0.1, cx - size * 0.6, topY - size * 0.1, cx - size * 0.3, topY - size * 0.1);
  ctx.bezierCurveTo(cx - size * 0.05, topY - size * 0.1, cx, topY + size * 0.1, cx, topY + size * 0.2);
  ctx.bezierCurveTo(cx, topY + size * 0.1, cx + size * 0.05, topY - size * 0.1, cx + size * 0.3, topY - size * 0.1);
  ctx.bezierCurveTo(cx + size * 0.6, topY - size * 0.1, cx + size * 0.6, cy + size * 0.1, cx, cy + size * 0.45);
  ctx.closePath();
  ctx.fill();
}

function drawDailyMixOverlay(ctx, w, h, num) {
  // Bottom gradient overlay
  const grad = ctx.createLinearGradient(0, h * 0.6, 0, h);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.85)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, h * 0.5, w, h * 0.5);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `300 ${Math.round(w * 0.085)}px Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText('Daily Mix', w * 0.1, h * 0.92);

  ctx.font = `bold ${Math.round(w * 0.2)}px Arial, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText(String(num).padStart(2, '0'), w * 0.92, h * 0.95);
}

function saveCanvas(canvas, filepath) {
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filepath, buffer);
  console.log(`  Created: ${filepath}`);
}

// ─── 1. QUICK ACCESS (120x120) ────────────────────────────────

function generateLikedSongs() {
  const s = 120;
  const c = createCanvas(s, s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = createGradient(ctx, s, s, ['#450AF5', '#8E8FE8', '#C4EFD9']);
  ctx.fillRect(0, 0, s, s);
  ctx.fillStyle = '#FFFFFF';
  drawHeart(ctx, s / 2, s / 2, s * 0.4);
  addNoise(ctx, s, s, 0.03);
  saveCanvas(c, 'public/images/covers/liked-songs.png');
}

function generateDailyMix1() {
  const s = 120;
  const c = createCanvas(s, s);
  const ctx = c.getContext('2d');
  const colors = ['#1A1A2E', '#16213E', '#0F3460', '#533483'];
  const half = s / 2;
  ctx.fillStyle = colors[0]; ctx.fillRect(0, 0, half, half);
  ctx.fillStyle = colors[1]; ctx.fillRect(half, 0, half, half);
  ctx.fillStyle = colors[2]; ctx.fillRect(0, half, half, half);
  ctx.fillStyle = colors[3]; ctx.fillRect(half, half, half, half);
  // Subtle lines between quadrants
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(half, 0); ctx.lineTo(half, s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, half); ctx.lineTo(s, half); ctx.stroke();
  drawDailyMixOverlay(ctx, s, s, 1);
  addNoise(ctx, s, s);
  saveCanvas(c, 'public/images/covers/daily-mix-1.png');
}

function generateCodingBootcamp() {
  const s = 120;
  const c = createCanvas(s, s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0D1117';
  ctx.fillRect(0, 0, s, s);

  // Matrix-like code lines in background
  ctx.font = `${Math.round(s * 0.06)}px monospace`;
  ctx.fillStyle = '#0A4D1A';
  const codeLines = ['fn main() {', '  let x = 42;', '  loop {', '    println!();', '  }', '}', 'const f =', 'return 0;', 'if (true)', '{ code }'];
  for (let i = 0; i < 14; i++) {
    ctx.fillText(codeLines[i % codeLines.length], 3, 9 + i * (s * 0.07));
  }

  // "THIS IS" text
  ctx.fillStyle = '#00FF41';
  ctx.font = `bold ${Math.round(s * 0.1)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('THIS IS', s / 2, s * 0.3);

  // "Coding" text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.round(s * 0.18)}px Arial, sans-serif`;
  ctx.fillText('Coding', s / 2, s * 0.5);

  // "Bootcamp" text
  ctx.fillStyle = '#00FF41';
  ctx.font = `bold ${Math.round(s * 0.14)}px Arial, sans-serif`;
  ctx.fillText('Bootcamp', s / 2, s * 0.68);

  addNoise(ctx, s, s, 0.05);
  saveCanvas(c, 'public/images/covers/coding-bootcamp.png');
}

function generateTrilhaLeitura() {
  const s = 120;
  const c = createCanvas(s, s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = createGradient(ctx, s, s, ['#2C1810', '#1A0A00'], 180);
  ctx.fillRect(0, 0, s, s);

  // Subtle paper texture stripes
  ctx.strokeStyle = 'rgba(212,165,116,0.04)';
  for (let i = 0; i < s; i += 3) {
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(s, i); ctx.stroke();
  }

  // Open book silhouette
  const cx = s / 2, cy = s / 2;
  ctx.fillStyle = '#D4A574';
  // Left page
  ctx.beginPath();
  ctx.moveTo(cx, cy - 8);
  ctx.quadraticCurveTo(cx - 28, cy - 14, cx - 30, cy + 14);
  ctx.lineTo(cx, cy + 10);
  ctx.closePath();
  ctx.fill();
  // Right page
  ctx.beginPath();
  ctx.moveTo(cx, cy - 8);
  ctx.quadraticCurveTo(cx + 28, cy - 14, cx + 30, cy + 14);
  ctx.lineTo(cx, cy + 10);
  ctx.closePath();
  ctx.fill();
  // Spine
  ctx.strokeStyle = '#8B6914';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx, cy - 10); ctx.lineTo(cx, cy + 12); ctx.stroke();

  // Sound waves
  ctx.strokeStyle = '#8B6914';
  ctx.lineWidth = 1;
  for (let r = 12; r <= 24; r += 6) {
    ctx.beginPath();
    ctx.arc(cx, cy - 4, r, -Math.PI * 0.4, -Math.PI * 0.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy - 4, r, -Math.PI * 0.9, -Math.PI * 0.6);
    ctx.stroke();
  }

  addNoise(ctx, s, s, 0.04);
  saveCanvas(c, 'public/images/covers/trilha-leitura.png');
}

function generateFroidDonde() {
  const s = 120;
  const c = createCanvas(s, s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#1C1C1C';
  ctx.fillRect(0, 0, s, s);

  // Grunge texture
  ctx.fillStyle = 'rgba(255,255,255,0.02)';
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * s, y = Math.random() * s;
    ctx.fillRect(x, y, 1, 1);
  }

  // "FROID" text (tilted)
  ctx.save();
  ctx.translate(s / 2, s * 0.25);
  ctx.rotate(-0.08);
  ctx.fillStyle = '#E13300';
  ctx.font = `bold ${Math.round(s * 0.22)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('FROID', 0, 0);
  ctx.restore();

  // Big X crosshair
  ctx.strokeStyle = '#E13300';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  const margin = s * 0.22;
  ctx.beginPath();
  ctx.moveTo(margin, s * 0.35); ctx.lineTo(s - margin, s * 0.75);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(s - margin, s * 0.35); ctx.lineTo(margin, s * 0.75);
  ctx.stroke();

  // "¿DÓNDE?" text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.round(s * 0.14)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('¿DÓNDE?', s / 2, s * 0.9);

  addNoise(ctx, s, s, 0.05);
  saveCanvas(c, 'public/images/covers/froid-donde.png');
}

function generateMatue() {
  const s = 120;
  const c = createCanvas(s, s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = createGradient(ctx, s, s, ['#0A0A0A', '#2D2D2D'], 180);
  ctx.fillRect(0, 0, s, s);

  // Silhouette of face in profile (golden)
  ctx.fillStyle = '#FFD700';
  // Head shape
  ctx.beginPath();
  ctx.ellipse(s * 0.48, s * 0.38, s * 0.2, s * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();
  // Neck
  ctx.fillRect(s * 0.38, s * 0.55, s * 0.2, s * 0.18);

  // Rectangular sunglasses (black on gold)
  ctx.fillStyle = '#0A0A0A';
  ctx.fillRect(s * 0.28, s * 0.3, s * 0.16, s * 0.08);
  ctx.fillRect(s * 0.5, s * 0.3, s * 0.16, s * 0.08);
  // Bridge
  ctx.fillRect(s * 0.44, s * 0.32, s * 0.06, s * 0.04);

  // Sparkles
  ctx.fillStyle = '#FFD700';
  const sparkles = [[0.15, 0.2], [0.8, 0.15], [0.85, 0.55], [0.12, 0.65], [0.75, 0.8], [0.2, 0.45]];
  sparkles.forEach(([x, y]) => {
    const sx = s * x, sy = s * y;
    ctx.beginPath();
    ctx.moveTo(sx, sy - 3); ctx.lineTo(sx + 1, sy); ctx.lineTo(sx, sy + 3); ctx.lineTo(sx - 1, sy);
    ctx.closePath(); ctx.fill();
  });

  // "MATUÊ" text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.round(s * 0.1)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('MATUÊ', s / 2, s * 0.9);

  addNoise(ctx, s, s, 0.04);
  saveCanvas(c, 'public/images/covers/matue.png');
}

function generateCerebro100() {
  const s = 120;
  const c = createCanvas(s, s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = createGradient(ctx, s, s, ['#0B0B3B', '#1B0B3B']);
  ctx.fillRect(0, 0, s, s);

  const cx = s / 2, cy = s * 0.42;

  // Glow effect
  const glow = ctx.createRadialGradient(cx, cy, 5, cx, cy, 35);
  glow.addColorStop(0, 'rgba(0,212,255,0.2)');
  glow.addColorStop(1, 'rgba(0,212,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, s, s);

  // Brain silhouette in cyan neon lines
  ctx.strokeStyle = '#00D4FF';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  // Left hemisphere
  ctx.beginPath();
  ctx.moveTo(cx - 2, cy - 20);
  ctx.bezierCurveTo(cx - 22, cy - 22, cx - 26, cy - 5, cx - 22, cy + 5);
  ctx.bezierCurveTo(cx - 26, cy + 12, cx - 18, cy + 18, cx - 2, cy + 16);
  ctx.stroke();
  // Right hemisphere
  ctx.beginPath();
  ctx.moveTo(cx + 2, cy - 20);
  ctx.bezierCurveTo(cx + 22, cy - 22, cx + 26, cy - 5, cx + 22, cy + 5);
  ctx.bezierCurveTo(cx + 26, cy + 12, cx + 18, cy + 18, cx + 2, cy + 16);
  ctx.stroke();
  // Folds
  ctx.strokeStyle = 'rgba(0,212,255,0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx - 18, cy - 8); ctx.quadraticCurveTo(cx - 10, cy - 2, cx - 18, cy + 4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 18, cy - 8); ctx.quadraticCurveTo(cx + 10, cy - 2, cx + 18, cy + 4); ctx.stroke();
  // Middle line
  ctx.beginPath(); ctx.moveTo(cx, cy - 20); ctx.lineTo(cx, cy + 16); ctx.stroke();

  // Circular pulses
  ctx.strokeStyle = '#7B68EE';
  ctx.lineWidth = 0.8;
  for (let r = 22; r <= 38; r += 8) {
    ctx.globalAlpha = 1 - (r - 22) / 30;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Neuron dots
  ctx.fillStyle = '#FFFFFF';
  const dots = [[0.25, 0.2], [0.75, 0.25], [0.15, 0.55], [0.85, 0.5], [0.3, 0.7], [0.7, 0.7]];
  dots.forEach(([x, y]) => {
    ctx.beginPath(); ctx.arc(s * x, s * y, 1.5, 0, Math.PI * 2); ctx.fill();
  });

  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.round(s * 0.11)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('Cérebro', s / 2, s * 0.82);
  ctx.font = `bold ${Math.round(s * 0.13)}px Arial, sans-serif`;
  ctx.fillText('100%', s / 2, s * 0.94);

  addNoise(ctx, s, s, 0.04);
  saveCanvas(c, 'public/images/covers/cerebro-100.png');
}

function generateBrandao85() {
  const s = 120;
  const c = createCanvas(s, s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#121212';
  ctx.fillRect(0, 0, s, s);

  // Urban texture (subtle)
  ctx.fillStyle = 'rgba(255,255,255,0.015)';
  for (let i = 0; i < 150; i++) {
    ctx.fillRect(Math.random() * s, Math.random() * s, Math.random() * 3 + 1, 1);
  }

  // Red bar behind text
  ctx.fillStyle = '#E13300';
  ctx.fillRect(s * 0.05, s * 0.4, s * 0.9, s * 0.22);

  // "THIS IS" text
  ctx.fillStyle = '#B3B3B3';
  ctx.font = `${Math.round(s * 0.09)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('THIS IS', s / 2, s * 0.28);

  // "Brandão85" text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.round(s * 0.17)}px Arial, sans-serif`;
  ctx.fillText('Brandão85', s / 2, s * 0.52);

  addNoise(ctx, s, s, 0.04);
  saveCanvas(c, 'public/images/covers/brandao85.png');
}

// ─── 2. FEATURED (380x380) ───────────────────────────────────

function generateRobynLive() {
  const w = 380, h = 380;
  const c = createCanvas(w, h);
  const ctx = c.getContext('2d');
  ctx.fillStyle = createGradient(ctx, w, h, ['#2D1B4E', '#1A0A2E'], 180);
  ctx.fillRect(0, 0, w, h);

  // Light beams from behind
  ctx.globalAlpha = 0.15;
  const beamColors = ['#8E44AD', '#C39BD3', '#9B59B6', '#AF7AC5'];
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = beamColors[i % beamColors.length];
    ctx.beginPath();
    ctx.moveTo(w * 0.45, h * 0.35);
    const angle = -Math.PI * 0.8 + i * (Math.PI * 0.2);
    ctx.lineTo(w * 0.45 + Math.cos(angle) * w, h * 0.35 + Math.sin(angle) * h);
    ctx.lineTo(w * 0.45 + Math.cos(angle + 0.08) * w, h * 0.35 + Math.sin(angle + 0.08) * h);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Singing person silhouette
  ctx.fillStyle = '#9B59B6';
  // Body
  ctx.beginPath();
  ctx.ellipse(w * 0.42, h * 0.35, 25, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  // Torso
  ctx.beginPath();
  ctx.moveTo(w * 0.42 - 20, h * 0.42);
  ctx.lineTo(w * 0.42 - 35, h * 0.72);
  ctx.lineTo(w * 0.42 + 35, h * 0.72);
  ctx.lineTo(w * 0.42 + 20, h * 0.42);
  ctx.closePath();
  ctx.fill();
  // Arm holding mic
  ctx.strokeStyle = '#9B59B6';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(w * 0.42 + 18, h * 0.45);
  ctx.quadraticCurveTo(w * 0.42 + 45, h * 0.35, w * 0.42 + 30, h * 0.25);
  ctx.stroke();
  // Mic
  ctx.fillStyle = '#C39BD3';
  ctx.beginPath();
  ctx.arc(w * 0.42 + 30, h * 0.23, 6, 0, Math.PI * 2);
  ctx.fill();

  // Bokeh particles
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 30; i++) {
    const bx = Math.random() * w, by = Math.random() * h;
    const br = Math.random() * 5 + 2;
    ctx.fillStyle = ['#C39BD3', '#8E44AD', '#FFFFFF', '#AF7AC5'][Math.floor(Math.random() * 4)];
    ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Spotify badge (green circle top-left)
  ctx.fillStyle = '#1DB954';
  ctx.beginPath(); ctx.arc(30, 30, 14, 0, Math.PI * 2); ctx.fill();
  // S inside badge
  ctx.fillStyle = '#000';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('S', 30, 30);

  // "SPOTIFY PRESENTS"
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `${Math.round(w * 0.03)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.letterSpacing = '2px';
  ctx.fillText('SPOTIFY PRESENTS', w / 2, h * 0.12);

  // "Robyn"
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.round(w * 0.12)}px Arial, sans-serif`;
  ctx.fillText('Robyn', w / 2, h * 0.84);

  // "LIVE FROM LOS ANGELES"
  ctx.fillStyle = '#B3B3B3';
  ctx.font = `${Math.round(w * 0.03)}px Arial, sans-serif`;
  ctx.fillText('LIVE FROM LOS ANGELES', w / 2, h * 0.9);

  addVignette(ctx, w, h, 0.5);
  addNoise(ctx, w, h, 0.03);
  saveCanvas(c, 'public/images/covers/robyn-live.png');
}

// ─── 3. FEITO PARA VOCÊ (164x164) ───────────────────────────

function generateDescobertas() {
  const s = 164;
  const c = createCanvas(s, s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#121212';
  ctx.fillRect(0, 0, s, s);

  // Geometric shapes
  const geoColors = ['#1DB954', '#E13300', '#509BF5', '#F5E642'];
  // Triangle 1
  ctx.fillStyle = geoColors[0];
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.moveTo(s * 0.1, s * 0.7); ctx.lineTo(s * 0.5, s * 0.15); ctx.lineTo(s * 0.6, s * 0.7);
  ctx.closePath(); ctx.fill();
  // Rectangle
  ctx.fillStyle = geoColors[1];
  ctx.globalAlpha = 0.7;
  ctx.save(); ctx.translate(s * 0.6, s * 0.3); ctx.rotate(0.3);
  ctx.fillRect(0, 0, s * 0.35, s * 0.5);
  ctx.restore();
  // Triangle 2
  ctx.fillStyle = geoColors[2];
  ctx.globalAlpha = 0.65;
  ctx.beginPath();
  ctx.moveTo(s * 0.3, s * 0.9); ctx.lineTo(s * 0.7, s * 0.4); ctx.lineTo(s * 0.95, s * 0.9);
  ctx.closePath(); ctx.fill();
  // Small square
  ctx.fillStyle = geoColors[3];
  ctx.globalAlpha = 0.7;
  ctx.save(); ctx.translate(s * 0.05, s * 0.2); ctx.rotate(-0.2);
  ctx.fillRect(0, 0, s * 0.2, s * 0.2);
  ctx.restore();
  ctx.globalAlpha = 1;

  // Text
  ctx.save();
  ctx.translate(s / 2, s * 0.45);
  ctx.rotate(-0.08);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.round(s * 0.12)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DESCOBERTAS', 0, -8);
  ctx.font = `bold ${Math.round(s * 0.1)}px Arial, sans-serif`;
  ctx.fillText('DA SEMANA', 0, 12);
  ctx.restore();

  addNoise(ctx, s, s, 0.04);
  saveCanvas(c, 'public/images/covers/descobertas-semana.png');
}

function generateDailyMix2() {
  const s = 164;
  const c = createCanvas(s, s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = createGradient(ctx, s, s, ['#8B0000', '#2D0000'], 180);
  ctx.fillRect(0, 0, s, s);

  // Person with red jacket silhouette
  ctx.fillStyle = '#FF4444';
  // Head
  ctx.beginPath();
  ctx.ellipse(s * 0.5, s * 0.28, s * 0.1, s * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Jacket/body
  ctx.beginPath();
  ctx.moveTo(s * 0.3, s * 0.38);
  ctx.lineTo(s * 0.22, s * 0.7);
  ctx.lineTo(s * 0.78, s * 0.7);
  ctx.lineTo(s * 0.7, s * 0.38);
  ctx.closePath();
  ctx.fill();
  // Sunglasses
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(s * 0.38, s * 0.25, s * 0.1, s * 0.04);
  ctx.fillRect(s * 0.52, s * 0.25, s * 0.1, s * 0.04);

  drawDailyMixOverlay(ctx, s, s, 2);
  addNoise(ctx, s, s, 0.04);
  saveCanvas(c, 'public/images/covers/daily-mix-2.png');
}

function generateDailyMix3() {
  const s = 164;
  const c = createCanvas(s, s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = createGradient(ctx, s, s, ['#F5A623', '#8B4513'], 180);
  ctx.fillRect(0, 0, s, s);

  // Man profile silhouette
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  // Head
  ctx.ellipse(s * 0.55, s * 0.32, s * 0.14, s * 0.16, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Neck + shoulders
  ctx.beginPath();
  ctx.moveTo(s * 0.42, s * 0.45);
  ctx.lineTo(s * 0.2, s * 0.75);
  ctx.lineTo(s * 0.85, s * 0.75);
  ctx.lineTo(s * 0.65, s * 0.45);
  ctx.closePath();
  ctx.fill();

  // Sunglasses highlight
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(s * 0.42, s * 0.28, s * 0.22, s * 0.05);

  drawDailyMixOverlay(ctx, s, s, 3);
  addNoise(ctx, s, s, 0.04);
  saveCanvas(c, 'public/images/covers/daily-mix-3.png');
}

function generateDailyMix4() {
  const s = 164;
  const c = createCanvas(s, s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = createGradient(ctx, s, s, ['#1A5276', '#0A2A3C'], 180);
  ctx.fillRect(0, 0, s, s);

  // "Chill" cursive text
  ctx.fillStyle = '#87CEEB';
  ctx.font = `italic ${Math.round(s * 0.22)}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Chill', s / 2, s * 0.3);

  // "SELECT" spaced
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `${Math.round(s * 0.08)}px Arial, sans-serif`;
  const selectText = 'S E L E C T';
  ctx.fillText(selectText, s / 2, s * 0.45);

  // Fluid waves at bottom
  ctx.strokeStyle = 'rgba(135,206,235,0.3)';
  ctx.lineWidth = 2;
  for (let w2 = 0; w2 < 3; w2++) {
    ctx.beginPath();
    for (let x = 0; x <= s; x += 2) {
      const y = s * 0.6 + w2 * 12 + Math.sin(x * 0.05 + w2) * 8;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  drawDailyMixOverlay(ctx, s, s, 4);
  addNoise(ctx, s, s, 0.03);
  saveCanvas(c, 'public/images/covers/daily-mix-4.png');
}

function generateDailyMix5() {
  const s = 164;
  const c = createCanvas(s, s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0D1117';
  ctx.fillRect(0, 0, s, s);

  // Code lines background
  const syntaxColors = ['#FF7B72', '#79C0FF', '#7EE787', '#FFA657', '#D2A8FF'];
  ctx.font = `${Math.round(s * 0.055)}px monospace`;
  ctx.textAlign = 'left';
  const codeSnippets = [
    { text: 'const', color: '#FF7B72' }, { text: ' music', color: '#FFA657' },
    { text: ' = require', color: '#D2A8FF' }, { text: '("beats")', color: '#79C0FF' },
  ];
  // Draw faded code lines
  ctx.globalAlpha = 0.15;
  for (let row = 0; row < 12; row++) {
    ctx.fillStyle = syntaxColors[row % syntaxColors.length];
    const lineText = ['import { flow }', 'let beat = 120;', 'fn compile() {', '  return music;', 'const x = true;', '} // end', 'while (loop)', 'export default', 'async function', 'yield* track()'];
    ctx.fillText(lineText[row % lineText.length], 5, 14 + row * (s * 0.075));
  }
  ctx.globalAlpha = 1;

  // Main text
  ctx.textAlign = 'center';
  ctx.fillStyle = '#7EE787';
  ctx.font = `bold ${Math.round(s * 0.085)}px monospace`;
  ctx.fillText('PROGRAMMING /', s / 2, s * 0.35);
  ctx.fillStyle = '#79C0FF';
  ctx.fillText('CODING / HACKING', s / 2, s * 0.47);
  ctx.fillStyle = '#FF7B72';
  ctx.font = `bold ${Math.round(s * 0.1)}px monospace`;
  ctx.fillText('MUSIC', s / 2, s * 0.6);

  // Blinking cursor
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(s * 0.68, s * 0.54, 2, s * 0.08);

  drawDailyMixOverlay(ctx, s, s, 5);
  addNoise(ctx, s, s, 0.05);
  saveCanvas(c, 'public/images/covers/daily-mix-5.png');
}

function generateDailyMix6() {
  const s = 164;
  const c = createCanvas(s, s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = createGradient(ctx, s, s, ['#2E7D32', '#1B5E20'], 180);
  ctx.fillRect(0, 0, s, s);

  // Spray paint texture
  ctx.fillStyle = 'rgba(205,220,57,0.06)';
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * s, y = Math.random() * s;
    ctx.beginPath(); ctx.arc(x, y, Math.random() * 2, 0, Math.PI * 2); ctx.fill();
  }

  // Guitar silhouette
  ctx.strokeStyle = '#CDDC39';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  // Neck
  ctx.beginPath();
  ctx.moveTo(s * 0.35, s * 0.18);
  ctx.lineTo(s * 0.45, s * 0.52);
  ctx.stroke();
  // Body
  ctx.beginPath();
  ctx.ellipse(s * 0.48, s * 0.6, s * 0.15, s * 0.12, 0.1, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(s * 0.45, s * 0.48, s * 0.1, s * 0.08, 0.1, 0, Math.PI * 2);
  ctx.stroke();

  // Skateboard crossed
  ctx.strokeStyle = 'rgba(205,220,57,0.6)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(s * 0.55, s * 0.2);
  ctx.lineTo(s * 0.7, s * 0.7);
  ctx.stroke();
  // Wheels
  ctx.fillStyle = '#CDDC39';
  ctx.beginPath(); ctx.arc(s * 0.56, s * 0.23, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(s * 0.69, s * 0.67, 3, 0, Math.PI * 2); ctx.fill();

  drawDailyMixOverlay(ctx, s, s, 6);
  addNoise(ctx, s, s, 0.04);
  saveCanvas(c, 'public/images/covers/daily-mix-6.png');
}

function generateRadarNovidades() {
  const s = 164;
  const c = createCanvas(s, s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#121212';
  ctx.fillRect(0, 0, s, s);

  const cx = s / 2, cy = s * 0.45;

  // Concentric radar circles
  for (let r = 15; r <= 60; r += 15) {
    ctx.strokeStyle = `rgba(29,185,84,${0.5 - r * 0.005})`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  }

  // Radar sweep line
  ctx.strokeStyle = 'rgba(29,185,84,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + 50, cy - 35);
  ctx.stroke();

  // Sweep area
  ctx.fillStyle = 'rgba(29,185,84,0.1)';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, 60, -0.8, -0.3);
  ctx.closePath();
  ctx.fill();

  // Center bright dot
  const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 8);
  centerGlow.addColorStop(0, '#1DB954');
  centerGlow.addColorStop(1, 'rgba(29,185,84,0)');
  ctx.fillStyle = centerGlow;
  ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1DB954';
  ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();

  // Blip dots
  ctx.fillStyle = '#FFFFFF';
  const blips = [[0.6, 0.3], [0.35, 0.55], [0.7, 0.5], [0.45, 0.25], [0.58, 0.6]];
  blips.forEach(([x, y]) => {
    ctx.beginPath(); ctx.arc(s * x, s * y, 2, 0, Math.PI * 2); ctx.fill();
  });

  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `${Math.round(s * 0.08)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('Radar de', s / 2, s * 0.8);
  ctx.font = `bold ${Math.round(s * 0.11)}px Arial, sans-serif`;
  ctx.fillText('Novidades', s / 2, s * 0.92);

  addNoise(ctx, s, s, 0.04);
  saveCanvas(c, 'public/images/covers/radar-novidades.png');
}

// ─── 4. ARTISTS ──────────────────────────────────────────────

function generateMatueArtist() {
  const s = 164;
  const c = createCanvas(s, s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = createGradient(ctx, s, s, ['#1A1A2E', '#0A0A14'], 180);
  ctx.fillRect(0, 0, s, s);

  // Blue side lighting
  const sideLight = ctx.createLinearGradient(0, 0, s * 0.3, 0);
  sideLight.addColorStop(0, 'rgba(80,155,245,0.15)');
  sideLight.addColorStop(1, 'rgba(80,155,245,0)');
  ctx.fillStyle = sideLight;
  ctx.fillRect(0, 0, s, s);

  // Face silhouette (80% of canvas)
  ctx.fillStyle = '#1A1A2E';
  // Head
  ctx.beginPath();
  ctx.ellipse(s * 0.5, s * 0.38, s * 0.22, s * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  // Neck + shoulders
  ctx.beginPath();
  ctx.moveTo(s * 0.35, s * 0.6);
  ctx.lineTo(s * 0.1, s * 1.0);
  ctx.lineTo(s * 0.9, s * 1.0);
  ctx.lineTo(s * 0.65, s * 0.6);
  ctx.closePath();
  ctx.fill();

  // Hair (dark)
  ctx.fillStyle = '#0A0A14';
  ctx.beginPath();
  ctx.ellipse(s * 0.5, s * 0.2, s * 0.2, s * 0.12, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Golden sunglasses highlight
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(s * 0.3, s * 0.32, s * 0.15, s * 0.05);
  ctx.fillRect(s * 0.53, s * 0.32, s * 0.15, s * 0.05);
  // Bridge
  ctx.fillRect(s * 0.45, s * 0.335, s * 0.08, s * 0.025);
  // Frame
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 1;
  ctx.strokeRect(s * 0.3, s * 0.32, s * 0.15, s * 0.05);
  ctx.strokeRect(s * 0.53, s * 0.32, s * 0.15, s * 0.05);

  addVignette(ctx, s, s, 0.3);
  addNoise(ctx, s, s, 0.04);
  saveCanvas(c, 'public/images/artists/matue-artist.png');
}

function generateRaffaMoreira() {
  const w = 350, h = 200;
  const c = createCanvas(w, h);
  const ctx = c.getContext('2d');
  ctx.fillStyle = createGradient(ctx, w, h, ['#8B0000', '#2D0000'], 180);
  ctx.fillRect(0, 0, w, h);

  // Smoke/haze
  ctx.globalAlpha = 0.08;
  for (let i = 0; i < 15; i++) {
    const sx = Math.random() * w;
    const sy = Math.random() * h;
    const sr = 30 + Math.random() * 50;
    const smokeGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
    smokeGrad.addColorStop(0, '#FF2D2D');
    smokeGrad.addColorStop(1, 'rgba(255,45,45,0)');
    ctx.fillStyle = smokeGrad;
    ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Red backlight
  const backlight = ctx.createRadialGradient(w * 0.5, h * 0.3, 10, w * 0.5, h * 0.3, 120);
  backlight.addColorStop(0, 'rgba(255,45,45,0.3)');
  backlight.addColorStop(1, 'rgba(255,45,45,0)');
  ctx.fillStyle = backlight;
  ctx.fillRect(0, 0, w, h);

  // Person silhouette with red jacket
  ctx.fillStyle = '#FF2D2D';
  // Head
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.3, 22, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  // Jacket body (slightly turned)
  ctx.beginPath();
  ctx.moveTo(w * 0.35, h * 0.48);
  ctx.lineTo(w * 0.28, h * 1.0);
  ctx.lineTo(w * 0.72, h * 1.0);
  ctx.lineTo(w * 0.65, h * 0.48);
  ctx.closePath();
  ctx.fill();
  // Neck
  ctx.fillRect(w * 0.45, h * 0.45, w * 0.1, h * 0.08);

  // Chain suggestion (golden)
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(w * 0.43, h * 0.52);
  ctx.quadraticCurveTo(w * 0.5, h * 0.62, w * 0.54, h * 0.52);
  ctx.stroke();

  addVignette(ctx, w, h, 0.5);
  addNoise(ctx, w, h, 0.04);
  saveCanvas(c, 'public/images/artists/raffa-moreira.png');
}

// ─── 5. NOW PLAYING (350x350) ─────────────────────────────────

function generate10kEPouco() {
  const s = 350;
  const c = createCanvas(s, s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = createGradient(ctx, s, s, ['#1A0A00', '#3D1C00', '#0A0A0A']);
  ctx.fillRect(0, 0, s, s);

  // Leather/paper texture
  ctx.fillStyle = 'rgba(200,169,110,0.03)';
  for (let i = 0; i < 600; i++) {
    ctx.fillRect(Math.random() * s, Math.random() * s, Math.random() * 4 + 1, 1);
  }

  // "RAFFA MOREIRA" top
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `${Math.round(s * 0.035)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('RAFFA MOREIRA', s / 2, s * 0.1);

  // "PART. KLYN" top right
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = `${Math.round(s * 0.028)}px Arial, sans-serif`;
  ctx.fillText('PART. KLYN', s * 0.92, s * 0.1);

  // "10k" huge text
  ctx.fillStyle = '#C8A96E';
  ctx.font = `bold ${Math.round(s * 0.28)}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('10k', s / 2, s * 0.4);

  // "É Pouco" below
  ctx.font = `${Math.round(s * 0.1)}px Georgia, serif`;
  ctx.fillText('É Pouco', s / 2, s * 0.58);

  // "Eu sei" in cursive/italic
  ctx.fillStyle = '#8B7355';
  ctx.font = `italic ${Math.round(s * 0.08)}px Georgia, serif`;
  ctx.fillText('Eu sei', s / 2, s * 0.7);

  // Ornamental line
  ctx.strokeStyle = '#C8A96E';
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(s * 0.25, s * 0.78);
  ctx.lineTo(s * 0.75, s * 0.78);
  ctx.stroke();
  ctx.globalAlpha = 1;

  addVignette(ctx, s, s, 0.6);
  addNoise(ctx, s, s, 0.05);
  saveCanvas(c, 'public/images/now-playing/10k-e-pouco.png');
}

// ─── 6. EXTRAS (164x164) ──────────────────────────────────────

function generateFlowAbsurdo() {
  const s = 164;
  const c = createCanvas(s, s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, s, s);

  // Energy lines/rays
  ctx.strokeStyle = 'rgba(255,0,0,0.15)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(s / 2, s / 2);
    ctx.lineTo(s / 2 + Math.cos(angle) * s, s / 2 + Math.sin(angle) * s);
    ctx.stroke();
  }

  // "FLOW" huge white text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.round(s * 0.3)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('FLOW', s / 2, s * 0.35);

  // "ABSURDO" red text
  ctx.fillStyle = '#FF0000';
  ctx.font = `bold ${Math.round(s * 0.18)}px Arial, sans-serif`;
  ctx.fillText('ABSURDO', s / 2, s * 0.58);

  // Stylized "!"
  ctx.fillStyle = '#FF0000';
  ctx.font = `bold ${Math.round(s * 0.25)}px Arial, sans-serif`;
  ctx.fillText('!', s * 0.82, s * 0.58);

  // Energy glow around text
  ctx.shadowColor = '#FF0000';
  ctx.shadowBlur = 15;
  ctx.fillStyle = 'rgba(255,0,0,0.05)';
  ctx.fillRect(s * 0.1, s * 0.2, s * 0.8, s * 0.5);
  ctx.shadowBlur = 0;

  addNoise(ctx, s, s, 0.05);
  saveCanvas(c, 'public/images/covers/flow-absurdo.png');
}

function generateMusicasLeituras() {
  const s = 164;
  const c = createCanvas(s, s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = createGradient(ctx, s, s, ['#1A1A2E', '#0F0F1A'], 180);
  ctx.fillRect(0, 0, s, s);

  // Lamp light from top
  const lampLight = ctx.createRadialGradient(s / 2, s * 0.05, 5, s / 2, s * 0.3, s * 0.45);
  lampLight.addColorStop(0, 'rgba(108,91,123,0.25)');
  lampLight.addColorStop(1, 'rgba(108,91,123,0)');
  ctx.fillStyle = lampLight;
  ctx.fillRect(0, 0, s, s);

  // Open book silhouette
  const bx = s / 2, by = s * 0.6;
  ctx.fillStyle = '#1B2A4A';
  // Left page
  ctx.beginPath();
  ctx.moveTo(bx, by - 5);
  ctx.quadraticCurveTo(bx - 32, by - 12, bx - 35, by + 12);
  ctx.lineTo(bx, by + 8);
  ctx.closePath(); ctx.fill();
  // Right page
  ctx.beginPath();
  ctx.moveTo(bx, by - 5);
  ctx.quadraticCurveTo(bx + 32, by - 12, bx + 35, by + 12);
  ctx.lineTo(bx, by + 8);
  ctx.closePath(); ctx.fill();

  // Headphones over book
  ctx.strokeStyle = '#6C5B7B';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  // Headband arc
  ctx.beginPath();
  ctx.arc(bx, by - 18, 22, Math.PI, Math.PI * 2);
  ctx.stroke();
  // Left ear cup
  ctx.fillStyle = '#6C5B7B';
  ctx.beginPath();
  ctx.ellipse(bx - 22, by - 14, 7, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // Right ear cup
  ctx.beginPath();
  ctx.ellipse(bx + 22, by - 14, 7, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Floating music notes
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.font = `${Math.round(s * 0.1)}px serif`;
  ctx.fillText('♪', s * 0.2, s * 0.3);
  ctx.fillText('♫', s * 0.7, s * 0.25);
  ctx.font = `${Math.round(s * 0.08)}px serif`;
  ctx.fillText('♪', s * 0.35, s * 0.18);
  ctx.fillText('♫', s * 0.6, s * 0.4);

  addVignette(ctx, s, s, 0.3);
  addNoise(ctx, s, s, 0.04);
  saveCanvas(c, 'public/images/covers/musicas-leituras.png');
}

// ─── EXECUTE ALL ──────────────────────────────────────────────

console.log('\n  Generating images...\n');

// Quick Access (120x120)
generateLikedSongs();
generateDailyMix1();
generateCodingBootcamp();
generateTrilhaLeitura();
generateFroidDonde();
generateMatue();
generateCerebro100();
generateBrandao85();

// Featured (380x380)
generateRobynLive();

// Feito para você (164x164)
generateDescobertas();
generateDailyMix2();
generateDailyMix3();
generateDailyMix4();
generateDailyMix5();
generateDailyMix6();
generateRadarNovidades();

// Artists
generateMatueArtist();
generateRaffaMoreira();

// Now Playing (350x350)
generate10kEPouco();

// Extras (164x164)
generateFlowAbsurdo();
generateMusicasLeituras();

console.log('\n  All 21 images generated!\n');
