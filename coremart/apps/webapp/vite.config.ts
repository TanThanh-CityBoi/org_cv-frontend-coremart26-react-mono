/// <reference types="vitest" />

import tailwindcssVite from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';


export default defineConfig({
	plugins: [
		tsconfigPaths(),
		// Service classes are annotated with TC39 decorators (`@storeService`). Oxc, the
		// default transformer, does not implement them: it passes the decorator through
		// verbatim and emits `export @storeService(...) class ...`, which no browser can
		// parse ("Unexpected token 'export'"). Routing these files through Babel with the
		// decorators plugin compiles them away. `version: '2023-11'` is the stage-3
		// standard semantics the runtime `storeService` is written against, not the
		// legacy `experimentalDecorators` form.
		react({
			babel: {
				plugins: [
					['@babel/plugin-proposal-decorators', { version: '2023-11' }],
				],
			},
		}),
		tailwindcssVite(),
	],
	resolve: {
		alias: {
			// Tree-shaking
			'@tabler/icons-react': '@tabler/icons-react/dist/esm/icons',
		},
	},
});
