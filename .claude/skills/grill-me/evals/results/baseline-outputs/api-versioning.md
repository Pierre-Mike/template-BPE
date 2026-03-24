Good news and bad news from the codebase scan. **Good news**: no existing routes means you're starting clean. **Bad news**: that means the versioning strategy you pick now will be load-bearing from day one.

Let me dig in.

---

**Question 1 — Scope of "the API"**

The codebase has FastAPI declared as a dependency but zero HTTP routes implemented. The only "API" that exists today is the FreeCAD agent's internal Python interface (`FreeCADAPIWrapper`, `FreeCADAgent`).

So when you say "version our API" — what exactly are you versioning?

- (a) A new **HTTP API** you're about to build on top of this agent skills framework?
- (b) A specific agent's HTTP surface (e.g., the FreeCAD agent only)?
- (c) The **skill invocation protocol** — how external callers trigger skills?
- (d) Something else entirely?

The answer changes everything downstream — routing structure, what counts as a breaking change, and who the consumers are.