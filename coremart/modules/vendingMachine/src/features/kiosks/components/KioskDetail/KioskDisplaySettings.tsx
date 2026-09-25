import { Stack } from '@mantine/core';
import React from 'react';


import { GameSelect } from '@/components/GameSelect';
import { KioskSettingSelect } from '@/components/KioskSettingSelect';
import { MediaPlaylistSelect } from '@/components/MediaPlaylistSelect';
import { ThemeSelect } from '@/components/ThemeSelect';
import { UIModeSelect } from '@/components/UIModeSelect';
import { Kiosk } from '@/features/kiosks/types';

import { useKioskSettingTab } from './hooks';


interface KioskDisplaySettingsProps {
	kiosk: Kiosk;
}

export const KioskDisplaySettings: React.FC<KioskDisplaySettingsProps> = ({ kiosk }) => {
	const {
		isEditing,
		isSubmitting,
		setting,
		waitingScreenPlaylist,
		shoppingScreenPlaylist,
		theme,
		game,
		handleSettingChange,
		handleWaitingChange,
		handleShoppingChange,
		handleThemeChange,
		handleGameChange,
		handleUIModeChange,
		uiMode,
	} = useKioskSettingTab(kiosk);

	return (
		<Stack gap='md'>
			<UIModeSelect
				value={uiMode}
				onChange={handleUIModeChange}
				isEditing={isEditing}
				disabled={isSubmitting ?? false}
			/>

			<KioskSettingSelect
				value={setting}
				onChange={handleSettingChange}
				onRemove={() => handleSettingChange(undefined)}
				isEditing={isEditing}
				disabled={isSubmitting ?? false}
			/>

			<MediaPlaylistSelect
				type='waiting'
				value={waitingScreenPlaylist}
				onChange={handleWaitingChange}
				onRemove={() => handleWaitingChange(undefined)}
				isEditing={isEditing}
			/>

			<MediaPlaylistSelect
				type='shopping'
				value={shoppingScreenPlaylist}
				onChange={handleShoppingChange}
				onRemove={() => handleShoppingChange(undefined)}
				isEditing={isEditing}
			/>

			<ThemeSelect
				value={theme}
				onChange={handleThemeChange}
				onRemove={() => handleThemeChange(undefined)}
				isEditing={isEditing}
			/>

			<GameSelect
				value={game}
				onChange={handleGameChange}
				onRemove={() => handleGameChange(undefined)}
				isEditing={isEditing}
			/>
		</Stack>
	);
};
