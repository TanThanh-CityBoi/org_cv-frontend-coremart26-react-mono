import { Box, Divider, Stack, Text } from '@mantine/core';
import { FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconCalendarEvent } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { AuditDate } from '@/components';
import { PreviewDrawer } from '@/components/PreviewDrawer';
import { eventCrudSchema } from '@/features/events/schemas';

import { EventKioskList } from './EventKioskList';
import { Event } from '../../types';
import { EventFormFields } from '../EventFormFields';


export interface EventDetailDrawerProps {
	opened: boolean;
	onClose: () => void;
	event: Event | undefined;
	isLoading?: boolean;
}


export const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({
	opened,
	onClose,
	event,
	isLoading = false,
}) => {
	const { t: translate } = useTranslation();
	const navigate = useNavigate();

	if (!event) return null;
	return (
		<PreviewDrawer
			opened={opened}
			onClose={onClose}
			header={{
				title: event?.name,
				subtitle: event?.code,
				avatar: <IconCalendarEvent size={40} stroke={1.5} />,
			}}
			onViewDetails={() => {
				if (event?.id) {
					navigate(`../events/${event.id}`);
				}
				onClose();
			}}
			isLoading={isLoading}
			isNotFound={!event && !isLoading}
			drawerProps={{ size: 'xl', opened, onClose }}
		>
			<Stack gap='md'>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						key={`${event.id}-${event.etag}-basic-info`}
						formVariant='update'
						modelSchema={eventCrudSchema as ModelSchema}
						modelValue={event}
					>
						{() => (
							<form
								id={'event-detail-drawer-form'}
								noValidate
								style={{ display: 'contents' }}
							>
								<EventFormFields mode={'view'} />
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>

				<Divider />
				<Box>
					<Text size='sm' c='dimmed' mb='md' fw={500}>
						{translate('coremart.vendingMachine.events.fields.kiosks')}
					</Text>
					<EventKioskList
						kiosks={event?.kiosks ?? []}
					/>
				</Box>

				<AuditDate
					date={event?.createdAt ?? ''}
					label={translate('coremart.vendingMachine.events.fields.createdAt')}
				/>
				<Box h={50}></Box>
			</Stack>
		</PreviewDrawer>
	);
};

