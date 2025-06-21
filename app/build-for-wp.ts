#!/usr/bin/env bun
import { build } from "bun";
import plugin from "bun-plugin-tailwind";
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import path from "node:path";

const outdir = path.join(process.cwd(), "../dist");
if (existsSync(outdir)) {
	console.log(`🗑️ Cleaning previous build at ${outdir}`);
	await rm(outdir, { recursive: true, force: true });
}

console.log("\n🚀 Building React app...\n");

// Build the frontend app specifically for WordPress integration
const result = await build({
	entrypoints: ["./src/frontend.tsx"],
	outdir,
	plugins: [plugin],
	minify: true,
	target: "browser",
	sourcemap: "linked",
	define: {
		"process.env.NODE_ENV": JSON.stringify("production"),
	},
});

// Also copy any static assets
try {
	await Bun.write(path.join(outdir, "logo.svg"), Bun.file("./src/logo.svg"));
	console.log("✅ Copied logo.svg to output directory");
} catch (error) {
	console.error("⚠️ Failed to copy logo.svg:", error);
}

console.log(
	`\n✅ Build completed with ${result.outputs.length} files generated\n`,
);
