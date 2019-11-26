const fs = require('fs');
const path = require('path')

const targetPath = path.resolve(__dirname, '../assets/appid.js')

const file = fs.readFileSync(targetPath, 'utf8');

const result = file.replace(/global.AGORA_APPID = (.*)/, `global.AGORA_APPID = "${process.env.AGORA_APPID}"`);

if (process.env.AGORA_APPID) {
  console.log(`======= Agora App ID ${process.env.AGORA_APPID} has been set  =====`)
} else {
  console.log('======= Agora App ID is empty  =====')
}

fs.writeFileSync(targetPath, result);
