import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Box, Divider, Group, Stack, Text } from '@mantine/core';
import dayjs from 'dayjs';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { type Event } from '../../types';
import { EventArchiveAndScheduleBadges } from '../EventScheduleBadges';


export interface EventCalendarViewProps {
	events: Event[];
	isLoading?: boolean;
	onViewDetail: (eventId: string) => void;
	onEdit?: (eventId: string) => void;
	onDelete?: (eventId: string) => void;
}

export const EventCalendarView: React.FC<EventCalendarViewProps> = ({
	events,
	isLoading: _isLoading,
	onViewDetail,
	onEdit: _onEdit,
	onDelete: _onDelete,
}) => {
	const { t: translate } = useTranslation('vending_machine');

	const eventsData = useMemo(() => events.map((ev) => ({
		id: ev.id,
		start: new Date(ev.startTime),
		end: new Date(ev.endTime),
		title: ev.name,
		extendedProps: {
			ev,
		},
	})), [events]);

	const handleEventClick = useCallback((_clickInfo: { event: { id: string } }) => {
		// if (clickInfo.event.id) {
		// 	onViewDetail(clickInfo.event.id);
		// }
	}, [onViewDetail]);

	const renderEventContent = useCallback((eventInfo: {
		event: {
			title: string,
			start: Date | null,
			end: Date | null,
			extendedProps?: { ev: Event },
		},
	}) => {
		const ext = eventInfo.event.extendedProps;
		const startTime = eventInfo.event.start
			? dayjs(eventInfo.event.start).format('HH:mm')
			: '';
		const ev = ext?.ev;
		return (
			<Stack gap={4} p={4}>
				{ev && <EventArchiveAndScheduleBadges event={ev} size='xs' wrap />}
				<Group gap='xs' wrap='nowrap'>
					{startTime && <Text size='xs' c='var(--mantine-color-blue-8)' fw={600}>{startTime}</Text>}
					<Divider orientation='vertical' />
					<Text size='xs' c='var(--mantine-color-gray-7)' lineClamp={2}>{eventInfo.event.title}</Text>
				</Group>
			</Stack>
		);
	}, []);

	const buttonText = useMemo(() => ({
		today: translate('action.today') || 'Today',
		month: translate('events.calendar.view.month') || 'Month',
		week: translate('events.calendar.view.week') || 'Week',
		day: translate('events.calendar.view.day') || 'Day',
		list: translate('events.calendar.view.list') || 'List',
	}), [translate]);

	return (
		<Box h={700}>
			<FullCalendar
				plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
				initialView='dayGridMonth'
				headerToolbar={{
					left: 'prev,next today',
					center: 'title',
					right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
				}}
				buttonText={buttonText}
				events={eventsData}
				eventContent={renderEventContent}
				eventClick={(info) => handleEventClick(info)}
				dragScroll
				height='100%'
				expandRows
				weekends
				eventColor='var(--mantine-color-blue-1)'
			/>
		</Box>
	);
};
