
import React from 'react';
import { useTranslation } from 'react-i18next';



import { filterConfig } from './filterConfig';
import { FilterGroup, SearchGraph, useFilterState } from '../../../../components/FilterGroup';





export interface KioskModelFilterProps {
	onSearchGraphChange: (graph: SearchGraph) => void;
}

export const KioskModelFilter: React.FC<KioskModelFilterProps> = ({
	onSearchGraphChange,
}) => {
	const { t: translate } = useTranslation('vending_machine');
	const { state, updateState, resetState } = useFilterState({
		config: filterConfig,
		onSearchGraphChange,
	});

	return (
		<FilterGroup
			config={filterConfig}
			state={state}
			updateState={updateState}
			resetState={resetState}
			placeholder={translate('kiosk_models.search.placeholder')}
		/>
	);
};

