import { createDetailTabControl } from '../../../../components/DetailLayout';

import type { KioskDetailTabs } from './hooks/types';




export const {
	DetailTabControlProvider: KioskDetailTabControlProvider,
	useDetailTabControl: useKioskDetailTabControl,
	useRegisterDetailTab: useRegisterKioskDetailTab,
} = createDetailTabControl<KioskDetailTabs>();
