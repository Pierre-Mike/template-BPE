# Grill Me: In-House Feature Flag System

## Motivation

What specifically made you rule out LaunchDarkly and Split — was it cost, data residency, vendor dependency, or something else? And what's the immediate trigger: is there a feature rollout blocked on not having flags, or is this a proactive infrastructure investment?

You mentioned "our existing admin panel" — who built it, who currently owns it, and how often do non-engineers use it to toggle things today?

## Design Decisions

You said flags are stored in a Redis hash and read on each request. What's the expected read volume across your 15 services at peak, and have you profiled what a per-request Redis call adds to your p99 latency?

If Redis is unavailable — connection failure, eviction, or a network partition — what does the SDK do? Does the request fail, fall back to a default value, or fall back to a local cache?

How will the SDK know which variant to serve to which user or request? Are you implementing percentage rollouts, user-segment targeting, or just binary on/off per flag?

You have 15 services. Will each service get its own SDK instance with its own Redis connection, or is there a shared sidecar/proxy? How does that affect your connection pool under concurrent traffic?

## Operational Readiness

When an engineer on service 7 toggles a flag in the admin panel, how quickly does that change propagate to all 15 services — and how will you verify propagation happened everywhere before assuming the rollout is live?

What's the audit trail? If a flag was toggled at 3am and caused an incident, how will the on-call engineer find out who changed what, when, and from what value to what value?

Do you have circuit-breaking or rate-limiting on the Redis reads themselves, or is the flag system on the same Redis cluster as your application data?

## People and Process

Who owns the SDK? With 30 engineers across 15 services, who decides when the SDK gets a new version, who reviews breaking changes, and how do services actually upgrade?

Are engineers expected to clean up flags after a rollout, or do flags accumulate indefinitely in the hash? What happens to flag evaluation logic in the codebase once a flag is fully rolled out — is there a process to remove it?

When a flag is misconfigured and causes an incident, is the first-responder protocol "toggle it off in the admin panel" — and does every on-call engineer have access to do that at 2am?

## Risk and Exit

If this system becomes load-bearing for 15 services and you later decide it's not meeting your needs, what does migration off it look like — particularly if flags have accumulated deeply into application logic across services?

Have you estimated the engineering hours to build, maintain, and evolve this system over 12 months, and how does that compare to the cost of the vendor tools you're replacing?

## Success Criteria

How will you know in 6 months that building this in-house was the right call — what does success look like beyond "it works"?
