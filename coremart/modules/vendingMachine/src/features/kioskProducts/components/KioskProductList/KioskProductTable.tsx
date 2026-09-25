import { ActionIcon, Avatar, Badge, Table, Text } from '@mantine/core';
import { formatCurrency } from '@nikkierp/common/utils';
import blankPicture from '@nikkierp/ui/assets/images/blank-picture.png';
import { IconCheck } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { formatCatalogPrice } from '../../sellPrice';
import { KioskProduct } from '../../type';


export type KioskProductTableProps = {
	products: KioskProduct[],
	displayNameFor: (p: KioskProduct) => string,
	isRowSelected?: (productId: string) => boolean,
	onRowActivate?: (product: KioskProduct) => void,
};

export const KioskProductTable: React.FC<KioskProductTableProps> = ({
	products,
	displayNameFor,
	isRowSelected,
	onRowActivate,
}) => {
	const { t } = useTranslation('vending_machine');
	return (
		<Table striped highlightOnHover verticalSpacing='sm'>
			<Table.Thead>
				<Table.Tr>
					{onRowActivate && <Table.Th w={50} />}
					<Table.Th w={60} />
					<Table.Th>{t('kiosk.stocks.fields.sku')}</Table.Th>
					<Table.Th>{t('kiosk.stocks.fields.barcode')}</Table.Th>
					<Table.Th>{t('kiosk.stocks.fields.name')}</Table.Th>
					<Table.Th>{t('kiosk.fields.status')}</Table.Th>
					<Table.Th style={{ textAlign: 'right' }}>
						{t('kiosk.stocks.fields.proposed_price')}
					</Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{products.map((p) => {
					const selected = isRowSelected?.(p.id) ?? false;
					return (
						<Table.Tr
							key={p.id}
							style={{
								cursor: onRowActivate ? 'pointer' : undefined,
							}}
							onClick={() => onRowActivate?.(p)}
						>
							{onRowActivate && (
								<Table.Td>
									{selected && (
										<ActionIcon variant='light' color='blue' size='sm' aria-hidden>
											<IconCheck size={16} />
										</ActionIcon>
									)}
								</Table.Td>
							)}
							<Table.Td>
								<Avatar
									size={40}
									radius='sm'
									src={p.imageUrl || blankPicture}
									alt=''
								/>
							</Table.Td>
							<Table.Td><Text size='sm'>{p.sku}</Text></Table.Td>
							<Table.Td><Text size='sm' c='dimmed'>{p.barcode || '—'}</Text></Table.Td>
							<Table.Td><Text size='sm'>{displayNameFor(p)}</Text></Table.Td>
							<Table.Td>
								<Badge size='sm' variant='light'>{p.status}</Badge>
							</Table.Td>
							<Table.Td style={{ textAlign: 'right' }}>
								<Text size='sm'>{formatCatalogPrice(p.proposedPrice, formatCurrency.VND)}</Text>
							</Table.Td>
						</Table.Tr>
					);
				})}
			</Table.Tbody>
		</Table>
	);
};
