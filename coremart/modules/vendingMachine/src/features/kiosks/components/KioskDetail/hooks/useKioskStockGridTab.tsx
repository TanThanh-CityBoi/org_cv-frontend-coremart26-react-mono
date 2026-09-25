import { IconDeviceFloppy, IconEdit, IconFileDownloadFilled, IconX } from '@tabler/icons-react';
import { useCallback, useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

import { KioskDetailTabs } from './types';

import { ControlPanelProps } from '@/components/ControlPanel';
import { useRegisterKioskDetailTab } from '@/features/kiosks/components/KioskDetail/kioskDetailTabControl';



export function buildProductsGridActions(
	isEditing: boolean,
	translate: ReturnType<typeof useTranslation>['t'],
	actions: {
		handleEdit: () => void;
		handleLoadAll: () => void;
		handleSave: () => void;
		handleCancel: () => void;
	},
): ControlPanelProps['actions'] {
	const { handleEdit, handleLoadAll, handleSave, handleCancel } = actions;

	return [
		...(!isEditing ?
			[
				{
					label: translate('nikki.general.actions.edit'),
					leftSection: <IconEdit size={16} />,
					onClick: handleEdit,
					variant: 'filled' as const,
				},
			] :
			[
				{
					label: translate('coremart.vendingMachine.kiosk.stocks.actions.loadAll'),
					leftSection: <IconFileDownloadFilled size={16} />,
					onClick: handleLoadAll,
					variant: 'filled' as const,
				},
				{
					label: translate('nikki.general.actions.save'),
					leftSection: <IconDeviceFloppy size={16} />,
					onClick: handleSave,
					variant: 'filled' as const,
				},
				{
					label: translate('nikki.general.actions.cancel'),
					leftSection: <IconX size={16} />,
					onClick: handleCancel,
					variant: 'outline' as const,
				},
			]),
	];
}

export type UseKioskStockGridTabArgs = {
	handleResetGrid?: () => void;
	handleSaveGrid?: () => void;
	handleFillAllGrid?: () => void;
};

export type UseKioskStockGridTabReturn = {
	isEditing: boolean;
	setIsEditing: (isEditing: boolean) => void;
	/** `true` khi React đang render lại grid ở background sau khi toggle edit mode. */
	isPending: boolean;
};

export function useKioskStockGridTab({
	handleResetGrid,
	handleSaveGrid,
	handleFillAllGrid,
}: UseKioskStockGridTabArgs): UseKioskStockGridTabReturn {
	const [isEditing, setIsEditing] = useState(false);
	const [isPending, startTransition] = useTransition();
	const { t: translate, i18n } = useTranslation();

	const changeEditMode = useCallback((isEditing: boolean) => {
		startTransition(() => setIsEditing(isEditing));
	}, [startTransition]);

	const handleEdit = useCallback(() => {
		changeEditMode(true);
	}, [changeEditMode]);

	const handleSave = useCallback(() => {
		handleSaveGrid?.();
	}, [handleSaveGrid]);

	const handleCancel = useCallback(() => {
		handleResetGrid?.();
		changeEditMode(false);
	}, [handleResetGrid]);

	const handleLoadAll = useCallback(() => {
		handleFillAllGrid?.();
	}, [handleFillAllGrid]);

	const actions = useMemo(
		() => buildProductsGridActions(
			isEditing,
			translate,
			{
				handleEdit,
				handleLoadAll,
				handleSave,
				handleCancel,
			},
		),
		[isEditing, i18n.language, handleEdit, handleLoadAll, handleSave, handleCancel],
	);

	useRegisterKioskDetailTab(KioskDetailTabs.STOCK_GRID, actions);

	return {
		isEditing,
		isPending,
		setIsEditing: changeEditMode,
	};
}

