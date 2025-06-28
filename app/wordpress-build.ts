#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import path from "node:path";
/**
 * WordPress Integration Build Script
 *
 * This script builds the React app for WordPress integration.
 * It outputs all files to the /dist directory in the plugin's root.
 */
import { build } from "bun";
import plugin from "bun-plugin-tailwind";

async function main() {
	console.log("\n🚀 Building React app for WordPress integration...\n");

	// Clean the dist directory if it exists
	const outdir = path.join(process.cwd(), "../dist");
	if (existsSync(outdir)) {
		console.log(`🗑️ Cleaning previous build at ${outdir}`);
		await rm(outdir, { recursive: true, force: true });
	}

	// Build both apps in one go
	console.log("\n🚀 Building React apps for WordPress integration...\n");
	const buildResult = await build({
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

	// Print the results
	console.log(
		`\n✅ Build completed with ${buildResult.outputs.length} files generated\n`,
	);

	console.log("Files built for WordPress integration:");
	for (const output of buildResult.outputs) {
		console.log(`- ${path.relative(process.cwd(), output.path)}`);
	}

	console.log(
		"\n👉 To use in WordPress, make sure your rwl.php file is properly enqueuing these files.\n",
	);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
