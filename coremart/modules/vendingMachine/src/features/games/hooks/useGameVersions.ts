import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback } from 'react';

import { gameCrudService } from '../gameService';

import type { Game, GameVersion } from '../types';


/**
 * Add / remove entries in a game's `versions` array.
 *
 * Versions are **not** a sub-resource — there is no `games/:id/versions` route. They are an array
 * field on the game record, so each mutation is an `update` that rewrites the whole array. The
 * caller must pass the current `game` so the new array can be derived from it.
 */
export function useGameVersions() {
	const { dispatchMethod, result } = useServiceLayer(gameCrudService.update);

	const writeVersions = useCallback(
		(game: Game, versions: GameVersion[]) => dispatchMethod({
			id: game.id,
			etag: game.etag,
			versions,
		}),
		[dispatchMethod],
	);

	const addVersion = useCallback(
		(game: Game, version: GameVersion) => writeVersions(game, [...(game.versions ?? []), version]),
		[writeVersions],
	);

	const deleteVersion = useCallback(
		(game: Game, versionCode: string) => writeVersions(
			game,
			(game.versions ?? []).filter((v) => v.code !== versionCode),
		),
		[writeVersions],
	);

	return { addVersion, deleteVersion, isSubmitting: result.isPending };
}
