#!/usr/bin/env node
// Validates a pack directory: pack.json against the service pack definition
// schema, graph.json against the graph schema, and then the structural rules a
// schema cannot state.
//
//   node tools/validate-pack.mjs packs/document-operations
//   node tools/validate-pack.mjs packs/*            (every pack)

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validate } from './schema.mjs';

const here = fileURLToPath(new URL('.', import.meta.url));
const repo = resolve(here, '..');

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

const packSchema = readJson(join(repo, 'schema/service-pack-definition.v1.schema.json'));
const graphSchema = readJson(join(repo, 'schema/graph.v1.schema.json'));

/** Structural rules. Each returns an error string, or null when it holds. */
export function graphRules(graph) {
  const errors = [];
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));

  for (const edge of graph.edges) {
    if (!nodes.has(edge.source)) errors.push(`edge ${edge.id}: unknown source ${edge.source}`);
    if (!nodes.has(edge.target)) errors.push(`edge ${edge.id}: unknown target ${edge.target}`);
  }
  if (!nodes.has(graph.startNodeId)) errors.push(`startNodeId ${graph.startNodeId} is not a node`);
  if (graph.nodeCount !== graph.nodes.length) errors.push(`nodeCount ${graph.nodeCount} does not match ${graph.nodes.length} nodes`);
  if (graph.edgeCount !== graph.edges.length) errors.push(`edgeCount ${graph.edgeCount} does not match ${graph.edges.length} edges`);
  if (errors.length) return errors;

  // One human gate, and the count says so.
  const gates = graph.nodes.filter((node) => node.type === 'human_gate');
  if (gates.length !== 1) errors.push(`expected exactly one human_gate node, found ${gates.length}`);
  if (graph.humanGateCount !== gates.length) errors.push(`humanGateCount ${graph.humanGateCount} does not match ${gates.length} human_gate nodes`);
  if (gates.length !== 1) return errors;
  const gate = gates[0];

  // The gate is left by exactly one approval edge and one rejection edge.
  const fromGate = graph.edges.filter((edge) => edge.source === gate.id);
  for (const branch of ['approval', 'rejection']) {
    const count = fromGate.filter((edge) => edge.branchType === branch).length;
    if (count !== 1) errors.push(`gate ${gate.id}: expected one ${branch} edge, found ${count}`);
  }

  const reach = (skip) => {
    const out = new Map();
    for (const edge of graph.edges) out.set(edge.source, [...(out.get(edge.source) ?? []), edge.target]);
    const seen = new Set();
    const stack = [graph.startNodeId];
    while (stack.length) {
      const id = stack.pop();
      if (seen.has(id) || id === skip) continue;
      seen.add(id);
      stack.push(...(out.get(id) ?? []));
    }
    return seen;
  };

  // No authorized write is reachable without passing the gate.
  const withoutGate = reach(gate.id);
  for (const node of graph.nodes) {
    if (node.sideEffect === 'authorized' && withoutGate.has(node.id)) {
      errors.push(`node ${node.id}: an authorized side effect is reachable without passing ${gate.id}`);
    }
  }

  // Every node, and so every terminal, is reachable from the start.
  const reachable = reach(null);
  for (const node of graph.nodes) {
    if (!reachable.has(node.id)) errors.push(`node ${node.id} is unreachable from ${graph.startNodeId}`);
  }
  const terminals = graph.nodes.filter((node) => node.type === 'terminal');
  if (terminals.length === 0) errors.push('the graph has no terminal node');
  for (const terminal of terminals) {
    if (graph.edges.some((edge) => edge.source === terminal.id)) {
      errors.push(`terminal ${terminal.id} has an outgoing edge`);
    }
  }
  // Every non-terminal node leads somewhere.
  for (const node of graph.nodes) {
    if (node.type === 'terminal') continue;
    if (!graph.edges.some((edge) => edge.source === node.id)) {
      errors.push(`node ${node.id} has no outgoing edge and is not a terminal`);
    }
  }
  return errors;
}

/** Rules that tie the definition to the compiled graph. */
export function packRules(pack, graph) {
  const errors = [];
  if (graph && pack.packId !== graph.serviceId) {
    errors.push(`packId ${pack.packId} does not match graph serviceId ${graph.serviceId}`);
  }
  if (pack.humanGates.gates.length < 1) errors.push('the definition declares no human gate');

  const stepIds = new Set(pack.workflowSteps.steps.map((step) => step.id));
  for (const gate of pack.decisionGates.gates) {
    if (!stepIds.has(gate.stepId)) errors.push(`decision gate ${gate.id}: unknown stepId ${gate.stepId}`);
  }
  for (const receipt of pack.receipts.items) {
    if (!stepIds.has(receipt.stepId)) errors.push(`receipt ${receipt.id}: unknown stepId ${receipt.stepId}`);
  }
  for (const entry of pack.agents.participation) {
    for (const stepId of entry.stepIds) {
      if (!stepIds.has(stepId)) errors.push(`agent ${entry.id}: unknown stepId ${stepId}`);
    }
  }
  for (const counter of pack.simulationFixture.counters) {
    if (!stepIds.has(counter.stepId)) errors.push(`counter ${counter.label}: unknown stepId ${counter.stepId}`);
  }

  const gateIds = new Set(pack.humanGates.gates.map((gate) => gate.id));
  for (const action of pack.actions.actions) {
    if (action.requiresGateId && !gateIds.has(action.requiresGateId)) {
      errors.push(`action ${action.id}: unknown gate ${action.requiresGateId}`);
    }
    if (action.consequential && !action.reversible && !action.requiresGateId) {
      errors.push(`action ${action.id}: an irreversible consequential action has no human gate`);
    }
  }

  const artifactIds = new Set(pack.artifacts.artifacts.map((artifact) => artifact.id));
  for (const card of pack.publicOutput.cards) {
    if (!artifactIds.has(card.artifactId)) errors.push(`public output card: unknown artifact ${card.artifactId}`);
  }

  const terminalIds = new Set(pack.branching.terminals.map((terminal) => terminal.id));
  const pathIds = new Set(pack.branching.paths.map((path) => path.id));
  const endpoints = new Set([...stepIds, ...terminalIds, ...gateIds]);
  for (const path of pack.branching.paths) {
    if (!endpoints.has(path.to)) {
      errors.push(`path ${path.id}: destination ${path.to} is not a step, terminal or human gate`);
    }
    if (!endpoints.has(path.from)) {
      errors.push(`path ${path.id}: origin ${path.from} is not a step, terminal or human gate`);
    }
  }
  for (const terminal of pack.branching.terminals) {
    if (terminal.resumesVia && !pathIds.has(terminal.resumesVia)) {
      errors.push(`terminal ${terminal.id}: unknown resume path ${terminal.resumesVia}`);
    }
  }
  if (pack.branching.archivePath && !pathIds.has(pack.branching.archivePath)) {
    errors.push(`archivePath ${pack.branching.archivePath} is not a declared path`);
  }
  return errors;
}

export function validatePack(directory) {
  const errors = [];
  const packPath = join(directory, 'pack.json');
  const graphPath = join(directory, 'graph.json');
  if (!existsSync(packPath)) return [`${directory}: no pack.json`];

  const pack = readJson(packPath);
  errors.push(...validate(pack, packSchema, 'pack.json').map((error) => `schema: ${error}`));

  let graph = null;
  if (existsSync(graphPath)) {
    graph = readJson(graphPath);
    errors.push(...validate(graph, graphSchema, 'graph.json').map((error) => `schema: ${error}`));
    if (!errors.length) errors.push(...graphRules(graph).map((error) => `graph: ${error}`));
  }
  if (!errors.length) errors.push(...packRules(pack, graph).map((error) => `pack: ${error}`));
  return errors;
}

function main(args) {
  const targets = args.length
    ? args
    : readdirSync(join(repo, 'packs'))
        .map((name) => join(repo, 'packs', name))
        .filter((path) => statSync(path).isDirectory());

  let failed = 0;
  for (const target of targets) {
    const directory = resolve(target);
    const errors = validatePack(directory);
    if (errors.length) {
      failed += 1;
      console.error(`FAIL ${basename(directory)}`);
      for (const error of errors) console.error(`  ${error}`);
    } else {
      console.log(`ok   ${basename(directory)}`);
    }
  }
  if (failed) {
    console.error(`${failed} pack${failed === 1 ? '' : 's'} failed validation.`);
    process.exit(1);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main(process.argv.slice(2));
}
