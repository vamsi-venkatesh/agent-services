import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runMock } from '../tools/run-mock.mjs';
import { verifyBundle } from '../tools/verify-bundle.mjs';

const repo = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const packs = readdirSync(join(repo, 'packs'));
const graphOf = (id) => JSON.parse(readFileSync(join(repo, 'packs', id, 'graph.json'), 'utf8'));

test('the same input produces the same sealed hash', () => {
  for (const id of packs) {
    const graph = graphOf(id);
    for (const options of [
      { route: 'clean' },
      { route: 'exception' },
      { route: 'exception', decision: 'approve' },
      { route: 'exception', decision: 'reject' },
    ]) {
      const first = runMock(graph, options);
      const second = runMock(graph, options);
      assert.equal(first.sha256, second.sha256, `${id} ${JSON.stringify(options)}`);
      assert.deepEqual(first, second);
    }
  }
});

test('different routes produce different hashes', () => {
  const graph = graphOf('document-operations');
  const hashes = new Set([
    runMock(graph, { route: 'clean' }).sha256,
    runMock(graph, { route: 'exception' }).sha256,
    runMock(graph, { route: 'exception', decision: 'approve' }).sha256,
    runMock(graph, { route: 'exception', decision: 'reject' }).sha256,
  ]);
  assert.equal(hashes.size, 4);
});

test('every emitted bundle verifies against its own hash', () => {
  for (const id of packs) {
    const bundle = runMock(graphOf(id), { route: 'exception', decision: 'approve' });
    assert.equal(verifyBundle(bundle).match, true, id);
  }
});

test('the exception route holds at the gate when no decision is given', () => {
  for (const id of packs) {
    const graph = graphOf(id);
    const gate = graph.nodes.find((node) => node.type === 'human_gate');
    const bundle = runMock(graph, { route: 'exception' });

    assert.equal(bundle.verdict, 'held', id);
    assert.equal(bundle.outcome, gate.id, id);

    const kinds = bundle.receipts.map((receipt) => `${receipt.kind}.${receipt.status}`);
    assert.ok(kinds.includes('gate.held'), id);
    assert.ok(!kinds.includes('gate.decided'), id);
    assert.equal(bundle.totals.externalSends, 0, id);

    const touched = bundle.receipts.map((receipt) => receipt.detail.nodeId);
    for (const node of graph.nodes) {
      if (node.sideEffect === 'authorized') assert.ok(!touched.includes(node.id), `${id} ${node.id}`);
    }
  }
});

test('a rejection reaches a terminal and writes nothing', () => {
  for (const id of packs) {
    const bundle = runMock(graphOf(id), { route: 'exception', decision: 'reject' });
    assert.equal(bundle.verdict, 'rejected', id);
    assert.equal(bundle.totals.externalSends, 0, id);
    const sealed = bundle.receipts.at(-1);
    assert.equal(`${sealed.kind}.${sealed.status}`, 'evidence.sealed', id);
    assert.equal(sealed.detail.authorizedWrites, 0, id);
  }
});

test('an approval passes the gate and reaches an authorized write', () => {
  for (const id of packs) {
    const bundle = runMock(graphOf(id), { route: 'exception', decision: 'approve' });
    assert.equal(bundle.verdict, 'completed', id);
    const sealed = bundle.receipts.at(-1);
    assert.ok(sealed.detail.authorizedWrites >= 1, id);
    const kinds = bundle.receipts.map((receipt) => `${receipt.kind}.${receipt.status}`);
    assert.ok(kinds.indexOf('gate.decided') < kinds.lastIndexOf('node.terminal'), id);
  }
});

test('the clean route never reaches the gate', () => {
  for (const id of packs) {
    const graph = graphOf(id);
    const gate = graph.nodes.find((node) => node.type === 'human_gate');
    const bundle = runMock(graph, { route: 'clean' });
    assert.equal(bundle.verdict, 'completed', id);
    assert.ok(!bundle.receipts.some((receipt) => receipt.detail.nodeId === gate.id), id);
  }
});

test('an unknown route or decision is refused', () => {
  const graph = graphOf('mcp-integration');
  assert.throws(() => runMock(graph, { route: 'sideways' }), /unknown route/);
  assert.throws(() => runMock(graph, { route: 'exception', decision: 'maybe' }), /unknown decision/);
});
