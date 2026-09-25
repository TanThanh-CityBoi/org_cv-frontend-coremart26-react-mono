import { Group, ScrollArea, Stack, Text } from '@mantine/core';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { deriveEventRunPhase, type Event, type EventRunPhase } from '../../types';
import { EventCard } from '../EventGridView/EventCard';

import type { EventTableActions } from '../EventTable';


export interface EventKanbanViewProps {
	events: Event[];
	isLoading?: boolean;
	actions?: EventTableActions;
}

const RUN_PHASE_ORDER: EventRunPhase[] = ['upcoming', 'ongoing', 'ended'];

export const EventKanbanView: React.FC<EventKanbanViewProps> = ({
	events,
	isLoading = false,
	actions = {},
}) => {
	const { t: translate } = useTranslation();
	const { preview: onPreview, ...cardActions } = actions;

	const phaseLabel = (phase: EventRunPhase) =>
		translate(`coremart.vendingMachine.events.runPhase.${phase}`);

	const eventsByRunPhase = useMemo(() => {
		const grouped: Record<EventRunPhase, Event[]> = {
			upcoming: [],
			ongoing: [],
			ended: [],
		};

		events.forEach((ev) => {
			const bucket = deriveEventRunPhase(ev);
			grouped[bucket].push(ev);
		});

		return grouped;
	}, [events]);

	if (isLoading) {
		return <Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>;
	}

	return (
		<Group align='flex-start' gap='md' style={{ width: '100%', overflowX: 'auto' }}>
			{RUN_PHASE_ORDER.map((phase) => (
				<Stack key={phase} gap='sm' style={{ minWidth: 300, flex: 1 }}>
					<Group justify='space-between' align='center' p='xs' style={{ borderBottom: '2px solid' }}>
						<Text fw={600} size='md'>{phaseLabel(phase)}</Text>
						<Text size='sm' c='dimmed' fw={500}>{eventsByRunPhase[phase]?.length || 0}</Text>
					</Group>
					<ScrollArea h='calc(100vh - 300px)' type='auto'>
						<Stack gap='sm'>
							{eventsByRunPhase[phase]?.map((event) => (
								<EventCard
									key={event.id}
									event={event}
									cardActions={cardActions}
									onPreview={onPreview}
									translate={translate}
									density='compact'
								/>
							))}
							{(!eventsByRunPhase[phase] || eventsByRunPhase[phase].length === 0) && (
								<Text size='sm' c='dimmed' ta='center' p='md'>
									{translate('coremart.vendingMachine.events.messages.no_events')}
								</Text>
							)}
						</Stack>
					</ScrollArea>
				</Stack>
			))}
		</Group>
	);
};
