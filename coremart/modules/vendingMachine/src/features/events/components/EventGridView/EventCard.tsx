import { Card, Group, Stack, Text } from '@mantine/core';
import { IconCalendarEvent } from '@tabler/icons-react';
import { TFunction } from 'i18next';
import React, { useRef } from 'react';

import { CardActionMenu } from '@/components';

import { Event } from '../../types';
import { EventArchiveAndScheduleBadges } from '../EventScheduleBadges';
import { getEventTableActions, type EventTableActions } from '../EventTable';


export type EventCardDensity = 'comfortable' | 'compact';

export type EventCardProps = {
	event: Event;
	cardActions: EventTableActions;
	onPreview?: (event: Event) => void;
	translate: TFunction;
	/** Comfortable = grid; compact = kanban columns */
	density?: EventCardDensity;
};

export function EventCard({
	event,
	cardActions,
	onPreview,
	translate,
	density = 'comfortable',
}: EventCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);
	const compact = density === 'compact';

	return (
		<Card
			ref={cardRef}
			shadow='sm'
			padding={compact ? 'md' : 'lg'}
			radius='md'
			withBorder
			pos='relative'
			style={{ cursor: 'pointer' }}
			onClick={() => onPreview?.(event)}
		>
			<Stack gap={compact ? 'xs' : 'sm'}>
				<Group justify='space-between' align='flex-start'>
					<Group gap='xs' wrap={compact ? 'nowrap' : undefined}
						style={compact ? { flex: 1, minWidth: 0 } : undefined}>
						<IconCalendarEvent size={compact ? 16 : 20} />
						<Stack gap={0} style={compact ? { flex: 1, minWidth: 0 } : undefined}>
							<Text fw={600} size='sm' lineClamp={compact ? 1 : undefined}>{event.code}</Text>
							<Text size='xs' c='dimmed' lineClamp={compact ? 1 : undefined}>{event.name}</Text>
						</Stack>
					</Group>
					<Group gap='xs' onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();
					}}>
						<CardActionMenu
							items={getEventTableActions(event, cardActions, translate)}
							contextMenuContainerRef={cardRef}
						/>
					</Group>
				</Group>

				{event.description && (
					<Text size='xs' c='dimmed' lineClamp={compact ? 2 : 3}>
						{event.description}
					</Text>
				)}

				<EventArchiveAndScheduleBadges event={event} size='sm' />

				<Stack gap={compact ? 2 : 4}>
					<Text size='xs' c='dimmed'>
						{translate('coremart.vendingMachine.events.fields.startDate')}: {
							new Date(event.startTime).toLocaleDateString()
						}
					</Text>
					<Text size='xs' c='dimmed'>
						{translate('coremart.vendingMachine.events.fields.endDate')}: {
							new Date(event.endTime).toLocaleDateString()
						}
					</Text>
				</Stack>

				{!compact && (
					<Text size='xs' c='dimmed'>
						{translate('coremart.vendingMachine.events.fields.createdAt')}: {
							new Date(event.createdAt).toLocaleDateString()
						}
					</Text>
				)}
			</Stack>
		</Card>
	);
}
