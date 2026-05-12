require('dotenv').config();
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const assetsDir = path.join(__dirname, '../frontend/src/assets');
const outputMap = {};

async function uploadImages() {
  const files = fs.readdirSync(assetsDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
  console.log(`Found ${files.length} images to upload...`);

  for (const file of files) {
    const filePath = path.join(assetsDir, file);
    try {
      console.log(`Uploading ${file}...`);
      const res = await cloudinary.uploader.upload(filePath, {
        folder: 'tiemoc_assets_static',
        use_filename: true,
        unique_filename: false,
        resource_type: 'image'
      });
      outputMap[file] = res.secure_url;
      console.log(`SUCCESS: ${res.secure_url}`);
    } catch (err) {
      console.error(`FAILED to upload ${file}:`, err);
    }
  }

  fs.writeFileSync(path.join(__dirname, 'asset_map.json'), JSON.stringify(outputMap, null, 2));
  console.log('DONE! Wrote to asset_map.json');
}

uploadImages();
