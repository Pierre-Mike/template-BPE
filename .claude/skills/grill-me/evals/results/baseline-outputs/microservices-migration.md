Let's start at the root of the tree — the **"why"** before we touch the "how."

---

## Round 1: Motivation & Success Criteria

**Q1: What is the primary driver for this migration?**

Pick the closest one (or correct me):
- A) We're hitting **scaling bottlenecks** — specific parts of the system can't scale independently
- B) We have **team autonomy problems** — multiple teams are stepping on each other in the same codebase
- C) We want **independent deployability** — deployments are too risky/slow because everything ships together
- D) We have a **technology debt** problem — we want to rewrite parts in different languages/frameworks
- E) Something else entirely

The answer to this question determines *which* services get carved out first, *how* we measure success, and whether 6 months is even a realistic timeline.

---

And before you answer — a loaded follow-up baked in:

**Q1b: Who made the decision to do this, and do the engineers closest to the codebase agree it's the right call?**

Top-down mandates and bottom-up consensus lead to very different execution realities.