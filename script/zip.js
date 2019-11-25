const fs = require('fs')
const path = require('path')
const archiver = require('archiver');

const archive = archiver('zip', { zlib: { level: 9 }});
const stream = fs.createWriteStream(path.join(__dirname, '../out.zip'));

archive
.directory(path.join(__dirname, '../out'), false)
.on('error', err => {console.error(err)})
.pipe(stream)
;

stream.on('close', () => {console.log(`done`)});
archive.finalize();