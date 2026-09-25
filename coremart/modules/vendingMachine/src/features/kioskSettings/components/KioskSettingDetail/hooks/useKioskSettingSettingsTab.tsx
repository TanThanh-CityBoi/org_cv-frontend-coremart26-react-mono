import { IconDeviceFloppy, IconEdit, IconX } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanelProps } from '../../../../../components/ControlPanel/ControlPanel';
import { Game } from '../../../../games/types';
import { Playlist } from '../../../../mediaPlaylist/types';
import { Theme } from '../../../../themes/types';
import { KioskSetting } from '../../../types';
import { useRegisterKioskSettingDetailTab } from '../kioskSettingDetailTabControl';
import { useKioskSettingDetailPersistence } from './useKioskSettingDetailPersistence';


type UseKioskSettingSettingsTabArgs = {
	setting: KioskSetting,
};

export function useKioskSettingSettingsTab({ setting }: UseKioskSettingSettingsTabArgs) {
	const { t: translate } = useTranslation('vending_machine');
	const [isEditing, setIsEditing] = useState(false);
	const { onSaveSettings, isSaveSubmitting } = useKioskSettingDetailPersistence(setting, {
		onUpdateSuccess: () => setIsEditing(false),
	});

	const [draftTheme, setDraftTheme] = useState<Theme | undefined>(undefined);
	const [draftGame, setDraftGame] = useState<Game | undefined>(undefined);
	const [idlePlaylist, setIdlePlaylist] = useState<Playlist | undefined>(undefined);
	const [shoppingPlaylist, setShoppingPlaylist] = useState<Playlist | undefined>(undefined);

	const resetDraftFromSetting = useCallback(() => {
		setDraftTheme(setting.themeSetting ?? undefined);
		setDraftGame(setting.gameSetting ?? undefined);
		setIdlePlaylist(setting.waitingScreenPlaylistSetting ?? undefined);
		setShoppingPlaylist(setting.shoppingScreenPlaylistSetting ?? undefined);
	}, [setting]);

	useEffect(() => {
		resetDraftFromSetting();
	}, [setting.id, setting.etag, resetDraftFromSetting]);

	const handleEdit = useCallback(() => setIsEditing(true), []);
	const handleSave = useCallback(() => {
		onSaveSettings({
			themeRef: draftTheme?.id ?? null,
			gameRef: draftGame?.id ?? null,
			waitingScreenPlaylistRef: idlePlaylist?.id ?? null,
			shoppingScreenPlaylistRef: shoppingPlaylist?.id ?? null,
		});
	}, [onSaveSettings, draftTheme, draftGame, idlePlaylist, shoppingPlaylist]);
	const handleCancel = useCallback(() => {
		resetDraftFromSetting();
		setIsEditing(false);
	}, [resetDraftFromSetting]);

	const actions = useMemo<ControlPanelProps['actions']>(() => [
		...(!isEditing ? [{
			label: translate('action.edit'),
			leftSection: <IconEdit size={16} />,
			onClick: handleEdit,
			variant: 'filled' as const,
		}] : [{
			label: translate('action.save'),
			leftSection: <IconDeviceFloppy size={16} />,
			onClick: handleSave,
			variant: 'filled' as const,
			disabled: isSaveSubmitting,
			loading: isSaveSubmitting,
		}, {
			label: translate('action.cancel'),
			leftSection: <IconX size={16} />,
			onClick: handleCancel,
			variant: 'outline' as const,
			disabled: isSaveSubmitting,
		}]),
	], [isEditing, translate, handleEdit, handleSave, handleCancel, isSaveSubmitting]);

	useRegisterKioskSettingDetailTab('settings', actions);

	return {
		isEditing,
		settingTheme: draftTheme,
		settingGame: draftGame,
		idlePlaylist,
		shoppingPlaylist,
		onThemeChange: setDraftTheme,
		onThemeRemove: () => setDraftTheme(undefined),
		onGameChange: setDraftGame,
		onGameRemove: () => setDraftGame(undefined),
		onIdlePlaylistChange: setIdlePlaylist,
		onShoppingPlaylistChange: setShoppingPlaylist,
		onIdlePlaylistRemove: () => setIdlePlaylist(undefined),
		onShoppingPlaylistRemove: () => setShoppingPlaylist(undefined),
	};
}
