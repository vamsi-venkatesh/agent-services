# Agent runtime runbook — MCP Integration

## Ready-made assembly

1. Start with `vvdex-strategy`, `vvdex-orchestrator`, `sara-intake`,
   `specialist-mcp-integration`, `connector-steward`, `project-brain` and
   `evidence-qa`.
2. Load the client brief and replace assumptions with verified facts.
3. Bind only the tools listed in `10-toolkit.yaml` that exist in the client
   environment.
4. Run read-only fixtures before requesting any write permission.
5. Route every consequential action through the Approval Inbox.
6. Close only after Evidence & QA reconciles the real external state.

## Service-specific sequence

1. Name the one system and the one owner before writing a line of contract.
2. Turn the jobs into the narrowest tools that can do them, and write the contract.
3. Mark every tool whose results carry content written outside the business.
4. Build against the contract with every write-capable tool disabled.
5. Run the conformance tests per tool, including the idempotency replays.
6. Run the probes against the built server, not against the design.
7. Have somebody who did not build the server re-check it against the contract.
8. Prepare the deployment package, writes disabled, with the enabling order per tool.

## What blocks a handover

1. A tool on the server that is not in the contract.
2. A failing conformance check on a tool being offered.
3. An unresolved probe with any write-capable tool offered.
4. A write tool whose idempotency key has never been replayed.
5. A package in which any write-capable tool is enabled.

## Adaptation contract

- Keep the specialist mission and safety boundary stable.
- Adapt channels, terminology, schemas, systems and thresholds to the client.
- Add a new tool through a typed adapter; never place credentials in prompts.
- Add a new skill as an independently testable input/action/output contract.
- Record every handoff and resume from the last verified checkpoint.

## Minimum release proof

- All fixtures in `06-evaluation.yaml` pass.
- Tool writes are idempotent and produce receipts.
- Human rejection and resume paths are exercised.
- Cross-tenant and prompt-injection tests pass.
- A real end-to-end client path is verified before production.
- An injection inside a tool result is shown to change nothing the server does.
- A replayed idempotency key is shown to produce exactly one effect.
- A cross-tenant identifier is shown to return nothing.
- The handed-over package is shown with every write-capable tool disabled.
