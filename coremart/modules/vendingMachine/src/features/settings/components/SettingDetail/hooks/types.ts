import { ModelSchema } from '@nikkierp/common/dynamicModel';

import { BreadcrumbItem } from '../../../../../components/BreadCrumbs';
import { ControlPanelProps } from '../../../../../components/ControlPanel/ControlPanel';
import { SettingCreateFormData } from '../../../hooks/useSettingCreate';
import { Setting } from '../../../types';


export type UseSettingDetailPageConfigProps = {
	setting?: Setting,
};

export type SettingFormProps = {
	formId: string,
	isEditing: boolean,
	isSubmitting: boolean,
	modelSchema: ModelSchema,
	modelValue?: SettingCreateFormData,
	onFormSubmit: (data: SettingCreateFormData) => void,
	closeDeleteModal: () => void,
	confirmDelete: () => void,
	isOpenDeleteModal: boolean,
};

export type UseSettingDetailPageConfigReturn = {
	breadcrumbs: BreadcrumbItem[],
	actions: ControlPanelProps['actions'],
	formProps: SettingFormProps,
};
