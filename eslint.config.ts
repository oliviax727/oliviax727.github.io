import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { Config, defineConfig } from "eslint/config";
import type { Linter } from "eslint";
import functional from "eslint-plugin-functional";
import html from "@html-eslint/eslint-plugin";
import globals from "globals";

// Files that should ALWAYS be ignored (as they are automatically generated)
const universalIgnores = ["src/scripts/dist/**", "src/scripts/app/**", "src/scripts/types/**", "bundle.js"];

const globalIgnoreConfig = {
	ignores: universalIgnores,
} as Config;

const defaultRules: Linter.RulesRecord = {
	indent: ["warn", "tab"],
	semi: [1, "always"],
};

// Configure node-only files
const nodeOnlyConfig = {
	files: ["src/scripts/**/*.ts"],
	ignores: universalIgnores,
	plugins: { js },
	extends: [
		js.configs.recommended,
		tseslint.configs.recommendedTypeChecked,
		tseslint.configs.strictTypeChecked,
		tseslint.configs.stylisticTypeChecked,
	],
	languageOptions: {
		globals: globals.node,
		parserOptions: {
			projectService: true,
		},
	},
	rules: defaultRules,
} as Config;

// Configure browser-only files
const browserOnlyConfig = {
	files: ["**/*.js"],
	ignores: universalIgnores,
	plugins: { js, html },
	extends: [js.configs.recommended, html.configs.recommended],
	languageOptions: {
		globals: globals.browser,
		parserOptions: {
			projectService: true,
		},
	},
	rules: defaultRules,
} as Config;

// Configure typescript backend modules
const moduleOnlyConfig = {
	files: ["src/scripts/**/*.ts"],
	ignores: ["src/scripts/**/index.ts", ...universalIgnores],
	plugins: { functional },
	extends: [
		functional.configs.recommended,
		functional.configs.stylistic,
		functional.configs.externalVanillaRecommended,
		functional.configs.externalTypeScriptRecommended,
	],
	languageOptions: {
		parserOptions: {
			projectService: true,
		},
	},
	rules: defaultRules,
} as Config;

// Configure entry files
const entryConfig = {
	files: ["src/scripts/entry.js", "src/scripts/**/index.ts"],
	ignores: universalIgnores,
	languageOptions: {
		parserOptions: {
			sourceType: "module",
			allowImportExportEverywhere: true,
		},
	},
	rules: defaultRules,
} as Config;

export default defineConfig([globalIgnoreConfig, nodeOnlyConfig, browserOnlyConfig, moduleOnlyConfig, entryConfig]);
