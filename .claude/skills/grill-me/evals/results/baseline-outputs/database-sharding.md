Let's dig in. I'll work through this systematically, one branch at a time.

---

**Question 1: What's driving the decision right now?**

You said "growing dataset" — but *which* specific bottleneck are you actually hitting?

- **Storage** — you're running out of disk on a single node?
- **Write throughput** — too many inserts/updates per second?
- **Read latency** — queries are slowing down under load?
- **Lock contention** — hot rows blocking each other?
- **Replication lag** — your read replicas can't keep up?

The answer matters enormously, because sharding by user ID solves some of these and is completely irrelevant to others. For example, if your bottleneck is a handful of extremely hot users (e.g. large enterprise accounts), sharding by user ID could make things *worse* by concentrating hot shards.

What does your monitoring actually show?