# Grill Me: Redis Caching Layer

## Motivation

What specific performance problem are you solving — is this latency on reads, throughput under load, or something else you've measured?

What data do you have on where the bottleneck actually is? Have you profiled the PostgreSQL queries or checked connection pool saturation?

Why Redis specifically over alternatives like Memcached, an in-process cache, or query-level optimizations in Postgres itself?

## Design Decisions

Which queries or data sets are you planning to cache, and how did you decide on those?

What's your cache invalidation strategy — how will you ensure cached data stays consistent with what's in Postgres when writes happen?

What TTL policy are you planning, and how did you arrive at that?

If a write goes to Postgres but the cache isn't invalidated in time, what does that mean for your users — is stale data acceptable in your domain, and for how long?

## Operational Readiness

How will you handle Redis being unavailable — does the application fall back to Postgres, fail hard, or something else?

What does your monitoring setup look like for cache hit rate, eviction rate, and latency once this is live?

What's your rollback plan if caching causes correctness issues in production?

## People and Process

Who owns Redis infrastructure once this is running — is that your team, a platform team, or a managed service?

How are you handling cache warming after a Redis restart or eviction flush?

## Risk and Exit

What's the worst-case failure mode here, and what's the blast radius if it happens?

If caching turns out not to solve the performance problem, what's your next move?

## Success Criteria

How will you know this worked — what metric or threshold will you use to call it a success?

What does a partial success look like, and at what point would you decide to roll it back?
