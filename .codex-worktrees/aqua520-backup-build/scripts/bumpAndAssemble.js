#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

function replaceFileSync(file, replacer) {
  const p = path.resolve(process.cwd(), file);
  const src = fs.readFileSync(p, 'utf8');
  const out = replacer(src);
  if (out && out !== src) fs.writeFileSync(p, out, 'utf8');
}

function bumpVersionCode() {
  const gradlePath = 'android/app/build.gradle';
  let bumped = false;
  replaceFileSync(gradlePath, (txt) => {
    return txt.replace(/versionCode\s+(\d+)/, (_, n) => {
      bumped = true;
      const next = String(parseInt(n, 10) + 1);
      console.log(`versionCode: ${n} -> ${next}`);
      return `versionCode ${next}`;
    });
  });
  if (!bumped) console.warn('versionCode not found to bump');
}

function ensureUniversalApk() {
  const gradlePath = 'android/app/build.gradle';
  replaceFileSync(gradlePath, (txt) => {
    if (txt.includes('universalApk true')) return txt; // already present
    const injectAt = txt.indexOf('buildTypes {');
    if (injectAt === -1) return txt;
    const block = `
    // Generated: universal APK for broad device support
    splits {
        abi {
            enable true
            reset()
            include 'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'
            universalApk true
        }
    }
`;
    return txt.replace('buildTypes {', block + '\n    buildTypes {');
  });
}

function assembleRelease() {
  const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
  const cwd = path.resolve(process.cwd(), 'android');
  console.log('Assembling release (universal)...');
  cp.spawnSync(gradlew, ['assembleRelease'], { stdio: 'inherit', cwd, shell: true });
}

try {
  bumpVersionCode();
  ensureUniversalApk();
  assembleRelease();
  console.log('Done. Check android/app/build/outputs/apk/release for APKs.');
} catch (e) {
  console.error('Build script failed:', e);
  process.exit(1);
}

