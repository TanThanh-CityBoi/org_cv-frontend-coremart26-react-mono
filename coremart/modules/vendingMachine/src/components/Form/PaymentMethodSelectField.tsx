import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { buildSimpleSearchGraph } from '@/common/helpers';
import { usePaymentList } from '@/features/payment';
import { PaymentMethod } from '@/features/payment/types';

import { MultiSelectField, MultiSelectFieldProps } from './MultiSelectField';


export type PaymentMethodSelectFieldProps = Omit<MultiSelectFieldProps, 'name' | 'data' | 'searchValue' | 'onSearchChange'> & {
	isView: boolean;
	isSubmitting: boolean;
};

export function PaymentMethodSelectField({ isView, isSubmitting, ...restProps }: PaymentMethodSelectFieldProps) {
	const { t: translate } = useTranslation();
	const [paymentSearch, setPaymentSearch] = useState('');
	const paymentGraph = useMemo(() => buildSimpleSearchGraph([
		{
			key: 'search',
			type: 'search',
			value: paymentSearch,
			searchFields: ['name', 'method'],
		},
		{
			key: 'isArchived',
			type: 'multiSelect',
			value: [false],
		},
	]), [paymentSearch]);
	const { payments, isLoadingList } = usePaymentList(paymentGraph);
	const paymentOptions = useMemo(
		() => (isLoadingList ? [] : (payments ?? []).map((p: PaymentMethod) => ({
			value: p.id,
			label: p.name,
		}))),
		[payments, isLoadingList],
	);

	return (
		<MultiSelectField
			name='paymentRefs'
			data={paymentOptions}
			searchValue={paymentSearch}
			onSearchChange={setPaymentSearch}
			readOnly={isView}
			disabled={isSubmitting ?? false}
			placeholder={translate('coremart.vendingMachine.kiosk.fields.paymentMethods')}
			{...restProps}
		/>
	);
}