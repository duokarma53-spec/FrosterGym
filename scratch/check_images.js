import { Jimp } from 'jimp';
import path from 'path';

const files = ['basic-plan.jpeg', 'premium-plan.jpeg', 'stnd-plan.jpeg'];
for (const file of files) {
  const filePath = path.join('public', file);
  try {
    const image = await Jimp.read(filePath);
    console.log(`${file}: ${image.width}x${image.height}`);
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
  }
}
