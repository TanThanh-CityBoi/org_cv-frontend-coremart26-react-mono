import { Box, SimpleGrid } from '@mantine/core';
import { AutoField } from '@nikkierp/ui/components';
import { IconMapPin } from '@tabler/icons-react';
import React from 'react';


import classes from './KioskFormFields.module.css';
import { PaymentMethodSelectField, KioskModelSelectField } from '../../../../components/Form';
import { Kiosk } from '../../types';



export type KioskFormFieldsMode = 'view' | 'create' | 'edit';

export interface KioskFormFieldsProps {
	mode: KioskFormFieldsMode;
	kiosk?: Kiosk;
	isSubmitting?: boolean;
}

export const KioskFormFields: React.FC<KioskFormFieldsProps> = ({ mode, kiosk, isSubmitting }) => {
	const isView = mode === 'view';
	const readonlyInput = isView ? { readOnly: true } : {};


	return (
		<>
			<Box className={classes.kioskFormField}>
				<AutoField name='name' autoFocused={mode === 'create'} htmlProps={readonlyInput} />
			</Box>

			<Box className={classes.kioskFormField}>
				<AutoField name='displayName' htmlProps={readonlyInput} />
			</Box>

			{mode === 'create' &&
				<Box className={classes.kioskFormField}>
					<AutoField name='code'/>
				</Box>
			}

			<Box className={classes.kioskFormField}>
				<AutoField name='mode' htmlProps={readonlyInput}/>
			</Box>


			<SimpleGrid cols={{ base: 1, sm: 2 }}>
				<Box className={classes.kioskFormField}>
					<KioskModelSelectField
						isView={isView}
						isSubmitting={isSubmitting ?? false}
						fallbackLabel={kiosk?.model?.name ?? ''}
					/>
				</Box>
				<Box className={classes.kioskFormField}>
					<PaymentMethodSelectField
						isView={isView}
						isSubmitting={isSubmitting ?? false}
					/>
				</Box>
			</SimpleGrid>

			<Box className={classes.kioskFormField}>
				<AutoField
					inputProps={{
						leftSection: <IconMapPin color='black' size={18} style={{ marginBottom: 2 }} />,
					}}
					htmlProps={readonlyInput}
					name='locationAddress'
				/>
			</Box>

			<SimpleGrid cols={{ base: 1, sm: 2 }}>
				<Box flex={1} miw={0} className={classes.kioskFormField}>
					<AutoField name='latitude' inputProps={{ w: '100%' }} htmlProps={readonlyInput} />
				</Box>
				<Box flex={1} miw={0} className={classes.kioskFormField}>
					<AutoField name='longitude' inputProps={{ w: '100%' }} htmlProps={readonlyInput}/>
				</Box>
			</SimpleGrid>


		</>
	);
};
