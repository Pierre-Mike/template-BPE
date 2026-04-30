/**
 * Canonical markers for the deployment binding examples in wrangler.toml.
 * These comment-only examples document how to activate Cloudflare D1, KV,
 * and environment variables without enabling any live bindings.
 */
export const WRANGLER_EXAMPLES = {
	/** Marker for the commented D1 database binding example */
	D1_DATABASES_SECTION: "[[d1_databases]]",
	/** Marker for the commented KV namespace binding example */
	KV_NAMESPACES_SECTION: "[[kv_namespaces]]",
	/** Marker for the commented vars section example */
	VARS_SECTION: "[vars]",
	/** The DB binding name used in the D1 example */
	D1_BINDING: 'binding = "DB"',
} as const;
