import { Text } from '@mantine/core';
import { Gantt, Task } from 'gantt-task-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import 'gantt-task-react/dist/index.css';

import { deriveEventRunPhase, Event, type EventRunPhase } from '../../types';


export type EventGanttViewProps = {
	events: Event[],
	isLoading?: boolean,
	onViewDetail: (eventId: string) => void,
	onEdit?: (eventId: string) => void,
	onDelete?: (eventId: string) => void,
};

/** 0–100: share of [start, end] already elapsed at `nowMs` (bar length still comes from start/end). */
function eventRunProgressMs(
	startMs: number,
	endMs: number,
	nowMs: number,
): number {
	const totalMs = endMs - startMs;
	if (totalMs <= 0 || Number.isNaN(totalMs)) return 0;
	if (nowMs <= startMs) return 0;
	if (nowMs >= endMs) return 100;
	return Math.min(100, Math.max(0, Math.round(((nowMs - startMs) / totalMs) * 100)));
}

function runPhasePalette(phase: EventRunPhase) {
	switch (phase) {
		case 'ongoing':
			return {
				backgroundColor: 'var(--mantine-color-green-1)',
				backgroundSelectedColor: 'var(--mantine-color-green-2)',
				progressColor: 'var(--mantine-color-green-5)',
				progressSelectedColor: 'var(--mantine-color-green-7)',
			};
		case 'upcoming':
			return {
				backgroundColor: 'var(--mantine-color-yellow-1)',
				backgroundSelectedColor: 'var(--mantine-color-yellow-2)',
				progressColor: 'var(--mantine-color-yellow-5)',
				progressSelectedColor: 'var(--mantine-color-yellow-7)',
			};
		case 'ended':
		default:
			return {
				backgroundColor: 'var(--mantine-color-gray-2)',
				backgroundSelectedColor: 'var(--mantine-color-gray-3)',
				progressColor: 'var(--mantine-color-gray-6)',
				progressSelectedColor: 'var(--mantine-color-gray-8)',
			};
	}
}

export const EventGanttView: React.FC<EventGanttViewProps> = ({
	events,
	isLoading,
	onViewDetail: _onViewDetail,
	onEdit: _onEdit,
	onDelete: _onDelete,
}) => {
	const { t: translate } = useTranslation('vending_machine');

	const tasks: Task[] = useMemo(() => {
		const nowMs = Date.now();
		return events.map((event) => {
			const startDate = new Date(event.startTime);
			const endDate = new Date(event.endTime);
			const startMs = startDate.getTime();
			const endMs = endDate.getTime();
			const progress = eventRunProgressMs(startMs, endMs, nowMs);

			const phase = deriveEventRunPhase(event);
			const styles = runPhasePalette(phase);

			return {
				start: startDate,
				end: endDate,
				name: `${event.code} - ${event.name}`,
				id: event.id,
				type: 'task' as const,
				progress,
				isDisabled: !!event.isArchived,
				styles: styles,
			};
		});
	}, [events]);

	const handleTaskClick = (_task: Task) => {
		// onViewDetail(task.id);
	};

	if (isLoading) {
		return <Text c='dimmed'>{translate('messages.loading')}</Text>;
	}

	if (tasks.length === 0) {
		return (
			<Text c='dimmed' ta='center' p='md'>
				{translate('events.messages.no_events')}
			</Text>
		);
	}

	return <Gantt tasks={tasks} onClick={handleTaskClick} />;
};
