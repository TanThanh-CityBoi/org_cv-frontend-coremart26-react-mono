import { IconDeviceFloppy, IconEdit, IconX } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanelProps } from '../../../../../components/ControlPanel';
import { KioskDevice } from '../../../types';
import { useRegisterKioskDeviceDetailTab } from '../kioskDeviceDetailTabControl';


export type UseSpecificationsTabArgs = {
	kioskDevice: KioskDevice,
};

export type UseSpecificationsTabReturn = {
	isEditing: boolean,
};

export function useSpecificationsTab({ kioskDevice }: UseSpecificationsTabArgs): UseSpecificationsTabReturn {
	const { t: translate } = useTranslation('vending_machine');
	const [isEditing, setIsEditing] = useState(false);

	const handleEdit = useCallback(() => setIsEditing(true), []);
	const handleSave = useCallback(() => {
		// TODO: Implement save logic for specifications
		setIsEditing(false);
	}, []);
	const handleCancel = useCallback(() => setIsEditing(false), []);

	const actions = useMemo<ControlPanelProps['actions']>(() => [
		...(!isEditing ? [{
			label: translate('action.edit'),
			leftSection: <IconEdit size={16} />,
			onClick: handleEdit,
			type: 'button' as const,
			variant: 'filled' as const,
		}] : [{
			label: translate('action.save'),
			leftSection: <IconDeviceFloppy size={16} />,
			onClick: handleSave,
			type: 'button' as const,
			variant: 'filled' as const,
		}, {
			label: translate('action.cancel'),
			leftSection: <IconX size={16} />,
			onClick: handleCancel,
			type: 'button' as const,
			variant: 'outline' as const,
		}]),
	], [isEditing, handleEdit, handleSave, handleCancel, translate]);

	useRegisterKioskDeviceDetailTab('specifications', actions);

	return { isEditing };
}
