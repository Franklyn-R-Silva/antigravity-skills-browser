const assert = require('node:assert/strict');
const test = require('node:test');

const skills = require('../skills.json');
const translations = require('../skills-pt.json');

const SKILL_NAME_PATTERN = /^[a-z0-9][a-z0-9._-]{0,127}$/;

test('bundled catalog has unique, well-formed entries', () => {
  assert.ok(Array.isArray(skills));
  assert.ok(skills.length > 0);

  const ids = new Set();
  const names = new Set();

  for (const skill of skills) {
    assert.equal(typeof skill.id, 'string');
    assert.equal(typeof skill.name, 'string');
    assert.equal(typeof skill.category, 'string');
    assert.equal(typeof skill.description, 'string');
    assert.match(skill.name, SKILL_NAME_PATTERN);
    assert.ok(!ids.has(skill.id), `duplicate skill id: ${skill.id}`);
    assert.ok(!names.has(skill.name), `duplicate skill name: ${skill.name}`);
    ids.add(skill.id);
    names.add(skill.name);
  }
});

test('Portuguese descriptions exactly cover the bundled catalog', () => {
  const ids = new Set(skills.map((skill) => skill.id));
  const translatedIds = Object.keys(translations);

  assert.equal(translatedIds.length, ids.size);
  for (const id of ids) {
    assert.equal(typeof translations[id], 'string', `missing translation: ${id}`);
    assert.ok(translations[id].trim().length > 0, `empty translation: ${id}`);
  }
  for (const id of translatedIds) {
    assert.ok(ids.has(id), `orphan translation: ${id}`);
  }
});
