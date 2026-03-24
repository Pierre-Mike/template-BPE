# Grill Me: Auth0 Migration

## Motivation

What's the specific failure mode or limitation in your homegrown auth that's driving this now — is it a security incident, a compliance requirement, a scaling problem, or something else?

Who made this decision, and what alternatives to Auth0 were evaluated before settling on it?

## Scope and Design

When you say "all our apps" — how many apps are we talking, and do they share a single session store today or does each app manage its own?

What does your current session-based auth handle beyond login: MFA, SSO, role/permission data, impersonation, service-to-service auth?

Which of those features does Auth0 cover out of the box, and which will require custom rules, actions, or post-login hooks you'll have to build and maintain?

## Migration Path

What's the sequencing — are you migrating all apps at once, or app by app, and if the latter, how will you handle users who are authenticated in a pre-migration app that needs to call a post-migration one?

How are you handling existing active sessions during the cutover — forced logout, parallel session validity, or something else?

What happens to your existing user store: are you migrating user records into Auth0, keeping your own database as the source of truth, or running a dual-write period?

## Operational Readiness

What does your rollback plan look like if Auth0 is down or behaving unexpectedly in production — can you revert to homegrown auth without a full redeploy?

Auth0 introduces a runtime dependency on a third-party service for every authenticated request. How are you thinking about availability and latency SLAs compared to what you had before?

## People and Process

Who owns the Auth0 tenant configuration going forward, and how will changes to it (new connections, rule updates, policy changes) be reviewed and deployed?

How are your app teams being onboarded to the new auth model — are they expected to migrate their own integrations, or is a central team doing it for them?

## Success Criteria

How will you know the migration succeeded — what does "done" look like, and what are the metrics or signals you're watching during and after rollout?
