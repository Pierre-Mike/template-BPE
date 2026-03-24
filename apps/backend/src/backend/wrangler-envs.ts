/**
 * Canonical name constants for the [env.staging] and [env.production] blocks
 * in apps/backend/wrangler.toml.
 */
export const WRANGLER_ENVS = {
	/** Worker name for the staging environment */
	STAGING_NAME: "template-bpe-backend-staging",
	/** Worker name for the production environment */
	PRODUCTION_NAME: "template-bpe-backend-production",
} as const;
