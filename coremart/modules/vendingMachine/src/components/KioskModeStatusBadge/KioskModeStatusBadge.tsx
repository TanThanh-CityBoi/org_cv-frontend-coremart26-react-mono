import { useTranslation } from 'react-i18next';

import { KioskMode } from '../../features/kiosks';
import { StatusBadge } from '../StatusBadge';


export const KioskModeStatusBadge: React.FC<{ mode?: KioskMode | null }> = ({ mode }) => {
	const { t: translate } = useTranslation('vending_machine');
	const modeMap: Partial<Record<KioskMode, { color: string, label: string }>> = {
		[KioskMode.PENDING]: { color: 'yellow', label: translate('kiosk.mode.pending') },
		[KioskMode.SELLING]: { color: 'blue', label: translate('kiosk.mode.selling') },
		[KioskMode.SLIDESHOW_ONLY]: { color: 'grape', label: translate('kiosk.mode.slideshow_only') },
	};
	const modeInfo = mode ? modeMap[mode] : undefined;

	return <StatusBadge color={modeInfo?.color} miw={80}>{modeInfo?.label}</StatusBadge>;
};