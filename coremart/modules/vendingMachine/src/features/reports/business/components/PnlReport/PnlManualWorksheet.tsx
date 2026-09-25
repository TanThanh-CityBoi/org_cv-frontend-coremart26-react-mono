/* eslint-disable max-lines-per-function */

import {
	Alert,
	Anchor,
	Box,
	Divider,
	Flex,
	NumberInput,
	Paper,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import {
	computePnl,
	formatPnlWorksheetMoney,
	PNL_LINE_INPUTS_ZERO,
} from './helper';

import type { PnlLineInputs } from './type';


type PnlManualWorksheetProps = {
	/** Increment when filters are applied so COGS “snapshot” matches last apply. */
	applyNonce: number,
};

export function PnlManualWorksheet({ applyNonce }: PnlManualWorksheetProps): React.ReactElement {
	const { t: translate } = useTranslation('vending_machine');

	const [lines, setLines] = useState<PnlLineInputs>(() => ({ ...PNL_LINE_INPUTS_ZERO }));
	const [cogsAtLastApply, setCogsAtLastApply] = useState<number | null>(null);

	useEffect(() => {
		if (applyNonce === 0) {
			return;
		}
		setCogsAtLastApply(lines.cogs);
		// Snapshot COGS only when parent applies filters (nonce bumps).
	}, [applyNonce]);

	const setLine = <K extends keyof PnlLineInputs>(key: K, value: PnlLineInputs[K]) => {
		setLines((prev) => ({ ...prev, [key]: value }));
	};

	const computed = useMemo(() => computePnl(lines), [lines]);
	const cogsWarning =
		cogsAtLastApply !== null && lines.cogs !== cogsAtLastApply;

	const rowInput = (key: keyof PnlLineInputs, label: string, indent = false) => (
		<Flex justify='space-between' align='center' gap='md' wrap='wrap' pl={indent ? 'md' : 0}>
			<Text size='sm' c='dark.6' style={{ flex: '1 1 200px' }}>{label}</Text>
			<NumberInput
				size='xs'
				w={200}
				min={0}
				thousandSeparator='.'
				decimalSeparator=','
				hideControls
				value={lines[key] as number}
				onChange={(v) => setLine(key, typeof v === 'number' ? v : 0)}
			/>
		</Flex>
	);

	const rowTotal = (label: string, value: number, opts?: { uppercase?: boolean, strong?: boolean }) => (
		<Flex justify='space-between' align='center' gap='md' wrap='wrap'>
			<Text
				size='sm'
				fw={opts?.strong ? 700 : 500}
				tt={opts?.uppercase ? 'uppercase' : undefined}
				style={{ flex: '1 1 200px' }}
			>
				{label}
			</Text>
			<Text size='sm' fw={700} miw={200} ta='right'>{formatPnlWorksheetMoney(value)}</Text>
		</Flex>
	);

	return (
		<Paper p='lg' radius='sm' withBorder shadow='xs'>
			<Box mb='lg'>
				<Title order={5} fz='md' fw={700} mb='xs'>
					{translate('reports.pnl_report.manual_worksheet_title')}
				</Title>
				<Text size='xs' c='dimmed'>
					{translate('reports.pnl_report.hint_manual_entry')}
				</Text>
			</Box>
			<Divider my='md' />
			<Stack gap='sm'>
				{rowInput('salesRevenue', translate('reports.pnl_report.sales_revenue'))}
				<Text size='sm' fw={600} mt='xs'>
					{translate('reports.pnl_report.revenue_deductions')}
				</Text>
				{rowInput('refunds', translate('reports.pnl_report.refunds'), true)}
				{rowInput('promotions', translate('reports.pnl_report.promotions'), true)}
				<Divider my='xs' />
				{rowTotal(
					translate('reports.pnl_report.net_revenue'),
					computed.netRevenue,
					{ uppercase: true, strong: true },
				)}
				<Text size='xs' c='dimmed' pl={0}>
					{translate('reports.pnl_report.formula_net_revenue')}
				</Text>

				<Divider my='md' />

				<Text size='sm' fw={600}>{translate('reports.pnl_report.cogs')}</Text>
				{rowInput('cogs', translate('reports.pnl_report.cogs_amount'))}
				{cogsWarning && (
					<Alert
						color='yellow'
						icon={<IconAlertTriangle size={18} />}
						title={translate('reports.pnl_report.cogs_changed_title')}
					>
						<Stack gap='xs'>
							<Text size='sm'>{translate('reports.pnl_report.cogs_changed_body')}</Text>
							<Flex gap='md' wrap='wrap'>
								<Anchor component={Link} to='/reports/revenue' size='sm'>
									{translate('reports.pnl_report.link_revenue_report')}
								</Anchor>
								<Anchor component={Link} to='/reports/inventory' size='sm'>
									{translate('reports.pnl_report.link_inventory_report')}
								</Anchor>
							</Flex>
						</Stack>
					</Alert>
				)}

				<Divider my='md' />
				{rowTotal(
					translate('reports.pnl_report.gross_profit'),
					computed.grossProfit,
					{ uppercase: true, strong: true },
				)}
				<Text size='xs' c='dimmed'>
					{translate('reports.pnl_report.formula_gross_profit')}
				</Text>

				<Divider my='md' />
				{rowInput('financialRevenue', translate('reports.pnl_report.financial_revenue'))}
				{rowInput('financialExpense', translate('reports.pnl_report.financial_expense'))}

				<Text size='sm' fw={600} mt='sm'>
					{translate('reports.pnl_report.selling_expenses')}
				</Text>
				<Text size='xs' c='dimmed' tt='uppercase'>
					{translate('reports.pnl_report.fixed_costs')}
				</Text>
				{rowInput('electricity', translate('reports.pnl_report.electricity'), true)}
				{rowInput('internet', translate('reports.pnl_report.internet'), true)}
				{rowInput('rent', translate('reports.pnl_report.rent'), true)}
				{rowInput('fixedOther', translate('reports.pnl_report.fixed_other'), true)}

				<Text size='xs' c='dimmed' tt='uppercase' mt='xs'>
					{translate('reports.pnl_report.variable_costs')}
				</Text>
				{rowInput('partnerDiscount', translate('reports.pnl_report.partner_discount'), true)}
				<Text size='sm' c='dark.5' pl='md'>{translate('reports.pnl_report.gateway_fees')}</Text>
				{rowInput('gatewayMomo', translate('reports.pnl_report.gateway_momo'), true)}
				{rowInput('gatewayVietqr', translate('reports.pnl_report.gateway_vietqr'), true)}
				{rowInput('gatewayMpos', translate('reports.pnl_report.gateway_mpos'), true)}
				{rowInput('expiredGoodsCost', translate('reports.pnl_report.expired_goods'), true)}
				{rowInput('variableOther', translate('reports.pnl_report.variable_other'), true)}
				{rowTotal(
					translate('reports.pnl_report.selling_expense_subtotal'),
					computed.sellingExpenseTotal,
				)}

				{rowInput('adminExpense', translate('reports.pnl_report.admin_expense'))}

				<Divider my='md' />
				{rowTotal(
					translate('reports.pnl_report.net_operating_profit'),
					computed.netOperatingProfit,
					{ uppercase: true, strong: true },
				)}
				<Text size='xs' c='dimmed'>
					{translate('reports.pnl_report.formula_net_operating')}
				</Text>

				<Divider my='md' />
				{rowInput('otherIncome', translate('reports.pnl_report.other_income'))}
				{rowInput('otherExpense', translate('reports.pnl_report.other_expense'))}
				{rowTotal(translate('reports.pnl_report.other_profit'), computed.otherProfit)}
				<Text size='xs' c='dimmed'>
					{translate('reports.pnl_report.formula_other_profit')}
				</Text>

				<Divider my='md' />
				{rowTotal(
					translate('reports.pnl_report.profit_before_tax'),
					computed.profitBeforeTax,
					{ uppercase: true, strong: true },
				)}
				<Text size='xs' c='dimmed'>
					{translate('reports.pnl_report.formula_before_tax')}
				</Text>

				<Divider my='md' />
				<Text size='sm' fw={600}>{translate('reports.pnl_report.taxes')}</Text>
				<Flex justify='space-between' align='center' gap='md' wrap='wrap'>
					<Stack gap={4} style={{ flex: '1 1 220px' }}>
						<Text size='sm' c='dark.6'>{translate('reports.pnl_report.vat_rate_label')}</Text>
						<Text size='xs' c='dimmed'>{translate('reports.pnl_report.vat_formula_hint')}</Text>
					</Stack>
					<NumberInput
						size='xs'
						w={88}
						min={0}
						max={100}
						suffix='%'
						hideControls
						value={lines.vatRateOnDiff}
						onChange={(v) => setLine('vatRateOnDiff', typeof v === 'number' ? v : 0)}
					/>
				</Flex>
				{rowTotal(translate('reports.pnl_report.vat_amount'), computed.vatAmount)}
				<Flex justify='space-between' align='center' gap='md' wrap='wrap' mt='xs'>
					<Stack gap={4} style={{ flex: '1 1 220px' }}>
						<Text size='sm' c='dark.6'>{translate('reports.pnl_report.cit_rate_label')}</Text>
						<Text size='xs' c='dimmed'>{translate('reports.pnl_report.cit_formula_hint')}</Text>
					</Stack>
					<NumberInput
						size='xs'
						w={88}
						min={0}
						max={100}
						suffix='%'
						hideControls
						value={lines.corporateIncomeTaxRate}
						onChange={(v) => setLine('corporateIncomeTaxRate', typeof v === 'number' ? v : 0)}
					/>
				</Flex>
				{rowTotal(translate('reports.pnl_report.cit_amount'), computed.citAmount)}
				{rowTotal(translate('reports.pnl_report.total_tax'), computed.totalTax)}

				<Divider my='md' />
				{rowTotal(
					translate('reports.pnl_report.profit_after_tax'),
					computed.profitAfterTax,
					{ uppercase: true, strong: true },
				)}
				<Text size='xs' c='dimmed'>
					{translate('reports.pnl_report.formula_after_tax')}
				</Text>
			</Stack>
		</Paper>
	);
}
