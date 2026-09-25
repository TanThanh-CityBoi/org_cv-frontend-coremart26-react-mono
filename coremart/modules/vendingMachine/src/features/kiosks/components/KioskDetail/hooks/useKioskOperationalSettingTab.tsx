import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { IconDeviceFloppy, IconEdit, IconX } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { KioskDetailTabs } from './types';

import { kioskActions, VendingMachineDispatch } from '@/appState';
import { ControlPanelProps } from '@/components/ControlPanel';
import { buildShelvesConfigWire, parseShelvesConfigRows } from '@/features/kioskModels/components/ShelvesConfig';
import { KioskType, ShelvesConfigRow } from '@/features/kioskModels/types';
import { useRegisterKioskDetailTab } from '@/features/kiosks/components/KioskDetail/kioskDetailTabControl';
import { useKioskEdit } from '@/features/kiosks/hooks/useKioskEdit';
import { Kiosk } from '@/features/kiosks/types';


export type useKioskOperationalSettingTabArgs = {
	kiosk: Kiosk;
};

export type useKioskOperationalSettingTabReturn = {
	isEditing: boolean;
	isSubmitting: boolean;
	goodsCollectorType?: KioskType | null;
	setGoodsCollectorType: (v: KioskType | null) => void;
	shelvesNumber: number;
	setShelvesNumber: (n: number) => void;
	shelvesConfigRows: ShelvesConfigRow[];
	setShelvesConfigRows: (rows: ShelvesConfigRow[]) => void;
};

export function useKioskOperationalSettingTab({ kiosk }:
useKioskOperationalSettingTabArgs): useKioskOperationalSettingTabReturn {
	const { t: translate } = useTranslation();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const [isEditing, setIsEditing] = useState(false);
	const [goodsCollectorType, setGoodsCollectorType] =
		useState<KioskType | null | undefined>(kiosk.goodsCollectorType);

	const [shelvesNumber, setShelvesNumber] = useState(kiosk.shelvesNumber || 0);
	const [shelvesConfigRows, setShelvesConfigRows] = useState<ShelvesConfigRow[]>(
		() => parseShelvesConfigRows(kiosk.shelvesConfig),
	);

	const syncShelvesConfig = useCallback(() => {
		setGoodsCollectorType(kiosk.goodsCollectorType || null);
		setShelvesNumber(kiosk.shelvesNumber || 0);
		setShelvesConfigRows(parseShelvesConfigRows(kiosk.shelvesConfig));
	}, [kiosk.goodsCollectorType, kiosk.shelvesNumber, kiosk.shelvesConfig]);

	const onUpdateSuccess = useCallback(() => {
		setIsEditing(false);
		if (kiosk.id) {
			dispatch(kioskActions.getKiosk(kiosk.id));
		}
	}, [kiosk.id, dispatch]);

	const { isSubmitting, handleSubmit } = useKioskEdit({ onUpdateSuccess });

	const handleEdit = useCallback(() => setIsEditing(true), []);

	const handleSave = useCallback(() => {
		handleSubmit({
			id: kiosk.id,
			etag: kiosk.etag,
			goodsCollectorType,
			shelvesNumber,
			shelvesConfig: buildShelvesConfigWire(shelvesConfigRows),
		});
	}, [handleSubmit, goodsCollectorType, shelvesNumber, shelvesConfigRows]);

	const handleCancel = useCallback(() => {
		syncShelvesConfig();
		setIsEditing(false);
	}, [syncShelvesConfig]);

	const actions = useMemo<ControlPanelProps['actions']>(() => [
		...(!isEditing
			? [{
				label: translate('nikki.general.actions.edit'),
				leftSection: <IconEdit size={16} />,
				onClick: handleEdit,
				type: 'button' as const,
				variant: 'filled' as const,
			}]
			: [{
				label: translate('nikki.general.actions.save'),
				leftSection: <IconDeviceFloppy size={16} />,
				onClick: handleSave,
				type: 'button' as const,
				variant: 'filled' as const,
				disabled: isSubmitting,
				loading: isSubmitting,
			}, {
				label: translate('nikki.general.actions.cancel'),
				leftSection: <IconX size={16} />,
				onClick: handleCancel,
				type: 'button' as const,
				variant: 'outline' as const,
				disabled: isSubmitting,
			}]),
	], [isEditing, isSubmitting, translate, handleEdit, handleSave, handleCancel]);

	useRegisterKioskDetailTab(KioskDetailTabs.OPERATIONAL_SETTINGS, actions);

	return {
		isEditing,
		isSubmitting,
		goodsCollectorType,
		setGoodsCollectorType,
		shelvesNumber,
		setShelvesNumber,
		shelvesConfigRows,
		setShelvesConfigRows,
	};
}
