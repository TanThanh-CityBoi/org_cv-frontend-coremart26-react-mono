import { useDocumentTitle } from '@mantine/hooks';
import { ConfirmModal } from '@nikkierp/ui/components';
import { useConfirmModal } from '@nikkierp/ui/hookhoc';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { asLegacyModelSchema } from '../../common/helpers';
import { ControlPanel, type ViewMode, ControlPanelFilterConfig } from '../../components';
import { PageContainer } from '../../components/PageContainer';
import { ThemeDetailDrawer, ThemeGridView, ThemeTable, themeSchema, useThemeDetail, useThemeList } from '../../features/themes';
import { Theme } from '../../features/themes/types';


// eslint-disable-next-line max-lines-per-function
export const ThemesPage: React.FC = () => {
	const { t: translate } = useTranslation('vending_machine');
	const { themes, isLoadingList, handleRefresh } = useThemeList();
	const { isOpen, item, configOpenModal, handleCloseModal } = useConfirmModal<Theme>();

	const [viewMode, setViewMode] = useState<ViewMode>('list');
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<string[]>([]);
	const [selectedThemeId, setSelectedThemeId] = useState<string | undefined>();
	const [drawerOpened, setDrawerOpened] = useState(false);

	const { theme: selectedTheme, isLoading: isLoadingDetail } = useThemeDetail(selectedThemeId);



	// Filter and search themes
	const filteredThemes = useMemo(() => {
		let filtered = themes || [];

		// Filter by status
		if (statusFilter.length > 0) {
			filtered = filtered.filter((theme: Theme) => statusFilter.includes(theme.status));
		}

		// Search by code or name
		if (searchValue.trim()) {
			const searchLower = searchValue.toLowerCase().trim();
			filtered = filtered.filter(
				(theme: Theme) =>
					theme.code.toLowerCase().includes(searchLower) ||
					theme.name.toLowerCase().includes(searchLower),
			) as Theme[];
		}

		return filtered;
	}, [themes, statusFilter, searchValue]);

	const handleViewDetail = (themeId: string) => {
		setSelectedThemeId(themeId);
		setDrawerOpened(true);
	};

	const handleCloseDrawer = () => {
		setDrawerOpened(false);
		setSelectedThemeId(undefined);
	};

	const handleOpenDeleteModal = (themeId: string) => {
		const theme = themes.find((t: Theme) => t.id === themeId);
		if (theme) {
			configOpenModal(theme);
		}
	};

	const handleDeleteConfirm = () => {
		if (item) {
			// TODO: Implement delete
			console.log('Delete theme:', item.id);
		}
		handleCloseModal();
	};

	const handleCreate = () => {
		// TODO: Navigate to create page
		console.log('Create theme');
	};

	const statusOptions = [
		{ value: 'active', label: translate('status.active') },
		{ value: 'inactive', label: translate('status.inactive') },
	];

	const filters: ControlPanelFilterConfig[] = useMemo(() => [
		{
			key: 'status',
			type: 'multiSelect' as const,
			value: statusFilter,
			onChange: setStatusFilter,
			options: statusOptions,
			placeholder: translate('themes.filter.status'),
		},
	], [statusFilter, statusOptions, translate]);

	useDocumentTitle('menu.themes');

	const breadcrumbs = useMemo(() => [
		{ title: translate('title'), href: '../overview' },
		{ title: translate('menu.themes'), href: '#' },
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
						search={{ value: searchValue, onChange: setSearchValue, placeholder: translate('themes.search.placeholder') }}
						filters={filters}
						viewMode={{ value: viewMode, onChange: setViewMode, segments: ['list', 'grid'] }}
					/>
				}
			>
				{viewMode === 'list' ? (
					<ThemeTable
						columns={['code', 'name', 'description', 'status', 'primaryColor', 'actions']}
						data={filteredThemes as unknown as Record<string, unknown>[]}
						schema={asLegacyModelSchema(themeSchema)}
						isLoading={isLoadingList}
						onViewDetail={handleViewDetail}
						onDelete={handleOpenDeleteModal}
					/>
				) : (
					<ThemeGridView
						themes={filteredThemes}
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

			<ThemeDetailDrawer
				opened={drawerOpened}
				onClose={handleCloseDrawer}
				theme={selectedTheme}
				isLoading={isLoadingDetail}
			/>
		</>
	);
};
