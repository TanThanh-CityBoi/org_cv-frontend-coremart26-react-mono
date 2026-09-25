import { Stack } from '@mantine/core';
import React from 'react';

import { GameSelect } from '@/components/GameSelect';
import { MediaPlaylistSelect } from '@/components/MediaPlaylistSelect';
import { ThemeSelect } from '@/components/ThemeSelect';

import { useEventUiTab } from './hooks/useEventUiTab';

import type { Event } from '@/features/events/types';


export interface EventUiTabProps {
	event: Event;
}

export const EventUiTab: React.FC<EventUiTabProps> = ({ event }) => {
	const {
		isEditing,
		theme,
		game,
		waitingScreenPlaylist,
		shoppingScreenPlaylist,
		handleThemeChange,
		handleGameChange,
		handleWaitingChange,
		handleShoppingChange,
	} = useEventUiTab(event);

	return (
		<Stack gap='md'>
			<MediaPlaylistSelect
				type='waiting'
				value={waitingScreenPlaylist}
				onRemove={() => handleWaitingChange(undefined)}
				onChange={(v) => {
					if (v) {
						handleWaitingChange(v);
					}
				}}
				isEditing={isEditing}
			/>
			<MediaPlaylistSelect
				type='shopping'
				value={shoppingScreenPlaylist}
				onRemove={() => handleShoppingChange(undefined)}
				onChange={(v) => {
					if (v) {
						handleShoppingChange(v);
					}
				}}
				isEditing={isEditing}
			/>
			<ThemeSelect
				value={theme}
				onRemove={() => handleThemeChange(undefined)}
				onChange={(v) => {
					if (v) {
						handleThemeChange(v);
					}
				}}
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
