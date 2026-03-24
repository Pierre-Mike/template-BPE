/**
 * Documents the Cloudflare binding names that this Worker expects.
 * These must match the `binding` field in wrangler.toml when activated.
 *
 * See the commented examples in wrangler.toml for how to wire each one up.
 */
export const BINDINGS = {
	/** D1 database binding — activate with [[d1_databases]] in wrangler.toml */
	D1: "DB",
	/** KV namespace binding — activate with [[kv_namespaces]] in wrangler.toml */
	KV: "MY_KV",
} as const;
