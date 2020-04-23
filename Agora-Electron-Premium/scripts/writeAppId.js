const fs = require('fs');
const path = require('path')

const targetPath = path.resolve(__dirname, '../src/utils/settings.js')

const file = fs.readFileSync(targetPath, 'utf8');

const result = file.replace(/export const APP_ID = '(.*)'/, `export const APP_ID = "${process.env.AGORA_APP_ID}"`);

if (process.env.AGORA_APP_ID) {
  console.log('======= Agora App ID has been set  =====')
} else {
  console.log('======= Agora App ID is empty  =====')
}

fs.writeFileSync(targetPath, result);