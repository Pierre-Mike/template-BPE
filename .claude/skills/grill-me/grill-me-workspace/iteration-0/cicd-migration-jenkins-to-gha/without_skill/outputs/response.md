# Grilling: Jenkins to GitHub Actions Migration

Here are the hard questions your plan needs to survive. No softballs.

---

## Scope and Complexity

**1. "40 Jenkinsfiles" — what does that actually mean?**
Are these 40 distinct pipeline shapes, or 40 files with heavy shared library usage? If you have a Jenkins Shared Library (`vars/` or `src/`), you're not migrating 40 files — you're migrating the shared library first, or re-implementing its logic as reusable GHA workflows/composite actions. Have you mapped your shared library surface area? What's the LOC count there?

**2. What's the variance across those 40 pipelines?**
If 35 are stamped from a template and 5 are snowflakes, your migration cost is not evenly distributed. Have you actually read all 40 Jenkinsfiles and categorized them? "Rewrite all 40" as a flat number suggests you may not have done this audit yet.

**3. What Jenkins plugins are in play?**
Jenkins' plugin ecosystem is its killer feature and your migration's biggest risk. Specific things that don't have clean GHA equivalents: Kubernetes plugin (ephemeral agents), Pipeline: Multibranch, Shared Groovy steps, Lockable Resources, Throttle Concurrent Builds. For each plugin, have you identified the GHA equivalent, or confirmed one exists?

---

## Team and Capacity

**4. 3 people, 40 files, 3 months — have you done the math?**
That's roughly 13 pipelines per person, or about one per week. That sounds fine until you account for: parallel running (you have to maintain both), on-call rotations, unplanned work, and the fact that complex pipelines can take several days to rewrite and validate. What percentage of these 3 people's time is actually allocated to this work? "Platform team of 3" doing *all the rewrites* while also presumably keeping the lights on is not the same as 3 FTEs on this migration.

**5. Who owns validation?**
When a Jenkinsfile is rewritten as a GHA workflow, who signs off that it's equivalent? The platform team, or the application team that owns the service? If it's the platform team alone, you're taking on risk you don't understand. If it requires app team sign-off, you've just introduced a coordination dependency across however many teams own those 40 pipelines — and that's not in your plan.

---

## The Parallel-Run Phase

**6. How long is "running both in parallel" and what triggers the cutover?**
This is the most underspecified part of your plan. "Run both in parallel" sounds safe, but it creates real problems: Which is the source of truth for build status? What happens when they produce different results? How do you gate deploys when two systems say different things? "Parallel" without a defined exit criterion is how migrations become permanent.

**7. What's the cost of running both?**
GitHub Actions isn't free at scale (unless you're on a generous enterprise agreement or all runners are self-hosted). Jenkins infra has ongoing maintenance cost. You're paying both costs for up to 3 months. Has this been budgeted and approved? Have you modeled GHA usage costs based on current build frequency and duration?

**8. What happens when Jenkins breaks during the parallel phase?**
If Jenkins has an outage in month 2, do you accelerate the GHA cutover, or do you fix Jenkins? This decision point needs to be pre-decided, or you'll have a panic-driven choice mid-incident.

---

## Risk and Rollback

**9. What's your rollback plan?**
If GHA turns out to be wrong for a specific pipeline (runner limitations, secrets management issues, rate limits, workflow size limits), what do you do? "Keep Jenkins around" isn't a rollback plan — it's just not having decommissioned it yet. You need a defined decision: under what conditions does a pipeline stay on Jenkins permanently, and how do you handle that exception?

**10. Have you accounted for GHA-specific limitations that Jenkins handles gracefully?**
- GHA has a 6-hour job timeout (configurable but bounded)
- Workflow files are capped at 500KB
- No native "lock" primitive for mutually exclusive jobs across repos
- Self-hosted runner fleet management is a new operational burden if you need custom environments
- GHA secrets are scoped differently than Jenkins credentials — org/repo/environment hierarchy vs. Jenkins folders

Do any of your 40 pipelines hit these constraints?

---

## Governance and Standards

**11. What's the GHA workflow standard you're migrating *to*?**
Are you defining a canonical workflow structure before you start, or letting each migration be slightly different? If you don't establish a reusable workflow / composite action strategy up front, you'll end up with 40 one-off YAML files that are as hard to maintain as the Jenkinsfiles were. What's the "shared library equivalent" in GHA terms, and is it designed before migration starts?

**12. How are you handling secrets migration?**
Jenkins credentials store → GHA secrets is not trivial at scale, especially if you use credential types GHA doesn't natively support (certificates, SSH keys with passphrases, username/password combos used in specific ways). Have you inventoried credentials used across all 40 pipelines and confirmed they map cleanly to GHA secrets/OIDC/environments?

---

## The Decommission

**13. What does "decommission Jenkins" actually mean, and who decides when it's done?**
Does the Jenkins server go away? Does the infra team own that? Is there a hard date, or is it "when all 40 are migrated"? What if migration is at 38/40 at the 3-month mark — do you extend the timeline or force the last 2? Decommission without a clear owner and hard date usually means Jenkins quietly runs forever.

---

## The Questions I'd Want Answered Before Starting

1. Have you read all 40 Jenkinsfiles and categorized them by complexity and plugin dependencies?
2. Have you mapped your Jenkins Shared Library and designed its GHA equivalent?
3. What percentage of the 3 engineers' time is formally allocated to this, and who approved it?
4. Have you modeled GHA cost against current build volume?
5. What is the explicit, pre-agreed exit criterion for the parallel-run phase?
6. Who signs off that each migrated pipeline is functionally equivalent?
7. Is there a canonical GHA workflow standard defined before migration begins?

If you can answer all seven with specifics, your plan is solid. If more than two are fuzzy, you have planning work to do before you start writing YAML.
