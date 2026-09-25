import { Button, Divider, Group } from '@mantine/core';
import { IconArchive, IconRestore, IconTrash } from '@tabler/icons-react';
import { TFunction } from 'i18next';
import React from 'react';

import type { KioskMedia } from '../../types';


export type KioskMediaMutationFooterProps = {
	media: KioskMedia;
	translate: TFunction;
	onRequestDelete?: () => void;
	onRequestArchive?: () => void;
	onRequestRestore?: () => void;
};

export const KioskMediaMutationFooter: React.FC<KioskMediaMutationFooterProps> = ({
	media,
	translate,
	onRequestDelete,
	onRequestArchive,
	onRequestRestore,
}) => {
	if (!onRequestDelete && !onRequestArchive && !onRequestRestore) return null;

	return (
		<>
			<Divider my='sm' />
			<Group justify='flex-end' gap='xs'>
				{media.isArchived !== true && onRequestArchive ? (
					<Button variant='light' color='orange' onClick={onRequestArchive} leftSection={<IconArchive size={16} />}>
						{translate('nikki.general.actions.archive')}
					</Button>
				) : null}
				{media.isArchived === true && onRequestRestore ? (
					<Button variant='light' color='blue' onClick={onRequestRestore} leftSection={<IconRestore size={16} />}>
						{translate('nikki.general.actions.restore')}
					</Button>
				) : null}
				{onRequestDelete ? (
					<Button variant='outline' color='red' onClick={onRequestDelete} leftSection={<IconTrash size={16} />}>
						{translate('nikki.general.actions.delete')}
					</Button>
				) : null}
			</Group>
		</>
	);
};
