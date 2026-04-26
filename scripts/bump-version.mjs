import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PACKAGE_JSON = path.join(ROOT, 'package.json');
const PACKAGE_LOCK_JSON = path.join(ROOT, 'package-lock.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function parseVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    throw new Error(`Invalid version format: ${version}. Expected X.Y.Z`);
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function formatVersion({ major, minor, patch }) {
  return `${major}.${minor}.${patch}`;
}

function incrementVersion(currentVersion) {
  const next = parseVersion(currentVersion);

  next.patch += 1;
  if (next.patch > 99) {
    next.patch = 0;
    next.minor += 1;
  }

  if (next.minor > 99) {
    next.minor = 0;
    next.major += 1;
  }

  if (next.major > 99) {
    next.major = 0;
  }

  return formatVersion(next);
}

function assertRange(version) {
  const { major, minor, patch } = parseVersion(version);
  const inRange = [major, minor, patch].every((n) => n >= 0 && n <= 99);
  if (!inRange) {
    throw new Error(`Version parts must be within 0-99: ${version}`);
  }
}

function setVersion(newVersion) {
  assertRange(newVersion);

  const pkg = readJson(PACKAGE_JSON);
  const lock = readJson(PACKAGE_LOCK_JSON);

  const previous = pkg.version;
  pkg.version = newVersion;

  lock.version = newVersion;
  if (lock.packages && lock.packages['']) {
    lock.packages[''].version = newVersion;
  }

  writeJson(PACKAGE_JSON, pkg);
  writeJson(PACKAGE_LOCK_JSON, lock);

  console.log(`Version updated: ${previous} -> ${newVersion}`);
}

function main() {
  const args = process.argv.slice(2);

  if (args[0] === '--set') {
    const target = args[1];
    if (!target) {
      throw new Error('Missing version after --set. Example: --set 1.7.10');
    }
    setVersion(target);
    return;
  }

  if (args[0] === '--increment') {
    const pkg = readJson(PACKAGE_JSON);
    const next = incrementVersion(pkg.version);
    setVersion(next);
    return;
  }

  throw new Error('Usage: node scripts/bump-version.mjs --increment | --set X.Y.Z');
}

main();
