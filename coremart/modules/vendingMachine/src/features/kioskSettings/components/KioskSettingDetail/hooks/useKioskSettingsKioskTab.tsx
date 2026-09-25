import { TablePaginationProps } from '@nikkierp/ui/components';
import { IconPlus } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanelProps } from '../../../../../components/ControlPanel/ControlPanel';
import { SearchGraph } from '../../../../../types';
import { useKioskListInSetting } from '../../../hooks';
import { useRegisterKioskSettingDetailTab } from '../kioskSettingDetailTabControl';


type UseKioskSettingsKioskTabArgs = {
	graph: SearchGraph,
};

function useTablePagination(
	listPagination: ReturnType<typeof useKioskListInSetting>['pagination'],
): TablePaginationProps {
	return useMemo(
		() => ({
			totalItems: listPagination.totalItems,
			page: listPagination.page,
			totalPages: listPagination.totalPages,
			pageSize: listPagination.pageSize,
			onPageChange: listPagination.onPageChange,
			onPageSizeChange: listPagination.onPageSizeChange,
		}),
		[listPagination],
	);
}

export function useKioskSettingsKioskTab({ graph }: UseKioskSettingsKioskTabArgs) {
	const { t: translate } = useTranslation('vending_machine');
	const list = useKioskListInSetting({ graph });
	const pagination = useTablePagination(list.pagination);

	const [modalOpened, setModalOpened] = useState(false);

	const tabActions = useMemo<ControlPanelProps['actions']>(() => [
		{
			label: translate('kiosk_settings.actions.add_kiosk'),
			leftSection: <IconPlus size={16} />,
			onClick: () => setModalOpened(true),
			variant: 'filled' as const,
		},
	], [translate]);

	useRegisterKioskSettingDetailTab('kiosks', tabActions);

	const closeSelectModal = useCallback(() => setModalOpened(false), []);

	return {
		kiosks: list.kiosks ?? [],
		isLoading: list.isLoading,
		refreshKiosks: list.handleRefresh,
		pagination,
		modalOpened,
		onCloseKioskModal: closeSelectModal,
	};
}
