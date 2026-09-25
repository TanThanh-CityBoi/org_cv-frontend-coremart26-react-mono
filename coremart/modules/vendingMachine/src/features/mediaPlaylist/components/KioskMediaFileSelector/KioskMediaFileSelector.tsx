/* eslint-disable max-lines-per-function */
import {
	ActionIcon,
	Box,
	Group,
	Image,
	Stack,
	Text,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconTrash, IconUpload, IconX } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';


const ACCEPT_MIME = [
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
	'image/svg+xml',
	'video/mp4',
	'video/webm',
	'video/ogg',
	'video/quicktime',
];

const MAX_BYTES = 200 * 1024 * 1024;

function useObjectPreviewUrl(file: File | null): string | null {
	const [url, setUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!file) {
			setUrl(null);
			return undefined;
		}
		const objectUrl = URL.createObjectURL(file);
		setUrl(objectUrl);
		return () => URL.revokeObjectURL(objectUrl);
	}, [file]);

	return url;
}

function isVideoFile(file: File): boolean {
	return file.type.startsWith('video/');
}

export interface KioskMediaFileSelectorProps {
	label: string;
	file: File | null;
	onFileChange: (file: File | null) => void;
	error?: string;
}

export function KioskMediaFileSelector({
	label,
	file,
	onFileChange,
	error,
}: KioskMediaFileSelectorProps) {
	const { t: translate } = useTranslation();
	const previewUrl = useObjectPreviewUrl(file);
	const showVideo = file ? isVideoFile(file) : false;

	return (
		<Stack gap='sm'>
			<Text size='sm' fw={500}>
				{label}
			</Text>
			<Dropzone
				onDrop={(files) => onFileChange(files[0] ?? null)}
				maxFiles={1}
				maxSize={MAX_BYTES}
				accept={ACCEPT_MIME}
				styles={{
					root: {
						borderWidth: 2,
						borderStyle: 'dashed',
						borderColor: 'var(--mantine-color-blue-4)',
						borderRadius: 'var(--mantine-radius-md)',
						backgroundColor: 'var(--mantine-color-blue-0)',
						transition: 'border-color 120ms ease, background-color 120ms ease',
					},
				}}
			>
				<Stack
					align='center'
					justify='center'
					gap='sm'
					mih={148}
					style={{ pointerEvents: 'none' }}
				>
					<Dropzone.Accept>
						<Stack align='center' gap='xs'>
							<UploadCircleIcon />
							<Text size='sm' fw={600} c='blue.6'>
								{translate('coremart.vendingMachine.kioskMedia.create.drop_accept')}
							</Text>
						</Stack>
					</Dropzone.Accept>
					<Dropzone.Reject>
						<Stack align='center' gap='xs'>
							<Box
								style={{
									width: 56,
									height: 56,
									borderRadius: '50%',
									background: 'var(--mantine-color-error-1)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<IconX size={28} color='var(--mantine-color-red-7)' stroke={1.5} />
							</Box>
							<Text size='sm' fw={600} c='error.7'>
								{translate('coremart.vendingMachine.kioskMedia.create.drop_reject')}
							</Text>
						</Stack>
					</Dropzone.Reject>
					<Dropzone.Idle>
						<Stack align='center' gap='xs'>
							<UploadCircleIcon />
							<Text size='sm' fw={600} c='blue.6'>
								{translate('coremart.vendingMachine.kioskMedia.create.upload_zone_title')}
							</Text>
						</Stack>
					</Dropzone.Idle>
				</Stack>
			</Dropzone>

			{file && previewUrl ? (
				<Box
					p='md'
					style={{
						borderRadius: 'var(--mantine-radius-md)',
						background: 'var(--mantine-color-gray-0)',
						border: '1px solid var(--mantine-color-gray-3)',
					}}
				>
					{showVideo ? (
						<video
							src={previewUrl}
							controls
							style={{
								width: '100%',
								maxHeight: 280,
								display: 'block',
								borderRadius: 'var(--mantine-radius-sm)',
							}}
						/>
					) : (
						<Image
							src={previewUrl}
							alt={translate('coremart.vendingMachine.kioskMedia.create.preview_alt')}
							fit='contain'
							mah={280}
							mx='auto'
							style={{ display: 'block' }}
						/>
					)}
				</Box>
			) : null}

			{file ? (
				<Group
					justify='space-between'
					gap='sm'
					px='md'
					py={10}
					wrap='nowrap'
					style={{
						borderRadius: 9999,
						background: 'var(--mantine-color-blue-0)',
						border: '1px solid var(--mantine-color-blue-2)',
					}}
				>
					<Text size='sm' lineClamp={1} style={{ flex: 1, minWidth: 0 }}>
						{file.name}
					</Text>
					<ActionIcon
						variant='filled'
						color='blue'
						radius='xl'
						size='lg'
						aria-label={translate('coremart.vendingMachine.kioskMedia.create.remove_file_aria')}
						onClick={() => onFileChange(null)}
					>
						<IconTrash size={18} stroke={1.5} />
					</ActionIcon>
				</Group>
			) : null}

			{error ? (
				<Text size='xs' c='red'>
					{error}
				</Text>
			) : null}
		</Stack>
	);
}

function UploadCircleIcon() {
	return (
		<Box
			style={{
				width: 56,
				height: 56,
				borderRadius: '50%',
				background: 'var(--mantine-color-blue-1)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<IconUpload size={28} color='var(--mantine-color-blue-6)' stroke={1.5} />
		</Box>
	);
}
