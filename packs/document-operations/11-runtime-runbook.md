# Agent runtime runbook — Document Operations Agent

## Ready-made assembly

1. Start with `vvdex-strategy`, `vvdex-orchestrator`, `sara-intake`,
   `specialist-document-operations`, `connector-steward`, `project-brain` and
   `evidence-qa`.
2. Load the client brief and replace assumptions with verified facts.
3. Bind only the tools listed in `10-toolkit.yaml` that exist in the client
   environment.
4. Run read-only fixtures before requesting any write permission.
5. Route every consequential action through the Approval Inbox.
6. Close only after Evidence & QA reconciles the real external state.

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
