/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
	forbidden: [
		{
			name: "core-is-pure",
			comment:
				"*.core.ts files contain pure business logic — no I/O, no platform adapters. " +
				"They must not import sibling tiers (repo/routes/migration/fixture) within the slice " +
				"or any platform infrastructure adapter (effect-handler, config, bindings, d1-types). " +
				"Violation: a PR adding `import ... from '../../platform/effect-handler.ts'` inside " +
				"a *.core.ts file fails CI.",
			severity: "error",
			from: { path: "src/backend/features/[^/]+/[^/]+\\.core\\.ts$" },
			to: {
				path: "src/backend/(features/[^/]+/[^/]+\\.(repo|routes|migration|fixture)\\.ts$|platform/(effect-handler|wrangler-bindings|worker-bindings|d1-types|config))",
			},
		},
		{
			name: "no-cross-feature-imports",
			comment:
				"Features must not import each other directly. Cross-feature collaboration goes through " +
				"platform/ (shared infra) or composition in api.ts. " +
				"Violation: `import ... from '../version/version.core.ts'` inside features/note/ fails CI.",
			severity: "error",
			from: { path: "^src/backend/features/([^/]+)/" },
			to: { path: "^src/backend/features/(?!$1/)[^/]+/" },
		},
		{
			name: "platform-has-no-feature-deps",
			comment:
				"platform/ is feature-agnostic infrastructure. Must not import from features/. " +
				"Violation: a PR adding `import ... from '../features/note/...'` in platform/ fails CI.",
			severity: "error",
			from: { path: "src/backend/platform/" },
			to: { path: "src/backend/features/" },
		},
		{
			name: "effect-handler-stays-pure-glue",
			comment:
				"platform/effect-handler.ts is the Effect runtime adapter — pure glue. " +
				"It must not import any feature code. " +
				"Violation: `import ... from '../features/...'` inside effect-handler.ts fails CI.",
			severity: "error",
			from: { path: "src/backend/platform/effect-handler\\.ts$" },
			to: { path: "src/backend/features/" },
		},
	],
	options: {
		doNotFollow: { path: "node_modules" },
		tsPreCompilationDeps: true,
		enhancedResolveOptions: {
			extensions: [".ts", ".tsx", ".js", ".jsx"],
		},
	},
};
