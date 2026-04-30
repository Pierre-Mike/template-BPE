/**
 * Canonical names for the GitHub Actions secrets required for Cloudflare deployment.
 * These must be configured in the GitHub repository under:
 * Settings → Secrets and variables → Actions → New repository secret
 *
 * Neither value should ever appear in plaintext in the repository; only the
 * secret names are stored here so CI workflows can reference them without
 * hardcoding strings that could be misspelled.
 */
export const GITHUB_SECRETS = {
	/** Cloudflare API token scoped to Workers Scripts:Edit and Pages:Edit */
	CLOUDFLARE_API_TOKEN: "CLOUDFLARE_API_TOKEN",
	/** Cloudflare account ID for the target deployment account */
	CLOUDFLARE_ACCOUNT_ID: "CLOUDFLARE_ACCOUNT_ID",
} as const;

export type GitHubSecretName = (typeof GITHUB_SECRETS)[keyof typeof GITHUB_SECRETS];

/**
 * Minimum Cloudflare API token permissions required for CI deployments.
 * The token must have at least these permissions scoped to the correct account.
 */
export const CLOUDFLARE_TOKEN_PERMISSIONS = {
	/** Required to deploy Worker scripts via Wrangler */
	WORKERS_SCRIPTS_EDIT: "Workers Scripts:Edit",
	/** Required to deploy Cloudflare Pages projects via Wrangler */
	PAGES_EDIT: "Pages:Edit",
} as const;
