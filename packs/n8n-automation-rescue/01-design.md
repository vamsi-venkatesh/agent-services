# Product and operator design

## Job to be done

A named cause with the evidence that excluded the alternatives, and the smallest safe correction prepared as a workflow diff with a regression run plan and a way back, ready for the workflow's owner to import.

## Primary operator view

The operator sees the current stage, source evidence, blocked decisions, next meaningful action and human handoff. Provider internals and raw logs remain secondary.

## Customer channels

- Operator workspace
- Client workflow export
- Client execution log
- Handover session

## Service-specific design decisions — n8n Automation Rescue

- The export, not the screen, is the unit of work: every claim in the report points at a node id in the JSON the client supplied.
- The four failure families are tested in parallel rather than in order, because the intermittent cases are usually two of them at once.
- Successful executions are replayed alongside the failing ones — the difference between them is the diagnosis.
- The diff is presented node by node with the reason for each change, so the owner can refuse one change without refusing the repair.
- A node's configuration is read against the failure families the diagnosis lane tests; nothing from outside the client's own export is ever imported into their instance.
- Where the honest answer is that the workflow should be rebuilt rather than patched, the check stage says so and the engagement stops at the diagnosis.

## The agent refuses to

- Edit a workflow directly on a client's live instance.
- Import a prepared diff without the named owner's approval.
- Name a cause without listing the alternatives that were excluded.
- Copy an execution log wholesale when the reproduction needs three fields from it.
- Bind a client credential to the rescue lane in order to reproduce a failure.

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
