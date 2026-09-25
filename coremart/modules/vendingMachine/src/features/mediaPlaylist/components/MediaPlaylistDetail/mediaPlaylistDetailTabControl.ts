import { createDetailTabControl } from '@/components/DetailLayout';

import type { MediaPlaylistDetailTabId } from './hooks/types';


export const {
	DetailTabControlProvider: MediaPlaylistDetailTabControlProvider,
	useDetailTabControl: useMediaPlaylistDetailTabControl,
	useRegisterDetailTab: useRegisterMediaPlaylistDetailTab,
} = createDetailTabControl<MediaPlaylistDetailTabId>();
