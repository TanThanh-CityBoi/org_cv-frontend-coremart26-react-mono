/* eslint-disable max-lines-per-function */
import { Box, Divider, Stack, Text } from '@mantine/core';
import { IconSettings2 } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ArchivedStatusBadge } from '../../../../components/ArchivedStatusBadge';
import { AssignedKioskList } from '../../../../components/AssignKiosks';
import { GameSelect } from '../../../../components/GameSelect';
import { MediaPlaylistSelect } from '../../../../components/MediaPlaylistSelect';
import { PreviewDrawer } from '../../../../components/PreviewDrawer';
import { ThemeSelect } from '../../../../components/ThemeSelect';
import { Game } from '../../../games/types';
import { Kiosk } from '../../../kiosks/types';
import { Playlist } from '../../../mediaPlaylist/types';
import { Theme } from '../../../themes/types';
import { KioskSetting } from '../../types';


export interface KioskSettingDetailDrawerProps {
	opened: boolean;
	onClose: () => void;
	setting: KioskSetting | undefined;
	isLoading?: boolean;
}

export const KioskSettingDetailDrawer: React.FC<KioskSettingDetailDrawerProps> = ({
	opened,
	onClose,
	setting,
	isLoading = false,
}) => {
	const { t: translate } = useTranslation('vending_machine');
	const navigate = useNavigate();
	const [settingKiosks, setSettingKiosks] = useState<Kiosk[]>(setting?.kiosks || []);
	const [settingTheme, setSettingTheme] = useState<Theme | undefined>(() => setting?.themeSetting ?? undefined);
	const [settingGame, setSettingGame] = useState<Game | undefined>(() => setting?.gameSetting ?? undefined);
	const [idlePlaylist, setIdlePlaylist] = useState<Playlist | undefined>(() =>
		setting?.waitingScreenPlaylistSetting ?? undefined);
	const [shoppingPlaylist, setShoppingPlaylist] = useState<Playlist | undefined>(() =>
		setting?.shoppingScreenPlaylistSetting ?? undefined);
	const [kioskSelectModalOpened, setKioskSelectModalOpened] = useState(false);

	useEffect(() => {
		if (setting) {
			setSettingKiosks(setting.kiosks || []);
			setSettingTheme(setting.themeSetting ?? undefined);
			setSettingGame(setting.gameSetting ?? undefined);
			setIdlePlaylist(setting.waitingScreenPlaylistSetting ?? undefined);
			setShoppingPlaylist(setting.shoppingScreenPlaylistSetting ?? undefined);
		}
	}, [setting]);

	const handleAddKiosks = (kiosks: Kiosk[]) => {
		setSettingKiosks([...settingKiosks, ...kiosks]);
	};

	const handleRemoveKiosk = (kioskId: string) => {
		setSettingKiosks(settingKiosks.filter((k) => k.id !== kioskId));
	};

	const handleThemeChange = (theme: Theme) => {
		setSettingTheme(theme);
	};

	const handleThemeRemove = () => {
		setSettingTheme(undefined);
	};

	const handleGameChange = (game: Game) => {
		setSettingGame(game);
	};

	const handleGameRemove = () => {
		setSettingGame(undefined);
	};

	const handleIdlePlaylistChange = (playlist: Playlist) => {
		setIdlePlaylist(playlist);
	};

	const handleShoppingPlaylistChange = (playlist: Playlist) => {
		setShoppingPlaylist(playlist);
	};

	const handleIdlePlaylistRemove = () => {
		setIdlePlaylist(undefined);
	};

	const handleShoppingPlaylistRemove = () => {
		setShoppingPlaylist(undefined);
	};

	return (
		<PreviewDrawer
			opened={opened}
			onClose={onClose}
			header={{
				title: setting?.name,
				subtitle: setting?.code,
				avatar: <IconSettings2 size={20} />,
			}}
			onViewDetails={() => {
				if (setting?.id) {
					navigate(`../kiosk-settings/${setting.id}`);
				}
				onClose();
			}}
			isLoading={isLoading}
			isNotFound={!setting && !isLoading}
			drawerProps={{ size: 'xl', opened, onClose }}
		>
			<Stack gap='md'>
				<Box>
					<Text size='sm' c='dimmed' mb='xs'>{translate('kiosk_settings.fields.code')}</Text>
					<Text size='sm' fw={500}>{setting?.code}</Text>
				</Box>

				<Divider />

				<Box>
					<Text size='sm' c='dimmed' mb='xs'>{translate('kiosk_settings.fields.name')}</Text>
					<Text size='sm'>{setting?.name}</Text>
				</Box>

				{setting?.description && (
					<>
						<Divider />
						<Box>
							<Text size='sm' c='dimmed' mb='xs'>{translate('kiosk_settings.fields.description')}</Text>
							<Text size='sm'>{setting.description}</Text>
						</Box>
					</>
				)}

				<Divider />

				<Box>
					<Text size='sm' c='dimmed' mb='xs'>{translate('kiosk_settings.fields.status')}</Text>
					<ArchivedStatusBadge isArchived={!!setting?.isArchived} />
				</Box>

				<Divider />

				<Box>
					<Text size='sm' c='dimmed' mb='xs'>{translate('kiosk_settings.fields.created_at')}</Text>
					<Text size='sm'>{setting?.createdAt ? new Date(setting.createdAt).toLocaleString() : '—'}</Text>
				</Box>

				{/* Kiosks Section */}
				<Divider />
				<Box>
					<Text size='sm' c='dimmed' mb='md' fw={500}>
						{translate('kiosk_settings.fields.kiosks')}
					</Text>
					<AssignedKioskList
						kiosks={settingKiosks}
						onAddKiosks={() => setKioskSelectModalOpened(true)}
						onRemoveKiosk={handleRemoveKiosk}
					/>
				</Box>

				{/* Theme and Playlist Configuration */}
				<Divider />
				<Box>
					<Stack gap='md'>
						<ThemeSelect
							value={settingTheme}
							onChange={(v) => {
								if (v) {
									handleThemeChange(v);
								}
							}}
							onRemove={handleThemeRemove}
							isEditing
						/>
						<MediaPlaylistSelect
							type='waiting'
							value={idlePlaylist}
							onRemove={handleIdlePlaylistRemove}
							onChange={(v) => {
								if (v) {
									handleIdlePlaylistChange(v);
								}
							}}
							isEditing
						/>
						<MediaPlaylistSelect
							type='shopping'
							value={shoppingPlaylist}
							onRemove={handleShoppingPlaylistRemove}
							onChange={(v) => {
								if (v) {
									handleShoppingPlaylistChange(v);
								}
							}}
							isEditing
						/>
					</Stack>
				</Box>

				{/* Game Configuration */}
				<Box>
					<GameSelect
						value={settingGame}
						onRemove={handleGameRemove}
						onChange={(v) => {
							if (v) {
								handleGameChange(v);
							}
						}}
						isEditing
					/>
				</Box>

				<Box h={50}></Box>
			</Stack>
		</PreviewDrawer>
	);
};
