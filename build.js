const fs = require('fs-extra');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

async function build() {
  try {
    // Ensure dist directory exists and is empty
    await fs.emptyDir(distDir);
    
    // Copy src directory content to dist
    await fs.copy(srcDir, distDir);
    
    console.log('Build completed successfully!');
  } catch (err) {
    console.error('Error during build:', err);
    process.exit(1);
  }
}

build();
