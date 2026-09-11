#!/usr/bin/env node
// Recomputes an evidence bundle's sha256 from its receipts and compares it with
// the hash the bundle states.
//
//   node tools/verify-bundle.mjs packs/document-operations/evidence/run-37c494ba.evidence.json
//
// The hash is taken over the canonical receipt lines, in ledger order:
//
//   sha256( schema + "\n" + receipts.length + "\n" + each JSON.stringify(receipt) + "\n" )
//
// Exit status is 1 on a mismatch.

import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function receiptsSha256(schema, receipts) {
  const hash = createHash('sha256');
  hash.update(`${schema}\n${receipts.length}\n`);
  for (const receipt of receipts) hash.update(`${JSON.stringify(receipt)}\n`);
  return hash.digest('hex');
}

export function verifyBundle(bundle) {
  const computed = receiptsSha256(bundle.schema, bundle.receipts);
  return {
    computed,
    stated: bundle.sha256,
    match: computed === bundle.sha256,
    countMatch: bundle.receiptsSealed === bundle.receipts.length,
  };
}

function main(args) {
  if (args.length !== 1) {
    console.error('usage: node tools/verify-bundle.mjs <bundle.json>');
    process.exit(2);
  }
  const path = resolve(args[0]);
  const bundle = JSON.parse(readFileSync(path, 'utf8'));
  const result = verifyBundle(bundle);

  console.log(`bundle    ${path}`);
  console.log(`schema    ${bundle.schema}`);
  console.log(`run       ${bundle.runId}`);
  console.log(`pack      ${bundle.packId}`);
  console.log(`lane      ${bundle.lane}`);
  console.log(`receipts  ${bundle.receipts.length} sealed, ${bundle.receiptsSealed} stated`);
  console.log(`stated    ${result.stated}`);
  console.log(`computed  ${result.computed}`);
  console.log(result.match && result.countMatch ? 'match' : 'MISMATCH');
  if (!result.match || !result.countMatch) process.exit(1);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main(process.argv.slice(2));
}
