import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

/**
 * Clean, standard ZIP generator in pure Node.js (zero extra dependencies).
 * Generates official PKZIP archives with forward slashes (/) and correct root folder.
 */

function createZip(sourceDir, rootFolderName, outputPaths) {
  const files = [];

  function scanDir(dir, baseRel = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = baseRel ? `${baseRel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        scanDir(fullPath, relPath);
      } else if (entry.isFile()) {
        files.push({
          fullPath,
          entryName: `${rootFolderName}/${relPath.replace(/\\/g, '/')}`,
        });
      }
    }
  }

  scanDir(sourceDir);

  // Build ZIP buffer
  const localHeaders = [];
  const centralHeaders = [];
  let offset = 0;

  for (const file of files) {
    const data = fs.readFileSync(file.fullPath);
    const uncompressedSize = data.length;
    const compressedData = zlib.deflateRawSync(data, { level: 9 });
    const compressedSize = compressedData.length;
    const crc = crc32(data);
    const nameBuffer = Buffer.from(file.entryName, 'utf8');

    // Local file header (30 bytes + name length)
    const localHeader = Buffer.alloc(30 + nameBuffer.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // signature
    localHeader.writeUInt16LE(20, 4);         // version needed (2.0)
    localHeader.writeUInt16LE(0, 6);          // general purpose bit flag
    localHeader.writeUInt16LE(8, 8);          // compression method (deflate)
    localHeader.writeUInt16LE(0, 10);         // last mod file time
    localHeader.writeUInt16LE(0, 12);         // last mod file date
    localHeader.writeUInt32LE(crc, 14);       // crc-32
    localHeader.writeUInt32LE(compressedSize, 18);   // compressed size
    localHeader.writeUInt32LE(uncompressedSize, 22); // uncompressed size
    localHeader.writeUInt16LE(nameBuffer.length, 26);// file name length
    localHeader.writeUInt16LE(0, 28);         // extra field length
    nameBuffer.copy(localHeader, 30);

    localHeaders.push(localHeader, compressedData);

    // Central directory header (46 bytes + name length)
    const centralHeader = Buffer.alloc(46 + nameBuffer.length);
    centralHeader.writeUInt32LE(0x02014b50, 0); // signature
    centralHeader.writeUInt16LE(20, 4);         // version made by
    centralHeader.writeUInt16LE(20, 6);         // version needed
    centralHeader.writeUInt16LE(0, 8);          // bit flag
    centralHeader.writeUInt16LE(8, 10);         // compression method
    centralHeader.writeUInt16LE(0, 12);         // file time
    centralHeader.writeUInt16LE(0, 14);         // file date
    centralHeader.writeUInt32LE(crc, 16);       // crc32
    centralHeader.writeUInt32LE(compressedSize, 20);
    centralHeader.writeUInt32LE(uncompressedSize, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);         // extra field length
    centralHeader.writeUInt16LE(0, 32);         // file comment length
    centralHeader.writeUInt16LE(0, 34);         // disk number start
    centralHeader.writeUInt16LE(0, 36);         // internal file attributes
    centralHeader.writeUInt32LE(0, 38);         // external file attributes
    centralHeader.writeUInt32LE(offset, 42);    // relative offset of local header
    nameBuffer.copy(centralHeader, 46);

    centralHeaders.push(centralHeader);

    offset += localHeader.length + compressedData.length;
  }

  const centralDirOffset = offset;
  const centralDirBuffer = Buffer.concat(centralHeaders);
  const centralDirSize = centralDirBuffer.length;

  // End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // signature
  eocd.writeUInt16LE(0, 4);          // disk number
  eocd.writeUInt16LE(0, 6);          // disk with central dir
  eocd.writeUInt16LE(files.length, 8); // total entries on disk
  eocd.writeUInt16LE(files.length, 10); // total entries
  eocd.writeUInt32LE(centralDirSize, 12); // size of central directory
  eocd.writeUInt32LE(centralDirOffset, 16); // offset of central dir
  eocd.writeUInt16LE(0, 20);         // comment length

  const finalZipBuffer = Buffer.concat([
    ...localHeaders,
    centralDirBuffer,
    eocd,
  ]);

  for (const outPath of outputPaths) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, finalZipBuffer);
    console.log(`Created: ${outPath} (${(finalZipBuffer.length / 1024).toFixed(1)} KB)`);
  }
}

// CRC32 implementation
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buffer[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const source = path.resolve(process.cwd(), 'wordpress-theme/np-news-metro');
const version = '1.0.1';

const targets = [
  path.resolve(process.cwd(), `np-news-metro-v${version}.zip`),
  path.resolve(process.cwd(), `np_news_metro_v${version}.zip`),
  path.resolve(process.cwd(), 'np-news-metro.zip'),
  path.resolve(process.cwd(), 'np_news_metro.zip'),
  path.resolve(process.cwd(), `wordpress-theme/np-news-metro-v${version}.zip`),
  path.resolve(process.cwd(), 'wordpress-theme/np-news-metro.zip'),
];

createZip(source, 'np-news-metro', targets);
