/// <reference types="astro/client" />

interface Env {
	PUBLIC_API_URL: string;
}

declare module "cloudflare:workers" {
	export const env: Env;
}
