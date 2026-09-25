import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { IconDeviceFloppy, IconEdit, IconX } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';


import { KioskDetailTabs } from './types';
import { ControlPanelProps } from '../../../../../components/ControlPanel';
import { buildShelvesConfigWire, parseShelvesConfigRows } from '../../../../kioskModels/components/ShelvesConfig';
import { KioskType, ShelvesConfigRow } from '../../../../kioskModels/types';
import { useKioskEdit } from '../../../hooks/useKioskEdit';
import { kioskCrudService } from '../../../kioskService';
import { Kiosk } from '../../../types';
import { useRegisterKioskDetailTab } from '../kioskDetailTabControl';



export type useKioskOperationalSettingTabArgs = {
	kiosk: Kiosk,
};

export type useKioskOperationalSettingTabReturn = {
	isEditing: boolean,
	isSubmitting: boolean,
	goodsCollectorType?: KioskType | null,
	setGoodsCollectorType: (v: KioskType | null) => void,
	shelvesNumber: number,
	setShelvesNumber: (n: number) => void,
	shelvesConfigRows: ShelvesConfigRow[],
	setShelvesConfigRows: (rows: ShelvesConfigRow[]) => void,
};

export function useKioskOperationalSettingTab({ kiosk }:
useKioskOperationalSettingTabArgs): useKioskOperationalSettingTabReturn {
	const { t: translate } = useTranslation('vending_machine');
	const { dispatchMethod: reloadKiosk } = useServiceLayer(kioskCrudService.getById);
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
			reloadKiosk({ id: kiosk.id });
		}
	}, [kiosk.id, reloadKiosk]);

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
				label: translate('action.edit'),
				leftSection: <IconEdit size={16} />,
				onClick: handleEdit,
				type: 'button' as const,
				variant: 'filled' as const,
			}]
			: [{
				label: translate('action.save'),
				leftSection: <IconDeviceFloppy size={16} />,
				onClick: handleSave,
				type: 'button' as const,
				variant: 'filled' as const,
				disabled: isSubmitting,
				loading: isSubmitting,
			}, {
				label: translate('action.cancel'),
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
