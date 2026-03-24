The codebase here is a stateless skill orchestration platform with no database — so this plan isn't about *this* repo. That means I have zero codebase context to lean on. Every assumption needs to come from you. Let's start at the root of the decision tree.

---

**Question 1 — The problem statement:**

You said "improve performance." Have you actually measured the problem, or is this anticipated?

Specifically: Do you have **concrete metrics** — query latency (p50/p95/p99), database CPU, connection pool exhaustion, or throughput numbers — that tell you PostgreSQL is the bottleneck? Or are you reasoning from first principles that it *will* be a bottleneck?