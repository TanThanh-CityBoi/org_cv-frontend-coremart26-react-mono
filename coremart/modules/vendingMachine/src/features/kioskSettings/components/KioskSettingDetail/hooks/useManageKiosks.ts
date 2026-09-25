import { useUIState } from '@nikkierp/shell/contexts';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMutationOutcome } from '../../../../../common/hooks/useMutationOutcome';
import { Kiosk } from '../../../../kiosks/types';
import { kioskSettingCrudService } from '../../../kioskSettingService';

import type { KioskSetting } from '../../../types';


type UseAssignKiosksToSettingArgs = {
	setting: KioskSetting,
	onAssignSuccess?: () => void,
	onAssignError?: () => void,
};


export function useAssignKiosksToSetting({
	setting,
	onAssignSuccess = () => {},
	onAssignError = () => {},
}: UseAssignKiosksToSettingArgs) {
	const { dispatchMethod, result } = useServiceLayer(kioskSettingCrudService.manageKiosks);

	const handleAssignKiosks = useCallback(
		(picked: Kiosk[]) => {
			if (picked.length === 0 || result.isPending) return;
			dispatchMethod({ settingId: setting.id, add: picked.map((k) => k.id), remove: [] });
		},
		[dispatchMethod, result.isPending, setting.id],
	);

	useMutationOutcome(result, {
		successKey: () => 'common.messages.update_success',
		errorKey: 'common.messages.update_failed',
		onSuccess: onAssignSuccess,
		onError: onAssignError,
	});

	return {
		handleAssignKiosks,
		isAssignLoading: result.isPending,
	};
}


type UseRemoveKioskFromSettingArgs = {
	setting: KioskSetting,
	onRemovedSuccess?: () => void,
	onRemovedError?: () => void,
};


export function useRemoveKioskFromSetting({
	setting,
	onRemovedSuccess = () => {},
	onRemovedError = () => {},
}: UseRemoveKioskFromSettingArgs) {
	const { t: translate } = useTranslation('vending_machine');
	const { notification } = useUIState();
	const { dispatchMethod, result } = useServiceLayer(kioskSettingCrudService.manageKiosks);

	const [kioskToRemove, setKioskToRemove] = useState<Kiosk | null>(null);
	const [confirmModalOpened, setConfirmModalOpened] = useState(false);

	const closeConfirmModal = useCallback(() => {
		if (result.isPending) return;
		setKioskToRemove(null);
		setConfirmModalOpened(false);
	}, [result.isPending]);

	const openConfirmModal = useCallback(
		(kiosk: Kiosk) => {
			if (result.isPending) {
				notification.showError(
					translate('common.messages.update_failed'),
					translate('messages.error'),
				);
				return;
			}
			setKioskToRemove(kiosk);
			setConfirmModalOpened(true);
		},
		[result.isPending, notification, translate],
	);

	const handleRemoveKiosk = useCallback(() => {
		if (result.isPending || !kioskToRemove) return;
		dispatchMethod({ settingId: setting.id, add: [], remove: [kioskToRemove.id] });
	}, [dispatchMethod, kioskToRemove, result.isPending, setting.id]);

	// Each hook now owns its own service-layer result, so assign and remove no longer share
	// one slice entry — the requestId cross-talk guards the Redux version needed are gone.
	useMutationOutcome(result, {
		successKey: () => 'common.messages.update_success',
		errorKey: 'common.messages.update_failed',
		onSuccess: () => { setKioskToRemove(null); setConfirmModalOpened(false); onRemovedSuccess(); },
		onError: () => { setKioskToRemove(null); setConfirmModalOpened(false); onRemovedError(); },
	});

	return {
		settingName: setting.name ?? setting.code ?? setting.id,
		kioskToRemove,
		isRemoveLoading: confirmModalOpened && kioskToRemove != null && result.isPending,
		confirmModalOpened,
		openConfirmModal,
		closeConfirmModal,
		handleRemoveKiosk,
	};
}
