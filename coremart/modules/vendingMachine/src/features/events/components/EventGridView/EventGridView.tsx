import { SimpleGrid, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { EventCard } from './EventCard';
import { TablePagination } from '../../../../components/Table';
import { type TablePaginationProps } from '../../../../components/Table';
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
	const { t: translate } = useTranslation('vending_machine');
	const { preview: onPreview, ...cardActions } = actions;

	if (isLoading) {
		return <Text c='dimmed'>{translate('messages.loading')}</Text>;
	}

	if (events.length === 0) {
		return <Text c='dimmed'>{translate('events.messages.no_events')}</Text>;
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
