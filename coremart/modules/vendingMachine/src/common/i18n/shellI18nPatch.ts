import vendingMachineEn from './en/vendingMachine.json';
import vendingMachineVi from './vi/vendingMachine.json';

/**
 * Gộp vào shell `i18n` qua `registerMicroAppI18nResources` (cùng instance `@nikkierp/ui/i18n`).
 *
 * Dưới namespace mặc định `common`, cấu trúc gộp thành:
 * - `nikki` — từ shell base (`@nikkierp/ui` locales), micro-app không cần khai báo lại.
 * - `coremart` — do micro-app vending (Coremart) thêm, cạnh `nikki` (không lồng trong `nikki`).
 *
 * Ví dụ key: `t('coremart.vendingMachine.myKey')` vs shell `t('nikki.vendingMachine.…')`.
 */
export const vendingMachineShellI18nPatch: Record<string, Record<string, unknown>> = {
	vi: {
		common: {
			coremart: {
				vendingMachine: vendingMachineVi,
			},
		},
	},
	en: {
		common: {
			coremart: {
				vendingMachine: vendingMachineEn,
			},
		},
	},
};
