import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CATALOG_SHA256, KNOWN_BOOK_IDS } from '../worker/known-books.js';

test('backend book IDs match the exact published browser sample', async () => {
  const root = new URL('../../frontend/public/data/', import.meta.url);
  const catalog = JSON.parse(await readFile(new URL('catalog.json', root), 'utf8'));
  const manifest = JSON.parse(await readFile(new URL('manifest.json', root), 'utf8'));
  assert.equal(CATALOG_SHA256, manifest.files['catalog.json'].sha256);
  assert.deepEqual(KNOWN_BOOK_IDS, new Set(catalog.map(book => book.id)));
});
