import { arrayMove } from '@dnd-kit/sortable';
import { useUIState } from '@nikkierp/shell/contexts';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { kioskService } from '@/features/kiosks/kioskService';
import { Kiosk } from '@/features/kiosks/types';
import { SortDirection } from '@/types/search-graph';

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
	kiosk: Kiosk;
	onSuccess?: () => void;
};

export function useKioskStockSort({ kiosk, onSuccess }: UseKioskStockSortArgs) {
	const { t: translate } = useTranslation();
	const { notification } = useUIState();
	const [items, setItems] = useState<SortableStock[]>([]);
	const [isFetching, setIsFetching] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isDirty, setIsDirty] = useState(false);

	const fetchAll = useCallback(async () => {
		if (!kiosk.id) return;
		setIsFetching(true);
		try {
			const result = await kioskService.searchKioskStocks(kiosk.id, {
				fields: ['id', 'etag', 'sortIndex', 'sellPrice', 'warningQuantity', 'productRef'],
				page: 0,
				size: 100,
				extra: { include_product: 'true' },
				graph: { order: [['sort_index', SortDirection.ASC]] },
			});
			setItems(result.items.map(toSortableStock).sort((a, b) => (a?.sortIndex ?? 0) - (b?.sortIndex ?? 0)));
			setIsDirty(false);
		}
		catch {
			notification.showError(
				translate('nikki.general.errors.load_failed', { defaultValue: 'Failed to load stocks' }),
				translate('nikki.general.messages.error'),
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
			await kioskService.bulkUpdateKioskStocks(
				kiosk.id,
				items.map(({ id, etag, sortIndex, warningQuantity }) => ({
					id,
					etag,
					sortIndex: sortIndex ? sortIndex + 1 : 1,
					warningQuantity,
				})),
			);
			notification.showInfo(
				translate('coremart.vendingMachine.kioskStock.sort.success', {
					defaultValue: 'Product order saved',
				}),
				translate('nikki.general.messages.success'),
			);
			setIsDirty(false);
			onSuccess?.();
			fetchAll();
		}
		catch {
			notification.showError(
				translate('nikki.general.errors.update_failed', { defaultValue: 'Failed to save order' }),
				translate('nikki.general.messages.error'),
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
