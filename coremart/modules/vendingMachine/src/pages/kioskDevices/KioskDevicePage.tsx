import { useDocumentTitle } from '@mantine/hooks';
import { ConfirmModal } from '@nikkierp/ui/components';
import { useConfirmModal } from '@nikkierp/ui/hookhoc';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { asLegacyModelSchema } from '../../common/helpers';
import { ControlPanel, type ViewMode, ControlPanelFilterConfig } from '../../components';
import { PageContainer } from '../../components/PageContainer';
import {
	KioskDeviceDetailDrawer,
	KioskDeviceGridView,
	KioskDeviceTable,
	kioskDeviceSchema,
	useKioskDeviceDetail,
	useKioskDeviceList,
} from '../../features/kioskDevices';
import { KioskDevice } from '../../features/kioskDevices/types';


// eslint-disable-next-line max-lines-per-function
export const KioskDevicePage: React.FC = () => {
	const { t: translate } = useTranslation('vending_machine');
	const { kioskDevices, isLoadingList, handleRefresh } = useKioskDeviceList();
	const { isOpen, item, configOpenModal, handleCloseModal } = useConfirmModal<KioskDevice>();

	const [viewMode, setViewMode] = useState<ViewMode>('list');
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<string[]>([]);
	const [deviceTypeFilter, setDeviceTypeFilter] = useState<string[]>([]);
	const [selectedKioskDeviceId, setSelectedKioskDeviceId] = useState<string | undefined>();
	const [drawerOpened, setDrawerOpened] = useState(false);

	const { kioskDevice: selectedKioskDevice, isLoading: isLoadingDetail } =
		useKioskDeviceDetail(selectedKioskDeviceId);


	// Filter and search kiosk devices
	const filteredKioskDevices = useMemo(() => {
		let filtered = kioskDevices || [];

		// Filter by status
		if (statusFilter.length > 0) {
			filtered = filtered.filter((kioskDevice: KioskDevice) => statusFilter.includes(kioskDevice.status));
		}

		// Filter by device type
		if (deviceTypeFilter.length > 0) {
			filtered = filtered.filter((kioskDevice: KioskDevice) => deviceTypeFilter.includes(kioskDevice.deviceType));
		}

		// Search by code or name
		if (searchValue.trim()) {
			const searchLower = searchValue.toLowerCase().trim();
			filtered = filtered.filter(
				(kioskDevice: KioskDevice) =>
					kioskDevice.code.toLowerCase().includes(searchLower) ||
					kioskDevice.name.toLowerCase().includes(searchLower),
			) as KioskDevice[];
		}

		return filtered;
	}, [kioskDevices, statusFilter, deviceTypeFilter, searchValue]);

	const handleViewDetail = (kioskDeviceId: string) => {
		setSelectedKioskDeviceId(kioskDeviceId);
		setDrawerOpened(true);
	};

	const handleCloseDrawer = () => {
		setDrawerOpened(false);
		setSelectedKioskDeviceId(undefined);
	};

	const handleOpenDeleteModal = (kioskDeviceId: string) => {
		const kioskDevice = kioskDevices.find((d: KioskDevice) => d.id === kioskDeviceId);
		if (kioskDevice) {
			configOpenModal(kioskDevice);
		}
	};

	const handleDeleteConfirm = () => {
		if (item) {
			// TODO: Implement delete
			console.log('Delete kiosk device:', item.id);
		}
		handleCloseModal();
	};

	const handleCreate = () => {
		// TODO: Navigate to create page
		console.log('Create kiosk device');
	};

	const statusOptions = [
		{ value: 'active', label: translate('status.active') },
		{ value: 'inactive', label: translate('status.inactive') },
	];

	const deviceTypeOptions = [
		{ value: 'motor', label: translate('device.device_type.motor') },
		{ value: 'pos', label: translate('device.device_type.pos') },
		{ value: 'screen', label: translate('device.device_type.screen') },
		{ value: 'cpu', label: translate('device.device_type.cpu') },
		{ value: 'router', label: translate('device.device_type.router') },
	];

	const filters: ControlPanelFilterConfig[] = useMemo(() => [
		{
			key: 'status',
			type: 'multiSelect' as const,
			value: statusFilter,
			onChange: setStatusFilter,
			options: statusOptions,
			placeholder: translate('device.filter.status'),
		},
		{
			key: 'deviceType',
			type: 'multiSelect' as const,
			value: deviceTypeFilter,
			onChange: setDeviceTypeFilter,
			options: deviceTypeOptions,
			placeholder: translate('device.filter.device_type'),
		},
	], [statusFilter, deviceTypeFilter, statusOptions, deviceTypeOptions, translate]);

	useDocumentTitle('menu.device');

	const breadcrumbs = useMemo(() => [
		{ title: translate('title'), href: '../overview' },
		{ title: translate('menu.device'), href: '#' },
	], [translate]);

	return (
		<>
			<PageContainer
				breadcrumbs={breadcrumbs}
				actionBar={
					<ControlPanel
						actions={[
							{ label: translate('action.create'), leftSection: <IconPlus size={16} />, onClick: handleCreate },
							{ label: translate('action.refresh'), leftSection: <IconRefresh size={16} />, onClick: handleRefresh, variant: 'outline' },
						]}
						search={{ value: searchValue, onChange: setSearchValue, placeholder: translate('device.search.placeholder') }}
						filters={filters}
						viewMode={{ value: viewMode, onChange: setViewMode, segments: ['list', 'grid'] }}
					/>
				}
			>
				{viewMode === 'list' ? (
					<KioskDeviceTable
						columns={['code', 'name', 'deviceType', 'description', 'status', 'specifications', 'actions']}
						data={filteredKioskDevices as unknown as Record<string, unknown>[]}
						schema={asLegacyModelSchema(kioskDeviceSchema)}
						isLoading={isLoadingList}
						onViewDetail={handleViewDetail}
						onDelete={handleOpenDeleteModal}
					/>
				) : (
					<KioskDeviceGridView
						kioskDevices={filteredKioskDevices}
						isLoading={isLoadingList}
						onViewDetail={handleViewDetail}
						onDelete={handleOpenDeleteModal}
					/>
				)}
			</PageContainer>

			<ConfirmModal
				opened={isOpen}
				onClose={handleCloseModal}
				onConfirm={handleDeleteConfirm}
				title={translate('messages.delete.confirm')}
				message={
					item
						? translate('messages.delete.confirm.name', { name: item.name })
						: translate('messages.delete.confirm')
				}
				confirmLabel={translate('action.delete')}
				confirmColor='red'
			/>

			<KioskDeviceDetailDrawer
				opened={drawerOpened}
				onClose={handleCloseDrawer}
				kioskDevice={selectedKioskDevice}
				isLoading={isLoadingDetail}
			/>
		</>
	);
};
