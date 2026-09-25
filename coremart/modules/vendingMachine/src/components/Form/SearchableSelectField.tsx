import { Combobox, TextInput, useCombobox } from '@mantine/core';
import { useId } from '@mantine/hooks';
import { BaseFieldWrapper } from '@nikkierp/ui/components';
import { useFieldData, useFormField } from '@nikkierp/ui/components';
import { useLocalize } from '@nikkierp/ui/i18n';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';



export type SearchableSelectOption = { value: string, label: string };

export type SearchableSelectFieldProps = {
	name: string,
	options: SearchableSelectOption[],
	searchValue: string,
	onSearchChange: (value: string) => void,
	readOnly?: boolean,
	disabled?: boolean,
	/** Label when the value is not present in `options` (for example entity name before the list loads). */
	fallbackLabel?: string,
	placeholder?: string,
	emptyMessage?: string,
	formDefaultValue?: string | null,
};

function findOption(
	options: SearchableSelectOption[],
	value: string | null | undefined,
) {
	if (value == null || value === '') return undefined;
	return options.find((item) => item.value === value);
}

export function SearchableSelectField({
	name,
	options,
	searchValue,
	onSearchChange,
	readOnly = false,
	disabled = false,
	fallbackLabel = '',
	placeholder,
	emptyMessage,
	formDefaultValue = null,
}: SearchableSelectFieldProps) {
	const inputId = useId();
	const { control } = useFormField();
	const fieldData = useFieldData(name);
	const { t: translate } = useTranslation('vending_machine');
	// Schema labels are `{ $ref }` lang-json, not plain keys: i18next would stringify them.
	const localize = useLocalize('vending_machine');
	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
	});

	if (!fieldData) {
		return null;
	}

	const resolvedPlaceholder =
		placeholder ?? (fieldData.placeholder ? localize(fieldData.placeholder) : translate('search.placeholder'));

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
				render={({ field }) => {
					const closedDisplay =
						findOption(options, field.value)?.label ?? fallbackLabel ?? '';
					const comboboxOpts = options.map((item) => (
						<Combobox.Option
							value={item.value}
							key={item.value}
							selected={item.value === field.value}
						>
							{item.label}
						</Combobox.Option>
					));
					return (
						<Combobox
							store={combobox}
							onClose={() => onSearchChange('')}
							onOpen={() => onSearchChange('')}
							onOptionSubmit={(optionValue) => {
								field.onChange(optionValue);
								onSearchChange('');
								combobox.closeDropdown();
							}}
						>
							<Combobox.Target>
								<TextInput
									size='md'
									placeholder={
										combobox.dropdownOpened ? closedDisplay : resolvedPlaceholder
									}
									value={combobox.dropdownOpened ? searchValue : closedDisplay}
									onChange={(event) => onSearchChange(event.currentTarget.value)}
									readOnly={readOnly}
									disabled={disabled}
									onClick={() => !readOnly && !disabled && combobox.openDropdown()}
									onFocus={() => !readOnly && !disabled && combobox.openDropdown()}
									onBlur={() => !readOnly && !disabled && combobox.closeDropdown()}
								/>
							</Combobox.Target>
							<Combobox.Dropdown>
								<Combobox.Options>
									{comboboxOpts.length === 0 ? (
										<Combobox.Empty>{emptyMessage ?? 'Nothing found'}</Combobox.Empty>
									) : (
										comboboxOpts
									)}
								</Combobox.Options>
							</Combobox.Dropdown>
						</Combobox>
					);
				}}
			/>
		</BaseFieldWrapper>
	);
}
