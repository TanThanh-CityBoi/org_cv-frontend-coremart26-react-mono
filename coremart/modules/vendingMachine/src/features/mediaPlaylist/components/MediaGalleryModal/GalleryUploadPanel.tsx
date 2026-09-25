import { Button, FileButton, Stack, Text } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';
import React from 'react';


export interface GalleryUploadPanelProps {
	description: string;
	buttonLabel: string;
}

export const GalleryUploadPanel: React.FC<GalleryUploadPanelProps> = ({
	description,
	buttonLabel,
}) => (
	<Stack gap='md'>
		<Text size='sm' c='dimmed'>
			{description}
		</Text>
		<FileButton
			onChange={(files) => {
				// TODO: Handle file upload
				console.log('Files to upload:', files);
			}}
			accept='image/*,video/*'
			multiple
		>
			{(props) => (
				<Button {...props} leftSection={<IconUpload size={16} />}>
					{buttonLabel}
				</Button>
			)}
		</FileButton>
	</Stack>
);
