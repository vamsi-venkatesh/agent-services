import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validatePack, graphRules } from '../tools/validate-pack.mjs';

const repo = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const packs = readdirSync(join(repo, 'packs'));
const graphOf = (id) => JSON.parse(readFileSync(join(repo, 'packs', id, 'graph.json'), 'utf8'));

test('every pack in the repository validates', () => {
  assert.equal(packs.length, 3);
  for (const id of packs) {
    assert.deepEqual(validatePack(join(repo, 'packs', id)), [], `${id} should validate`);
  }
});

test('a graph with two human gates is rejected', () => {
  const graph = graphOf('mcp-integration');
  const verifier = graph.nodes.find((node) => node.type === 'independent_verifier');
  verifier.type = 'human_gate';
  const errors = graphRules(graph);
  assert.ok(errors.some((error) => error.includes('exactly one human_gate')), errors.join('; '));
});

test('a graph with no human gate is rejected', () => {
  const graph = graphOf('mcp-integration');
  const gate = graph.nodes.find((node) => node.type === 'human_gate');
  gate.type = 'policy_decision';
  const errors = graphRules(graph);
  assert.ok(errors.some((error) => error.includes('found 0')), errors.join('; '));
});

test('an authorized write reachable without the gate is rejected', () => {
  const graph = graphOf('mcp-integration');
  const gate = graph.nodes.find((node) => node.type === 'human_gate');
  const authorized = graph.nodes.find((node) => node.sideEffect === 'authorized');
  const decision = graph.nodes.find((node) => node.type === 'policy_decision');
  graph.edges.push({
    id: `${decision.id}__clean__${authorized.id}`,
    source: decision.id,
    target: authorized.id,
    branchType: 'clean',
  });
  graph.edgeCount += 1;
  const errors = graphRules(graph);
  assert.ok(
    errors.some((error) => error.includes(`reachable without passing ${gate.id}`)),
    errors.join('; '),
  );
});

test('an unreachable node is rejected', () => {
  const graph = graphOf('n8n-automation-rescue');
  const orphaned = graph.nodes.find((node) => node.type === 'independent_verifier');
  graph.edges = graph.edges.filter((edge) => edge.target !== orphaned.id);
  graph.edgeCount = graph.edges.length;
  const errors = graphRules(graph);
  assert.ok(errors.some((error) => error.includes(`${orphaned.id} is unreachable`)), errors.join('; '));
});
