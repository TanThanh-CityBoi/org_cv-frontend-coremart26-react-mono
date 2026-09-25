import React, { useMemo } from 'react';


export type ClientPaginationConfig = {
	page: number;
	pageSize: number;
	totalPages: number;
	totalItems: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (value: string | null) => void;
};

export type UseClientPaginationOptions = {
	fallbackPageSize?: number;
	/** When this value changes, page resets to 1. */
	resetKey?: unknown;
};

/**
 * Local-only pagination — no Redux.
 * Use when the full data set is already in memory (client-side slice) or when the
 * total is driven by a value passed reactively from the caller (e.g. from a Redux hook).
 *
 * `total` is read on every render so it stays in sync with external state.
 */
export function useClientPagination(
	total: number,
	options?: UseClientPaginationOptions,
): ClientPaginationConfig {
	const fallback = options?.fallbackPageSize ?? 10;
	const resetKey = options?.resetKey;

	const [page, setPage] = React.useState(1);
	const [pageSize, setPageSize] = React.useState(fallback);

	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	React.useLayoutEffect(() => {
		if (resetKey !== undefined) {
			setPage(1);
		}
	}, [resetKey]);

	React.useEffect(() => {
		if (totalPages > 0 && page > totalPages) {
			setPage(totalPages);
		}
	}, [page, totalPages]);

	const onPageChange = React.useCallback((newPage: number) => {
		setPage(newPage);
	}, []);

	const onPageSizeChange = React.useCallback((value: string | null) => {
		const next = Number(value ?? fallback);
		setPageSize(Number.isFinite(next) && next > 0 ? next : fallback);
		setPage(1);
	}, [fallback]);

	return useMemo(() => ({
		page,
		pageSize,
		totalPages,
		totalItems: total,
		onPageChange,
		onPageSizeChange,
	}), [page, pageSize, totalPages, total, onPageChange, onPageSizeChange]);
}
