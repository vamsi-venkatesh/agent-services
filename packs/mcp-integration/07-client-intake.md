# Client intake — MCP Integration

Use these questions before selecting tools or quoting implementation.

1. Which system is being exposed, and who owns what happens inside it?
2. Which tools should the assistant have, and what is the narrowest scope each one needs?
3. Which of those tools write, and what does a duplicate of each write look like?
4. Does any tool return content that people outside the business wrote?
5. Where does the server run, and whose credential does it hold?

## Baseline evidence to request

- Current process map or a screen recording of one real case.
- Monthly volume, handling time, backlog and known error types.
- Sample inputs and successful outputs with sensitive data removed where possible.
- Named systems of record and system owners.
- Existing policies, permissions, retention rules and escalation contacts.
- Three ordinary cases, three edge cases and three cases the agent must refuse.

## Also request for MCP Integration

- The one system to be exposed, with the person accountable for its data.
- The jobs the assistant is meant to do, in the business's own words.
- The existing credentials and their scopes, without secrets.
- Which fields and records carry content written outside the business.
- Where the server may run, and who can revoke its credential.

## Discovery output

Produce a signed scope with the allowed reads, allowed writes, approval gates, authoritative sources, expected outcome, baseline, pilot sample and explicit exclusions.
