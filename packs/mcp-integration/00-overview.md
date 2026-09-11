# MCP Integration

**Pack:** `mcp-integration`  
**Version:** 0.1.0  
**Tier:** A  
**Readiness:** Foundation ready  
**Operating mode:** approval-gated

## Purpose

Exposes one client system to agents through a Model Context Protocol server with a written tool contract — every tool, its scope, its read or write side and its idempotency key — proven by conformance tests and safety probes before any write-capable tool is offered.

## Buyer

Businesses whose ticketing system, CRM or database is about to be connected to an AI assistant, and who have no written statement of what that assistant would then be able to do.

## Outcome

A tool contract with per-tool conformance and safety-probe results, a server built against it with every write-capable tool disabled, and a deployment package the systems owner approves tool by tool.

## Promise

> Every tool named, scoped and probed before anything can write.

## Readiness honesty

The protocol and the probe set are real and this estate runs its own tool servers, but nothing in this pack has been built for an external client: no client system has been exposed, no client contract has been written and no server has been deployed anywhere. Every number in the walkthrough is fixture data from a synthetic ticketing system. Foundation ready means the contract shape, the conformance tests and the probes exist and are exercised inside VVDex.

## Standing laws

- The contract is written before the server: a tool that is not in the contract does not exist on the server.
- Read and write are separate tools with separate scopes, never one tool with a flag.
- Every write-capable tool carries an idempotency key that has been replayed and shown to produce one effect.
- Write-capable tools ship disabled and are enabled one at a time by the systems owner, never as a set.
- A tool whose results carry content written outside the business is marked as such, and a write may not be reachable from it in the same turn without a fresh approval.
- A probe that reached a write holds every write-capable tool, not only the one it came through.

## Deliverables

- A tool contract: every tool, its scope, its read or write side and its idempotency key
- A built server with every write-capable tool disabled
- Per-tool conformance results, including the idempotency replays
- Safety probe results with the probes that were refused and the ones that were not
- A deployment package for the client's own platform, with the enabling order per tool

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
