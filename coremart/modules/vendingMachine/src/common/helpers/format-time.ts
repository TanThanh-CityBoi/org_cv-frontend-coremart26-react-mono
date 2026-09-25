import dayjs from 'dayjs';


export function formatRelativeTime(
	dateString: string,
	translate: (key: string, options?: { count?: number }) => string,
): string {
	const date = dayjs(dateString);
	const now = dayjs();

	const diffMins = now.diff(date, 'minute');
	const diffHours = now.diff(date, 'hour');
	const diffDays = now.diff(date, 'day');

	if (diffMins < 1) {
		return translate('nikki.general.time.just_now');
	}

	if (diffMins < 60) {
		return translate('nikki.general.time.minutes_ago', { count: diffMins });
	}

	if (diffHours < 24) {
		return translate('nikki.general.time.hours_ago', { count: diffHours });
	}

	return translate('nikki.general.time.days_ago', { count: diffDays });
}

export function formatDateTime(dateString: string): string {
	return dayjs(dateString).format('DD/MM/YYYY HH:mm');
}

export function getDate(dateInput: string | Date, format?: string): Date | null {
	if (dateInput instanceof Date) return Number.isNaN(dateInput.getTime()) ? null : dateInput;
	const d = format ? dayjs(dateInput, format, true).toDate() : dayjs(dateInput).toDate();
	return Number.isNaN(d?.getTime()) ? null : d;
}

/** Chuẩn hoá giờ trong ngày cho query API (`hh:mm:ss`). */
export function formatTimeQuery(raw: string | null | undefined, fallback: string): string {
	if (!raw || !String(raw).trim()) return fallback;
	const parts = String(raw).trim().split(':').filter(Boolean);
	if (parts.length === 2) {
		const h = parts[0].padStart(2, '0');
		const m = parts[1].padStart(2, '0');
		return `${h}:${m}:00`;
	}
	if (parts.length >= 3) {
		const h = parts[0].padStart(2, '0');
		const m = parts[1].padStart(2, '0');
		const secRaw = parts[2].replace(/\D/g, '').slice(0, 2);
		const s = (secRaw || '00').padStart(2, '0');
		return `${h}:${m}:${s}`;
	}
	return fallback;
}