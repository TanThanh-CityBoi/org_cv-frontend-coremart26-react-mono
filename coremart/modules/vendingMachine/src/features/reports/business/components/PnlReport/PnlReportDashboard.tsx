/* eslint-disable max-lines-per-function */

import {
	Alert,
	Box,
	Grid,
	Paper,
	SimpleGrid,
	Stack,
	Table,
	Text,
	Title,
} from '@mantine/core';
import { IconChartInfographic } from '@tabler/icons-react';
import {
	ArcElement,
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	type ChartOptions,
	Filler,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Tooltip as ChartTooltip,
} from 'chart.js';
import React, { useMemo } from 'react';
import { Bar, Chart, Doughnut, Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';


import { PNL_CHART_COLORS } from './helper';
import {
	PNL_EXPENSE_ACCOUNT_STACK_KEYS,
	pnlBaseBarTooltipMoney,
	pnlChartNumberFormatVi,
	pnlCompactMoney,
	pnlStatementTableCellMoney,
} from './helper';
import {
	MOCK_EXPENSE_BY_ACCOUNT_12M,
	MOCK_EXPENSE_BY_TYPE_12M,
	MOCK_PNL_EXPENSE_DONUT_LAST_MONTH,
	MOCK_PNL_KPI,
	MOCK_PNL_OPERATING_12M,
	MOCK_PNL_PROFIT_TRENDS,
	MOCK_PNL_STATEMENT_TABLE,
	MOCK_REVENUE_BY_ACCOUNT_12M,
	MOCK_REVENUE_STACKED_12M,
	PNL_DASH_MONTHS,
} from './mocks';
import {
	REPORT_PALETTE_BORDERS,
	REPORT_PALETTE_FILLS,
} from '../../../../../components/reportChartTheme';


import type { DonutDatasetPack, PnlExpenseSlice } from './type';


ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	ArcElement,
	ChartTooltip,
	Legend,
	Filler,
);

const C = PNL_CHART_COLORS;
const F = REPORT_PALETTE_FILLS;
const D = REPORT_PALETTE_BORDERS;

/** Stacked “expense by account” series: rentPremises → miscExpense ({@link PNL_EXPENSE_ACCOUNT_STACK_KEYS} order). */
const STACK_EXPENSE_ACCOUNT_FILLS = [
	F.blue,
	F.crimson,
	F.gold,
	F.teal,
	F.indigo,
	F.tangerine,
	F.slate,
] as const;

/** Expense doughnut fills: rent, electricity, gateway, waste, marketing, payroll tax, other (mock order). */
function pnlExpenseDonutDatasetFromSlices(slices: PnlExpenseSlice[]): DonutDatasetPack {
	return {
		label: 'expense',
		data: slices.map((s) => Math.max(0, s.value)),
		backgroundColor: [
			F.blue,
			F.gold,
			F.teal,
			F.gray,
			F.violet,
			F.tangerine,
			F.slate,
		],
		borderWidth: 1,
		borderColor: D.pearl,
	};
}

function chartCardTitle(title: string): React.ReactElement {
	return (
		<Text fw={700} fz='sm' mb='xs' lineClamp={2}>
			{title}
		</Text>
	);
}

function chartBox(chart: React.ReactNode): React.ReactElement {
	return <Box miw={0} h={268}>{chart}</Box>;
}

export const PnlReportDashboard: React.FC = () => {
	const { t: translate } = useTranslation('vending_machine');
	const td = (k: string) => translate(`reports.pnl_report.dashboard.${k}`);
	const tSlice = (key: string) =>
		translate(`reports.pnl_report.dashboard.expense_slices.${key}`);

	const operatingData = useMemo(() => ({
		labels: [...PNL_DASH_MONTHS],
		datasets: [
			{
				type: 'bar' as const,
				label: td('dsRevenue'),
				data: MOCK_PNL_OPERATING_12M.map((r) => r.revenue),
				backgroundColor: F.blue,
				borderRadius: 4,
				maxBarThickness: 28,
				order: 2,
			},
			{
				type: 'bar' as const,
				label: td('dsExpenses'),
				data: MOCK_PNL_OPERATING_12M.map((r) => r.expenses),
				backgroundColor: F.gold,
				borderRadius: 4,
				maxBarThickness: 28,
				order: 2,
			},
			{
				type: 'line' as const,
				label: td('dsOperatingMarginPct'),
				data: MOCK_PNL_OPERATING_12M.map((r) => r.operatingMarginPct),
				borderColor: D.crimson,
				backgroundColor: F.crimson,
				yAxisID: 'y1',
				tension: 0.25,
				pointRadius: 3,
				borderWidth: 2,
				order: 1,
			},
		],
	}), [translate]);

	const operatingOptions = useMemo((): ChartOptions<'bar'> => ({
		responsive: true,
		maintainAspectRatio: false,
		interaction: { mode: 'index', intersect: false },
		plugins: {
			legend: { position: 'top', labels: { usePointStyle: true, padding: 12 } },
			tooltip: {
				callbacks: {
					label: (ctx) => {
						const v = typeof ctx.raw === 'number' ? ctx.raw : 0;
						if (ctx.dataset.yAxisID === 'y1') {
							return `${ctx.dataset.label ?? ''}: ${v}%`;
						}
						return `${ctx.dataset.label ?? ''}: ${pnlChartNumberFormatVi().format(v)}`;
					},
				},
			},
		},
		scales: {
			x: { grid: { display: false } },
			y: {
				position: 'left',
				stacked: false,
				ticks: {
					callback: (val) => (typeof val === 'number' ? pnlCompactMoney(val) : val),
				},
			},
			y1: {
				position: 'right',
				grid: { drawOnChartArea: false },
				ticks: { callback: (val) => `${val}%` },
			},
		},
	}), []);

	const dualLineOpts = useMemo(
		(): ChartOptions<'line'> => ({
			responsive: true,
			maintainAspectRatio: false,
			interaction: { mode: 'index', intersect: false },
			plugins: {
				legend: { position: 'top', labels: { usePointStyle: true, padding: 10 } },
				tooltip: {
					callbacks: {
						label: (ctx) => {
							const v = typeof ctx.raw === 'number' ? ctx.raw : 0;
							if (ctx.dataset.yAxisID === 'y1') {
								return `${ctx.dataset.label ?? ''}: ${v}%`;
							}
							return `${ctx.dataset.label ?? ''}: ${pnlChartNumberFormatVi().format(v)}`;
						},
					},
				},
			},
			scales: {
				x: { grid: { display: false } },
				y: {
					position: 'left',
					ticks: { callback: (val) => (typeof val === 'number' ? pnlCompactMoney(val) : val) },
				},
				y1: {
					position: 'right',
					grid: { drawOnChartArea: false },
					ticks: { callback: (val) => `${val}%` },
				},
			},
		}),
		[],
	);

	const grossTrendData = useMemo(() => ({
		labels: [...PNL_DASH_MONTHS],
		datasets: [
			{
				label: td('dsAmount'),
				data: MOCK_PNL_PROFIT_TRENDS.map((r) => r.grossProfit),
				borderColor: C.blue,
				backgroundColor: C.blueFill,
				fill: true,
				yAxisID: 'y',
				tension: 0.25,
				borderWidth: 2,
				pointRadius: 2,
			},
			{
				label: td('dsGrossMarginPct'),
				data: MOCK_PNL_PROFIT_TRENDS.map((r) => r.grossMarginPct),
				borderColor: C.yellow,
				borderDash: [4, 3],
				fill: false,
				yAxisID: 'y1',
				tension: 0.25,
				borderWidth: 2,
				pointRadius: 2,
			},
		],
	}), [translate]);

	const opTrendData = useMemo(() => ({
		labels: [...PNL_DASH_MONTHS],
		datasets: [
			{
				label: td('dsOperatingProfit'),
				data: MOCK_PNL_PROFIT_TRENDS.map((r) => r.operatingProfit),
				borderColor: C.blue,
				backgroundColor: C.blueFill,
				fill: true,
				yAxisID: 'y',
				tension: 0.25,
				borderWidth: 2,
				pointRadius: 2,
			},
			{
				label: td('dsOperatingMargin'),
				data: MOCK_PNL_PROFIT_TRENDS.map((r) => r.operatingMarginPct),
				borderColor: C.yellow,
				borderDash: [4, 3],
				fill: false,
				yAxisID: 'y1',
				tension: 0.25,
				borderWidth: 2,
				pointRadius: 2,
			},
		],
	}), [translate]);

	const netTrendData = useMemo(() => ({
		labels: [...PNL_DASH_MONTHS],
		datasets: [
			{
				label: td('dsNetProfit'),
				data: MOCK_PNL_PROFIT_TRENDS.map((r) => r.netProfit),
				borderColor: C.teal,
				backgroundColor: 'rgba(13, 148, 136, 0.1)',
				fill: true,
				yAxisID: 'y',
				tension: 0.25,
				borderWidth: 2,
				pointRadius: 2,
			},
			{
				label: td('dsNetMarginPct'),
				data: MOCK_PNL_PROFIT_TRENDS.map((r) => r.netMarginPct),
				borderColor: C.rose,
				borderDash: [4, 3],
				fill: false,
				yAxisID: 'y1',
				tension: 0.25,
				borderWidth: 2,
				pointRadius: 2,
			},
		],
	}), [translate]);

	const donutOpts = useMemo((): ChartOptions<'doughnut'> => ({
		responsive: true,
		maintainAspectRatio: false,
		cutout: '62%',
		plugins: {
			legend: { position: 'bottom', labels: { boxWidth: 10, padding: 8, font: { size: 10 } } },
			tooltip: {
				callbacks: {
					label: (ctx) => {
						const raw = typeof ctx.raw === 'number' ? ctx.raw : 0;
						return `${ctx.label ?? ''}: ${pnlChartNumberFormatVi().format(raw)}`;
					},
				},
			},
		},
	}), []);

	const stackedOpts = useMemo((): ChartOptions<'bar'> => ({
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			x: { stacked: true, grid: { display: false } },
			y: {
				stacked: true,
				ticks: { callback: (val) => (typeof val === 'number' ? pnlCompactMoney(val) : val) },
			},
		},
		plugins: {
			legend: { position: 'top', labels: { usePointStyle: true, padding: 10, font: { size: 10 } } },
			...pnlBaseBarTooltipMoney().plugins,
		},
	}), []);

	const revenueStackData = useMemo(() => ({
		labels: [...PNL_DASH_MONTHS],
		datasets: [
			{
				label: td('dsDirectCosts'),
				data: MOCK_REVENUE_STACKED_12M.map((r) => Number(r.directCosts ?? 0)),
				backgroundColor: F.blue,
				borderRadius: 2,
				maxBarThickness: 36,
				stack: 'rev',
			},
			{
				label: td('dsGrossProfit'),
				data: MOCK_REVENUE_STACKED_12M.map((r) => Number(r.grossProfit ?? 0)),
				backgroundColor: F.crimson,
				borderRadius: 2,
				maxBarThickness: 36,
				stack: 'rev',
			},
		],
	}), [translate]);

	const expenseTypeData = useMemo(() => ({
		labels: [...PNL_DASH_MONTHS],
		datasets: [
			{
				label: td('dsOperatingExpense'),
				data: MOCK_EXPENSE_BY_TYPE_12M.map((r) => Number(r.operatingExpense ?? 0)),
				backgroundColor: F.blue,
				stack: 'ex',
				borderRadius: 2,
				maxBarThickness: 36,
			},
			{
				label: td('dsDirectCosts'),
				data: MOCK_EXPENSE_BY_TYPE_12M.map((r) => Number(r.directCosts ?? 0)),
				backgroundColor: F.crimson,
				stack: 'ex',
				borderRadius: 2,
				maxBarThickness: 36,
			},
		],
	}), [translate]);

	const _revenueAcctData = useMemo(() => ({
		labels: [...PNL_DASH_MONTHS],
		datasets: [
			{
				label: td('dsSales'),
				data: MOCK_REVENUE_BY_ACCOUNT_12M.map((r) => Number(r.salesChannel ?? 0)),
				backgroundColor: F.blue,
				stack: 'ra',
				borderRadius: 2,
				maxBarThickness: 36,
			},
			{
				label: td('dsService'),
				data: MOCK_REVENUE_BY_ACCOUNT_12M.map((r) => Number(r.serviceChannel ?? 0)),
				backgroundColor: F.teal,
				stack: 'ra',
				borderRadius: 2,
				maxBarThickness: 36,
			},
		],
	}), [translate]);

	const expenseAcctData = useMemo(() => ({
		labels: [...PNL_DASH_MONTHS],
		datasets: PNL_EXPENSE_ACCOUNT_STACK_KEYS.map((col, idx) => ({
			label: td(col.labelKey),
			data: MOCK_EXPENSE_BY_ACCOUNT_12M.map((row) => Number(row[col.key] ?? 0)),
			backgroundColor: STACK_EXPENSE_ACCOUNT_FILLS[idx] ?? F.coffee,
			stack: 'ea',
			borderRadius: 1,
			maxBarThickness: 42,
		})),
	}), [translate]);

	const kpiItems = [
		{ label: td('kpiTotalRevenue'), value: pnlCompactMoney(MOCK_PNL_KPI.totalRevenue) },
		{ label: td('kpiTotalGrossProfit'), value: pnlCompactMoney(MOCK_PNL_KPI.totalGrossProfit) },
		{ label: td('kpiReturnOnAssets'), value: `${MOCK_PNL_KPI.returnOnAssetsPct}%` },
		{ label: td('kpiOperatingProfit'), value: pnlCompactMoney(MOCK_PNL_KPI.totalOperatingProfit) },
		{ label: td('kpiReturnOnEquity'), value: `${MOCK_PNL_KPI.returnOnEquityPct}%` },
		{ label: td('kpiNetProfit'), value: pnlCompactMoney(MOCK_PNL_KPI.totalNetProfit) },
	];

	return (
		<Stack gap='md'>
			<Alert color='gray' variant='light' icon={<IconChartInfographic size={18} />}>
				<Text size='sm'>{td('mockDataBanner')}</Text>
			</Alert>

			<Grid gap='md'>
				<Grid.Col span={{ base: 12, lg: 4 }}>
					<SimpleGrid cols={{ base: 2, xs: 2, sm: 2 }} spacing='sm' h='100%'>
						{kpiItems.map((kpi) => (
							<Paper key={kpi.label} p='sm' radius='sm' withBorder shadow='xs'>
								<Text size='xs' c='dimmed' lineClamp={2}>{kpi.label}</Text>
								<Text fw={800} fz='lg' lh={1.3}>{kpi.value}</Text>
							</Paper>
						))}
					</SimpleGrid>
				</Grid.Col>
				<Grid.Col span={{ base: 12, lg: 8 }}>
					<Paper p='md' radius='sm' withBorder shadow='xs' h='100%'>
						{chartCardTitle(td('chartOperating'))}
						{chartBox(
							<Chart type='bar' data={operatingData as never} options={operatingOptions} />,
						)}
					</Paper>
				</Grid.Col>
			</Grid>


			<Paper p='md' radius='sm' withBorder shadow='xs' h='100%'>
				{chartCardTitle(td('stackedRevenue'))}
				{chartBox(<Bar data={revenueStackData} options={stackedOpts} />)}
			</Paper>

			<Grid gap='md'>
				<Grid.Col span={{ base: 12, md: 6 }}>
					<Paper p='md' radius='sm' withBorder shadow='xs' h='100%'>
						{chartCardTitle(td('stackedExpenseType'))}
						{chartBox(<Bar data={expenseTypeData} options={stackedOpts} />)}
					</Paper>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6 }}>
					<Paper p='md' radius='sm' withBorder shadow='xs' h='100%'>
						{chartCardTitle(td('expenseLastMonth'))}
						{chartBox(
							<Doughnut
								data={{
									labels: MOCK_PNL_EXPENSE_DONUT_LAST_MONTH.map((s) => tSlice(s.key)),
									datasets: [
										pnlExpenseDonutDatasetFromSlices(MOCK_PNL_EXPENSE_DONUT_LAST_MONTH),
									],
								}}
								options={donutOpts}
							/>,
						)}
					</Paper>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 12 }}>
					<Paper p='md' radius='sm' withBorder shadow='xs' h='100%'>
						{chartCardTitle(td('stackedExpenseAccount'))}
						{chartBox(<Bar data={expenseAcctData} options={stackedOpts} />)}
					</Paper>
				</Grid.Col>
			</Grid>

			<Grid gap='md'>
				<Grid.Col span={{ base: 12, lg: 6 }}>
					<Paper p='md' radius='sm' withBorder shadow='xs' h='100%'>
						{chartCardTitle(td('chartGrossTrend'))}
						{chartBox(<Line data={grossTrendData} options={dualLineOpts} />)}
					</Paper>
				</Grid.Col>
				<Grid.Col span={{ base: 12, lg: 6 }}>
					<Paper p='md' radius='sm' withBorder shadow='xs' h='100%'>
						{chartCardTitle(td('chartOperatingTrend'))}
						{chartBox(<Line data={opTrendData} options={dualLineOpts} />)}
					</Paper>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 12 }}>
					<Paper p='md' radius='sm' withBorder shadow='xs' h='100%'>
						{chartCardTitle(td('chartNetTrend'))}
						{chartBox(<Line data={netTrendData} options={dualLineOpts} />)}
					</Paper>
				</Grid.Col>
			</Grid>

			<Paper p='md' radius='sm' withBorder shadow='xs'>
				<Title order={5} fz='md' fw={700} mb='sm'>{td('statementTitle')}</Title>
				<Box style={{ overflowX: 'auto' }}>
					<Table striped highlightOnHover withTableBorder verticalSpacing='sm' horizontalSpacing='sm'>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>{td('colAccount')}</Table.Th>
								<Table.Th style={{ textAlign: 'right' }}>{td('colMtd')}</Table.Th>
								<Table.Th style={{ textAlign: 'right' }}>{td('colLastMonth')}</Table.Th>
								<Table.Th style={{ textAlign: 'right' }}>{td('colYtd')}</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{MOCK_PNL_STATEMENT_TABLE.map((row) => (
								<Table.Tr key={row.accountKey}>
									<Table.Td fw={row.emphasis ? 700 : 400}>
										{td(row.accountKey)}
									</Table.Td>
									<Table.Td ta='right'>{pnlStatementTableCellMoney(row.mtd)}</Table.Td>
									<Table.Td ta='right'>{pnlStatementTableCellMoney(row.lastMonth)}</Table.Td>
									<Table.Td ta='right' fw={row.emphasis ? 600 : 400}>{pnlStatementTableCellMoney(row.ytd)}</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				</Box>
			</Paper>
		</Stack>
	);
};
