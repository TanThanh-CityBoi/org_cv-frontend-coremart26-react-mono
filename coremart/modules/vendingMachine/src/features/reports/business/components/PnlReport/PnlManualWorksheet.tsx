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
	applyNonce: number;
};

export function PnlManualWorksheet({ applyNonce }: PnlManualWorksheetProps): React.ReactElement {
	const { t: translate } = useTranslation();

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

	const rowTotal = (label: string, value: number, opts?: { uppercase?: boolean; strong?: boolean }) => (
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
					{translate('coremart.vendingMachine.reports.pnlReport.manualWorksheetTitle')}
				</Title>
				<Text size='xs' c='dimmed'>
					{translate('coremart.vendingMachine.reports.pnlReport.hintManualEntry')}
				</Text>
			</Box>
			<Divider my='md' />
			<Stack gap='sm'>
				{rowInput('salesRevenue', translate('coremart.vendingMachine.reports.pnlReport.salesRevenue'))}
				<Text size='sm' fw={600} mt='xs'>
					{translate('coremart.vendingMachine.reports.pnlReport.revenueDeductions')}
				</Text>
				{rowInput('refunds', translate('coremart.vendingMachine.reports.pnlReport.refunds'), true)}
				{rowInput('promotions', translate('coremart.vendingMachine.reports.pnlReport.promotions'), true)}
				<Divider my='xs' />
				{rowTotal(
					translate('coremart.vendingMachine.reports.pnlReport.netRevenue'),
					computed.netRevenue,
					{ uppercase: true, strong: true },
				)}
				<Text size='xs' c='dimmed' pl={0}>
					{translate('coremart.vendingMachine.reports.pnlReport.formulaNetRevenue')}
				</Text>

				<Divider my='md' />

				<Text size='sm' fw={600}>{translate('coremart.vendingMachine.reports.pnlReport.cogs')}</Text>
				{rowInput('cogs', translate('coremart.vendingMachine.reports.pnlReport.cogsAmount'))}
				{cogsWarning && (
					<Alert
						color='yellow'
						icon={<IconAlertTriangle size={18} />}
						title={translate('coremart.vendingMachine.reports.pnlReport.cogsChangedTitle')}
					>
						<Stack gap='xs'>
							<Text size='sm'>{translate('coremart.vendingMachine.reports.pnlReport.cogsChangedBody')}</Text>
							<Flex gap='md' wrap='wrap'>
								<Anchor component={Link} to='/reports/revenue' size='sm'>
									{translate('coremart.vendingMachine.reports.pnlReport.linkRevenueReport')}
								</Anchor>
								<Anchor component={Link} to='/reports/inventory' size='sm'>
									{translate('coremart.vendingMachine.reports.pnlReport.linkInventoryReport')}
								</Anchor>
							</Flex>
						</Stack>
					</Alert>
				)}

				<Divider my='md' />
				{rowTotal(
					translate('coremart.vendingMachine.reports.pnlReport.grossProfit'),
					computed.grossProfit,
					{ uppercase: true, strong: true },
				)}
				<Text size='xs' c='dimmed'>
					{translate('coremart.vendingMachine.reports.pnlReport.formulaGrossProfit')}
				</Text>

				<Divider my='md' />
				{rowInput('financialRevenue', translate('coremart.vendingMachine.reports.pnlReport.financialRevenue'))}
				{rowInput('financialExpense', translate('coremart.vendingMachine.reports.pnlReport.financialExpense'))}

				<Text size='sm' fw={600} mt='sm'>
					{translate('coremart.vendingMachine.reports.pnlReport.sellingExpenses')}
				</Text>
				<Text size='xs' c='dimmed' tt='uppercase'>
					{translate('coremart.vendingMachine.reports.pnlReport.fixedCosts')}
				</Text>
				{rowInput('electricity', translate('coremart.vendingMachine.reports.pnlReport.electricity'), true)}
				{rowInput('internet', translate('coremart.vendingMachine.reports.pnlReport.internet'), true)}
				{rowInput('rent', translate('coremart.vendingMachine.reports.pnlReport.rent'), true)}
				{rowInput('fixedOther', translate('coremart.vendingMachine.reports.pnlReport.fixedOther'), true)}

				<Text size='xs' c='dimmed' tt='uppercase' mt='xs'>
					{translate('coremart.vendingMachine.reports.pnlReport.variableCosts')}
				</Text>
				{rowInput('partnerDiscount', translate('coremart.vendingMachine.reports.pnlReport.partnerDiscount'), true)}
				<Text size='sm' c='dark.5' pl='md'>{translate('coremart.vendingMachine.reports.pnlReport.gatewayFees')}</Text>
				{rowInput('gatewayMomo', translate('coremart.vendingMachine.reports.pnlReport.gatewayMomo'), true)}
				{rowInput('gatewayVietqr', translate('coremart.vendingMachine.reports.pnlReport.gatewayVietqr'), true)}
				{rowInput('gatewayMpos', translate('coremart.vendingMachine.reports.pnlReport.gatewayMpos'), true)}
				{rowInput('expiredGoodsCost', translate('coremart.vendingMachine.reports.pnlReport.expiredGoods'), true)}
				{rowInput('variableOther', translate('coremart.vendingMachine.reports.pnlReport.variableOther'), true)}
				{rowTotal(
					translate('coremart.vendingMachine.reports.pnlReport.sellingExpenseSubtotal'),
					computed.sellingExpenseTotal,
				)}

				{rowInput('adminExpense', translate('coremart.vendingMachine.reports.pnlReport.adminExpense'))}

				<Divider my='md' />
				{rowTotal(
					translate('coremart.vendingMachine.reports.pnlReport.netOperatingProfit'),
					computed.netOperatingProfit,
					{ uppercase: true, strong: true },
				)}
				<Text size='xs' c='dimmed'>
					{translate('coremart.vendingMachine.reports.pnlReport.formulaNetOperating')}
				</Text>

				<Divider my='md' />
				{rowInput('otherIncome', translate('coremart.vendingMachine.reports.pnlReport.otherIncome'))}
				{rowInput('otherExpense', translate('coremart.vendingMachine.reports.pnlReport.otherExpense'))}
				{rowTotal(translate('coremart.vendingMachine.reports.pnlReport.otherProfit'), computed.otherProfit)}
				<Text size='xs' c='dimmed'>
					{translate('coremart.vendingMachine.reports.pnlReport.formulaOtherProfit')}
				</Text>

				<Divider my='md' />
				{rowTotal(
					translate('coremart.vendingMachine.reports.pnlReport.profitBeforeTax'),
					computed.profitBeforeTax,
					{ uppercase: true, strong: true },
				)}
				<Text size='xs' c='dimmed'>
					{translate('coremart.vendingMachine.reports.pnlReport.formulaBeforeTax')}
				</Text>

				<Divider my='md' />
				<Text size='sm' fw={600}>{translate('coremart.vendingMachine.reports.pnlReport.taxes')}</Text>
				<Flex justify='space-between' align='center' gap='md' wrap='wrap'>
					<Stack gap={4} style={{ flex: '1 1 220px' }}>
						<Text size='sm' c='dark.6'>{translate('coremart.vendingMachine.reports.pnlReport.vatRateLabel')}</Text>
						<Text size='xs' c='dimmed'>{translate('coremart.vendingMachine.reports.pnlReport.vatFormulaHint')}</Text>
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
				{rowTotal(translate('coremart.vendingMachine.reports.pnlReport.vatAmount'), computed.vatAmount)}
				<Flex justify='space-between' align='center' gap='md' wrap='wrap' mt='xs'>
					<Stack gap={4} style={{ flex: '1 1 220px' }}>
						<Text size='sm' c='dark.6'>{translate('coremart.vendingMachine.reports.pnlReport.citRateLabel')}</Text>
						<Text size='xs' c='dimmed'>{translate('coremart.vendingMachine.reports.pnlReport.citFormulaHint')}</Text>
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
				{rowTotal(translate('coremart.vendingMachine.reports.pnlReport.citAmount'), computed.citAmount)}
				{rowTotal(translate('coremart.vendingMachine.reports.pnlReport.totalTax'), computed.totalTax)}

				<Divider my='md' />
				{rowTotal(
					translate('coremart.vendingMachine.reports.pnlReport.profitAfterTax'),
					computed.profitAfterTax,
					{ uppercase: true, strong: true },
				)}
				<Text size='xs' c='dimmed'>
					{translate('coremart.vendingMachine.reports.pnlReport.formulaAfterTax')}
				</Text>
			</Stack>
		</Paper>
	);
}
