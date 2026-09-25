export type { EventDetailTabId } from './hooks/types';
export * from './EventNotFound';
export * from './EventBasicInfo';
export * from './EventUiTab';
export * from './EventKiosksTab';
export { useEventDetailPageConfig } from './hooks/useEventDetailPageConfig';
export {
	EventDetailTabControlProvider,
	useEventDetailTabControl,
	useRegisterEventDetailTab,
} from './eventDetailTabControl';
