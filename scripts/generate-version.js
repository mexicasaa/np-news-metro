import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function getGitCommitHash() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: rootDir, encoding: 'utf8' }).trim();
  } catch {
    return 'rev-' + Date.now().toString(36);
  }
}

function getPackageVersion() {
  try {
    const pkgPath = path.join(rootDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return pkg.version || '1.0.1';
  } catch {
    return '1.0.1';
  }
}

function generateVersionManifest() {
  const version = getPackageVersion();
  const buildHash = getGitCommitHash();
  const buildTime = Date.now();
  const buildDate = new Date(buildTime).toISOString();

  const manifest = {
    version,
    buildTime,
    buildHash,
    buildDate,
    environment: 'production',
  };

  const publicDir = path.join(rootDir, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const targetPath = path.join(publicDir, 'version.json');
  fs.writeFileSync(targetPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`[Version Generator] Generated ${targetPath} (v${version}, commit: ${buildHash}, time: ${buildTime})`);
}

generateVersionManifest();
