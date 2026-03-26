const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function copyBabelTypesOverrides() {
  const srcRoot = path.join(root, 'overrides', '@babel', 'types', 'lib');
  const destRoot = path.join(root, 'node_modules', '@babel', 'types', 'lib');

  if (!fs.existsSync(srcRoot)) {
    throw new Error(`Missing overrides directory at ${srcRoot}`);
  }

  if (!fs.existsSync(destRoot)) {
    fs.mkdirSync(destRoot, { recursive: true });
  }

  for (const entry of fs.readdirSync(srcRoot)) {
    const src = path.join(srcRoot, entry);
    const dest = path.join(destRoot, entry);
    if (!fs.existsSync(src)) {
      continue;
    }
    fs.rmSync(dest, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.cpSync(src, dest, { recursive: true });
  }
}

function copyCoreJsCompat() {
  const source = path.join(root, 'node_modules', 'core-js-compat');
  const destRoot = path.join(root, 'node_modules', '@babel', 'plugin-transform-runtime', 'node_modules');
  const dest = path.join(destRoot, 'core-js-compat');

  if (!fs.existsSync(source)) {
    throw new Error(`Missing core-js-compat at ${source}`);
  }

  fs.mkdirSync(destRoot, { recursive: true });
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(source, dest, { recursive: true });
  ensureCoreJsCompatDataJs(source);
  ensureCoreJsCompatDataJs(dest);
}

function ensureCoreJsCompatDataJs(targetDir) {
  const dataJson = path.join(targetDir, 'data.json');
  const dataJs = path.join(targetDir, 'data.js');
  if (!fs.existsSync(dataJson)) {
    return;
  }
  const content = "module.exports = require('./data.json');\n";
  if (!fs.existsSync(dataJs) || fs.readFileSync(dataJs, 'utf8') !== content) {
    fs.writeFileSync(dataJs, content, 'utf8');
  }
}

copyBabelTypesOverrides();
copyCoreJsCompat();
