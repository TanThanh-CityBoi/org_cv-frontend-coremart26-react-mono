/** Fallback key published by MapTiler for unregistered demo use. */
export const DEFAULT_MAPLIBRE_GL_API_KEY = 'get_your_own_OpIi9ZULNHzrESv6T2vL';

/**
 * The MapTiler key from the shell env, falling back to MapTiler's public demo key.
 *
 * `MAPLIBRE_GL_API_KEY` is a coremart-only variable, so it is absent from `ShellEnvVars` — a
 * closed type alias in nikkierp that cannot be augmented by declaration merging. Reading it
 * through one accessor keeps the widening cast in a single place instead of at every map.
 */
export function getMaplibreGlApiKey(envVars: object): string {
	const key = (envVars as { MAPLIBRE_GL_API_KEY?: string }).MAPLIBRE_GL_API_KEY;
	return key || DEFAULT_MAPLIBRE_GL_API_KEY;
}
