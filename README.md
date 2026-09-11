# Agent services as compiled graphs

[![CI](https://github.com/vamsi-venkatesh/agent-services/actions/workflows/ci.yml/badge.svg)](https://github.com/vamsi-venkatesh/agent-services/actions/workflows/ci.yml)

Three production-shaped agent service packs from the VVDex Agent Service Lab, with the schema, a validator, a deterministic replay runner and a sealed evidence bundle you can hash yourself.

![The Document Operations graph in the lab hero, with the human gate marked](docs/images/hero.png)

## What this is

A service here is a compiled graph, not a prompt and not a chain. Nodes are typed: intake, deterministic work, model reasoning, parallel workers, an aggregator, an independent verifier, a policy decision, prepared writes, the human gate, result verification and terminals. Edges carry a branch type. Each of the three graphs has exactly one human gate, and every node whose side effect is `authorized` sits behind it. Until a named person decides, a write is prepared and nothing leaves the run.

Each pack is measured by the same 58-case harness across six areas: matcher, brief, graph, runtime, safety and evidence. The harness executes the graph rather than reading it. It runs the clean path, the exception path, an approval and a rejection; it injects a worker failure, a timeout, a transient error, a cancellation and a duplicate start; it mutates the contract to remove the gate's approval edge and to turn a prepared write into an executed one, and requires the compiler to refuse both. `harness.json` in each pack carries the per-case result and the evidence line the case produced.

A run leaves receipts. The receipts are hashed into a bundle, and the bundle states the hash. `packs/document-operations/evidence/run-37c494ba.evidence.json` is one such bundle, 43 receipts from a real mock-lane run, and `tools/verify-bundle.mjs` recomputes its sha256 from the receipts alone.

The packs are complete operating documents. Thirteen files each: the overview, the design, the blueprint, the architecture diagram, the automation steps, the external services, the evaluation rules, the client intake questions, the customization checklist, the agent manifest, the toolkit, the runtime runbook and the project template. `pack.json` is the machine-readable definition behind them, in sixteen blocks, where a block that states nothing says so rather than being filled in by a renderer.

![A supplier invoice held at the human gate: the run waits for a named person, the receipt ledger on the right](docs/images/run-stage-held.png)

## The three packs

| Pack | What it automates | Nodes | Human gates | Harness | Not applicable |
| --- | --- | --- | --- | --- | --- |
| `document-operations` | Invoices and other documents from arrival to a validated record: extraction, four parallel checks, an independent verifier, and a prepared write that a person releases | 19 | 1 | 55 / 58 | 3 |
| `n8n-automation-rescue` | Diagnosing a workflow somebody else built: reproduce the failure, name the cause, prepare the smallest correction as a diff the owner imports | 11 | 1 | 55 / 58 | 3 |
| `mcp-integration` | Exposing one system through an MCP server: a written tool contract, conformance tests and safety probes, with every write-capable tool disabled at handover | 12 | 1 | 55 / 58 | 3 |

The three not-applicable cases are the same in each pack, and they are the ones about executed side effects: idempotency of an executed write, side-effect failure, and compensation or rollback. These graphs prepare writes and stop at the gate, so there is no executed external write for those cases to exercise. The harness records that as not applicable rather than as a pass.

## Quick start

Install nothing. Node 20 or newer, no dependencies.

```
git clone https://github.com/vamsi-venkatesh/agent-services.git
cd agent-services

# Recompute the sealed hash of the evidence bundle
node tools/verify-bundle.mjs packs/document-operations/evidence/run-37c494ba.evidence.json

# Validate all three packs against the schema and the structural rules
node tools/validate-pack.mjs

# Replay a graph: the clean path
node tools/run-mock.mjs packs/document-operations

# Replay the exception path and reject at the gate
node tools/run-mock.mjs packs/document-operations --route exception --decision reject

# Leave the decision out and the run holds at the gate
node tools/run-mock.mjs packs/mcp-integration --route exception
```

`run-mock.mjs` uses no model, no network and no credential. Identifiers and timestamps are derived from the pack id, the route and the decision, so the same command always prints the same sealed hash. Add `--out run.json` to write the bundle, then hash it with `verify-bundle.mjs`.

![The Document Operations service page: the executable workflow, what it may do, what it never does](docs/images/service-page-contract.png)

## Anatomy of a pack

| File | What it holds |
| --- | --- |
| `00-overview.md` | The purpose, the buyer, the operating mode and the readiness state |
| `01-design.md` | The job to be done and the operator's view of a run |
| `02-blueprint.yaml` | The service as data: channels, core systems, stages, decisions |
| `03-architecture.mmd` | The same shape as a Mermaid diagram |
| `04-automation.yaml` | The triggers and the ordered workflow steps with their outputs |
| `05-external-services.yaml` | Which capability each integration covers, and the selection rules |
| `06-evaluation.yaml` | The release gate, the metrics and the adversarial cases |
| `07-client-intake.md` | The questions asked before any tool is chosen |
| `08-customization-checklist.md` | What must be replaced before a client-specific version runs |
| `09-agent.manifest.yaml` | The specialist agent: mission, runtime, autonomy, boundaries |
| `10-toolkit.yaml` | Each tool with its category and its permission |
| `11-runtime-runbook.md` | How the agents are assembled and what is bound to what |
| `12-project-template.json` | The project base a client engagement is cloned from |
| `pack.json` | The definition: sixteen blocks of machine-readable semantics |
| `graph.json` | The compiled graph: typed nodes, branch-typed edges, one gate |
| `harness.json` | The 58-case result, per case and per area |
| `evidence/` | Sealed evidence bundles, where a run has produced one |

## Author your own

`schema/service-pack-definition.v1.schema.json` describes the sixteen blocks: identity, inputs, clarifications, workflow steps, decision gates, human gates, branching, actions, artifacts, metrics, receipts, agents, tools, public output, simulation fixture and readiness state. Every block carries a `missing` array. An empty array means the block is complete; a non-empty array names the field paths the block leaves unstated. There is no default and no fallback, so a surface can only draw what a pack actually said.

Put your definition at `packs/<your-pack>/pack.json` and your compiled graph at `packs/<your-pack>/graph.json`, then:

```
node tools/validate-pack.mjs packs/your-pack
```

The validator checks both files against their schemas and then the rules the schemas cannot express. `CONTRIBUTING.md` covers what a pull request needs.

![The 58-case harness for Document Operations: six areas, not-applicable cases listed first with their reasons](docs/images/harness.png)

## How the graph rules work

`schema/graph.v1.schema.json` defines twelve node types and six branch types. `tools/validate-pack.mjs` then enforces what a schema cannot:

- Exactly one node is a `human_gate`, and `humanGateCount` says so.
- The gate is left by exactly one `approval` edge and one `rejection` edge.
- No node whose side effect is `authorized` is reachable from the start when the gate is removed. A write that a person has not released cannot happen.
- Every node is reachable from the start node, every terminal is reachable, no terminal has an outgoing edge, and every other node has one.
- In the definition, an action that is consequential and not reversible names the human gate that authorizes it.
- Steps, receipts, counters, agent participation, paths and terminals all resolve to ids declared in the same pack.

Side effects are a three-state field. `none` writes nothing. `prepared` holds a write nobody has authorized. `authorized` is a write a person released at the gate. The replay runner counts them, and the mock lane's count of external sends is zero by construction.

## Evidence

![The receipt chain of run 37c494ba with the bundle hash and the verify command](docs/images/evidence.png)

The bundle schema is `vvdex.evidence-bundle/v1`. Its `sha256` is taken over the canonical receipt lines in ledger order:

```
sha256( schema + "\n" + receipts.length + "\n" + for each receipt: JSON.stringify(receipt) + "\n" )
```

Nothing else enters the hash: not the bundle's own header, not the seal time, not the totals. Hashing the receipts alone is what lets a later seal record a longer prefix of the same append-only trail.

`packs/document-operations/evidence/run-37c494ba.evidence.json` states `df99eabfb747232ccde95c64309294f3c2df77dab0c4bf75964128dc29f99a93` over 43 receipts. `node tools/verify-bundle.mjs` recomputes it and exits non-zero on a mismatch.

## Live

![The showcase of 48 agent services, grouped by the work they automate](docs/images/showcase.png)

The three packs are published at the Agent Service Lab:

- [lab.vvdexops.com/agent-services](https://lab.vvdexops.com/agent-services/)
- [Document Operations](https://lab.vvdexops.com/agent-services/document-operations/)
- [n8n Automation Rescue](https://lab.vvdexops.com/agent-services/n8n-automation-rescue/)
- [MCP Integration](https://lab.vvdexops.com/agent-services/mcp-integration/)

## Acknowledgements

Built by VVDex. Along the way we read the MCP server specifications, the n8n workflow format and the public tool-contract patterns of the agent ecosystem; the graphs, the gates, the harness and the runtime are ours.

## License

MIT. See `LICENSE`.
