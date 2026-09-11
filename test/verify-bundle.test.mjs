import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyBundle, receiptsSha256 } from '../tools/verify-bundle.mjs';

const repo = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const path = join(repo, 'packs/document-operations/evidence/run-37c494ba.evidence.json');
const bundle = () => JSON.parse(readFileSync(path, 'utf8'));

const SEALED = 'df99eabfb747232ccde95c64309294f3c2df77dab0c4bf75964128dc29f99a93';

test('the sealed bundle reproduces its stated hash', () => {
  const result = verifyBundle(bundle());
  assert.equal(result.stated, SEALED);
  assert.equal(result.computed, SEALED);
  assert.equal(result.match, true);
  assert.equal(result.countMatch, true);
});

test('the bundle seals the receipts it says it seals', () => {
  const sealed = bundle();
  assert.equal(sealed.receipts.length, sealed.receiptsSealed);
  assert.equal(sealed.schema, 'vvdex.evidence-bundle/v1');
  assert.equal(sealed.packId, 'document-operations');
});

test('changing one character of one receipt changes the hash', () => {
  const tampered = bundle();
  tampered.receipts[0].summary = `${tampered.receipts[0].summary}.`;
  const result = verifyBundle(tampered);
  assert.equal(result.match, false);
  assert.notEqual(result.computed, SEALED);
});

test('dropping a receipt changes the hash', () => {
  const short = bundle();
  short.receipts = short.receipts.slice(0, -1);
  assert.notEqual(receiptsSha256(short.schema, short.receipts), SEALED);
});
