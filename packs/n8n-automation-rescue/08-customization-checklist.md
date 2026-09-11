# Customization checklist — n8n Automation Rescue

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

## Before a prepared package is handed over

- [ ] The failure reproduces on demand from the export and the recorded executions.
- [ ] The named cause carries the alternatives that were excluded and how.
- [ ] The diff is node by node, each change with its reason.
- [ ] The frozen reproduction case passes and the regression set is unchanged.
- [ ] A retry has been shown to produce one side effect, not two.
- [ ] The way back is written down and the named owner has read it.
