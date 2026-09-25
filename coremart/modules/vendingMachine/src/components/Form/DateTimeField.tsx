import { DateTimePicker, DateTimePickerProps } from '@mantine/dates';
import { useId } from '@mantine/hooks';
import { BaseFieldWrapper } from '@nikkierp/ui/components';
import { useFieldData, useFormField } from '@nikkierp/ui/components';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';



export type DateTimeFieldProps = {
	name: string;
	readOnly?: boolean;
	disabled?: boolean;
	placeholder?: string;
	formDefaultValue?: Date;
	inputProps?: Partial<DateTimePickerProps>;
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
	const { t: translate } = useTranslation();

	if (!fieldData) {
		return null;
	}

	const resolvedPlaceholder = placeholder ?? translate(fieldData.placeholder ?? '');

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={translate(fieldData.label)}
			description={translate(fieldData.description ?? '')}
			isRequired={fieldData.isRequired}
			error={translate(fieldData.error ?? '')}
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
