#!/usr/bin/env node
// Deterministic replay of a pack's compiled graph. No model, no network, no
// credential: the runner walks graph.json, emits receipts in the evidence
// bundle schema and seals them with the same hash recipe as verify-bundle.mjs.
// The same arguments always produce the same bundle and the same hash.
//
//   node tools/run-mock.mjs packs/document-operations
//   node tools/run-mock.mjs packs/document-operations --route exception --decision reject
//   node tools/run-mock.mjs packs/mcp-integration --route exception --decision approve --out run.json
//
// Routes
//   clean       take the clean branch at every choice
//   exception   take the exception branch where one exists, which leads to the gate
//
// Decision
//   approve     leave the gate by its approval edge
//   reject      leave the gate by its rejection edge
//   (omitted)   the run holds at the gate, which is the point of the gate

import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { receiptsSha256 } from './verify-bundle.mjs';

const SCHEMA = 'vvdex.evidence-bundle/v1';
// A fixed origin, because a wall clock would make the hash unreproducible.
const EPOCH = Date.parse('2026-01-01T00:00:00.000Z');

const digest = (text) => createHash('sha256').update(text).digest('hex');

/** A UUID-shaped identifier derived from the run's own inputs. */
function derivedId(seed) {
  const hex = digest(seed);
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20, 32)].join('-');
}

export function runMock(graph, { route = 'clean', decision = null } = {}) {
  if (!['clean', 'exception'].includes(route)) throw new Error(`unknown route ${route}`);
  if (decision && !['approve', 'reject'].includes(decision)) throw new Error(`unknown decision ${decision}`);

  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
  const outgoing = (id) => graph.edges.filter((edge) => edge.source === id);
  const incoming = (id) => graph.edges.filter((edge) => edge.target === id);

  const runId = derivedId(`${graph.serviceId}|${route}|${decision ?? 'held'}`);
  const receipts = [];
  const emit = (kind, status, summary, detail) => {
    const index = receipts.length;
    receipts.push({
      id: derivedId(`${runId}|${index}`),
      runId,
      lane: 'mock',
      kind,
      status,
      summary,
      detail,
      at: new Date(EPOCH + index).toISOString(),
    });
  };

  emit('run', 'created', `Run created for ${graph.serviceId}`, {
    packId: graph.serviceId,
    graphVersion: graph.graphVersion ?? null,
    definitionHash: graph.definitionHash ?? null,
    route,
    decision,
  });
  emit('run', 'lane', 'Lane: MOCK. No model, no network, no credential. Nothing here is a client result.', {
    lane: 'mock',
    nodes: graph.nodes.length,
    edges: graph.edges.length,
    humanGates: graph.humanGateCount,
  });

  const completed = new Set();
  const scheduled = new Map(); // node id -> the ids that scheduled it
  let queue = [graph.startNodeId];
  let heldGate = null;
  let terminal = null;
  let preparedWrites = 0;
  let authorizedWrites = 0;

  const order = (ids) => [...new Set(ids)].sort((a, b) => nodes.get(a).index - nodes.get(b).index);

  const step = () => {
    while (queue.length) {
      // Deterministic: lowest graph index first, and a join waits for every
      // predecessor that is still queued.
      queue = order(queue);
      const readyAt = queue.findIndex((id) =>
        incoming(id).every((edge) => !queue.includes(edge.source) && (completed.has(edge.source) || !scheduled.has(edge.source))),
      );
      if (readyAt === -1) throw new Error('the graph deadlocked: no node is ready');
      const id = queue.splice(readyAt, 1)[0];
      const node = nodes.get(id);
      if (completed.has(id)) continue;

      if (node.type === 'human_gate') {
        heldGate = node;
        emit('gate', 'held', `Held at ${node.label}. A named person decides; nothing is written until they do.`, {
          nodeId: node.id,
          prepared: preparedWrites,
          awaiting: outgoing(node.id).map((edge) => edge.branchType).sort(),
        });
        return;
      }

      completed.add(id);
      if (node.sideEffect === 'prepared') preparedWrites += 1;
      if (node.sideEffect === 'authorized') authorizedWrites += 1;
      emit('node', node.type === 'terminal' ? 'terminal' : 'completed', `${node.label} (${node.type})`, {
        nodeId: node.id,
        type: node.type,
        index: node.index,
        concurrencyGroup: node.concurrencyGroup,
        sideEffect: node.sideEffect,
      });
      if (node.type === 'terminal') {
        terminal = node;
        return;
      }

      const edges = outgoing(id);
      const exception = edges.filter((edge) => edge.branchType === 'exception');
      const taken = route === 'exception' && exception.length ? exception : edges.filter((edge) => edge.branchType === 'clean');
      if (!taken.length) throw new Error(`node ${id} offers no ${route} branch`);
      for (const edge of taken) {
        scheduled.set(edge.target, [...(scheduled.get(edge.target) ?? []), id]);
        queue.push(edge.target);
      }
    }
  };

  step();

  if (heldGate && decision) {
    const branch = decision === 'approve' ? 'approval' : 'rejection';
    const edge = outgoing(heldGate.id).find((candidate) => candidate.branchType === branch);
    if (!edge) throw new Error(`gate ${heldGate.id} has no ${branch} edge`);
    completed.add(heldGate.id);
    emit('gate', 'decided', `Decision at ${heldGate.label}: ${decision}.`, {
      nodeId: heldGate.id,
      decision,
      branchType: branch,
      next: edge.target,
      reviewer: 'fixture reviewer',
      reason: `Deterministic fixture decision for the ${route} route.`,
    });
    scheduled.set(edge.target, [heldGate.id]);
    queue = [edge.target];
    heldGate = null;
    step();
  }

  const state = terminal ? (terminal.id.includes('rejected') ? 'rejected' : 'completed') : 'held';
  emit('evidence', 'sealed', `Sealing the trail of this run: ${receipts.length + 1} receipts.`, {
    state,
    terminalNodeId: terminal?.id ?? null,
    heldGateId: heldGate?.id ?? null,
    nodesCompleted: completed.size,
    preparedWrites,
    authorizedWrites,
  });

  return {
    schema: SCHEMA,
    runId,
    lane: 'mock',
    sealedAt: new Date(EPOCH + receipts.length).toISOString(),
    receiptsSealed: receipts.length,
    sha256: receiptsSha256(SCHEMA, receipts),
    packId: graph.serviceId,
    route,
    decision,
    verdict: state,
    outcome: terminal?.id ?? heldGate?.id ?? null,
    egressDuringRun: { attempts: 0, blocked: 0 },
    totals: {
      receipts: receipts.length,
      toolCalls: 0,
      refused: 0,
      proposals: preparedWrites,
      externalSends: 0,
      mockExecutions: 0,
    },
    receipts,
  };
}

function main(args) {
  const packDirectory = args.find((argument) => !argument.startsWith('--'));
  if (!packDirectory) {
    console.error('usage: node tools/run-mock.mjs <pack directory> [--route clean|exception] [--decision approve|reject] [--out file.json]');
    process.exit(2);
  }
  const option = (name, fallback) => {
    const at = args.indexOf(`--${name}`);
    return at === -1 ? fallback : args[at + 1];
  };
  const graph = JSON.parse(readFileSync(join(resolve(packDirectory), 'graph.json'), 'utf8'));
  const bundle = runMock(graph, { route: option('route', 'clean'), decision: option('decision', null) });

  for (const [index, receipt] of bundle.receipts.entries()) {
    console.log(`${String(index).padStart(2, '0')}  ${receipt.kind}.${receipt.status}  ${receipt.summary}`);
  }
  console.log(`verdict   ${bundle.verdict} at ${bundle.outcome}`);
  console.log(`receipts  ${bundle.receiptsSealed}`);
  console.log(`sha256    ${bundle.sha256}`);

  const out = option('out', null);
  if (out) {
    writeFileSync(resolve(out), `${JSON.stringify(bundle, null, 2)}\n`);
    console.log(`written   ${resolve(out)}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main(process.argv.slice(2));
}
