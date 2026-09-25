import { Stack } from '@mantine/core';
import React from 'react';

import {
	useEventKiosksTab,
	useQueryKioskInEventGraph,
	useQueryKioskNotInEventGraph,
} from './hooks/useEventKiosksTab';
import { useAssignKiosksToEvent, useRemoveKioskFromEvent } from './hooks/useManageKiosks';
import { asLegacyModelSchema } from '../../../../common/helpers';
import { KioskSelectModal } from '../../../../components/KioskSelectModal';
import { KioskTable } from '../../../kiosks';
import { kioskSchema } from '../../../kiosks/schemas';
import { RemoveKioskFromEventModal } from '../EventConfirmModals';


import type { Event } from '../../types';


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
				schema={asLegacyModelSchema(kioskSchema)}
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
