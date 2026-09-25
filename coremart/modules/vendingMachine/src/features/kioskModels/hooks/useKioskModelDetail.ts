import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { kioskModelCrudService } from '../kioskModelService';
import { KioskModel } from '../types';


type GetOneResponse = { item: KioskModel };


export function useKioskModelDetail(modelId?: string): { model: KioskModel | undefined, isLoading: boolean } {
	const { dispatchMethod, result } = useServiceLayer<GetOneResponse>(kioskModelCrudService.getById);

	React.useEffect(() => {
		if (modelId) {
			dispatchMethod({ id: modelId });
		}
	}, [modelId, dispatchMethod]);

	return {
		model: result.data?.item,
		isLoading: result.isPending,
	};
}
