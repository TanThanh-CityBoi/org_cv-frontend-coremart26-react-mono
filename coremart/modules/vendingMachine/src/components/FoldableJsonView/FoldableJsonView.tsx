/* eslint-disable max-lines-per-function */
import { ActionIcon, Box, Collapse, Group, ScrollArea, Text } from '@mantine/core';
import { IconCheck, IconChevronDown, IconChevronRight, IconCopy } from '@tabler/icons-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';


function normalizePayload(raw: unknown): unknown {
	if (raw == null) return raw;
	if (typeof raw === 'string') {
		try {
			return JSON.parse(raw);
		}
		catch {
			return raw;
		}
	}
	return raw;
}

function serializeForCopy(value: unknown): string {
	if (value === undefined) return '';
	if (typeof value === 'string') return value;
	try {
		return JSON.stringify(value, null, 2);
	}
	catch {
		return String(value);
	}
}

function formatPrimitive(value: unknown): string {
	if (value === null) return 'null';
	if (value === undefined) return 'undefined';
	if (typeof value === 'string') return JSON.stringify(value);
	if (typeof value === 'number' || typeof value === 'boolean') return String(value);
	return JSON.stringify(value);
}

function JsonLabelColon({ label }: { label: string | null }) {
	if (label == null) return null;
	return (
		<>
			<Text span c='dimmed'>
				{label}
			</Text>
			<Text span>: </Text>
		</>
	);
}

type JsonPrimitiveLineProps = { label: string | null; value: unknown };

function JsonPrimitiveLine({ label, value }: JsonPrimitiveLineProps) {
	return (
		<Text size='xs' ff='monospace' lh={1.65} style={{ wordBreak: 'break-word' }}>
			<JsonLabelColon label={label} />
			<Text span>{formatPrimitive(value)}</Text>
		</Text>
	);
}

type JsonEmptyComplexProps = { label: string | null; isArr: boolean };

function JsonEmptyComplex({ label, isArr }: JsonEmptyComplexProps) {
	return (
		<Text size='xs' ff='monospace' lh={1.65}>
			<JsonLabelColon label={label} />
			<Text span>{isArr ? '[]' : '{}'}</Text>
		</Text>
	);
}

type JsonExpandableBranchProps = {
	label: string | null;
	isArr: boolean;
	entries: readonly (readonly [string, unknown])[];
	preview: string;
	depth: number;
	defaultOpenDepth: number;
};

function JsonExpandableBranch({
	label,
	isArr,
	entries,
	preview,
	depth,
	defaultOpenDepth,
}: JsonExpandableBranchProps) {
	const [open, setOpen] = useState(depth < defaultOpenDepth);

	return (
		<Box>
			<Group gap={6} wrap='nowrap' align='flex-start'>
				<ActionIcon
					size='sm'
					variant='subtle'
					color='gray'
					onClick={() => setOpen((previous) => !previous)}
					aria-expanded={open}
				>
					{open ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
				</ActionIcon>
				<Text component='div' size='xs' ff='monospace' lh={1.65} style={{ flex: 1, minWidth: 0 }}>
					<JsonLabelColon label={label} />
					{open ? (
						<Text span>{isArr ? '[' : '{'}</Text>
					) : (
						<Text span c='dimmed'>
							{preview}
						</Text>
					)}
				</Text>
			</Group>
			<Collapse in={open}>
				<Box
					pl={28}
					ml={10}
					style={{
						borderLeft: '1px solid var(--mantine-color-gray-4)',
					}}
				>
					{entries.map(([key, child]) => (
						<Box key={`${depth}-${key}`} pb={4}>
							<JsonNode
								label={isArr ? key : `"${key}"`}
								value={child}
								depth={depth + 1}
								defaultOpenDepth={defaultOpenDepth}
							/>
						</Box>
					))}
				</Box>
				<Text pl={36} size='xs' ff='monospace' lh={1.65}>
					{isArr ? ']' : '}'}
				</Text>
			</Collapse>
		</Box>
	);
}

type JsonNodeProps = {
	label: string | null;
	value: unknown;
	depth: number;
	defaultOpenDepth: number;
};

function JsonNode({ label, value, depth, defaultOpenDepth }: JsonNodeProps) {
	const complex = value !== null && typeof value === 'object';

	if (!complex) {
		return <JsonPrimitiveLine label={label} value={value} />;
	}

	const isArr = Array.isArray(value);
	const entries = isArr
		? (value as unknown[]).map((v, idx) => [String(idx), v] as const)
		: Object.entries(value as Record<string, unknown>);

	const preview = isArr ? `[${entries.length}]` : `{${entries.length}}`;

	if (entries.length === 0) {
		return <JsonEmptyComplex label={label} isArr={isArr} />;
	}

	return (
		<JsonExpandableBranch
			label={label}
			isArr={isArr}
			entries={entries}
			preview={preview}
			depth={depth}
			defaultOpenDepth={defaultOpenDepth}
		/>
	);
}

export type FoldableJsonViewProps = {
	/** Raw API value or JSON string; arrays/objects render foldable. */
	data: unknown;
	/** Nodes at depth &lt; this value start expanded (depth 0 = root). */
	defaultOpenDepth?: number;
	/** Show copy-to-clipboard control (top-right). @default true */
	copyable?: boolean;
	/** Accessible label for the copy control. */
	copyAriaLabel?: string;
	/** Minimum height of the scroll area. @default 300 */
	minHeight?: number;
};

export const FoldableJsonView: React.FC<FoldableJsonViewProps> = ({
	data,
	defaultOpenDepth = 2,
	copyable = true,
	copyAriaLabel = 'Copy JSON',
	minHeight = 400,
}) => {
	const normalized = useMemo(() => normalizePayload(data), [data]);
	const textToCopy = useMemo(() => serializeForCopy(normalized), [normalized]);

	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (copied) {
			setTimeout(() => setCopied(false), 1000);
		}
	}, [copied]);

	const handleCopy = useCallback(async () => {
		if (!textToCopy?.length) return;
		try {
			await navigator.clipboard.writeText(textToCopy);
			setCopied(true);
		}
		catch {
			/* clipboard may be unavailable (permissions / non-secure context) */
		}
	}, [textToCopy]);

	return (
		<Box
			py='xs'
			ps='xs'
			pr='2'
			style={{
				position: 'relative',
				backgroundColor: 'var(--mantine-color-body)',
				borderRadius: 'var(--mantine-radius-sm)',
				border: '1px solid var(--mantine-color-gray-3)',
				minHeight: 120,
				paddingRight: copyable ? 'calc(var(--mantine-spacing-md) + 28px)' : undefined,
			}}
		>
			{copyable ? (
				<ActionIcon
					variant='subtle'
					color='gray'
					size='sm'
					aria-label={copyAriaLabel}
					title={copyAriaLabel}
					style={{
						position: 'absolute',
						top: 'var(--mantine-spacing-xs)',
						right: 'var(--mantine-spacing-xs)',
						zIndex: 1,
					}}
					onClick={() => {
						void handleCopy();
					}}
				>
					{copied ? <IconCheck size={16} color='var(--mantine-color-green-6)' /> : <IconCopy size={16} />}
				</ActionIcon>
			) : null}
			<ScrollArea
				h={minHeight}
				miw={'100%'}
				type='scroll'
				scrollbarSize={6}
				styles={{
					scrollbar: {
						'&:hover': {
							backgroundColor: 'var(--mantine-color-gray-2)',
						},
					},
					thumb: {
						backgroundColor: 'var(--mantine-color-gray-4)',
						'&:hover': {
							backgroundColor: 'var(--mantine-color-gray-5)',
						},
						minHeight: 50,
					},
				}}
			>
				<JsonNode label={null} value={normalized} depth={0} defaultOpenDepth={defaultOpenDepth} />
			</ScrollArea>
		</Box>
	);
};
