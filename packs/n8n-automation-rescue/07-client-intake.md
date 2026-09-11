# Client intake — n8n Automation Rescue

Use these questions before selecting tools or quoting implementation.

1. Which workflow is failing, and can you export it as JSON together with the ids of the failing executions?
2. What does the failure look like from the business's side, and how often does it happen?
3. Which instance does it run on, and who is allowed to import a change into it?
4. Which credentials does the workflow use, and may we see their scopes without their secrets?
5. May the execution log leave the instance, and does it carry personal data?

## Baseline evidence to request

- Current process map or a screen recording of one real case.
- Monthly volume, handling time, backlog and known error types.
- Sample inputs and successful outputs with sensitive data removed where possible.
- Named systems of record and system owners.
- Existing policies, permissions, retention rules and escalation contacts.
- Three ordinary cases, three edge cases and three cases the agent must refuse.

## Also request for n8n Automation Rescue

- The workflow export as JSON, from the instance it runs on.
- At least three failing execution ids and two successful ones.
- The connected accounts with their scopes and rotation dates, without secrets.
- What a person notices when it fails, and how often, over a stated window.
- The person who may import a change into the instance and undo it.

## Discovery output

Produce a signed scope with the allowed reads, allowed writes, approval gates, authoritative sources, expected outcome, baseline, pilot sample and explicit exclusions.
