const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const manifest = require('../package.json');
const lockfile = require('../package-lock.json');

test('package and lockfile versions stay aligned', () => {
  assert.equal(lockfile.version, manifest.version);
  assert.equal(lockfile.packages[''].version, manifest.version);
});

test('declared commands and views are implemented by the extension', () => {
  const source = fs.readFileSync(path.join(root, 'extension.js'), 'utf8');
  const commandIds = manifest.contributes.commands.map((command) => command.command);
  const viewIds = Object.values(manifest.contributes.views)
    .flat()
    .map((view) => view.id);

  for (const id of [...commandIds, ...viewIds]) {
    assert.ok(source.includes(id), `extension.js does not reference ${id}`);
  }
});

test('development-only files are excluded from the VSIX', () => {
  const ignored = fs.readFileSync(path.join(root, '.vscodeignore'), 'utf8');
  for (const pattern of ['.github/**', 'node_modules/**', 'scripts/**', 'test/**']) {
    assert.ok(ignored.includes(pattern), `missing .vscodeignore rule: ${pattern}`);
  }
});
