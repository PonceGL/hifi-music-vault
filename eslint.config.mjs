import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SOURCE_FILES = ["src/**/*.{ts,tsx}", "__tests__/**/*.{ts,tsx}"];

export default defineConfig([
  globalIgnores([
    "node_modules/**",
    ".next/**",
    ".agents/**",
    "out/**",
    "build/**",
    "public/**",
    "next-env.d.ts",
    "*.config.{mjs,ts,js}",
    "postcss.config.mjs",
  ]),

  ...nextVitals,
  ...nextTs,

  // Enable type-aware parsing for source files (required for no-floating-promises)
  {
    files: SOURCE_FILES,
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
  },

  // Custom rules — plugins already registered by nextVitals / nextTs
  {
    files: SOURCE_FILES,
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@next/next/no-img-element": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  prettierConfig,
]);
