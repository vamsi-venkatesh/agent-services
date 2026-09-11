# Security

## Reporting

Email vamsi@vamsivenkatesh.com with the file, the command that reproduces the problem and what you expected instead. A first reply comes within five working days. Please do not open a public issue for anything that lets a check pass when it should fail.

## In scope

- A structural rule in `tools/validate-pack.mjs` that can be bypassed: a graph with two human gates, or none, that validates; an authorized write reachable without passing the gate; an unreachable node or terminal that goes unreported.
- A bundle whose receipts can be changed without changing the hash that `tools/verify-bundle.mjs` computes, or a second receipt sequence that produces the same hash.
- A run of `tools/run-mock.mjs` that is not reproducible, that crosses the gate without a decision, or that reads or writes anything outside the repository.
- A schema in `schema/` that accepts a definition contradicting the rules it documents.
- Anything in `packs/` that carries a credential, a token, a hostname or a real person's data. These packs are fixture material and should contain none.

## Out of scope

- The hosted Agent Service Lab at lab.vvdexops.com. It is a separate system and is not in this repository. Report anything about it to the same address, marked as such.
- The runtime that produced `run-37c494ba.evidence.json`. Only the bundle is published here; the ledger implementation is not.
- Findings from automated scanners with no reproduction against the code in this repository.
- Dependency vulnerabilities. There are no runtime dependencies, and no development dependencies.

## What this repository is not

Nothing here executes untrusted input, opens a network connection or reads a credential. `run-mock.mjs` walks a JSON graph and hashes what it produced. Treat a pack's JSON as data you chose to run the tools over.
