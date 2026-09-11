#!/usr/bin/env node
// Every number in README.md comes from a file in this repository. This checks
// that it still does: the pack table against graph.json and harness.json, and
// the evidence paragraph against the bundle itself.
//
//   node tools/readme-check.mjs

import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

export function readmeErrors() {
  const readme = readFileSync(join(repo, 'README.md'), 'utf8');
  const errors = [];

  const rows = readme
    .split('\n')
    .filter((line) => /^\| `[a-z0-9-]+` \|/.test(line))
    .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()));

  if (rows.length === 0) errors.push('README: the pack table has no rows');

  for (const [name, , nodes, gates, harness, notApplicable] of rows) {
    const id = name.replace(/`/g, '');
    const directory = join(repo, 'packs', id);
    if (!existsSync(directory)) {
      errors.push(`README: table names ${id}, which is not a pack directory`);
      continue;
    }
    const graph = readJson(join(directory, 'graph.json'));
    const report = readJson(join(directory, 'harness.json'));

    if (Number(nodes) !== graph.nodeCount) errors.push(`${id}: table says ${nodes} nodes, graph.json says ${graph.nodeCount}`);
    if (Number(gates) !== graph.humanGateCount) errors.push(`${id}: table says ${gates} human gates, graph.json says ${graph.humanGateCount}`);

    const expected = `${report.passed} / ${report.cases}`;
    if (harness !== expected) errors.push(`${id}: table says ${harness}, harness.json says ${expected}`);
    if (Number(notApplicable) !== report.notApplicable) {
      errors.push(`${id}: table says ${notApplicable} not applicable, harness.json says ${report.notApplicable}`);
    }
  }

  const packIds = rows.map(([name]) => name.replace(/`/g, ''));
  const suite = new Set();
  for (const id of packIds) suite.add(readJson(join(repo, 'packs', id, 'harness.json')).cases);
  if (suite.size === 1) {
    const cases = [...suite][0];
    if (!readme.includes(`${cases}-case harness`)) errors.push(`README: no mention of the ${cases}-case harness`);
  }

  const bundlePath = join(repo, 'packs/document-operations/evidence/run-37c494ba.evidence.json');
  const bundle = readJson(bundlePath);
  if (!readme.includes(bundle.sha256)) errors.push('README: the bundle sha256 is not quoted');
  if (!readme.includes(`${bundle.receipts.length} receipts`)) {
    errors.push(`README: the bundle's receipt count (${bundle.receipts.length}) is not stated`);
  }

  const graphSchema = readJson(join(repo, 'schema/graph.v1.schema.json'));
  const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen'];
  const nodeTypes = graphSchema.$defs.nodeType.enum.length;
  const branchTypes = graphSchema.$defs.branchType.enum.length;
  if (!readme.includes(`${words[nodeTypes]} node types`)) errors.push(`README: the schema defines ${nodeTypes} node types`);
  if (!readme.includes(`${words[branchTypes]} branch types`)) errors.push(`README: the schema defines ${branchTypes} branch types`);

  const packSchema = readJson(join(repo, 'schema/service-pack-definition.v1.schema.json'));
  const blocks = packSchema.required.filter((key) => !['schema', 'packId'].includes(key)).length;
  if (!readme.includes(`${words[blocks] ?? blocks} blocks`)) errors.push(`README: the definition has ${blocks} blocks`);

  return errors;
}

function main() {
  const errors = readmeErrors();
  for (const error of errors) console.error(error);
  if (errors.length) {
    console.error(`${errors.length} README claim${errors.length === 1 ? '' : 's'} do not match the data.`);
    process.exit(1);
  }
  console.log('ok   README matches graph.json, harness.json and the evidence bundle');
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main();
}
