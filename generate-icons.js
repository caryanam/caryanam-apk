const fs = require('fs');
const path = require('path');
const { Jimp } = require('jimp');

const sourceImage = 'c:\\Users\\Laptop On Rent 200\\.gemini\\antigravity\\brain\\6c5b4c4f-be78-4302-964c-bfc81adb0456\\media__1783315214265.jpg';

const androidSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const iosSizes = [
  { size: 20, file: '20' },
  { size: 40, file: '40' },
  { size: 60, file: '60' },
  { size: 29, file: '29' },
  { size: 58, file: '58' },
  { size: 87, file: '87' },
  { size: 80, file: '80' },
  { size: 120, file: '120' },
  { size: 180, file: '180' },
  { size: 76, file: '76' },
  { size: 152, file: '152' },
  { size: 167, file: '167' },
  { size: 1024, file: '1024' }
];

async function generate() {
  try {
    console.log('Loading image...');
    const image = await Jimp.read(sourceImage);
    
    // Android
    console.log('Generating Android icons...');
    const androidRes = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');
    for (const [dir, size] of Object.entries(androidSizes)) {
      const targetDir = path.join(androidRes, dir);
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
      
      const resized = image.clone().resize({ w: size, h: size });
      await resized.write(path.join(targetDir, 'ic_launcher.png'));
      await resized.write(path.join(targetDir, 'ic_launcher_round.png'));
      console.log(`Generated Android ${dir} (${size}x${size})`);
    }

    // iOS
    console.log('Generating iOS icons...');
    const iosDir = path.join(__dirname, 'ios', 'CaryanamApp', 'Images.xcassets', 'AppIcon.appiconset');
    if (!fs.existsSync(iosDir)) fs.mkdirSync(iosDir, { recursive: true });
    
    for (const conf of iosSizes) {
      const resized = image.clone().resize({ w: conf.size, h: conf.size });
      await resized.write(path.join(iosDir, `${conf.size}.png`));
      console.log(`Generated iOS icon ${conf.size}x${conf.size}`);
    }
    
    console.log('Done!');
  } catch (err) {
    console.error(err);
  }
}

generate();
