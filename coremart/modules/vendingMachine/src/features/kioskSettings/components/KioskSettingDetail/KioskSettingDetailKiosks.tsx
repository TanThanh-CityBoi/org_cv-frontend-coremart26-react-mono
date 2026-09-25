import { Stack } from '@mantine/core';
import React, { useMemo } from 'react';

import { useAssignKiosksToSetting, useRemoveKioskFromSetting } from './hooks';
import { useKioskSettingsKioskTab } from './hooks/useKioskSettingsKioskTab';
import { asLegacyModelSchema } from '../../../../common/helpers';
import { KioskSelectModal } from '../../../../components/KioskSelectModal';
import { SearchOperator, SearchGraph } from '../../../../types';
import { KioskTable } from '../../../kiosks';
import { kioskSchema } from '../../../kiosks/schemas';
import { KioskSetting } from '../../types';
import { RemoveKioskFromSettingModal } from '../KioskSettingConfirmModals';



const KIOSK_DETAIL_COLUMNS = [
	'code',
	'name',
	'locationAddress',
	'isArchived',
	'mode',
	'actions',
] as const;

export type KioskSettingDetailKiosksProps = {
	setting: KioskSetting,
};

export const KioskSettingDetailKiosks: React.FC<KioskSettingDetailKiosksProps> = ({ setting }) => {
	const queryKioskInSettingGraph = useMemo(
		(): SearchGraph => ({
			if: ['setting_ref', SearchOperator.EQUAL, setting.id],
		}),
		[setting.id],
	);
	const queryNotInSettingKioskGraph = useMemo(
		(): SearchGraph => ({
			or: [
				{ if: ['setting_ref', SearchOperator.NOT_EQUAL, setting.id] },
				{ if: ['setting_ref', SearchOperator.IS_NOT_SET, true] },
			],
		}),
		[setting.id],
	);

	const {
		kiosks,
		isLoading,
		pagination,
		modalOpened,
		onCloseKioskModal,
		refreshKiosks,
	} = useKioskSettingsKioskTab({ graph: queryKioskInSettingGraph });


	const { handleAssignKiosks } = useAssignKiosksToSetting({
		setting,
		onAssignSuccess: refreshKiosks,
	});

	const {
		confirmModalOpened,
		isRemoveLoading,
		kioskToRemove,
		settingName,
		openConfirmModal,
		closeConfirmModal,
		handleRemoveKiosk,
	} = useRemoveKioskFromSetting({ setting, onRemovedSuccess: refreshKiosks });

	return (
		<Stack gap='md'>
			<KioskTable
				columns={[...KIOSK_DETAIL_COLUMNS]}
				data={kiosks as unknown as Record<string, unknown>[]}
				schema={asLegacyModelSchema(kioskSchema)}
				isLoading={isLoading}
				actions={{
					delete: (kiosk) => {
						openConfirmModal(kiosk);
					},
				}}
				pagination={pagination}
			/>

			<KioskSelectModal
				graph={queryNotInSettingKioskGraph}
				opened={modalOpened}
				onClose={onCloseKioskModal}
				onSelectKiosks={handleAssignKiosks}
			/>

			<RemoveKioskFromSettingModal
				opened={confirmModalOpened}
				onClose={closeConfirmModal}
				onConfirm={handleRemoveKiosk}
				confirmLoading={isRemoveLoading}
				kioskName={kioskToRemove?.name ?? kioskToRemove?.code ?? ''}
				settingName={settingName}
			/>
		</Stack>
	);
};
