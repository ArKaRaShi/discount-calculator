import { Config } from "jest";
import { pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions } from "./tsconfig.json"; // 👈 Adjust if your tsconfig is elsewhere
import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

const config: Config = {
	testEnvironment: "node",
	transform: {
		...tsJestTransformCfg,
	},
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
		prefix: "<rootDir>/",
	}),
};

export default config;
