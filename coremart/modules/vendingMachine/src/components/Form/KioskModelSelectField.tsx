import { useMemo, useState } from 'react';

import { buildSimpleSearchGraph } from '@/common/helpers';
import { useKioskModelList } from '@/features/kioskModels';
import { KioskModel } from '@/features/kioskModels/types';

import { SearchableSelectField, SearchableSelectFieldProps } from './SearchableSelectField';

export type KioskModelSelectFieldProps = Omit<SearchableSelectFieldProps, 'name' | 'options' | 'searchValue' | 'onSearchChange'> & {
	isView: boolean;
	isSubmitting: boolean;
};

export function KioskModelSelectField({ isView, isSubmitting, ...restProps }: KioskModelSelectFieldProps) {
	const [modelSearch, setModelSearch] = useState('');
	const modelGraph = useMemo(() => buildSimpleSearchGraph([
		{
			key: 'search',
			type: 'search',
			value: modelSearch,
			searchFields: ['id', 'name', 'referenceCode'],
		},
		{
			key: 'isArchived',
			type: 'multiSelect',
			value: [false],
		},
	]), [modelSearch]);
	const { models } = useKioskModelList(modelGraph);
	const modelOptions = useMemo(
		() => (models ?? []).map((item: KioskModel) => ({ value: item.id, label: item.name })),
		[models],
	);
	
	return (
		<SearchableSelectField
			name='modelRef'
			options={modelOptions}
			searchValue={modelSearch}
			onSearchChange={setModelSearch}
			readOnly={isView}
			disabled={isSubmitting ?? false}
			{...restProps}
		/>
	);
}