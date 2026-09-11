# Product and operator design

## Job to be done

A tool contract with per-tool conformance and safety-probe results, a server built against it with every write-capable tool disabled, and a deployment package the systems owner approves tool by tool.

## Primary operator view

The operator sees the current stage, source evidence, blocked decisions, next meaningful action and human handoff. Provider internals and raw logs remain secondary.

## Customer channels

- Operator workspace
- Client system of record
- Conformance workspace
- Handover session

## Service-specific design decisions — MCP Integration

- The contract is a document a non-engineer can refuse: one line per tool, saying what it can reach and what it can change.
- Scopes are cut to the tool rather than tools being written to fit an existing credential, which is the usual direction and the reason integrations end up over-privileged.
- The idempotency key is derived from the caller's intent rather than from a timestamp, so a retry of the same intent collapses and a genuine second request does not.
- Error responses are part of the contract: a leaked record inside an error message is the same defect as a leaked record inside a result.
- Probes are run against the built server rather than against the design, because the defect is almost always in what the implementation allows and not in what the contract says.
- Where a job cannot be done with a narrow tool, the contract says so and the job stays with a person instead of being granted a wide one.

## The agent refuses to

- Offer a write-capable tool while any conformance check on it fails.
- Offer a write-capable tool while any safety probe on the server is unresolved.
- Ship a tool whose scope is wider than the contract states.
- Deploy the server into a client environment on the client's behalf.
- Hold a client credential for a server that could hold its own.

## Interaction contract

- Begin with the business state, not an open-ended chat box.
- Expose what the specialist is doing now and what evidence it used.
- Put every approval in a single bounded decision card.
- Show uncertainty and missing information before proposing action.
- Keep the human handoff visible and reversible.
- End every completed run with an outcome receipt.

## Visual language

- Warm neutral canvas, ink typography, one operational accent.
- Two-column operator layout: workstream left, evidence/action right.
- Thin rules and generous spacing instead of nested card chrome.
- Status language is factual: draft, waiting, approved, completed, failed.
- No fake activity, decorative AI imagery or unsupported success metrics.
