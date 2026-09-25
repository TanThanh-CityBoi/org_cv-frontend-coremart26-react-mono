import { useState } from 'react';

import { type Event } from '../types';
import { useEventDetail } from './useEventDetail';


export const useEventPreview = () => {
	const [isOpenPreview, setIsOpenPreview] = useState(false);
	const [previewId, setPreviewId] = useState<string | undefined>();

	const fetchId = isOpenPreview ? previewId : undefined;
	const { event: detailEvent, isLoading } = useEventDetail(fetchId);

	const handlePreview = (evt: Event) => {
		setPreviewId(evt.id);
		setIsOpenPreview(true);
	};

	const handleClosePreview = () => {
		setIsOpenPreview(false);
		setPreviewId(undefined);
	};

	return {
		isOpenPreview,
		handlePreview,
		handleClosePreview,
		selectedEvent: detailEvent,
		isLoadingPreview: isLoading,
	};
};
