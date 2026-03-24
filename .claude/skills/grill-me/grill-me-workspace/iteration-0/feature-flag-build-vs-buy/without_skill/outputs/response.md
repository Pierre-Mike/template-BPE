# Grilling: In-House Feature Flag System

Alright, let's stress-test this plan. I have a lot of questions and concerns across several dimensions.

---

## 1. Redis as the Source of Truth

**Who owns the Redis instance — and is it the same one handling your application cache?**

If you're sharing Redis with application caching or session storage, a misconfigured flag write or a Redis memory pressure event could evict your flags silently. You'd have no idea a flag disappeared until production breaks. Are you planning a dedicated Redis cluster for flags, with separate memory limits and eviction policies (ideally `noeviction`)?

**What happens when Redis is unavailable?**

This is the most important question you haven't answered. If your SDK reads flags on every request and Redis goes down, what does your system do? Do you fail open, fail closed, or serve stale values? "Stale values" sounds safe until you realize you need a local fallback cache in every service — which means you're now building a caching layer on top of Redis, which is what LaunchDarkly's SDK already does for you.

**How do you handle Redis failover latency?**

If your Redis primary fails and you're in the middle of a failover (Sentinel or Cluster election), that can take 10–30 seconds. For 15 services reading on every request, that's 10–30 seconds of either errors or frozen flag state. Have you modeled what that looks like under production load?

---

## 2. The "Thin SDK Wrapper"

**How thin is thin, exactly?**

A truly thin wrapper — just `HGET flags <flag_name>` on every request — means a synchronous network call to Redis on every HTTP request across 15 services. At even modest traffic (say, 1,000 req/s across your services), that's 1,000 Redis calls per second just for flags, on top of everything else. Have you measured what the p99 latency contribution of that call is? What happens to your SLA when Redis slows down?

**Do you have a local in-process cache with TTL?**

If the SDK caches flags in memory with a short TTL (e.g., 5 seconds), you've reduced Redis load but introduced flag propagation delay. That might be fine — but it needs to be a deliberate decision with a defined TTL, not an afterthought.

**Will the SDK be a shared library across 15 services?**

If yes: how many languages/runtimes do your 15 services use? If you have Go, Python, Node, and Java services, you're maintaining 4 separate SDK implementations. Each one needs the same behavior: local caching, fallback defaults, error handling, flag type coercion. Who owns that? How do you ensure consistency when one team updates their SDK version and another doesn't for six months?

**How do you handle flag type safety?**

Redis hashes store strings. If a flag is a JSON object (for multivariate flags), who does the deserialization? What happens when a malformed value gets written? Do your services crash, or do they fall back gracefully?

---

## 3. Targeting and Segmentation

**Do you need user-level or context-level targeting?**

A Redis hash of `flag_name -> "true"/"false"` is a global on/off switch. That's fine for kill switches. But what about:

- Rolling out a feature to 10% of users?
- Enabling a flag only for users in the "beta" group?
- A/B testing with consistent bucket assignment per user?

If you ever need any of these — and with 30 engineers across 15 services, you will — your "thin wrapper" needs to become a rule evaluation engine. That's not thin anymore. That's a significant piece of infrastructure. What's your plan when the first engineer asks for a percentage rollout?

---

## 4. The Admin Panel

**Who has write access to the admin panel?**

With 30 engineers, "the admin panel" can mean anything from "anyone with a login" to "only platform engineers after a code review." Feature flags that touch production behavior need access controls. Do you have:

- Role-based permissions (who can create vs. toggle vs. delete flags)?
- Approval workflows for high-risk flags?
- An audit log of every toggle, with timestamp and actor?

**What is your change review process?**

A mis-toggled flag at 2pm on a Tuesday can take down a service just as effectively as a bad deploy. Arguably worse, because it's invisible in your deployment tooling. Do engineers get paged when a flag changes? Is there a "are you sure?" gate? Can you toggle a flag for one environment without affecting production?

---

## 5. Observability and Debugging

**How do you know which flags are active when something breaks?**

When an incident happens, your on-call engineer needs to answer: "What flags were active, and what values did service X see, at the time of the incident?" With a Redis hash and no event log, the answer is "whatever is in Redis right now." That's not an audit trail. Have you planned for:

- A changelog / event stream of every flag mutation?
- Metrics on flag evaluation counts per service?
- The ability to snapshot flag state at a point in time?

**How do you debug "flag is wrong in production"?**

If an engineer reports that a flag is returning the wrong value in a specific service, your debugging path is: SSH somewhere, run `HGET`, check the service's local cache TTL, check if the SDK is reading the right Redis instance, check if the service is on the right version of the SDK. That's a long chain. Do you have tooling to make this fast?

---

## 6. Operational Burden and Maintenance

**Who owns this system long-term?**

You're about to create a piece of infrastructure that 30 engineers and 15 services will depend on. Someone needs to:

- Handle Redis capacity planning
- Review and merge SDK changes across languages
- Triage "flag not working" tickets
- Build and maintain the admin panel UI
- Write runbooks for failure scenarios

Is there a team budgeted for this? "We'll own it as a team" with no designated owner means it will be under-maintained within 12 months.

**What is the total cost of build vs. buy?**

LaunchDarkly at your scale (30 engineers, 15 services) is roughly $300–$800/month depending on plan. Split is similar. Your in-house system will cost:

- Initial build: likely 2–4 engineer-weeks to do it properly (with caching, fallbacks, audit log, multi-language SDKs)
- Ongoing maintenance: probably 0.5–1 engineer per quarter indefinitely
- Incident response time when it breaks

Have you done that math? The breakeven point for build vs. buy is often much further out than teams expect.

---

## 7. Correctness Under Concurrency

**What is your write consistency model?**

If two engineers toggle the same flag simultaneously from the admin panel, what happens? Redis is single-threaded for commands, so a simple `HSET` is atomic — but if your admin panel does read-modify-write (e.g., "toggle" = read current value, flip it, write back), you have a race condition. Are you using atomic Redis operations or Lua scripts for mutations?

**How do you handle flag deletion vs. disabling?**

If a flag is deleted from Redis, services that haven't refreshed their local cache will still evaluate it. Services that have already refreshed will get a key-not-found and fall back to... what? Is the default behavior to fail open or closed, and is that consistent across all your SDK implementations?

---

## The Core Question

Before building this, I'd push you to be precise about one thing: **what problem are you actually solving by not using LaunchDarkly or Split?**

If the answer is cost, you should model the full engineering cost of build vs. buy — it's rarely as cheap as it looks.

If the answer is data privacy (flags contain sensitive targeting data), that's a legitimate reason — but it changes your requirements significantly.

If the answer is "we want control," that's worth interrogating. Control comes with responsibility. The operational surface area you're taking on here is non-trivial for a 30-engineer organization with 15 services.

None of this means you shouldn't build it. Simple kill-switch flags in Redis are entirely reasonable. But the plan as stated — Redis hash, thin wrapper, admin panel toggle — is missing answers to about a dozen production-critical questions. Which of these have you already solved?
