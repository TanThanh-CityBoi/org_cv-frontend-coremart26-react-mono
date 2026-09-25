
import { ActionIcon, Card, Group, Loader, Radio, Stack, Text, Title, Tooltip as MantineTooltip } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import {
	type Chart,
	CategoryScale,
	Chart as ChartJS,
	LinearScale,
	BarElement,
	type Plugin,
	Tooltip,
	Legend,
} from 'chart.js';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

import { fmtCurrency, fmtNumber, fmtShortNumber } from '../../../../../common/helpers/formartNumber';
import {
	TimeRangeSelect,
	type TimeRangePreset,
	type TimeRangePresetRange,
} from '../../../../../components/RangePicker';
import { GroupTime } from '../../../../../types/api';
import { formatOrderTimeLabel } from '../../../helpers';
import { RevenueReportFilters } from '../RevenueReportSwitcher';

import type { PaginationConfig } from '../../../../../common/hooks';
import type { ReportOverview, RevenueReportByOrderTime } from '../../type';


ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const AVERAGE_LINE_PLUGIN_ID = 'revenueAverageLine';

type RevenueAvgLinePluginOptions = {
	averageRevenue: number | null,
};

type AvgLineHitRegion = {
	lineY: number,
	lineX0: number,
	lineX1: number,
	pillLeft: number,
	pillRight: number,
	pillTop: number,
	pillBottom: number,
};

type ChartWithAvgLine = Chart & {
	_avgLineHit?: AvgLineHitRegion | null,
	_avgLineTooltipEl?: HTMLDivElement,
	_avgLineHandlers?: { move: (e: MouseEvent) => void, leave: () => void },
};

function getRevenueAvgOpts(chart: Chart): RevenueAvgLinePluginOptions {
	const plugins = chart.options.plugins as Record<string, RevenueAvgLinePluginOptions | undefined> | undefined;
	const raw = plugins?.[AVERAGE_LINE_PLUGIN_ID];
	if (raw && typeof raw === 'object' && 'averageRevenue' in raw) {
		const v = raw.averageRevenue;
		if (v == null) {
			return { averageRevenue: null };
		}
		return typeof v === 'number' && Number.isFinite(v) ? { averageRevenue: v } : { averageRevenue: null };
	}
	return { averageRevenue: null };
}

function hideAvgLineTooltip(c: ChartWithAvgLine): void {
	const el = c._avgLineTooltipEl;
	if (el) {
		el.style.display = 'none';
	}
}

function ensureAvgLineTooltipEl(c: ChartWithAvgLine): HTMLDivElement {
	let el = c._avgLineTooltipEl;
	if (el?.isConnected) {
		return el;
	}
	const parent = c.canvas.parentElement;
	if (!parent) {
		return document.createElement('div');
	}
	if (getComputedStyle(parent).position === 'static') {
		parent.style.position = 'relative';
	}
	el = document.createElement('div');
	el.setAttribute('role', 'tooltip');
	el.style.cssText = [
		'position:absolute',
		'pointer-events:none',
		'z-index:20',
		'display:none',
		'padding:6px 10px',
		'border-radius:6px',
		'font-size:12px',
		'line-height:1.35',
		'background:rgba(0,0,0,0.88)',
		'color:#fff',
		'white-space:nowrap',
		'box-shadow:0 2px 8px rgba(0,0,0,0.2)',
	].join(';');
	parent.appendChild(el);
	c._avgLineTooltipEl = el;
	return el;
}

function showAvgLineTooltip(c: ChartWithAvgLine, canvasX: number, canvasY: number, text: string): void {
	const el = ensureAvgLineTooltipEl(c);
	el.textContent = text;
	el.style.display = 'block';
	const parent = el.parentElement;
	if (!parent) {
		return;
	}
	const canvas = c.canvas;
	void el.offsetWidth;
	const pad = 8;
	let left = canvas.offsetLeft + canvasX + 12;
	let top = canvas.offsetTop + canvasY - el.offsetHeight - 12;
	left = Math.max(pad, Math.min(left, parent.clientWidth - el.offsetWidth - pad));
	top = Math.max(pad, Math.min(top, parent.clientHeight - el.offsetHeight - pad));
	el.style.left = `${left}px`;
	el.style.top = `${top}px`;
}

const revenueAverageLinePlugin: Plugin<'bar'> = {
	id: AVERAGE_LINE_PLUGIN_ID,
	afterInit(chart) {
		const c = chart as ChartWithAvgLine;
		const onMove = (e: MouseEvent) => {
			const { averageRevenue } = getRevenueAvgOpts(c);
			if (averageRevenue == null || !Number.isFinite(averageRevenue)) {
				hideAvgLineTooltip(c);
				return;
			}
			const hit = c._avgLineHit;
			if (!hit) {
				hideAvgLineTooltip(c);
				return;
			}
			const x = e.offsetX;
			const y = e.offsetY;
			const lineSlop = 10;
			const nearLine =
				Math.abs(y - hit.lineY) <= lineSlop && x >= hit.lineX0 && x <= hit.lineX1;
			const onPill =
				x >= hit.pillLeft && x <= hit.pillRight && y >= hit.pillTop && y <= hit.pillBottom;
			if (!nearLine && !onPill) {
				hideAvgLineTooltip(c);
				return;
			}
			const label = `Doanh thu trung bình: ${fmtCurrency(averageRevenue)}`;
			showAvgLineTooltip(c, x, y, label);
		};
		const onLeave = () => hideAvgLineTooltip(c);
		c.canvas.addEventListener('mousemove', onMove);
		c.canvas.addEventListener('mouseleave', onLeave);
		c._avgLineHandlers = { move: onMove, leave: onLeave };
	},
	beforeDestroy(chart) {
		const c = chart as ChartWithAvgLine;
		const h = c._avgLineHandlers;
		if (h) {
			c.canvas.removeEventListener('mousemove', h.move);
			c.canvas.removeEventListener('mouseleave', h.leave);
			c._avgLineHandlers = undefined;
		}
		c._avgLineTooltipEl?.remove();
		c._avgLineTooltipEl = undefined;
		c._avgLineHit = null;
	},
	afterDatasetsDraw(chart) {
		const c = chart as ChartWithAvgLine;
		const { averageRevenue } = getRevenueAvgOpts(c);
		if (averageRevenue == null || !Number.isFinite(averageRevenue)) {
			c._avgLineHit = null;
			return;
		}
		const { ctx, chartArea, scales } = c;
		const yScale = scales.y;
		if (!yScale) {
			c._avgLineHit = null;
			return;
		}

		const lineY = yScale.getPixelForValue(averageRevenue);
		if (lineY < chartArea.top || lineY > chartArea.bottom) {
			c._avgLineHit = null;
			return;
		}

		const lineEndX = chartArea.right;
		ctx.save();

		const label = 'Avg';
		const fontStack =
			typeof document !== 'undefined'
				? getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif'
				: 'system-ui, sans-serif';
		ctx.font = `600 11px ${fontStack}`;
		const padX = 8;
		const textW = ctx.measureText(label).width;
		const pillW = textW + padX * 2;
		const pillH = 20;
		const tailW = 6;
		const pillX = lineEndX - pillW;
		const pillY = lineY - pillH / 2;
		const r = 10;

		c._avgLineHit = {
			lineY,
			lineX0: chartArea.left,
			lineX1: pillX + pillW,
			pillLeft: pillX - tailW,
			pillRight: pillX + pillW,
			pillTop: pillY,
			pillBottom: pillY + pillH,
		};

		ctx.setLineDash([4, 4]);
		ctx.strokeStyle = '#fab005';
		ctx.lineWidth = 1.25;
		ctx.beginPath();
		ctx.moveTo(chartArea.left, lineY);
		ctx.lineTo(pillX - tailW + 0.5, lineY);
		ctx.stroke();
		ctx.setLineDash([]);

		ctx.fillStyle = '#1a1a1a';
		ctx.beginPath();
		ctx.moveTo(pillX - tailW, lineY);
		ctx.lineTo(pillX, pillY + 4);
		ctx.lineTo(pillX, pillY + pillH - 4);
		ctx.closePath();
		ctx.fill();

		ctx.beginPath();
		ctx.roundRect(pillX, pillY, pillW, pillH, r);
		ctx.fill();

		ctx.fillStyle = '#fff';
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'center';
		ctx.fillText(label, pillX + pillW / 2, lineY);

		ctx.restore();
	},
};

interface RevenueChartProps {
	overview?: ReportOverview<RevenueReportByOrderTime> | null;
	items?: RevenueReportByOrderTime[];
	title?: string;
	subtitle?: string;
	filters?: RevenueReportFilters;
	pagination?: PaginationConfig;
	isLoading?: boolean;
	groupTime?: GroupTime;
	showFilter?: boolean;
	activePreset?: TimeRangePreset;
	defaultPreset?: TimeRangePreset;
	onFilterChange?: (preset: TimeRangePreset, range: TimeRangePresetRange) => void;
}

function useChartOptions(
	activeTab: 'revenue' | 'orders' = 'revenue',
	opts: { averageRevenue: number, maxRevenue: number, maxOrders: number },
) {
	const { t: translate } = useTranslation('vending_machine');
	const { averageRevenue, maxRevenue, maxOrders } = opts ;
	const revenueAxisLabel = translate('reports.revenue_report.chart.revenue_axis_label');
	const ordersAxisLabel = translate('reports.revenue_report.chart.orders_axis_label');

	const chartOptions = useMemo(() => {
		return {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					display: true,
					position: 'top' as const,
					labels: {
						usePointStyle: true,
						padding: 15,
						boxWidth: 12,
						boxHeight: 12,
					},
				},
				tooltip: {
					callbacks: {
						label: (context: any) => {
							const value = context.parsed.y;
							if (activeTab === 'revenue') {
								return translate('reports.revenue_report.chart.tooltip_revenue_value', { value: fmtCurrency(value) });
							}
							return translate('reports.revenue_report.chart.tooltip_orders_value', { value: fmtNumber(value) });
						},
					},
				},
				[AVERAGE_LINE_PLUGIN_ID]: {
					averageRevenue: activeTab === 'revenue' ? Math.round(averageRevenue ?? 0) : null,
				},
			},
			scales: {
				y: {
					beginAtZero: true,
					max: activeTab === 'revenue' ? maxRevenue : maxOrders,
					title: {
						display: true,
						text: activeTab === 'revenue' ? revenueAxisLabel : ordersAxisLabel,
					},
					ticks: {
						callback: (value: any) => {
							return fmtShortNumber(value);
						},
					},
					grid: {
						color: 'rgba(255, 255, 255, 0.1)',
					},
				},
				x: {
					grid: {
						display: false,
					},
				},
			},
		};
	}, [averageRevenue, activeTab, translate]);

	return chartOptions;
};


const DRAG_THRESHOLD = 50;
const WHEEL_DEBOUNCE_MS = 400;

type NavHandlers = {
	hasPagination: boolean,
	page: number,
	totalPages: number,
	goToPrev: () => void,
	goToNext: () => void,
	onWheel: (e: React.WheelEvent) => void,
	onMouseDown: (e: React.MouseEvent) => void,
	onMouseMove: (e: React.MouseEvent) => void,
	onMouseUp: (e: React.MouseEvent) => void,
	onMouseLeave: () => void,
};

function useChartNavigation(pagination: PaginationConfig | undefined): NavHandlers {
	const dragStartX = useRef<number | null>(null);
	const isDragging = useRef(false);
	const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const hasPagination = !!pagination && pagination.totalPages > 1;
	const { page = 1, totalPages = 1, onPageChange } = pagination ?? {};

	const goToPrev = useCallback(() => {
		if (page > 1) onPageChange?.(page - 1);
	}, [page, onPageChange]);

	const goToNext = useCallback(() => {
		if (page < totalPages) onPageChange?.(page + 1);
	}, [page, totalPages, onPageChange]);

	const onWheel = useCallback((e: React.WheelEvent) => {
		if (!hasPagination) return;
		e.preventDefault();
		if (wheelTimerRef.current) return;
		if (e.deltaY > 0 || e.deltaX > 0) { goToNext(); }
		else { goToPrev(); }
		wheelTimerRef.current = setTimeout(() => { wheelTimerRef.current = null; }, WHEEL_DEBOUNCE_MS);
	}, [hasPagination, goToNext, goToPrev]);

	const onMouseDown = useCallback((e: React.MouseEvent) => {
		dragStartX.current = e.clientX;
		isDragging.current = false;
	}, []);

	const onMouseMove = useCallback((e: React.MouseEvent) => {
		if (dragStartX.current === null || !hasPagination) return;
		if (Math.abs(e.clientX - dragStartX.current) > 10) isDragging.current = true;
	}, [hasPagination]);

	const onMouseUp = useCallback((e: React.MouseEvent) => {
		if (dragStartX.current === null || !hasPagination) return;
		const delta = e.clientX - dragStartX.current;
		dragStartX.current = null;
		if (!isDragging.current || Math.abs(delta) < DRAG_THRESHOLD) return;
		if (delta < 0) { goToNext(); }
		else { goToPrev(); }
		isDragging.current = false;
	}, [hasPagination, goToNext, goToPrev]);

	const onMouseLeave = useCallback(() => {
		dragStartX.current = null;
		isDragging.current = false;
	}, []);

	return {
		hasPagination, page, totalPages, goToPrev, goToNext,
		onWheel, onMouseDown, onMouseMove, onMouseUp, onMouseLeave,
	};
}

type ChartBodyProps = {
	chartData: ReturnType<typeof useChartData>,
	chartOptions: ReturnType<typeof useChartOptions>,
	nav: NavHandlers,
	isLoading?: boolean,
};

function useChartData(
	data: RevenueReportByOrderTime[],
	activeTab: 'revenue' | 'orders',
	labels: string[],
) {
	const { t: translate } = useTranslation('vending_machine');
	const revenueLabel = translate('reports.revenue_report.chart.radio_revenue');
	const ordersLabel = translate('reports.revenue_report.chart.radio_orders');

	return {
		labels,
		datasets: [{
			label: activeTab === 'revenue' ? revenueLabel : ordersLabel,
			data: activeTab === 'revenue'
				? data.map((d) => Number(d.totalRevenue))
				: data.map((d) => d.orderCount),
			backgroundColor: activeTab === 'revenue' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(14, 165, 233, 0.6)',
			borderColor: activeTab === 'revenue' ? 'rgba(59, 130, 246, 1)' : 'rgba(14, 165, 233, 1)',
			borderWidth: 1,
			borderRadius: 4,
			maxBarThickness: 25,
		}],
	};
}

function ChartBody({ chartData, chartOptions, nav, isLoading }: ChartBodyProps): React.ReactElement {
	const {
		hasPagination, page, totalPages, goToPrev, goToNext,
		onMouseDown, onMouseMove, onMouseUp, onMouseLeave,
		onWheel: _noopWheel,
	} = nav;
	const navBtnStyle = (side: 'left' | 'right'): React.CSSProperties => ({
		position: 'absolute', [side]: 4, top: '50%', transform: 'translateY(-50%)', zIndex: 5,
	});
	return (
		<div
			style={{ height: '100%', minHeight: '330px', position: 'relative', cursor: hasPagination ? 'grab' : 'default', userSelect: 'none' }}
			onMouseDown={onMouseDown} onMouseMove={onMouseMove}
			onMouseUp={onMouseUp} onMouseLeave={onMouseLeave}
		>
			{isLoading && (
				<div style={{
					position: 'absolute', inset: 0, display: 'flex',
					alignItems: 'center', justifyContent: 'center',
					background: 'rgba(0,0,0,0.03)', borderRadius: 8, zIndex: 10,
				}}>
					<Loader size='sm' />
				</div>
			)}
			{hasPagination && page > 1 && (
				<MantineTooltip label='Trang trước' position='right' withArrow>
					<ActionIcon variant='default' size='md' radius='xl' onClick={goToPrev} style={navBtnStyle('left')}>
						<IconChevronLeft size={14} />
					</ActionIcon>
				</MantineTooltip>
			)}
			{hasPagination && page < totalPages && (
				<MantineTooltip label='Trang tiếp' position='left' withArrow>
					<ActionIcon variant='default' size='md' radius='xl' onClick={goToNext} style={navBtnStyle('right')}>
						<IconChevronRight size={14} />
					</ActionIcon>
				</MantineTooltip>
			)}
			<Bar data={chartData} options={chartOptions} plugins={[revenueAverageLinePlugin]} />
		</div>
	);
}

export function RevenueTimeSeriesChart({
	overview = null,
	items = [],
	title, subtitle,
	pagination, isLoading,
	groupTime = 'day',
	showFilter = false,
	activePreset,
	defaultPreset = 'this_month',
	onFilterChange,
}: RevenueChartProps): React.ReactElement {
	const [activeTab, setActiveTab] = useState<'revenue' | 'orders' | null>('revenue');
	const { t: translate, i18n } = useTranslation('vending_machine');
	const nav = useChartNavigation(pagination);
	const { hasPagination, page, totalPages, onPageChange } = { ...nav, onPageChange: pagination?.onPageChange };

	const labels = items?.map((d) => formatOrderTimeLabel(d.orderTime, groupTime, i18n.language, translate)) ?? [];
	const chartData = useChartData(items, activeTab ?? 'revenue', labels);
	const chartOptions = useChartOptions(activeTab ?? 'revenue', {
		averageRevenue: Number(overview?.averageRevenue ?? 0),
		maxRevenue: Number(overview?.highestRevenueStats?.totalRevenue ?? 0),
		maxOrders: Number(overview?.highestOrderCountStats?.orderCount ?? 0),
	});

	const revenueLabel = translate('reports.revenue_report.chart.radio_revenue');
	const ordersLabel = translate('reports.revenue_report.chart.radio_orders');

	return (
		<Card shadow='sm' padding='md' radius='md' withBorder h='100%'>
			<Stack gap='md' h='100%'>
				<Group justify='space-between' align='center'>
					<Stack gap={4}>
						<Title order={4} fw={600}>{title ?? 'Sales Insight'}</Title>
						<Text size='xs' c='dimmed'>{subtitle ?? 'Overview of revenue and orders'}</Text>
					</Stack>
					<Group gap='md' align='center'>
						{hasPagination && <Text size='xs' c='dimmed'>{page} / {totalPages}</Text>}
						<Radio.Group value={activeTab} onChange={(value) => setActiveTab(value as 'revenue' | 'orders')}>
							<Group gap='sm'>
								<Radio value='revenue' label={revenueLabel} size='xs' />
								<Radio value='orders' label={ordersLabel} size='xs' />
							</Group>
						</Radio.Group>
						{showFilter && (
							<TimeRangeSelect
								value={activePreset}
								defaultValue={defaultPreset}
								onChange={onFilterChange}
							/>
						)}
					</Group>
				</Group>
				<ChartBody chartData={chartData} chartOptions={chartOptions} nav={nav} isLoading={isLoading} />
				{hasPagination && (
					<Group justify='center' gap={6}>
						{Array.from({ length: totalPages }, (_, i) => (
							<div
								key={i}
								onClick={() => onPageChange?.(i + 1)}
								style={{
									width: i + 1 === page ? 16 : 6, height: 6, borderRadius: 3, cursor: 'pointer',
									background: i + 1 === page ? '#fab005' : 'var(--mantine-color-gray-4)',
									transition: 'width 0.2s ease, background 0.2s ease',
								}}
							/>
						))}
					</Group>
				)}
			</Stack>
		</Card>
	);
}
