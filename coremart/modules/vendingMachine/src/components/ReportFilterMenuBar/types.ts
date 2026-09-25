import type { DatesRangeValue, DateValue } from '@mantine/dates';


export type ReportFilterCollapseDirection = 'left' | 'right';

export type ReportSectionToggleDef = {
	id: string,
	label: string,
};

export type ReportFilterMenuBarProps = {
	/** Distance from top of viewport (e.g. below app header). */
	topOffset?: number,
	/** When true the drawer panel is visible on first paint. */
	defaultExpanded?: boolean,
	/** Slide panel off-screen toward this edge when collapsed. */
	collapseDirection?: ReportFilterCollapseDirection,
	kioskOptions: { value: string, label: string }[],
	kioskValue: string[],
	onKioskChange: (value: string[]) => void,
	dateRange: DatesRangeValue<DateValue> | undefined,
	onDateRangeChange: (value: DatesRangeValue<DateValue> | undefined) => void,
	reportSections: ReportSectionToggleDef[],
	sectionVisibility: Record<string, boolean>,
	onSectionVisibilityChange: (id: string, visible: boolean) => void,
};
