import * as nrwl from "@nrwl/devkit";
import { Tree } from "@nrwl/devkit";
import * as path from "path";

import {
	GeneratorOptions,
	normalizeGeneratorOptions,
	updateWorkspaceMembers,
} from "../../common";
import cargoInit from "../init/generator";
import CLIOptions from "./schema";

// prettier-ignore
type Options = CLIOptions & GeneratorOptions;

export default async function (host: Tree, opts: CLIOptions) {
	let options = normalizeGeneratorOptions("application", host, opts);

	nrwl.addProjectConfiguration(host, options.projectName, {
		root: options.projectRoot,
		projectType: "application",
		sourceRoot: `${options.projectRoot}/src`,
		targets: {
			build: {
				executor: "@noctifer20/nx-cargo:build",
				options: {
					release: false,
				},
				configurations: {
					production: {
						release: true,
					},
				},
			},
			run: {
				executor: "@noctifer20/nx-cargo:build",
				options: {
					release: false,
					run: true,
				},
			},
			test: {
				executor: "@noctifer20/nx-cargo:test",
				options: {},
			},
			lint: {
				executor: "@noctifer20/nx-cargo:clippy",
				options: {
					fix: false,
					failOnWarnings: true,
					noDeps: true,
				},
			},
		},
		tags: options.parsedTags,
	});

	await addFiles(host, options);
	updateWorkspaceMembers(host, options);
	await nrwl.formatFiles(host);
}

async function addFiles(host: Tree, opts: Options) {
	if (!host.exists("Cargo.toml")) {
		await cargoInit(host, {});
	}

	let substitutions = {
		projectName: opts.projectName,
		edition: opts.edition,
		template: "",
	};

	nrwl.generateFiles(
		host,
		path.join(__dirname, "files"),
		opts.projectRoot,
		substitutions
	);
}
