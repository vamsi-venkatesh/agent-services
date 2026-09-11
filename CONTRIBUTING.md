# Contributing

## What belongs here

Service packs, the schemas they are checked against, and the tools that check them. A pack is accepted when it validates, when its graph obeys the structural rules, and when the numbers in the README still derive from the files in the repository.

## Authoring a pack

Create `packs/<pack-id>/` and put two files in it.

`pack.json` is the definition, validated against `schema/service-pack-definition.v1.schema.json`. Sixteen blocks, in this order: identity, inputs, clarifications, workflowSteps, decisionGates, humanGates, branching, actions, artifacts, metrics, receipts, agents, tools, publicOutput, simulationFixture, readinessState.

Two rules are worth stating before you start, because they are what the sixteen blocks exist for:

1. **A block that states nothing says so.** Every block carries a `missing` array naming the field paths it leaves unstated. An empty array means the block is complete. Nothing substitutes a default for an absent field, so leaving a field out and leaving it out of `missing` are different acts, and the second one is a defect.
2. **A pack names its own nouns.** Steps carry `doingVerb` and `countNouns`; decision gates carry their own `question` and `outcomes`; the simulation fixture carries the `stepId` each counter was counted at. A pack that does not say what it counts has nothing counted for it.

`graph.json` is the compiled graph, validated against `schema/graph.v1.schema.json` and then against the structural rules in `tools/validate-pack.mjs`:

- exactly one `human_gate` node, with `humanGateCount` agreeing;
- exactly one `approval` edge and one `rejection` edge out of that gate;
- no node with `sideEffect: "authorized"` reachable from the start once the gate is removed;
- every node reachable from `startNodeId`, every terminal without an outgoing edge, every other node with one;
- ids resolving within the pack: steps, receipts, counters, agent participation, paths, terminals, artifacts and gates.

Then run:

```
node tools/validate-pack.mjs packs/your-pack
node tools/run-mock.mjs packs/your-pack --route exception --decision reject
npm test
```

The replay runner is the quickest way to see whether a graph does what its author thinks. If the exception route does not hold at the gate, or the clean route reaches it, the graph is wrong before any content is.

## Harness results

`harness.json` is a record of a run of the evaluation harness, not an assertion about a pack. Do not hand-edit a status, and do not mark a case `passed` that was not executed. A case that cannot apply to a graph is `not_applicable` with the reason that made it so. A pack submitted without harness results is fine; a pack submitted with invented ones is not.

## Evidence bundles

An `evidence/` directory holds sealed bundles. A bundle's `sha256` must be reproducible by `tools/verify-bundle.mjs` from the receipts alone. Bundles from real runs only, with fictional or fixture data in them: nothing in this repository should carry a client's content.

## Pull requests

- One pack, or one tool change, per pull request.
- `npm run validate`, `npm test` and `npm run readme` pass. CI runs all three on Node 20 and Node 22.
- No runtime dependencies. The tools are plain Node with no imports outside `node:`.
- If a change moves a number, update the README in the same commit. `tools/readme-check.mjs` will fail the build otherwise.
- Prose in a pack is the pack's own. Do not rewrite another pack's wording to match yours.
