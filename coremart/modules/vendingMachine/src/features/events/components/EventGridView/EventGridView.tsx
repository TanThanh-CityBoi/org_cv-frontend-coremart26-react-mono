import { SimpleGrid, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { TablePagination } from '@/components/Table';
import { type TablePaginationProps } from '@/components/Table';

import { EventCard } from './EventCard';
import { Event } from '../../types';

import type { EventTableActions } from '../EventTable';


export interface EventGridViewProps {
	events: Event[];
	isLoading?: boolean;
	actions?: EventTableActions;
	pagination?: TablePaginationProps;
}

export const EventGridView: React.FC<EventGridViewProps> = ({
	events,
	isLoading = false,
	actions = {},
	pagination,
}) => {
	const { t: translate } = useTranslation();
	const { preview: onPreview, ...cardActions } = actions;

	if (isLoading) {
		return <Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>;
	}

	if (events.length === 0) {
		return <Text c='dimmed'>{translate('coremart.vendingMachine.events.messages.no_events')}</Text>;
	}

	return (
		<Stack gap='md' mih={150}>
			<SimpleGrid
				cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
				spacing={{ base: 'sm', sm: 'md', lg: 'lg' }}
			>
				{events.map((event) => (
					<EventCard
						key={event.id}
						event={event}
						cardActions={cardActions}
						onPreview={onPreview}
						translate={translate}
					/>
				))}
			</SimpleGrid>
			{pagination ? <TablePagination {...pagination} /> : null}
		</Stack>
	);
};
