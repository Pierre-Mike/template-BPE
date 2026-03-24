## grill-me eval — 2026-03-19T19-34-03

**Overall: 34% pass rate** ✗

| Sample | Passed | Total | Rate |
|--------|--------|-------|------|
| todo-app | 3 | 5 | 60% ~ |
| caching-layer | 1 | 5 | 20% ✗ |
| api-versioning | 2 | 5 | 40% ✗ |
| microservices-migration | 2 | 5 | 40% ✗ |
| auth-replacement | 1 | 5 | 20% ✗ |
| database-sharding | 1 | 5 | 20% ✗ |
| new-hire-onboarding | 2 | 5 | 40% ✗ |

### Failed expectations

**todo-app**: Covers multiple decision branches — not just technology choices but also scope, users, or deployment
> The output introduces 'Branch 1: Purpose & Scope' and promises to 'go branch by branch', but only one branch is actually presented. No second branch covering technology choices, deployment, architecture, or any other axis appears. The expectation requires multiple branches to be covered, not merely announced.

**todo-app**: Asks about data persistence or storage approach
> There is no mention of databases, storage, persistence, state management, or any related concept anywhere in the output.

**caching-layer**: Asks about cache invalidation strategy or TTL decisions
> No mention of cache invalidation, TTL, expiry, or eviction policy anywhere in the output.

**caching-layer**: Asks about what data will be cached and why those queries are slow
> The single question targets whether the bottleneck has been measured at all (latency, CPU, connection pool), but never asks which specific queries, tables, or access patterns are candidates for caching. The 'what data' dimension is entirely absent.

**caching-layer**: Asks about consistency requirements or acceptable staleness
> There is no mention of consistency, staleness, read-your-writes guarantees, or acceptable lag anywhere in the output.

**caching-layer**: Covers operational concerns — monitoring, cache warming, fallback behavior, or failure modes
> The output contains no discussion of monitoring, cache warming, fallback strategies, or Redis failure modes. The single question is purely about whether the problem has been benchmarked.

**api-versioning**: Asks about existing clients or how breaking changes will be communicated
> No mention of existing clients, consumers, or breaking-change communication anywhere in the output. The only consumer-adjacent angle is 'who the consumers are' listed as a downstream concern, but this is stated as a consequence of answering Question 1 — it is not itself a question asked of the user.

**api-versioning**: Asks about deprecation policy — how long old versions are supported
> The word 'deprecation' does not appear. There is no question about version lifecycle, sunset timelines, or support windows. The output is entirely scoped to clarifying what is being versioned.

**api-versioning**: Covers more than just the URL scheme — asks about what triggers a version bump or how divergence between versions is managed
> The output asks only about the scope of the API (what is being versioned). It does not ask what qualifies as a breaking change, what triggers a version bump, or how divergence between /v1/ and /v2/ will be managed in practice.

**microservices-migration**: Asks about team structure — who owns each service, how many engineers are involved
> Q1b touches on decision-making authority ('Who made the decision... do the engineers closest to the codebase agree') but does not ask about team structure, service ownership assignments, or headcount. Organizational structure and ownership topology are not raised.

**microservices-migration**: Asks about data ownership or how shared databases will be handled
> No mention of databases, shared data, data ownership, bounded contexts, or data migration anywhere in the output. This is a critical concern in monolith-to-microservices migrations and is entirely absent.

**microservices-migration**: Covers deployment and operational concerns — service discovery, distributed tracing, or rollback strategy
> The output contains no questions or statements about deployment pipelines, service discovery, observability, distributed tracing, or rollback. Operational readiness is not raised at all.

**auth-replacement**: Asks about the migration path for existing users or active sessions
> The sole question asked concerns app inventory and type breakdown. There is no mention of existing users, active sessions, session migration, token migration, or any continuity concern for current users.

**auth-replacement**: Asks about which apps are in scope and whether they share the same user base
> The output asks 'how many apps are we talking about, and what's the breakdown?' — this covers scope partially. However, the question about whether apps share the same user base is entirely absent. The expectation requires both halves; only one is present.

**auth-replacement**: Covers risk and rollback — what happens if Auth0 is unavailable or the migration goes wrong
> No mention of risk, rollback plans, Auth0 outages, SLA dependencies, or failure scenarios anywhere in the output.

**auth-replacement**: Does not assume the decision is final — probes whether alternatives were considered
> The output accepts the Auth0 decision at face value and jumps straight into scoping the implementation. No question is raised about whether alternatives (Keycloak, Cognito, Okta, staying homegrown) were evaluated or whether this decision is reversible.

**database-sharding**: Asks questions rather than endorsing or warning against sharding
> The output explicitly warns: 'sharding by user ID could make things *worse* by concentrating hot shards.' This is a directional statement against a specific sharding outcome, not a neutral question. The skill makes a judgment call on behalf of the user rather than surfacing the concern as a question.

**database-sharding**: Asks about cross-shard queries or operations that span multiple users
> No mention of cross-shard queries, joins across shards, multi-user transactions, or any operations that would require coordinating across shard boundaries. The entire output is one question about bottleneck type.

**database-sharding**: Asks about the sharding key choice and whether user ID distribution is uniform
> The output raises the concern about hot users ('large enterprise accounts') as a declarative warning, but never asks the user whether their user ID distribution is uniform or how their user population is shaped. The concern is stated, not interrogated.

**database-sharding**: Covers operational overhead — re-sharding, hotspots, or whether simpler alternatives were considered
> Hotspots are referenced in passing as part of the warning about enterprise accounts, but operational overhead (e.g., cost of re-sharding, cross-shard consistency) and simpler alternatives (e.g., read replicas, indexing, vertical scaling, partitioning) are never raised as questions or topics.

**new-hire-onboarding**: Asks about who owns the program and who runs the weekly check-ins
> No mention of ownership, accountability, or who facilitates the weekly check-ins. The output contains only one question focused on the problem diagnosis.

**new-hire-onboarding**: Covers success metrics — how will the team know if the new process is better
> No mention of metrics, KPIs, measurement, or success criteria anywhere in the output.

**new-hire-onboarding**: Asks at least one question about edge cases or roles — whether all new hires follow the same program regardless of role or seniority
> No reference to roles, seniority levels, team types, or any differentiation across new hire populations.
