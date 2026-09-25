import { useState } from 'react';

import { type Setting } from '../types';
import { useSettingDetail } from './useSettingDetail';


export const useSettingPreview = () => {
	const [isOpenPreview, setIsOpenPreview] = useState(false);
	const [selectedSetting, setSelectedSetting] = useState<Setting | undefined>();

	const { setting: settingDetail, isLoading } = useSettingDetail(selectedSetting?.id || '');

	const handlePreview = (setting: Setting) => {
		setSelectedSetting(setting);
		setIsOpenPreview(true);
	};

	const handleClosePreview = () => {
		setIsOpenPreview(false);
		setSelectedSetting(undefined);
	};

	return {
		isOpenPreview,
		handlePreview,
		handleClosePreview,
		selectedSetting: settingDetail,
		isLoadingPreview: isLoading,
	};
};
