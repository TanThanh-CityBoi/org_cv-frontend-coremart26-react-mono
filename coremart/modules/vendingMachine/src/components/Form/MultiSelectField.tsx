import { MultiSelect } from '@mantine/core';
import { useId } from '@mantine/hooks';
import { BaseFieldWrapper } from '@nikkierp/ui/components';
import { useFieldData, useFormField } from '@nikkierp/ui/components';
import { useLocalize } from '@nikkierp/ui/i18n';
import React from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';



export type MultiSelectFieldOption = { value: string, label: string };

export type MultiSelectFieldProps = {
	name: string,
	data: MultiSelectFieldOption[],
	searchValue: string,
	onSearchChange: (value: string) => void,
	readOnly?: boolean,
	disabled?: boolean,
	placeholder?: string,
	formDefaultValue?: string[],
};

export function MultiSelectField({
	name,
	data,
	searchValue,
	onSearchChange,
	readOnly = false,
	disabled = false,
	placeholder,
	formDefaultValue = [],
}: MultiSelectFieldProps) {
	const inputId = useId();
	const { control } = useFormField();
	const fieldData = useFieldData(name);
	const { t: translate } = useTranslation('vending_machine');
	// Schema labels are `{ $ref }` lang-json, not plain keys: i18next would stringify them.
	const localize = useLocalize('vending_machine');

	if (!fieldData) {
		return null;
	}

	const resolvedPlaceholder = placeholder ?? localize(fieldData.placeholder);

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={localize(fieldData.label)}
			description={localize(fieldData.description)}
			isRequired={fieldData.isRequired}
			error={fieldData.error ? translate(fieldData.error) : ''}
		>
			<Controller
				name={name}
				control={control}
				defaultValue={formDefaultValue}
				render={({ field }) => (
					<MultiSelect
						size='md'
						searchable={!disabled}
						clearable={!disabled}
						id={inputId}
						data={data}
						value={field.value ?? []}
						onChange={field.onChange}
						searchValue={searchValue}
						onSearchChange={onSearchChange}
						placeholder={resolvedPlaceholder}
						readOnly={readOnly}
						disabled={disabled}
						styles={{
							pillsList: {
								flexWrap: 'nowrap',
								overflowX: 'auto',
								scrollbarWidth: 'none',
								'-ms-overflow-style': 'none',
								'&::-webkit-scrollbar': {
									display: 'none',
								},
							},
						}}
					/>
				)}
			/>
		</BaseFieldWrapper>
	);
}
