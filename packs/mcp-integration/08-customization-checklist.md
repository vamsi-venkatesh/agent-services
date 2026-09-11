# Customization checklist — MCP Integration

## Before implementation

- [ ] Clone this pack to a client-specific version; never edit the base in place.
- [ ] Name the accountable customer owner and operator.
- [ ] Replace generic channels and systems with the customer’s actual systems.
- [ ] Define authoritative data sources and conflict rules.
- [ ] Build the read/write/approve/prohibit action matrix.
- [ ] Complete data protection, AI disclosure and connector terms review.
- [ ] Capture the baseline and a representative fixture set.

## Before pilot

- [ ] Configure isolated credentials and minimal scopes.
- [ ] Test missing, duplicate, stale and adversarial inputs.
- [ ] Verify every irreversible action requires approval.
- [ ] Prove retries do not duplicate side effects.
- [ ] Verify the human can take over with full context.
- [ ] Set cost, latency, volume and incident limits.

## Before production

- [ ] Obtain customer sign-off on intended and prohibited use.
- [ ] Pass the complete evaluation gate.
- [ ] Verify monitoring, rollback, retention and deletion.
- [ ] Run the real channel end to end.
- [ ] Store deployment and external-state receipts.
- [ ] Schedule outcome review and maintenance cadence.

## Before a deployment package is handed over

- [ ] Every tool in the contract states its scope, its read or write side and its idempotency key.
- [ ] Every conformance check passes, or the tool it fails on is held.
- [ ] Every safety probe is resolved, or every write-capable tool is held.
- [ ] Each write tool's idempotency key has been replayed and produced one effect.
- [ ] Write-capable tools are disabled in the package that is handed over.
- [ ] The systems owner has read the contract and can name what each tool can change.
