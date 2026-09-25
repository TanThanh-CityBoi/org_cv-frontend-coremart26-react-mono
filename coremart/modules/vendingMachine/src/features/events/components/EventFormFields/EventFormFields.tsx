import { Box, SimpleGrid } from '@mantine/core';
import { AutoField } from '@nikkierp/ui/components';
import React from 'react';

import { DateTimeField } from '@/components/Form';
import { TimeField } from '@/components/Form/TimeField';

import classes from './EventFormFields.module.css';



export type EventFormFieldsMode = 'view' | 'create' | 'edit';

export interface EventFormFieldsProps {
	mode: EventFormFieldsMode;
	isSubmitting?: boolean;
}

export const EventFormFields: React.FC<EventFormFieldsProps> = ({ mode, isSubmitting }) => {
	const isView = mode === 'view';
	const readonlyInput = isView ? { readOnly: true } : {};

	return (
		<>
			<Box className={classes.EventFormField}>
				<AutoField name='name' autoFocused={mode === 'create'} htmlProps={readonlyInput} />
			</Box>

			{mode === 'create' && (
				<Box className={classes.EventFormField}>
					<AutoField name='code' />
				</Box>
			)}

			<Box className={classes.EventFormField}>
				<AutoField name='description' htmlProps={readonlyInput} />
			</Box>

			<SimpleGrid cols={{ base: 1, sm: 2 }}>
				<Box className={classes.EventFormField}>
					<DateTimeField
						name='startTime'
						inputProps={{ valueFormat: 'DD-MM-YYYY HH:mm', clearable: !isView }}
						readOnly={isView}
						disabled={isSubmitting ?? false}
					/>
				</Box>
				<Box className={classes.EventFormField}>
					<DateTimeField
						name='endTime'
						inputProps={{ valueFormat: 'DD-MM-YYYY HH:mm', clearable: !isView }}
						readOnly={isView}
						disabled={isSubmitting ?? false}
					/>
				</Box>
			</SimpleGrid>

			<Box className={classes.EventFormField} my={'xs'}>
				<AutoField name='isAllDay' inputProps={{ disabled: isView }} />
			</Box>

			<SimpleGrid cols={{ base: 1, sm: 2 }}>
				<Box className={classes.EventFormField}>
					<TimeField name='dailyStartTime' inputProps={{ clearable: !isView }} readOnly={isView} disabled={isSubmitting ?? false} />
				</Box>
				<Box className={classes.EventFormField}>
					<TimeField name='dailyEndTime' inputProps={{ clearable: !isView }} readOnly={isView} disabled={isSubmitting ?? false} />
				</Box>
			</SimpleGrid>
		</>
	);
};
