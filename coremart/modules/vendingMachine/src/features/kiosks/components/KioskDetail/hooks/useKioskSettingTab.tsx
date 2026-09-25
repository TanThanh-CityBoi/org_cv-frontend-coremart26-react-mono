import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { IconDeviceFloppy, IconEdit, IconX } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { KioskDetailTabs } from './types';

import { VendingMachineDispatch } from '@/appState';
import { kioskActions } from '@/appState/kiosk';
import { ControlPanelProps } from '@/components/ControlPanel';
import { Game } from '@/features/games/types';
import { useRegisterKioskDetailTab } from '@/features/kiosks/components/KioskDetail/kioskDetailTabControl';
import { KioskUpdateFormData, useKioskEdit } from '@/features/kiosks/hooks';
import { Kiosk, UIMode } from '@/features/kiosks/types';
import { KioskSetting } from '@/features/kioskSettings/types';
import { Playlist } from '@/features/mediaPlaylist/types';
import { Theme } from '@/features/themes/types';


export type KioskSettingFormData = Pick<
	KioskUpdateFormData,
	| 'id'
	| 'etag'
	| 'settingRef'
	| 'waitingScreenPlaylistRef'
	| 'shoppingScreenPlaylistRef'
	| 'themeRef'
	| 'gameRef'
	| 'uiMode'
>;

export type KioskSettingPickerValues = Pick<
	Kiosk,
	| 'uiMode'
	| 'setting'
	| 'waitingScreenPlaylist'
	| 'shoppingScreenPlaylist'
	| 'theme'
	| 'game'
>;

function pickerFromKiosk(k: Kiosk): KioskSettingPickerValues {
	return {
		uiMode: k.uiMode,
		setting: k.setting,
		waitingScreenPlaylist: k.waitingScreenPlaylist,
		shoppingScreenPlaylist: k.shoppingScreenPlaylist,
		theme: k.theme,
		game: k.game,
	};
}

function buildSubmitPayload(
	kiosk: Kiosk,
	settings: KioskSettingPickerValues,
): KioskSettingFormData {
	return {
		id: kiosk.id,
		etag: kiosk.etag,
		settingRef: settings.setting?.id ?? null,
		waitingScreenPlaylistRef: settings.waitingScreenPlaylist?.id,
		shoppingScreenPlaylistRef: settings.shoppingScreenPlaylist?.id,
		themeRef: settings.theme?.id,
		gameRef: settings.game?.id,
		uiMode: settings.uiMode,
	};
}

export function buildKioskSettingActions(
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

export type UseKioskSettingTabReturn = {
	isSubmitting: boolean;
	isEditing: boolean;
	setIsEditing: (v: boolean) => void;
	setting: KioskSetting | null | undefined;
	waitingScreenPlaylist: Playlist | null | undefined;
	shoppingScreenPlaylist: Playlist | null | undefined;
	theme: Theme | null | undefined;
	game: Game | null | undefined;
	uiMode: UIMode | null | undefined;
	handleSettingChange: (next: KioskSetting | undefined) => void;
	handleWaitingChange: (next: Playlist | undefined) => void;
	handleShoppingChange: (next: Playlist | undefined) => void;
	handleThemeChange: (next: Theme | undefined) => void;
	handleGameChange: (next: Game | undefined) => void;
	handleUIModeChange: (next: UIMode | undefined) => void;
};


export function useKioskSettingTab(kiosk: Kiosk): UseKioskSettingTabReturn {
	const { t: translate } = useTranslation();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();

	const [isEditing, setIsEditing] = useState(false);
	const [kioskSettings, setKioskSettings] = useState<KioskSettingPickerValues>(pickerFromKiosk(kiosk));

	useEffect(() => {
		if (!isEditing) {
			setKioskSettings(pickerFromKiosk(kiosk));
		}
	}, [isEditing, kiosk.id, kiosk.etag]);

	const { isSubmitting, handleSubmit } = useKioskEdit({
		onUpdateSuccess: () => {
			setIsEditing(false);
			if (kiosk.id) {
				dispatch(kioskActions.getKiosk(kiosk.id));
			}
		},
	});

	const handleEdit = useCallback(() => {
		setIsEditing(true);
	}, []);

	const handleSaveClick = useCallback(() => {
		handleSubmit(buildSubmitPayload(kiosk, kioskSettings));
	}, [handleSubmit, kiosk, kioskSettings]);

	const handleCancel = useCallback(() => {
		setKioskSettings(pickerFromKiosk(kiosk));
		setIsEditing(false);
	}, [kiosk, setKioskSettings]);

	const actions = useMemo(
		() => buildKioskSettingActions(
			isEditing,
			isSubmitting,
			translate,
			handleEdit,
			handleSaveClick,
			handleCancel,
		),
		[isEditing, isSubmitting, translate, handleEdit, handleSaveClick, handleCancel],
	);

	useRegisterKioskDetailTab(KioskDetailTabs.DISPLAY_SETTINGS, actions);

	const handleUIModeChange = useCallback((next?: UIMode | null) => {
		setKioskSettings((prev) => ({ ...prev, uiMode: next }));
	}, []);

	const handleSettingChange = useCallback((next: KioskSetting | undefined) => {
		setKioskSettings((prev) => ({ ...prev, setting: next }));
	}, []);

	const handleWaitingChange = useCallback((next: Playlist | undefined) => {
		setKioskSettings((prev) => ({ ...prev, waitingScreenPlaylist: next }));
	}, []);

	const handleShoppingChange = useCallback((next: Playlist | undefined) => {
		setKioskSettings((prev) => ({ ...prev, shoppingScreenPlaylist: next }));
	}, []);

	const handleThemeChange = useCallback((next: Theme | undefined) => {
		setKioskSettings((prev) => ({ ...prev, theme: next }));
	}, []);

	const handleGameChange = useCallback((next: Game | undefined) => {
		setKioskSettings((prev) => ({ ...prev, game: next }));
	}, []);

	return {
		isSubmitting,
		isEditing,
		setIsEditing,
		setting: kioskSettings?.setting,
		waitingScreenPlaylist: kioskSettings?.waitingScreenPlaylist,
		shoppingScreenPlaylist: kioskSettings?.shoppingScreenPlaylist,
		theme: kioskSettings?.theme,
		game: kioskSettings?.game,
		uiMode: kioskSettings?.uiMode,
		handleSettingChange,
		handleWaitingChange,
		handleShoppingChange,
		handleThemeChange,
		handleGameChange,
		handleUIModeChange,
	};
}
