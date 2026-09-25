import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	controlPanelToSearchGraph,
	type ControlPanelFilterConfig,
} from '../../../components';
import { SearchNode } from '../../../types';


/**
 * The search filter shared by the kiosk and event create-stock modals.
 *
 * This file used to also export `useKioskProductList`, a listing over the org-wide catalogue at
 * `{orgId}/inventory/variants`. That route never existed on the backend — the only `/variants`
 * route belonged to the superseded Products implementation — and its sole caller was a
 * fully commented-out modal, so both were removed rather than repaired. Listing a kiosk's
 * available products is `useAvailableProductForKiosk`, which calls a real vending_machine route.
 */
export function useKioskProductFilter(preGraph?: SearchNode) {
	const { t: translate } = useTranslation('vending_machine');
	const [searchValue, setSearchValue] = useState('');

	const filters: ControlPanelFilterConfig[] = useMemo(
		() => [
			{
				key: 'search',
				searchFields: ['sku', 'barcode', 'name'],
				type: 'search' as const,
				value: searchValue,
				onChange: setSearchValue,
				placeholder: translate('kiosk_products.search.placeholder'),
			},
		],
		[searchValue, translate],
	);

	const graph = useMemo(() => {
		const innerGraph = controlPanelToSearchGraph(filters);
		return {
			and: [
				innerGraph,
				preGraph ?? {},
			],
		};
	}, [filters]);

	return { filters, graph };
}
