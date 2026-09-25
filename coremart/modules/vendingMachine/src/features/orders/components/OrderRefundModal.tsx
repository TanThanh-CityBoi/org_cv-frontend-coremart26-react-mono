/* eslint-disable max-lines-per-function */
import {
	Box,
	Button,
	Checkbox,
	Divider,
	Group,
	Modal,
	NumberInput,
	Space,
	Stack,
	Table,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core';
import { useUIState } from '@nikkierp/shell/contexts';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { formatDateTime, getLocalizedName } from '@/common/helpers';
import { FileDropzoneUpload } from '@/components';

import { formatOrderMoney } from '../formatters';
import { useOrderDetail, useOrderRefund } from '../hooks';
import { VdOrderCurrency, VdOrderItem } from '../types';


type SelectedLine = { itemId: string; maxQty: number; qty: number; selected: boolean };

export type OrderRefundModalProps = {
	opened: boolean;
	onClose: () => void;
	orderId: string | null;
};

export const OrderRefundModal: React.FC<OrderRefundModalProps> = ({ opened, onClose, orderId }) => {
	const { t: translate, i18n } = useTranslation();
	const { notification } = useUIState();
	const { order, isLoading } = useOrderDetail(
		opened && orderId ? { id: orderId } : {},
	);
	const [lines, setLines] = useState<SelectedLine[]>([]);
	const [manual, setManual] = useState(false);
	const [bankCode, setBankCode] = useState('');
	const [accountName, setAccountName] = useState('');
	const [reason, setReason] = useState('');
	const [evidences, setEvidences] = useState<File[]>([]);

	const onCloseModal = useCallback(() => {
		onClose();
		setLines([]);
		setManual(false);
		setBankCode('');
		setAccountName('');
		setEvidences([]);
		setReason('');
	}, [onClose]);

	const { handleRefundOrderItemsSubmit, isRefundPending } = useOrderRefund({
		onRefundSuccessModalClose: onCloseModal,
	});

	useEffect(() => {
		if (!order?.items?.length) {
			setLines([]);
			setReason('');
			return;
		}
		setLines(
			order.items.map((it: VdOrderItem) => ({
				itemId: it.id,
				maxQty: it.quantity,
				qty: it.quantity,
				selected: false,
			})),
		);
		setReason('');
	}, [order?.items, order?.id]);

	const selectedTotal = useMemo(() => {
		if (!order?.items) return 0;
		let sum = 0;
		for (const l of lines) {
			if (!l.selected) continue;
			const it = order.items.find((i) => i.id === l.itemId);
			if (it) sum += Number(it.sellPrice) * l.qty;
		}
		return sum;
	}, [lines, order?.items]);

	const selectAll = useCallback(() => {
		if (!order?.items) return;
		setLines(
			order.items.map((it) => ({
				itemId: it.id,
				maxQty: it.quantity,
				qty: it.quantity,
				selected: true,
			})),
		);
	}, [order?.items]);

	const toggle = useCallback((itemId: string, checked: boolean) => {
		setLines((prev) => prev.map((l) => (l.itemId === itemId ? { ...l, selected: checked } : l)));
	}, []);

	const setQty = useCallback((itemId: string, qty: number) => {
		setLines((prev) => prev.map((l) => {
			if (l.itemId !== itemId) return l;
			const q = Math.max(1, Math.min(l.maxQty, qty));
			return { ...l, qty: q };
		}));
	}, []);

	const itemCount = order?.items?.length ?? 0;
	const allRefundLinesSelected = itemCount > 0 && lines.length > 0 && lines.every((l) => l.selected);
	const someRefundLinesSelected = lines.some((l) => l.selected);

	const submit = () => {
		if (!order?.id) return;

		if (!someRefundLinesSelected) {
			notification.showError(
				translate('coremart.vendingMachine.orders.refund.validation_items'),
				translate('coremart.vendingMachine.orders.refund.validation_title'),
			);
			return;
		}

		if (manual && (!bankCode.trim() || !accountName.trim())) {
			notification.showError(
				translate('coremart.vendingMachine.orders.refund.validation_bank'),
				translate('coremart.vendingMachine.orders.refund.validation_title'),
			);
			return;
		}

		const items = lines
			.filter((l) => l.selected && l.qty > 0)
			.map((l) => ({
				id: l.itemId,
				quantity: Math.floor(l.qty),
			}));

		if (!items.length) {
			notification.showError(
				translate('coremart.vendingMachine.orders.refund.validation_items'),
				translate('coremart.vendingMachine.orders.refund.validation_title'),
			);
			return;
		}

		handleRefundOrderItemsSubmit(order.id, {
			manualRefund: manual,
			items,
			refundInfo: manual
				? { providerName: 'manual', providerCode: `${bankCode.trim()}|${accountName.trim()}` }
				: { providerName: 'gateway', providerCode: 'auto' },
		});
	};


	const currency = (order?.currency ?? 'VND') as VdOrderCurrency;

	return (
		<Modal
			centered
			opened={opened}
			onClose={onCloseModal}
			size='xl'
			title={translate('coremart.vendingMachine.orders.refund.title')}
		>
			{isLoading && <Text size='sm' c='dimmed'>{translate('nikki.general.messages.loading')}</Text>}
			{!isLoading && order && (
				<Stack gap='md'>
					<Box>
						<Text size='sm'>
							{translate('coremart.vendingMachine.orders.fields.id')}: {' '}
							<strong>{order?.orderCode || ''}</strong>
						</Text>
						<Text size='sm'>
							{translate('coremart.vendingMachine.orders.fields.createdAt')}: {' '}
							{formatDateTime(order?.createdAt || '')}
						</Text>
					</Box>

					<Divider/>

					<Textarea
						label={translate('coremart.vendingMachine.orders.refund.reason')}
						value={reason}
						onChange={(e) => setReason(e.currentTarget.value)}
					/>

					<FileDropzoneUpload
						label={translate('coremart.vendingMachine.orders.refund.evidence')}
						accept={['image/*', 'application/pdf']}
						files={evidences}
						onFilesChange={setEvidences}
						browseLabel={translate('coremart.vendingMachine.orders.refund.evidence_browse')}
						acceptLabel={translate('coremart.vendingMachine.orders.refund.evidence_accept')}
						rejectLabel={translate('coremart.vendingMachine.orders.refund.evidence_reject')}
						emptyFileLabel={translate('coremart.vendingMachine.orders.refund.evidence_empty')}
						multiple
						maxFiles={3}
					/>

					<Divider/>

					<Stack gap={'xs'}>
						<Text size='sm'>{translate('coremart.vendingMachine.orders.refund.select_items')}</Text>
						<Table withTableBorder withColumnBorders>
							<Table.Thead>
								<Table.Tr>
									<Table.Th w={48}>
										<Checkbox
											disabled={itemCount === 0}
											checked={allRefundLinesSelected}
											indeterminate={someRefundLinesSelected && !allRefundLinesSelected}
											onChange={(e) => {
												if (e.currentTarget.checked) {
													selectAll();
												}
												else {
													setLines((prev) => prev.map((l) => ({ ...l, selected: false })));
												}
											}}
											aria-label={translate('coremart.vendingMachine.orders.refund.select_all')}
										/>
									</Table.Th>
									<Table.Th>{translate('coremart.vendingMachine.orders.items.product')}</Table.Th>
									<Table.Th w={100}>{translate('coremart.vendingMachine.orders.items.quantity')}</Table.Th>
									<Table.Th>{translate('coremart.vendingMachine.orders.items.line_total')}</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{order.items?.map((it) => {
									const line = lines.find((l) => l.itemId === it.id);
									const sel = line?.selected ?? false;
									const q = line?.qty ?? it.quantity;
									return (
										<Table.Tr key={it.id}>
											<Table.Td>
												<Checkbox
													checked={sel}
													onChange={(e) => toggle(it.id, e.currentTarget.checked)}
												/>
											</Table.Td>
											<Table.Td>
												<Text size='sm'>{getLocalizedName(it.productInfo?.name, i18n.language)}</Text>
												<Text size='xs' c='dimmed'>{it.productInfo?.sku ?? '—'}</Text>
											</Table.Td>
											<Table.Td>
												<NumberInput
													size='xs'
													min={1}
													max={it.quantity}
													value={q}
													onChange={(v) => setQty(it.id, Number(v) || 1)}
													disabled={!sel}
												/>
											</Table.Td>
											<Table.Td>
												{formatOrderMoney(
													String(Number(it.sellPrice) * q),
													currency,
												)}
											</Table.Td>
										</Table.Tr>
									);
								})}
							</Table.Tbody>
						</Table>

					</Stack>

					<Stack gap={6}>
						<Checkbox
							checked={manual}
							onChange={(e) => setManual(e.currentTarget.checked)}
							label={translate('coremart.vendingMachine.orders.refund.manual_toggle')}
							mb={3}
						/>
						{manual && (
							<>
								<TextInput
									label={translate('coremart.vendingMachine.orders.refund.bank_code')}
									value={bankCode}
									onChange={(e) => setBankCode(e.currentTarget.value)}
								/>
								<TextInput
									label={translate('coremart.vendingMachine.orders.refund.account_name')}
									value={accountName}
									onChange={(e) => setAccountName(e.currentTarget.value)}
								/>
							</>
						)}
					</Stack>

					<Text fw={600}>
						{translate('coremart.vendingMachine.orders.refund.total')}{': '}
						{formatOrderMoney(String(selectedTotal), currency)}
					</Text>

					<Space h='xs'/>

					<Group justify='flex-end'>
						<Button variant='default' disabled={isRefundPending} onClick={onCloseModal}>
							{translate('nikki.general.actions.close')}
						</Button>
						<Button
							loading={isRefundPending}
							disabled={isRefundPending || !someRefundLinesSelected}
							onClick={submit}
						>
							{translate('coremart.vendingMachine.orders.refund.submit')}
						</Button>
					</Group>
				</Stack>
			)}
		</Modal>
	);
};
