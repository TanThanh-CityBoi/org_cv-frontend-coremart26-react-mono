import React from 'react';

import { RevenueReportByKiosk } from '../RevenueReportByKiosk';
import { RevenueReportByPayment } from '../RevenueReportByPayment';
import { RevenueReportByProduct } from '../RevenueReportByProduct';
import { RevenueReportOverview } from '../RevenueReportOverview';
import {
	REVENUE_REPORT_TYPE,
	type RevenueReportFilters,
	type RevenueReportTypeKey,
} from './type';


export function RevenueReportSwitcher({
	active,
	filters,
}: {
	active: RevenueReportTypeKey;
	filters: RevenueReportFilters;
}): React.ReactElement {
	switch (active) {
		case REVENUE_REPORT_TYPE.BY_KIOSK:
			return <RevenueReportByKiosk filters={filters} />;
		case REVENUE_REPORT_TYPE.BY_PAYMENT:
			return <RevenueReportByPayment filters={filters} />;
		case REVENUE_REPORT_TYPE.BY_PRODUCT:
			return <RevenueReportByProduct filters={filters} />;
		default:
			return <RevenueReportOverview filters={filters} />;
	}
}
