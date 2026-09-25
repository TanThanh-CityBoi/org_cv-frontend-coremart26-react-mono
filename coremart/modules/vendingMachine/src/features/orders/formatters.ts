import { VdOrderCurrency } from './types';


export function formatOrderMoney(
	amount: string | undefined,
	currency: VdOrderCurrency | undefined,
): string {
	const n = Number(amount ?? 0);
	const c: VdOrderCurrency = currency ?? 'VND';
	if (c === 'VND') {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
	}
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}
