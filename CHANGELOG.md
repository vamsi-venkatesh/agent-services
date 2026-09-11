# Changelog

## 0.1.0

First public release.

- Three service packs: `document-operations`, `n8n-automation-rescue`, `mcp-integration`. Each carries its thirteen operating files, the pack definition, the compiled graph and the 58-case harness result.
- `schema/service-pack-definition.v1.schema.json`: the sixteen blocks of a pack definition.
- `schema/graph.v1.schema.json`: twelve node types, six branch types, three side-effect states.
- `tools/validate-pack.mjs`: schema validation plus the structural rules, including exactly one human gate and no authorized write reachable without it.
- `tools/verify-bundle.mjs`: recomputes an evidence bundle's sha256 from its receipts.
- `tools/run-mock.mjs`: deterministic replay of a compiled graph over the clean, exception, approval and rejection branches.
- `tools/readme-check.mjs`: asserts that every number in the README derives from the data files.
- One sealed evidence bundle, `packs/document-operations/evidence/run-37c494ba.evidence.json`, 43 receipts.
