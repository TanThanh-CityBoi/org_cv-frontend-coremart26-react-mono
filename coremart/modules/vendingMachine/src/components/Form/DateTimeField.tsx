import { DateTimePicker, DateTimePickerProps } from '@mantine/dates';
import { useId } from '@mantine/hooks';
import { BaseFieldWrapper } from '@nikkierp/ui/components';
import { useFieldData, useFormField } from '@nikkierp/ui/components';
import { useLocalize } from '@nikkierp/ui/i18n';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';



export type DateTimeFieldProps = {
	name: string,
	readOnly?: boolean,
	disabled?: boolean,
	placeholder?: string,
	formDefaultValue?: Date,
	inputProps?: Partial<DateTimePickerProps>,
};

export function DateTimeField({
	name,
	readOnly = false,
	disabled = false,
	placeholder,
	formDefaultValue = undefined,
	inputProps = {},
}: DateTimeFieldProps) {
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
					<DateTimePicker
						size='md'
						clearable={!disabled}
						id={inputId}
						value={field.value ?? formDefaultValue ?? undefined}
						onChange={field.onChange}
						placeholder={resolvedPlaceholder}
						readOnly={readOnly}
						disabled={disabled}
						{...inputProps}
					/>
				)}
			/>
		</BaseFieldWrapper>
	);
}
