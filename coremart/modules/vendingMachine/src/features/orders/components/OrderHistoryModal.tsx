
import { Button, Modal, ScrollArea, Tabs, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { FoldableJsonView } from '../../../components/FoldableJsonView';
import { useOrderDetail } from '../hooks';


export type OrderHistoryModalProps = {
	opened: boolean,
	onClose: () => void,
	orderId: string | null,
};

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ opened, onClose, orderId }) => {
	const { t: translate } = useTranslation('vending_machine');
	const { order, isLoading } = useOrderDetail(
		opened && orderId ? { id: orderId } : {},
	);

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			centered
			size='xl'
			title={translate('orders.history.title')}
		>
			{isLoading && <Text size='sm' c='dimmed'>{translate('messages.loading')}</Text>}
			{!isLoading && order && (
				<Tabs defaultValue='history'>
					<Tabs.List>
						<Tabs.Tab value='history'>{translate('orders.history.tab_updates')}</Tabs.Tab>
						<Tabs.Tab value='stocks'>{translate('orders.history.tab_stocks')}</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panel value='history' py='md'>
						<ScrollArea h={500} type='scroll'
							scrollbarSize={12}
							styles={{
								scrollbar: {
									'&:hover': {
										backgroundColor: 'var(--mantine-color-gray-2)',
									},
								},
								thumb: {
									backgroundColor: 'var(--mantine-color-gray-4)',
									'&:hover': {
										backgroundColor: 'var(--mantine-color-gray-5)',
									},
									minHeight: 50,
								},
							}}>
							<FoldableJsonView data={order.updateLogs ?? null} defaultOpenDepth={2} />
						</ScrollArea>
					</Tabs.Panel>
					<Tabs.Panel value='stocks' py='md'>
						<FoldableJsonView data={order.history ?? null} defaultOpenDepth={4} minHeight={500} />
					</Tabs.Panel>
				</Tabs>
			)}
			<Button fullWidth mt='md' onClick={onClose}>{translate('action.close')}</Button>
		</Modal>
	);
};
