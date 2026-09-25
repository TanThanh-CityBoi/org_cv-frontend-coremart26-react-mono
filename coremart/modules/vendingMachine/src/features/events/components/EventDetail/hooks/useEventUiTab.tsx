import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { IconDeviceFloppy, IconEdit, IconX } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { eventActions, VendingMachineDispatch } from '@/appState';
import { ControlPanelProps } from '@/components/ControlPanel';
import { useRegisterEventDetailTab } from '@/features/events/components/EventDetail/eventDetailTabControl';
import { EventUpdateFormData, useEventEdit } from '@/features/events/hooks/useEventEdit';
import { Event } from '@/features/events/types';
import { Game } from '@/features/games/types';
import { Playlist } from '@/features/mediaPlaylist/types';
import { Theme } from '@/features/themes/types';


export type EventUiFormData = Pick<
	EventUpdateFormData,
	| 'id'
	| 'etag'
	| 'themeRef'
	| 'gameRef'
	| 'waitingScreenPlaylistRef'
	| 'shoppingScreenPlaylistRef'
>;

export type EventUiPickerValues = Pick<
	Event,
	| 'theme'
	| 'game'
	| 'waitingScreenPlaylist'
	| 'shoppingScreenPlaylist'
>;

function pickerFromEvent(ev: Event): EventUiPickerValues {
	return {
		theme: ev.theme,
		game: ev.game,
		waitingScreenPlaylist: ev.waitingScreenPlaylist,
		shoppingScreenPlaylist: ev.shoppingScreenPlaylist,
	};
}

function buildSubmitPayload(ev: Event, pickers: EventUiPickerValues): EventUiFormData {
	return {
		id: ev.id,
		etag: ev.etag,
		themeRef: pickers.theme?.id ?? null,
		gameRef: pickers.game?.id ?? null,
		waitingScreenPlaylistRef: pickers.waitingScreenPlaylist?.id ?? null,
		shoppingScreenPlaylistRef: pickers.shoppingScreenPlaylist?.id ?? null,
	};
}

export function buildEventUiTabActions(
	isEditing: boolean,
	isSubmitting: boolean,
	translate: ReturnType<typeof useTranslation>['t'],
	handleEdit: () => void,
	handleSaveClick: () => void,
	handleCancel: () => void,
): ControlPanelProps['actions'] {
	return [
		...(!isEditing ? [{
			label: translate('nikki.general.actions.edit'),
			leftSection: <IconEdit size={16} />,
			onClick: handleEdit,
			type: 'button' as const,
			variant: 'filled' as const,
		}] : [{
			label: translate('nikki.general.actions.save'),
			leftSection: <IconDeviceFloppy size={16} />,
			onClick: handleSaveClick,
			type: 'button' as const,
			variant: 'filled' as const,
			disabled: isSubmitting,
			loading: isSubmitting,
		}, {
			label: translate('nikki.general.actions.cancel'),
			leftSection: <IconX size={16} />,
			onClick: handleCancel,
			type: 'button' as const,
			variant: 'outline' as const,
			disabled: isSubmitting,
		}]),
	];
}

export type UseEventUiTabReturn = {
	isSubmitting: boolean;
	isEditing: boolean;
	setIsEditing: (v: boolean) => void;
	theme: Theme | null | undefined;
	game: Game | null | undefined;
	waitingScreenPlaylist: Playlist | null | undefined;
	shoppingScreenPlaylist: Playlist | null | undefined;
	handleThemeChange: (next: Theme | undefined) => void;
	handleGameChange: (next: Game | undefined) => void;
	handleWaitingChange: (next: Playlist | undefined) => void;
	handleShoppingChange: (next: Playlist | undefined) => void;
};

export function useEventUiTab(event: Event): UseEventUiTabReturn {
	const { t: translate } = useTranslation();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();

	const [isEditing, setIsEditing] = useState(false);
	const [pickerValues, setPickerValues] = useState<EventUiPickerValues>(pickerFromEvent(event));

	useEffect(() => {
		if (!isEditing) {
			setPickerValues(pickerFromEvent(event));
		}
	}, [isEditing, event.id, event.etag]);

	const { isSubmitting, handleSubmit } = useEventEdit({
		onUpdateSuccess: () => {
			setIsEditing(false);
			if (event.id) {
				dispatch(eventActions.getEvent(event.id));
			}
		},
	});

	const handleEdit = useCallback(() => {
		setIsEditing(true);
	}, []);

	const handleSaveClick = useCallback(() => {
		handleSubmit(buildSubmitPayload(event, pickerValues));
	}, [handleSubmit, event, pickerValues]);

	const handleCancel = useCallback(() => {
		setPickerValues(pickerFromEvent(event));
		setIsEditing(false);
	}, [event]);

	const actions = useMemo(
		() => buildEventUiTabActions(
			isEditing,
			isSubmitting,
			translate,
			handleEdit,
			handleSaveClick,
			handleCancel,
		),
		[isEditing, isSubmitting, translate, handleEdit, handleSaveClick, handleCancel],
	);

	useRegisterEventDetailTab('ui', actions);

	const handleThemeChange = useCallback((next: Theme | undefined) => {
		setPickerValues((prev) => ({ ...prev, theme: next }));
	}, []);

	const handleGameChange = useCallback((next: Game | undefined) => {
		setPickerValues((prev) => ({ ...prev, game: next }));
	}, []);

	const handleWaitingChange = useCallback((next: Playlist | undefined) => {
		setPickerValues((prev) => ({ ...prev, waitingScreenPlaylist: next }));
	}, []);

	const handleShoppingChange = useCallback((next: Playlist | undefined) => {
		setPickerValues((prev) => ({ ...prev, shoppingScreenPlaylist: next }));
	}, []);

	return {
		isSubmitting,
		isEditing,
		setIsEditing,
		theme: pickerValues.theme,
		game: pickerValues.game,
		waitingScreenPlaylist: pickerValues.waitingScreenPlaylist,
		shoppingScreenPlaylist: pickerValues.shoppingScreenPlaylist,
		handleThemeChange,
		handleGameChange,
		handleWaitingChange,
		handleShoppingChange,
	};
}
