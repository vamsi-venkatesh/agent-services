# n8n Automation Rescue

**Pack:** `n8n-automation-rescue`  
**Version:** 0.1.0  
**Tier:** A  
**Readiness:** Foundation ready  
**Operating mode:** approval-gated

## Purpose

Takes a broken or brittle n8n or Make workflow somebody else built, reproduces the failure deterministically from the export and the execution log, names the cause with the alternatives it excluded, and prepares the smallest safe fix as a workflow diff.

## Buyer

Businesses running an automation they did not build — an n8n or Make workflow that fails intermittently, fails silently, or has failed since a change nobody on the team made — who cannot afford to have it edited live while it is failing.

## Outcome

A named cause with the evidence that excluded the alternatives, and the smallest safe correction prepared as a workflow diff with a regression run plan and a way back, ready for the workflow's owner to import.

## Promise

> Reproduce it from the export. Prove the cause. Prepare the smallest diff.

## Readiness honesty

The reproduction lane is real: this runtime replays a workflow export against recorded executions with every write adapter stubbed, and the estate operates its own n8n instance. What has never happened is an external rescue — no client instance has been read, no client execution log has been opened, no prepared diff has been imported anywhere. Foundation ready means the lane and the evidence ledger exist and are exercised inside VVDex, and nothing in this pack is a delivery record.

## Standing laws

- The rescue is reproduced from the export and the recorded executions. A workflow that could not be made to fail on demand has not been diagnosed.
- Nothing is ever edited on a live instance. The output is a diff and an import package the owner applies.
- A cause is named only with the alternatives that were excluded and the observation that excluded each one.
- The smallest diff wins: a node outside the failing path is left alone even when it is obviously untidy.
- The reproduction case is frozen as a regression test before the fix is written, so the fix cannot be tuned to a moving target.
- The way back is written before the import package is handed over, and it is written for the owner to execute without us.

## Deliverables

- A rescue brief naming the workflow, the executions and the data that was and was not copied
- A deterministic failure case, frozen as a regression test
- A root cause with the alternatives excluded and the observation behind each exclusion
- A node-by-node workflow diff with a reason per change
- An import package with a regression run plan and a written way back

## Pack contents

- [Design](./01-design.md)
- [Blueprint](./02-blueprint.yaml)
- [Architecture](./03-architecture.mmd)
- [Automation](./04-automation.yaml)
- [External services](./05-external-services.yaml)
- [Evaluation](./06-evaluation.yaml)
- [Client intake](./07-client-intake.md)
- [Customization checklist](./08-customization-checklist.md)
- [Specialist agent](./09-agent.manifest.yaml)
- [Specialist toolkit](./10-toolkit.yaml)
- [Runtime runbook](./11-runtime-runbook.md)
- [Ready project template](./12-project-template.json)

This pack is a reusable base, not a finished customer deployment. Every client version must receive a new configuration, threat review, evaluation fixture set and approval matrix.
