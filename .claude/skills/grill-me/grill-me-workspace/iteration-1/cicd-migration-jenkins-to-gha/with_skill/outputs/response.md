# Grill Me: CI/CD Migration from Jenkins to GitHub Actions

---

**Motivation**

Why now? What's the forcing function behind this migration — cost, maintenance burden, team capability gaps, or something else?

What is Jenkins currently failing to deliver that GitHub Actions is expected to solve? Are there specific pain points (e.g., plugin maintenance, agent management, flaky builds) or is this primarily a strategic alignment decision?

---

**Scope and Inventory**

You have 40 Jenkinsfiles — how much variation is there across them? Are these mostly similar pipelines with slight differences, or are there meaningfully different pipeline architectures across the 40?

How many of those 40 pipelines are actively used versus dormant or rarely triggered? Does the rewrite plan account for that distinction?

What external integrations do those Jenkinsfiles rely on — artifact registries, deployment targets, secret stores, notification systems — and have you audited how many of those have verified GHA equivalents?

---

**People and Capacity**

Your platform team of 3 will own all 40 rewrites over 3 months. What's their current load alongside this migration — are they backfilling ops work, supporting other teams, or fully dedicated to this effort?

How are the 40 pipelines distributed across the 3 people? Is there an ownership model, or are rewrites assigned by familiarity with the services?

What happens to the migration timeline if one of the three is pulled for an incident, goes on leave, or leaves the team during the 3-month window?

---

**Parallel Run**

During the parallel run, both Jenkins and GHA will execute. Who decides when a pipeline has reached sufficient parity to decommission its Jenkins counterpart — the platform team, the owning service team, or someone else?

What does "parity" mean concretely for your pipelines — identical artifact outputs, matching test pass/fail behavior, same deployment side effects, all of the above?

When Jenkins and GHA produce different results for the same commit during the parallel run, what's the escalation path and who has authority to decide which result is authoritative?

---

**Risk and Rollback**

If a GHA pipeline fails in production after Jenkins is decommissioned for that service, what's the rollback path — do you re-enable the Jenkinsfile, and is that infrastructure still intact at that point?

What's your threshold for declaring the migration has failed or needs to pause? Is there a defined criteria — a number of incidents, a severity level, a deadline slippage amount — or is that left to judgment at the time?

---

**Success Criteria**

How will you know the migration succeeded beyond "all 40 Jenkinsfiles are rewritten"? What does a healthy state look like 3 months after decommissioning Jenkins?

Are the service teams who depend on these pipelines part of the sign-off process, or is this entirely owned and validated by the platform team?
