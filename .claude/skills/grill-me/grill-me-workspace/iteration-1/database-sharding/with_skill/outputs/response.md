# Grill Me: Database Sharding by User ID

## Motivation

What's driving this now — is it a specific query latency threshold you've hit, a storage limit, or something else?

How much data are you actually managing today, and what growth rate made sharding feel necessary over alternatives like read replicas or vertical scaling?

## Design Decisions

Why user ID specifically as the shard key — what access patterns drove that choice over sharding by geography, tenant, or a hash of the user ID?

What sharding factor are you planning — how many shards, and how did you arrive at that number?

How will you handle cross-shard queries for operations that span multiple users, such as analytics, admin tooling, or any features that join users together?

What happens to a shard that receives a disproportionate share of high-activity users — how are you thinking about hotspot management?

## Migration

What's your plan for moving existing users to the new sharded layout — will you do a live migration, a cutover with downtime, or a dual-write approach?

How will you route reads and writes during the transition period when data exists in both the old schema and the new sharded one?

## Operational Readiness

How will your application layer know which shard to target for a given user ID — is there a routing layer, a client library, or something embedded in the app itself?

What does failure look like if one shard goes down — do users on that shard get a hard error, a degraded experience, or is there a failover strategy?

How will you run schema migrations going forward across all shards simultaneously?

## People and Process

Who owns the sharding logic in the codebase, and how many teams will need to update their queries or data access patterns?

## Success Criteria

How will you know the sharding is working — what metrics will you be watching, and what outcome would make you declare this a success?
