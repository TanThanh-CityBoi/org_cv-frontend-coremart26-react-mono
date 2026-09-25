import { arrayMove } from '@dnd-kit/sortable';
import { useUIState } from '@nikkierp/shell/contexts';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SortDirection } from '../../../../../../types/search-graph';
import { kioskStockService } from '../../../../kioskStockService';
import { Kiosk } from '../../../../types';

import type { KioskStock } from '../../KioskStockGrid/kioskStock.types';




export type SortableStock = Omit<Pick<KioskStock, 'id' | 'sortIndex' | 'etag' | 'product' | 'sellPrice' | 'warningQuantity'>, 'etag'> & { etag: string };

function toSortableStock(s: KioskStock): SortableStock {
	return {
		id: s.id,
		sortIndex: s.sortIndex ?? 0,
		etag: s.etag ?? '',
		product: s.product,
		sellPrice: s.sellPrice,
		warningQuantity: s.warningQuantity,
	};
}

function renumber(items: SortableStock[]): SortableStock[] {
	return items.map((item, idx) => ({ ...item, sortIndex: idx }));
}

export type UseKioskStockSortArgs = {
	kiosk: Kiosk,
	onSuccess?: () => void,
};

export function useKioskStockSort({ kiosk, onSuccess }: UseKioskStockSortArgs) {
	const { t: translate } = useTranslation('vending_machine');
	const { notification } = useUIState();
	const [items, setItems] = useState<SortableStock[]>([]);
	const [isFetching, setIsFetching] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isDirty, setIsDirty] = useState(false);

	const fetchAll = useCallback(async () => {
		if (!kiosk.id) return;
		setIsFetching(true);
		try {
			// Called imperatively, not through `useServiceLayer`: this modal owns its own local
			// list state, so the result must not go into the store.
			//
			// ⚠ The legacy call also sent `include_product=true`, which hydrated `product` on each
			// row. `RestSearchRequest` has no field for arbitrary query params, so it is dropped
			// here — rows arrive with `productRef` but no `product`. The modal only renders the
			// product name, so if that comes back blank this is why; the fix belongs upstream in
			// `RestSearchRequest`, not in a cast here.
			const { data } = await kioskStockService.search({
				fields: ['id', 'etag', 'sortIndex', 'sellPrice', 'warningQuantity', 'productRef'],
				page: 0,
				size: 100,
				graph: { order: [['sort_index', SortDirection.ASC]] },
			}, kiosk.id);
			const items_ = (data?.items ?? []) as KioskStock[];
			setItems(items_.map(toSortableStock).sort((a, b) => (a?.sortIndex ?? 0) - (b?.sortIndex ?? 0)));
			setIsDirty(false);
		}
		catch {
			notification.showError(
				translate('errors.loadFailed', { defaultValue: 'Failed to load stocks' }),
				translate('messages.error'),
			);
		}
		finally {
			setIsFetching(false);
		}
	}, [kiosk.id, notification, translate]);

	useEffect(() => { fetchAll(); }, [fetchAll]);

	const handleDragEnd = useCallback((activeId: string, overId: string) => {
		setItems((prev) => {
			const oldIdx = prev.findIndex((s) => s.id === activeId);
			const newIdx = prev.findIndex((s) => s.id === overId);
			if (oldIdx < 0 || newIdx < 0 || oldIdx === newIdx) return prev;
			return renumber(arrayMove(prev, oldIdx, newIdx));
		});
		setIsDirty(true);
	}, []);

	const handleMoveToPosition = useCallback((stockId: string, targetIndex: number) => {
		setItems((prev) => {
			const curIdx = prev.findIndex((s) => s.id === stockId);
			if (curIdx < 0) return prev;
			const safeTarget = Math.min(Math.max(0, targetIndex), prev.length - 1);
			return renumber(arrayMove(prev, curIdx, safeTarget));
		});
		setIsDirty(true);
	}, []);

	const handleSave = useCallback(async () => {
		if (!kiosk.id || !isDirty) return;
		setIsSaving(true);
		try {
			await kioskStockService.bulkUpdate({
				kioskId: kiosk.id,
				items: items.map(({ id, etag, sortIndex, warningQuantity }) => ({
					id,
					etag,
					sortIndex: sortIndex ? sortIndex + 1 : 1,
					warningQuantity,
				})),
			});
			notification.showInfo(
				translate('kiosk_stock.sort.success', {
					defaultValue: 'Product order saved',
				}),
				translate('messages.success'),
			);
			setIsDirty(false);
			onSuccess?.();
			fetchAll();
		}
		catch {
			notification.showError(
				translate('errors.updateFailed', { defaultValue: 'Failed to save order' }),
				translate('messages.error'),
			);
		}
		finally {
			setIsSaving(false);
		}
	}, [kiosk.id, isDirty, items, notification, translate, onSuccess]);

	const handleDiscard = useCallback(() => {
		fetchAll();
	}, [fetchAll]);

	return {
		items,
		isFetching,
		isSaving,
		isDirty,
		handleDragEnd,
		handleMoveToPosition,
		handleSave,
		handleDiscard,
	};
}
