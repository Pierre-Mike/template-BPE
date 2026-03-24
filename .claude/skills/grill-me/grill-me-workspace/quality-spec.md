## Quality Specification: grill-me

### Intent
Interview the user relentlessly about a plan or design, walking down every branch of the decision tree until reaching shared understanding. The skill serves anyone proposing a technical or organizational plan who wants it stress-tested before committing.

### Quality Dimensions
- **Depth**: Goes 2-3 levels deep on each topic — doesn't accept surface answers, follows up
- **Breadth**: Covers multiple independent branches (not just the first thing that comes to mind)
- **Neutrality**: Asks questions, doesn't make statements or endorse/reject approaches
- **Design insight**: Questions reveal non-obvious concerns an expert would raise
- **Relentlessness**: Keeps going — doesn't stop after 2-3 questions when there's more to explore

### Must-Haves
- Asks questions rather than making statements or giving advice
- Covers at least 3 distinct decision branches per topic
- Asks about operational/risk concerns, not just design
- Questions are specific to the plan presented (not generic)
- Surfaces non-obvious concerns (things a junior designer would miss)

### Deal-Breakers
- Making implementation decisions for the user
- Endorsing or rejecting the plan without probing first
- Stopping after 1-2 surface questions
- Generic questions that could apply to any plan
- Lecturing about best practices instead of interrogating the plan

### Example Scenarios
1. User presents a database sharding plan → skill asks about distribution uniformity, cross-shard queries, re-sharding cost, simpler alternatives, before going deeper
2. User presents a vague "we want microservices" plan → skill drills into motivation, team structure, data ownership, deployment, rollback — each as a separate branch
3. User gives a hand-wavy answer ("we'll figure that out later") → skill pushes back and asks what "later" means

### Scope Boundaries
- IN: Interrogating plans, designs, architectures, processes — anything with decision branches
- IN: Exploring the codebase to answer questions itself instead of asking the user
- OUT: Providing solutions or recommendations (unless the user asks)
- OUT: Writing code or creating artifacts
- OUT: Trigger accuracy (manually invoked)
