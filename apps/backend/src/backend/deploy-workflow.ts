/**
 * Canonical constants describing the structure of .github/workflows/deploy.yml.
 *
 * The YAML_TEMPLATE constant documents the exact workflow that must exist at
 * .github/workflows/deploy.yml. It cannot be committed by a GitHub App token
 * without the `workflows` permission — a human with that permission must create
 * the file from this template.
 *
 * All other constants are referenced in CI tests to prevent accidental regressions
 * (wrong CI workflow name, wrong working directory, wrong environment name).
 */

/** Name of the CI workflow that must complete successfully before deploying */
const CI_WORKFLOW_NAME = "CI";
/** Working directory for the backend Wrangler deploy step */
const BACKEND_DIR = "apps/backend";
/** Working directory for the frontend Wrangler deploy step */
const FRONTEND_DIR = "apps/frontend";
/** Wrangler environment name for staging deploys */
const STAGING_ENV = "staging";
/** Wrangler environment name for production deploys */
const PRODUCTION_ENV = "production";

/**
 * The full YAML content for .github/workflows/deploy.yml.
 * Copy this verbatim when creating the file manually.
 */
const YAML_TEMPLATE = `name: Deploy to Staging

on:
  workflow_run:
    workflows: ["${CI_WORKFLOW_NAME}"]
    branches: [main]
    types: [completed]

jobs:
  deploy:
    name: Deploy (backend → frontend)
    runs-on: ubuntu-latest
    if: \${{ github.event.workflow_run.conclusion == 'success' }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "22"

      - uses: oven-sh/setup-bun@v2

      - uses: actions/cache@v4
        with:
          path: ~/.bun/install/cache
          key: bun-\${{ runner.os }}-\${{ hashFiles('bun.lock') }}
          restore-keys: bun-\${{ runner.os }}-

      - run: bun install --frozen-lockfile

      - name: Build backend
        working-directory: ${BACKEND_DIR}
        run: bun run build

      - name: Deploy backend to staging
        working-directory: ${BACKEND_DIR}
        run: npx wrangler deploy --env ${STAGING_ENV}
        env:
          CLOUDFLARE_API_TOKEN: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}

      - name: Build frontend
        working-directory: ${FRONTEND_DIR}
        run: bun run build

      - name: Deploy frontend to staging
        working-directory: ${FRONTEND_DIR}
        run: npx wrangler deploy --env ${STAGING_ENV}
        env:
          CLOUDFLARE_API_TOKEN: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
`;

/**
 * The full YAML content for the production deploy workflow.
 * Triggered by manual workflow_dispatch or by pushing a v* tag to main.
 * Copy this verbatim when creating the file manually.
 */
const PROD_YAML_TEMPLATE = `name: Deploy to Production

on:
  workflow_dispatch:
  push:
    tags:
      - "v*"

jobs:
  deploy-production:
    name: Deploy to production (backend → frontend)
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "22"

      - uses: oven-sh/setup-bun@v2

      - uses: actions/cache@v4
        with:
          path: ~/.bun/install/cache
          key: bun-\${{ runner.os }}-\${{ hashFiles('bun.lock') }}
          restore-keys: bun-\${{ runner.os }}-

      - run: bun install --frozen-lockfile

      - name: Build backend
        working-directory: ${BACKEND_DIR}
        run: bun run build

      - name: Deploy backend to production
        working-directory: ${BACKEND_DIR}
        run: npx wrangler deploy --env ${PRODUCTION_ENV}
        env:
          CLOUDFLARE_API_TOKEN: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}

      - name: Build frontend
        working-directory: ${FRONTEND_DIR}
        run: bun run build

      - name: Deploy frontend to production
        working-directory: ${FRONTEND_DIR}
        run: npx wrangler deploy --env ${PRODUCTION_ENV}
        env:
          CLOUDFLARE_API_TOKEN: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
`;

export const DEPLOY_WORKFLOW = {
	CI_WORKFLOW_NAME,
	BACKEND_DIR,
	FRONTEND_DIR,
	STAGING_ENV,
	PRODUCTION_ENV,
	YAML_TEMPLATE,
	PROD_YAML_TEMPLATE,
} as const;
