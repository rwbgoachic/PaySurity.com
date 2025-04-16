import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a 16:9 video thumbnail
const width = 1280;
const height = 720;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Fill background with dark blue
ctx.fillStyle = '#0f172a';
ctx.fillRect(0, 0, width, height);

// Create a grid pattern
ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
ctx.lineWidth = 1;

// Horizontal lines
for (let y = 0; y < height; y += 20) {
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.stroke();
}

// Vertical lines
for (let x = 0; x < width; x += 20) {
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, height);
  ctx.stroke();
}

// Create a gradient overlay
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, 'rgba(79, 70, 229, 0.2)');
gradient.addColorStop(1, 'rgba(16, 24, 39, 0.8)');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

// Draw a big rectangle for UI mockup
ctx.save();
ctx.translate(width - 150, height - 100);
ctx.rotate(-15 * Math.PI / 180);
ctx.fillStyle = 'rgba(79, 70, 229, 0.3)';
ctx.fillRect(-300, -250, 500, 500);
ctx.restore();

// Draw a small rectangle for UI mockup
ctx.save();
ctx.translate(150, 120);
ctx.rotate(10 * Math.PI / 180);
ctx.fillStyle = 'rgba(79, 70, 229, 0.2)';
ctx.fillRect(-150, -150, 300, 300);
ctx.restore();

// Add logo text
ctx.font = 'bold 48px Arial';
const logoGradient = ctx.createLinearGradient(width/2 - 100, height/2 - 80, width/2 + 100, height/2 - 30);
logoGradient.addColorStop(0, '#6366f1');
logoGradient.addColorStop(1, '#a855f7');
ctx.fillStyle = logoGradient;
ctx.textAlign = 'center';
ctx.fillText('PaySurity', width/2, height/2 - 50);

// Add tagline
ctx.font = '28px Arial';
ctx.fillStyle = 'white';
ctx.fillText('Seamless Payment Processing', width/2, height/2);

// Add play button
ctx.beginPath();
ctx.arc(width/2, height/2 + 60, 40, 0, Math.PI * 2);
ctx.fillStyle = logoGradient;
ctx.fill();

// Draw play icon
ctx.beginPath();
ctx.moveTo(width/2 - 10, height/2 + 45);
ctx.lineTo(width/2 + 15, height/2 + 60);
ctx.lineTo(width/2 - 10, height/2 + 75);
ctx.closePath();
ctx.fillStyle = 'white';
ctx.fill();

// Save the image
const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
fs.writeFileSync(path.join(__dirname, 'video-thumbnail.jpg'), buffer);
console.log('Video thumbnail created successfully');