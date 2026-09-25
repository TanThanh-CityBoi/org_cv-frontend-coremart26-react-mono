import { createDetailTabControl } from '@/components/DetailLayout';

import type { EventDetailTabId } from './hooks/types';



export const {
	DetailTabControlProvider: EventDetailTabControlProvider,
	useDetailTabControl: useEventDetailTabControl,
	useRegisterDetailTab: useRegisterEventDetailTab,
} = createDetailTabControl<EventDetailTabId>();
