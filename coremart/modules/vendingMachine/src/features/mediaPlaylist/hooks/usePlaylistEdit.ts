import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback } from 'react';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { mediaPlaylistCrudService } from '../mediaPlaylistCrudService';

import type { Playlist } from '../types';


export type PlaylistUpdateFormData = { id: string, etag: string } & Pick<
	Partial<Playlist>,
	'name' | 'scopeType' | 'scopeRef'
>;


export function usePlaylistEdit({ onUpdateSuccess }: { onUpdateSuccess?: () => void }) {
	const { dispatchMethod, result } = useServiceLayer(mediaPlaylistCrudService.update);

	useMutationOutcome(result, {
		successKey: () => 'media_playlist.messages.update_success',
		errorKey: 'errors.updateFailed',
		onSuccess: onUpdateSuccess,
	});

	const submit = useCallback(
		(modelData: PlaylistUpdateFormData) => {
			if (!modelData.id || !modelData.etag) return;
			const { id, etag, name, scopeType, scopeRef } = modelData;
			dispatchMethod({ id, etag, name, scopeType, scopeRef });
		},
		[dispatchMethod],
	);

	return { isSubmitting: result.isPending, handleSubmit: submit };
}
