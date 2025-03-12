/**
 * Script to convert 0-byte PNG files to their SVG equivalents
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imgDir = path.join(__dirname, 'public', 'img');
const distImgDir = path.join(__dirname, 'dist', 'img');

// Ensure dist/img directory exists
if (!fs.existsSync(distImgDir)) {
  fs.mkdirSync(distImgDir, { recursive: true });
}

// Process PNG files in public/img
fs.readdirSync(imgDir).forEach(file => {
  if (file.endsWith('.png') && fs.statSync(path.join(imgDir, file)).size === 0) {
    // Check if SVG equivalent exists
    const svgFile = file.replace('.png', '.svg');
    const svgPath = path.join(imgDir, svgFile);
    
    if (fs.existsSync(svgPath)) {
      console.log(`Converting ${file} to use SVG content from ${svgFile}`);
      
      // Copy SVG content to PNG file
      const svgContent = fs.readFileSync(svgPath);
      fs.writeFileSync(path.join(imgDir, file), svgContent);
      
      // Also update in dist directory if it exists
      const distPngPath = path.join(distImgDir, file);
      if (fs.existsSync(distPngPath)) {
        fs.writeFileSync(distPngPath, svgContent);
      }
    } else {
      console.warn(`No SVG equivalent found for ${file}`);
    }
  }
});

console.log('Image conversion complete');
