/**
 * Canonical name constants for the [env.staging] and [env.production] blocks
 * in apps/frontend/wrangler.toml.
 */
export const FRONTEND_WRANGLER_ENVS = {
	/** App name for the staging environment */
	STAGING_NAME: "template-bpe-frontend-staging",
	/** App name for the production environment */
	PRODUCTION_NAME: "template-bpe-frontend-production",
} as const;
