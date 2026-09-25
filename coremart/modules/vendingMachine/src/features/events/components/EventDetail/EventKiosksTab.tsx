import { Stack } from '@mantine/core';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';

import { KioskSelectModal } from '@/components/KioskSelectModal';
import { RemoveKioskFromEventModal } from '@/features/events/components/EventConfirmModals';
import { KioskTable } from '@/features/kiosks';
import { kioskSchema } from '@/features/kiosks/schemas';

import {
	useEventKiosksTab,
	useQueryKioskInEventGraph,
	useQueryKioskNotInEventGraph,
} from './hooks/useEventKiosksTab';
import { useAssignKiosksToEvent, useRemoveKioskFromEvent } from './hooks/useManageKiosks';

import type { Event } from '@/features/events/types';


const EVENT_KIOSK_DETAIL_COLUMNS = [
	'code',
	'name',
	'locationAddress',
	'isArchived',
	'mode',
	'actions',
] as const;

export interface EventKiosksTabProps {
	event: Event;
}

export const EventKiosksTab: React.FC<EventKiosksTabProps> = ({ event }) => {
	const queryKioskInEventGraph = useQueryKioskInEventGraph(event.id);
	const queryKioskNotInEventGraph = useQueryKioskNotInEventGraph(event.id);

	const {
		kiosks,
		isLoading,
		pagination,
		assignModalOpened,
		closeAssignModal,
		refreshKiosks,
	} = useEventKiosksTab({ event, graph: queryKioskInEventGraph });

	const { handleAssignKiosks } = useAssignKiosksToEvent({ event, onAssignSuccess: refreshKiosks });

	const {
		isRemoveLoading,
		kioskToRemove,
		confirmModalOpened: removeModalOpened,
		openConfirmModal: openRemoveModal,
		closeConfirmModal: closeRemoveModal,
		handleRemoveKiosk,
	} = useRemoveKioskFromEvent({ event, onRemovedSuccess: refreshKiosks });

	return (
		<Stack gap='md'>
			<KioskTable
				columns={[...EVENT_KIOSK_DETAIL_COLUMNS]}
				data={kiosks as unknown as Record<string, unknown>[]}
				schema={kioskSchema as ModelSchema}
				isLoading={isLoading}
				actions={{
					delete: (kiosk) => openRemoveModal(kiosk),
				}}
				pagination={pagination}
			/>

			<KioskSelectModal
				graph={queryKioskNotInEventGraph}
				opened={assignModalOpened}
				onClose={closeAssignModal}
				onSelectKiosks={handleAssignKiosks}
			/>

			<RemoveKioskFromEventModal
				opened={removeModalOpened}
				onClose={closeRemoveModal}
				onConfirm={handleRemoveKiosk}
				confirmLoading={isRemoveLoading}
				kioskName={kioskToRemove?.name ?? kioskToRemove?.code ?? ''}
				eventName={event.name ?? event.code ?? event.id}
			/>
		</Stack>
	);
};
