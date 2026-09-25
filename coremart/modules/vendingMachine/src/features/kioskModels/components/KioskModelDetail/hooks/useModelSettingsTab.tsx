import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { IconDeviceFloppy, IconEdit, IconX } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanelProps } from '../../../../../components/ControlPanel';
import { useKioskModelEdit } from '../../../hooks/useKioskModelEdit';
import { kioskModelCrudService } from '../../../kioskModelService';
import { KioskModel, KioskType, ShelvesConfigRow } from '../../../types';
import { buildShelvesConfigWire, parseShelvesConfigRows } from '../../ShelvesConfig';
import { useRegisterKioskModelDetailTab } from '../kioskModelDetailTabControl';


export type UseModelSettingsTabArgs = {
	model: KioskModel,
};

export type UseModelSettingsTabReturn = {
	isEditing: boolean,
	isSubmitting: boolean,
	selectedGoodsCollectorType: KioskType | undefined,
	setSelectedGoodsCollectorType: (v: KioskType | undefined) => void,
	shelvesNumber: number,
	setShelvesNumber: (n: number) => void,
	shelvesConfigRows: ShelvesConfigRow[],
	setShelvesConfigRows: (rows: ShelvesConfigRow[]) => void,
};

export function useModelSettingsTab({ model }: UseModelSettingsTabArgs): UseModelSettingsTabReturn {
	const { t: translate } = useTranslation('vending_machine');
	const { dispatchMethod: refetchModel } = useServiceLayer(kioskModelCrudService.getById);
	const [isEditing, setIsEditing] = useState(false);
	const [selectedGoodsCollectorType, setSelectedGoodsCollectorType] =
		useState<KioskType | undefined>(model.goodsCollectorType);

	const [shelvesNumber, setShelvesNumber] = useState(model.shelvesNumber || 0);
	const [shelvesConfigRows, setShelvesConfigRows] = useState<ShelvesConfigRow[]>(
		() => parseShelvesConfigRows(model.shelvesConfig),
	);

	const syncFromModel = useCallback(() => {
		setSelectedGoodsCollectorType(model.goodsCollectorType);
		setShelvesNumber(model.shelvesNumber || 0);
		setShelvesConfigRows(parseShelvesConfigRows(model.shelvesConfig));
	}, [model.goodsCollectorType, model.shelvesNumber, model.shelvesConfig]);

	const onUpdateSuccess = useCallback(() => {
		setIsEditing(false);
		if (model.id) {
			refetchModel({ id: model.id });
		}
	}, [model.id, refetchModel]);
	const { isSubmitting, handleSubmit } = useKioskModelEdit({ onUpdateSuccess });

	const handleEdit = useCallback(() => setIsEditing(true), []);

	const handleSave = useCallback(() => {
		handleSubmit({
			id: model.id,
			etag: model.etag,
			goodsCollectorType: selectedGoodsCollectorType,
			shelvesNumber,
			shelvesConfig: buildShelvesConfigWire(shelvesConfigRows),
		});
	}, [handleSubmit, selectedGoodsCollectorType, shelvesNumber, shelvesConfigRows]);

	const handleCancel = useCallback(() => {
		syncFromModel();
		setIsEditing(false);
	}, [syncFromModel]);

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

	useRegisterKioskModelDetailTab('modelSettings', actions);

	return {
		isEditing,
		isSubmitting,
		selectedGoodsCollectorType,
		setSelectedGoodsCollectorType,
		shelvesNumber,
		setShelvesNumber,
		shelvesConfigRows,
		setShelvesConfigRows,
	};
}
