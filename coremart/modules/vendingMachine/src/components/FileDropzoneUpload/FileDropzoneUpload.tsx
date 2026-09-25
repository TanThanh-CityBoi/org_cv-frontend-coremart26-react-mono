import { ActionIcon, Box, Group, Image, Stack, Text } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconCloudUpload, IconFile, IconPhoto, IconTrash } from '@tabler/icons-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { formatFileSize } from '../../common/helpers';

import type { DropzoneProps } from '@mantine/dropzone';


const FD_I18N = {
	label: 'common.file_dropzone.label',
	hint: 'common.file_dropzone.hint',
	browseLabel: 'common.file_dropzone.browse_label',
	acceptLabel: 'common.file_dropzone.accept_label',
	rejectLabel: 'common.file_dropzone.reject_label',
	emptyFileLabel: 'common.file_dropzone.empty_file_label',
	clearAriaLabel: 'common.file_dropzone.clear_aria_label',
} as const;


function usePreviewThumbUrls(files: File[]): (string | null)[] {
	const [urls, setUrls] = useState<(string | null)[]>([]);
	const identityKey = files.map((file) => `${file.name}-${file.size}-${file.lastModified}`).join('|');

	useEffect(() => {
		const created = files.map((file) =>
			(file.type.startsWith('image/') ? URL.createObjectURL(file) : null));
		setUrls(created);
		return () => {
			created.forEach((url) => {
				if (url) URL.revokeObjectURL(url);
			});
		};
	}, [identityKey]);

	return urls;
}

function mergeDroppedFiles(
	multiple: boolean,
	effectiveFiles: File[],
	dropped: File[],
	maxFilesProp: number | undefined,
): File[] {
	if (!multiple) {
		return dropped[0] ? [dropped[0]] : [];
	}
	const merged = [...effectiveFiles, ...dropped];
	return maxFilesProp != null ? merged.slice(0, maxFilesProp) : merged;
}

function buildDropzoneRestProps(args: {
	multiple: boolean,
	maxFilesProp: number | undefined,
	accept: DropzoneProps['accept'] | undefined,
	maxSize: number | undefined,
}): Partial<Pick<DropzoneProps, 'accept' | 'maxSize' | 'multiple' | 'maxFiles'>> {
	const { multiple, maxFilesProp, accept, maxSize } = args;
	const dropzoneProps: Partial<Pick<DropzoneProps, 'accept' | 'maxSize' | 'multiple' | 'maxFiles'>> = {
		multiple,
	};
	if (!multiple) {
		dropzoneProps.maxFiles = 1;
	}
	else if (maxFilesProp !== undefined) {
		dropzoneProps.maxFiles = maxFilesProp;
	}
	if (accept !== undefined) {
		dropzoneProps.accept = accept;
	}
	if (maxSize !== undefined) {
		dropzoneProps.maxSize = maxSize;
	}
	return dropzoneProps;
}

function DropzoneBrowsePrompt({ body }: { body: string }) {
	return (
		<Stack align='center' justify='center' gap='sm' mih={120} style={{ pointerEvents: 'none' }}>
			<Box
				style={{
					width: 56,
					height: 56,
					borderRadius: '50%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: 'var(--mantine-color-blue-0)',
					border: '1px solid var(--mantine-color-blue-2)',
				}}
			>
				<IconCloudUpload size={32} color='var(--mantine-color-blue-6)' stroke={1.5} />
			</Box>
			<Text size='sm' c='gray.7' ta='center' fw={500} maw='90%'>
				{body}
			</Text>
		</Stack>
	);
}

function DropzoneRejectPrompt({ rejectLabel }: { rejectLabel: string }) {
	return (
		<Stack align='center' justify='center' gap='sm' mih={120} style={{ pointerEvents: 'none' }}>
			<Box
				style={{
					width: 56,
					height: 56,
					borderRadius: '50%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: 'var(--mantine-color-red-0)',
				}}
			>
				<IconCloudUpload size={32} color='var(--mantine-color-red-6)' stroke={1.5} />
			</Box>
			<Text size='sm' c='red.7' ta='center' fw={500} maw='90%'>
				{rejectLabel}
			</Text>
		</Stack>
	);
}

type FilePreviewSlotProps = {
	file: File | null,
	imageThumbSrc: string | null,
	emptyFileLabel: string,
	clearAriaLabel: string,
	onClear: () => void,
};

function FilePreviewSlot({
	file,
	imageThumbSrc,
	emptyFileLabel,
	clearAriaLabel,
	onClear,
}: FilePreviewSlotProps) {
	return (
		<Group
			wrap='nowrap'
			gap='sm'
			p={4}
			bdrs='md'
			bd='1px solid var(--mantine-color-blue-2)'
			bg='var(--mantine-color-blue-0)'
		>
			<Box
				w={40}
				h={40}
				style={{
					borderRadius: 8,
					overflow: 'hidden',
					flexShrink: 0,
					background: 'var(--mantine-color-gray-1)',
				}}
			>
				{imageThumbSrc ? (
					<Image src={imageThumbSrc} alt='' w={40} h={40} fit='cover' />
				) : (
					<Box
						w='100%'
						h='100%'
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							background: 'var(--mantine-color-blue-0)',
						}}
					>
						{file ? (
							<IconFile size={22} color='var(--mantine-color-blue-6)' stroke={1.5} />
						) : (
							<IconPhoto size={22} color='var(--mantine-color-blue-6)' stroke={1.5} />
						)}
					</Box>
				)}
			</Box>
			<Box flex={1} miw={0}>
				<Text size='sm' c='gray.7' lineClamp={1} style={{ flex: 1, minWidth: 0 }}>
					{file ? file.name : emptyFileLabel}
				</Text>
				<Text size='xs' c='dimmed'>{file ? file.type : ''}</Text>
			</Box>

			<Text size='xs' c='dimmed'>{file ? formatFileSize(file.size) : ''}</Text>
			<ActionIcon
				variant='subtle'
				color='gray'
				aria-label={clearAriaLabel}
				onClick={onClear}
				disabled={!file}
				style={{ flexShrink: 0, opacity: file ? 1 : 0.4 }}
			>
				<IconTrash size={18} />
			</ActionIcon>
		</Group>
	);
}

type FilePreviewStackProps = {
	effectiveFiles: File[],
	previewUrls: (string | null)[],
	emptyFileLabel: string,
	clearAriaLabel: string,
	onClearAll: () => void,
	onRemoveAt: (index: number) => void,
};

function FilePreviewStack({
	effectiveFiles,
	previewUrls,
	emptyFileLabel,
	clearAriaLabel,
	onClearAll,
	onRemoveAt,
}: FilePreviewStackProps) {
	if (effectiveFiles.length === 0) {
		return (
			<FilePreviewSlot
				file={null}
				imageThumbSrc={null}
				emptyFileLabel={emptyFileLabel}
				clearAriaLabel={clearAriaLabel}
				onClear={onClearAll}
			/>
		);
	}
	return (
		<>
			{effectiveFiles.map((file, index) => (
				<FilePreviewSlot
					key={`${file.name}-${file.lastModified}-${index}`}
					file={file}
					imageThumbSrc={previewUrls[index] ?? null}
					emptyFileLabel={emptyFileLabel}
					clearAriaLabel={clearAriaLabel}
					onClear={() => onRemoveAt(index)}
				/>
			))}
		</>
	);
}

export type FileDropzoneUploadProps = {
	/** Omit to use `common.file_dropzone.*` defaults. */
	label?: string,
	hint?: string,
	browseLabel?: string,
	acceptLabel?: string,
	rejectLabel?: string,
	emptyFileLabel?: string,
	files: File[],
	onFilesChange: (files: File[]) => void,
	multiple?: boolean,
	maxFiles?: number,
	accept?: DropzoneProps['accept'],
	maxSize?: number,
	clearAriaLabel?: string,
};

function resolveFileDropzoneLabels(
	t: (key: string) => string,
	p: Partial<Pick<FileDropzoneUploadProps,
		'label' | 'hint' | 'browseLabel' | 'acceptLabel' | 'rejectLabel' | 'emptyFileLabel' | 'clearAriaLabel'>>,
) {
	const hintRaw = p.hint ?? t(FD_I18N.hint);
	return {
		label: p.label ?? t(FD_I18N.label),
		hint: hintRaw.trim() === '' ? undefined : hintRaw,
		browseLabel: p.browseLabel ?? t(FD_I18N.browseLabel),
		acceptLabel: p.acceptLabel ?? t(FD_I18N.acceptLabel),
		rejectLabel: p.rejectLabel ?? t(FD_I18N.rejectLabel),
		emptyFileLabel: p.emptyFileLabel ?? t(FD_I18N.emptyFileLabel),
		clearAriaLabel: p.clearAriaLabel ?? t(FD_I18N.clearAriaLabel),
	};
}

type FileDropzoneUploadContentProps = {
	label: string,
	hint?: string,
	browseLabel: string,
	acceptLabel: string,
	rejectLabel: string,
	emptyFileLabel: string,
	clearAriaLabel: string,
	effectiveFiles: File[],
	previewUrls: (string | null)[],
	dropzoneRest: Partial<Pick<DropzoneProps, 'accept' | 'maxSize' | 'multiple' | 'maxFiles'>>,
	onDrop: (dropped: File[]) => void,
	onClearAll: () => void,
	onRemoveAt: (index: number) => void,
};

function FileDropzoneUploadContent({
	label,
	hint,
	browseLabel,
	acceptLabel,
	rejectLabel,
	emptyFileLabel,
	clearAriaLabel,
	effectiveFiles,
	previewUrls,
	dropzoneRest,
	onDrop,
	onClearAll,
	onRemoveAt,
}: FileDropzoneUploadContentProps) {
	return (
		<Stack gap={6} w='100%'>
			<Stack gap={2}>
				<Text size='sm' fw={500}>
					{label}
				</Text>
				{hint ? (
					<Text size='xs' c='dimmed'>
						{hint}
					</Text>
				) : null}
			</Stack>
			<Dropzone
				onDrop={onDrop}
				{...dropzoneRest}
				styles={{
					root: {
						border: '2px dashed var(--mantine-color-blue-4)',
						backgroundColor: 'var(--mantine-color-body)',
						borderRadius: 'var(--mantine-radius-md)',
						boxShadow: '0 0 0 1px rgba(34, 139, 230, 0.12), 0 4px 14px rgba(34, 139, 230, 0.08)',
					},
				}}
			>
				<Dropzone.Accept>
					<DropzoneBrowsePrompt body={acceptLabel} />
				</Dropzone.Accept>
				<Dropzone.Reject>
					<DropzoneRejectPrompt rejectLabel={rejectLabel} />
				</Dropzone.Reject>
				<Dropzone.Idle>
					<DropzoneBrowsePrompt body={browseLabel} />
				</Dropzone.Idle>
			</Dropzone>
			<Stack gap='xs'>
				<FilePreviewStack
					effectiveFiles={effectiveFiles}
					previewUrls={previewUrls}
					emptyFileLabel={emptyFileLabel}
					clearAriaLabel={clearAriaLabel}
					onClearAll={onClearAll}
					onRemoveAt={onRemoveAt}
				/>
			</Stack>
		</Stack>
	);
}

export const FileDropzoneUpload: React.FC<FileDropzoneUploadProps> = ({
	label: labelProp,
	hint: hintProp,
	browseLabel: browseLabelProp,
	acceptLabel: acceptLabelProp,
	rejectLabel: rejectLabelProp,
	emptyFileLabel: emptyFileLabelProp,
	files,
	onFilesChange,
	multiple = false,
	maxFiles: maxFilesProp = 5,
	accept,
	maxSize = 10 * 1024 * 1024, // 10MB
	clearAriaLabel: clearAriaLabelProp,
}) => {
	const { t } = useTranslation('vending_machine');
	const {
		label,
		hint,
		browseLabel,
		acceptLabel,
		rejectLabel,
		emptyFileLabel,
		clearAriaLabel,
	} = resolveFileDropzoneLabels(t, {
		label: labelProp,
		hint: hintProp,
		browseLabel: browseLabelProp,
		acceptLabel: acceptLabelProp,
		rejectLabel: rejectLabelProp,
		emptyFileLabel: emptyFileLabelProp,
		clearAriaLabel: clearAriaLabelProp,
	});

	const effectiveFiles = useMemo(
		() => (multiple ? files : files.slice(0, 1)),
		[files, multiple],
	);
	const previewUrls = usePreviewThumbUrls(effectiveFiles);
	const dropzoneRest = buildDropzoneRestProps({
		multiple,
		maxFilesProp,
		accept,
		maxSize,
	});

	const onDrop = (dropped: File[]) => {
		onFilesChange(mergeDroppedFiles(multiple, effectiveFiles, dropped, maxFilesProp));
	};

	const removeAt = (index: number) => {
		onFilesChange(effectiveFiles.filter((_, idx) => idx !== index));
	};

	return (
		<FileDropzoneUploadContent
			label={label}
			hint={hint}
			browseLabel={browseLabel}
			acceptLabel={acceptLabel}
			rejectLabel={rejectLabel}
			emptyFileLabel={emptyFileLabel}
			clearAriaLabel={clearAriaLabel}
			effectiveFiles={effectiveFiles}
			previewUrls={previewUrls}
			dropzoneRest={dropzoneRest}
			onDrop={onDrop}
			onClearAll={() => onFilesChange([])}
			onRemoveAt={removeAt}
		/>
	);
};
