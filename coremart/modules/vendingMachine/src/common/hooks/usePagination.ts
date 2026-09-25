import React, { useMemo } from 'react';

import type { SearchGraph } from '../../types';



export type UsePaginationOptions = {
	graph?: SearchGraph,
	/** Default page size khi component mount. */
	fallbackPageSize?: number,
	/** When this identity changes, page resets to 1 (e.g. parent entity id) */
	resetPageKey?: string | number,
};

export type PaginationConfig = {
	page: number,
	pageSize: number,
	totalPages: number,
	totalItems: number,
	onPageChange: (page: number) => void,
	onPageSizeChange: (pageSize: number | string | null) => void,
};


/**
 * Local page / pageSize with the server `total` supplied by the caller.
 *
 * `pageSize` is deliberately component-local rather than shared state, to avoid cross-page
 * contamination. A `useServiceLayer` result carries `total` directly, so no selector and no
 * Shell-store access is needed.
 */
export function usePaginationWithTotal(
	fetchList: (page: number, size: number, graph?: SearchGraph) => void,
	total: number,
	options?: UsePaginationOptions,
): PaginationConfig {
	const graph = options?.graph;
	const fallback = options?.fallbackPageSize ?? 10;
	const resetPageKey = options?.resetPageKey;

	const [page, setPage] = React.useState(1);
	const [pageSize, setPageSize] = React.useState(fallback);

	React.useLayoutEffect(() => {
		if (resetPageKey !== undefined) {
			setPage(1);
		}
	}, [resetPageKey]);

	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	React.useEffect(() => {
		if (totalPages > 0 && page > totalPages) {
			setPage(totalPages);
		}
	}, [page, totalPages]);

	const onPageChange = React.useCallback((newPage: number) => {
		setPage(newPage);
		fetchList(newPage, pageSize, graph);
	}, [fetchList, pageSize, graph]);

	const onPageSizeChange = React.useCallback((value: number | string | null) => {
		const newSize = Number(value ?? fallback);
		setPageSize(newSize);
		setPage(1);
		fetchList(1, newSize, graph);
	}, [fetchList, graph, fallback]);

	return useMemo(() => ({
		page,
		pageSize,
		totalPages,
		totalItems: total,
		onPageChange,
		onPageSizeChange,
	}), [page, pageSize, totalPages, total, onPageChange, onPageSizeChange]);
}
