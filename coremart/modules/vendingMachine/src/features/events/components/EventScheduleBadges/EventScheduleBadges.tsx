import { Group, MantineSize } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ArchivedStatusBadge } from '../../../../components/ArchivedStatusBadge';
import { StatusBadge } from '../../../../components/StatusBadge';
import { deriveEventRunPhase, type Event, type EventRunPhase } from '../../types';


const RUN_PHASE_META: Record<EventRunPhase, { color: string, labelKey: string }> = {
	upcoming: { color: 'yellow', labelKey: 'events.run_phase.upcoming' },
	ongoing: { color: 'green', labelKey: 'events.run_phase.ongoing' },
	ended: { color: 'gray', labelKey: 'events.run_phase.ended' },
};

export type EventRunPhaseBadgeProps = {
	phase: EventRunPhase,
	size?: MantineSize,
};

export const EventRunPhaseBadge: React.FC<EventRunPhaseBadgeProps> = ({ phase, size = 'sm' }) => {
	const { t } = useTranslation('vending_machine');
	const meta = RUN_PHASE_META[phase];
	return (
		<StatusBadge color={meta.color} size={size}>
			{t(meta.labelKey)}
		</StatusBadge>
	);
};

export type EventArchiveAndScheduleBadgesProps = {
	event: Pick<Event, 'startTime' | 'endTime' | 'isArchived'>,
	size?: MantineSize,
	gap?: 'xs' | 'sm' | 'md',
	wrap?: boolean,
};

/** Archive state (`isArchived`) + schedule phase (start/end vs now). */
export const EventArchiveAndScheduleBadges: React.FC<EventArchiveAndScheduleBadgesProps> = ({
	event,
	size = 'sm',
	gap = 'xs',
	wrap = true,
}) => {
	const phase = deriveEventRunPhase(event);
	return (
		<Group gap={gap} wrap={wrap ? 'wrap' : 'nowrap'}>
			<ArchivedStatusBadge isArchived={!!event.isArchived} size={size} />
			<EventRunPhaseBadge phase={phase} size={size} />
		</Group>
	);
};
