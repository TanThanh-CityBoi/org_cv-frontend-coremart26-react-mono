import { SearchGraph } from './search-graph';


/**
 * Merged list + pagination state — replaces the `list: ReduxActionState<T[]>` + `listPagination: Pagination` pair.
 * `size` is stored for reference but MUST NOT be used to initialise UI page-size state
 * (use the hook's `fallbackPageSize` option instead to avoid cross-page contamination).
 */
export type PagedReduxState<T> = {
	status: 'idle' | 'pending' | 'success' | 'error';
	error: string | null;
	requestId?: string | null;
	items: T[];
	total: number;
	page: number;
	size: number;
};

export function basePagedReduxState<T>(defaultSize: number): PagedReduxState<T> {
	return {
		status: 'idle',
		error: null,
		items: [],
		total: 0,
		page: 0,
		size: defaultSize,
	};
}


export type RestCreateResponse = {
	id: string;
	createdAt: number;
	etag: string;
};

export type RestUpdateResponse = {
	affectedCount: number;
	affectedAt: string;
	etag: string;
};

export type RestArchiveResponse = {
	affectedCount: number;
	affectedAt: string;
	etag: string;
};

export type RestDeleteResponse = {
	affectedCount: number;
	affectedAt: string;
	etag: string;
};

export type Pagination = {
	total: number;
	page: number;
	size: number;
};

export type PagedSearchResponse<T> = Pagination & {
	items: T[];
};

export type PageQuery = {
	page?: number;
	size?: number;
};

export type SearchParams<T=any> = PageQuery & {
	graph?: SearchGraph;
	fields?: Array<keyof T>;
	extra?: Record<string, string>;

	// /** @deprecated use `fields` instead */
	// columns?: Array<keyof T>;
};


//* Report query types

export type ReportTimeQuery = {
	fromDate: string; // ISO Z, ví dụ 2026-05-01T00:00:00Z
	toDate: string;
	/** Chuỗi `hh:mm:ss` (ghi trên URL), ví dụ 00:00:00 — Bruno `time_of_date_from`. */
	timeOfDateFrom?: string;
	/** Chuỗi `hh:mm:ss`, ví dụ 23:59:59 — Bruno `time_of_date_to`. */
	timeOfDateTo?: string;
};

export type GroupTime = 'hour' | 'day' | 'month' | 'year';
export type GroupTimeQuery = {
	groupTime?: GroupTime;
};

export type SortDirection = 'asc' | 'desc';
export type SortQuery = {
	sort?: {
		field: string;
		direction: SortDirection;
	}[];
};

//* Base report query types
export type KioskReportQuery = { kioskIds?: string[] };

export type BaseReportQuery = ReportTimeQuery & KioskReportQuery;

export type FileExportQuery = { download?: boolean };

export type ListReportQuery = BaseReportQuery & PageQuery & FileExportQuery & SortQuery;

// * revenue reports
export type RevenueReportOverviewQuery = BaseReportQuery & GroupTimeQuery;

export type RevenueReportByHourQuery = ListReportQuery;

export type RevenueReportByOrderTimeQuery = ListReportQuery & GroupTimeQuery;

export type RevenueReportByKioskQuery = ListReportQuery;

export type RevenueReportByPaymentMethodQuery = ListReportQuery;

export type RevenueReportByProductQuery = ListReportQuery;

export type RevenueReportByCategoryQuery = ListReportQuery;

// Refund report query types
export type RefundReportOverviewQuery = BaseReportQuery;
export type RefundReportByKioskQuery = BaseReportQuery;
export type RefundReportByPaymentMethodQuery = BaseReportQuery;
export type RefundReportByProductQuery = BaseReportQuery;
export type RefundReportOrdersQuery = ListReportQuery;

