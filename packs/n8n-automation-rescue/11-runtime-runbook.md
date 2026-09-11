# Agent runtime runbook — n8n Automation Rescue

## Ready-made assembly

1. Start with `vvdex-strategy`, `vvdex-orchestrator`, `sara-intake`,
   `specialist-n8n-automation-rescue`, `connector-steward`, `project-brain` and
   `evidence-qa`.
2. Load the client brief and replace assumptions with verified facts.
3. Bind only the tools listed in `10-toolkit.yaml` that exist in the client
   environment.
4. Run read-only fixtures before requesting any write permission.
5. Route every consequential action through the Approval Inbox.
6. Close only after Evidence & QA reconciles the real external state.

## Service-specific sequence

1. Take the export and the execution ids before anything else; a rescue without them is a conversation.
2. Extract only the fields the reproduction needs from the log, and redact the rest.
3. Replay the failing executions until the failure is deterministic, then freeze that case as a test.
4. Replay the successful executions alongside them — the difference is the diagnosis.
5. Test the four families in parallel: credential and authorization, schema drift, rate and timeout, logic.
6. Write the smallest diff that the named cause requires, node by node, with a reason for each change.
7. Have somebody who did not write the diff re-run the reproduction and the regression set.
8. Prepare the import package and the way back, and hand both to the named owner to apply.

## What blocks a handover

1. A failure that never reproduced from the export.
2. A cause named without its excluded alternatives.
3. A diff that changes a node outside the failing path.
4. A regression set that is not green against the patched export.
5. No written way back, or no named owner to execute it.

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
- The frozen reproduction case is shown failing against the original export and passing against the patched one.
- A retry of the patched workflow is shown to produce exactly one side effect.
- The rescue is shown to have made no external call and bound no client credential.
- The named owner reads the way back and states how they would execute it.
