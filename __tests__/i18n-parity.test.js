'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.join(__dirname, '..');

function readLocale(language) {
  return JSON.parse(
    fs.readFileSync(path.join(projectRoot, 'src', 'i18n', `${language}.json`), 'utf8')
  );
}

function flatten(value, prefix = '', result = {}) {
  for (const [key, entry] of Object.entries(value)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
      flatten(entry, fullKey, result);
    } else {
      result[fullKey] = entry;
    }
  }
  return result;
}

function placeholders(value) {
  if (typeof value !== 'string') return [];
  return [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
}

test('italiano e inglese espongono le stesse chiavi di traduzione', () => {
  const italian = flatten(readLocale('it'));
  const english = flatten(readLocale('en'));

  assert.deepEqual(Object.keys(english).sort(), Object.keys(italian).sort());
});

test('le traduzioni inglesi mantengono i segnaposto dinamici italiani', () => {
  const italian = flatten(readLocale('it'));
  const english = flatten(readLocale('en'));

  for (const key of Object.keys(italian)) {
    assert.deepEqual(placeholders(english[key]), placeholders(italian[key]), key);
  }
});
