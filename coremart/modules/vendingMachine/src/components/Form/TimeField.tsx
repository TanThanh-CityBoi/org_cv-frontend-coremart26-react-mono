import { TimePicker, TimePickerProps } from '@mantine/dates';
import { useId } from '@mantine/hooks';
import { BaseFieldWrapper } from '@nikkierp/ui/components';
import { useFieldData, useFormField } from '@nikkierp/ui/components';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';



export type TimeFieldProps = {
	name: string;
	readOnly?: boolean;
	disabled?: boolean;
	formDefaultValue?: Date;
	inputProps?: Partial<TimePickerProps>;
};

export function TimeField({
	name,
	readOnly = false,
	disabled = false,
	formDefaultValue = undefined,
	inputProps = {},
}: TimeFieldProps) {
	const inputId = useId();
	const { control } = useFormField();
	const fieldData = useFieldData(name);
	const { t: translate } = useTranslation();

	if (!fieldData) {
		return null;
	}

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
					<TimePicker
						size='md'
						clearable={!disabled}
						id={inputId}
						value={field.value ?? formDefaultValue ?? undefined}
						onChange={field.onChange}
						readOnly={readOnly}
						disabled={disabled}
						withDropdown
						{...inputProps}
					/>
				)}
			/>
		</BaseFieldWrapper>
	);
}
