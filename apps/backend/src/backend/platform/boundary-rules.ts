/**
 * Canonical names for the dependency-cruiser boundary enforcement rules.
 * These must match the `name` fields in apps/backend/.dependency-cruiser.cjs.
 */
export const BOUNDARY_RULES = {
	/** *.core.ts must not import sibling tiers or platform adapters */
	CORE_IS_PURE: "core-is-pure",
	/** features must not import each other directly */
	NO_CROSS_FEATURE_IMPORTS: "no-cross-feature-imports",
	/** platform/ must not import from features/ */
	PLATFORM_HAS_NO_FEATURE_DEPS: "platform-has-no-feature-deps",
	/** platform/effect-handler.ts must not import from features/ */
	EFFECT_HANDLER_STAYS_PURE_GLUE: "effect-handler-stays-pure-glue",
} as const;

export type BoundaryRuleName = (typeof BOUNDARY_RULES)[keyof typeof BOUNDARY_RULES];
