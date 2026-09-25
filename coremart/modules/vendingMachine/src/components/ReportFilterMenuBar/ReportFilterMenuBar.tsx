import {
	Box,
	Paper,
	Tooltip,
	UnstyledButton,
	useMantineTheme,
} from '@mantine/core';
import { useClickOutside, useMediaQuery } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight, IconFilter } from '@tabler/icons-react';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ReportFilterFields } from './ReportFilterFields';

import type { ReportFilterMenuBarProps } from './types';


const PEEK_W = 44;

const ToggleEdgeButton: React.FC<{
	expanded: boolean,
	onClick: () => void,
	expandLabel: string,
	collapseLabel: string,
	collapseDirection: 'left' | 'right',
}> = ({ expanded, onClick, expandLabel, collapseLabel, collapseDirection }) => {
	const theme = useMantineTheme();
	const isRight = collapseDirection === 'right';

	const Icon = expanded
		? (isRight ? IconChevronRight : IconChevronLeft)
		: (isRight ? IconChevronLeft : IconChevronRight);

	const label = expanded ? collapseLabel : expandLabel;

	return (
		<Tooltip label={label} position={isRight ? 'left' : 'right'} withArrow>
			<UnstyledButton
				type='button'
				onClick={onClick}
				aria-expanded={expanded}
				aria-label={label}
				style={{
					width: PEEK_W,
					minWidth: PEEK_W,
					background: 'var(--mantine-color-default)',
					border: '1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))',
					borderRadius: isRight ? `${theme.radius.md}px 0 0 ${theme.radius.md}px` : `0 ${theme.radius.md}px ${theme.radius.md}px 0`,
					boxShadow: theme.shadows.sm,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 6,
					cursor: 'pointer',
					color: 'var(--mantine-color-text)',
				}}
			>
				<IconFilter size={18} stroke={1.6} />
				<Icon size={16} stroke={2} />
			</UnstyledButton>
		</Tooltip>
	);
};

/* eslint-disable-next-line max-lines-per-function -- layout shell, panel slide-out, and filter state wiring */
export const ReportFilterMenuBar: React.FC<ReportFilterMenuBarProps> = ({
	topOffset = 65,
	defaultExpanded = false,
	collapseDirection = 'right',
	kioskOptions,
	kioskValue,
	onKioskChange,
	dateRange,
	onDateRangeChange,
	reportSections,
	sectionVisibility,
	onSectionVisibilityChange,
}) => {
	const { t: translate } = useTranslation('vending_machine');
	const theme = useMantineTheme();
	const isCompact = useMediaQuery('(max-width: 62em)');
	const isNarrow = useMediaQuery('(max-width: 36em)');
	const [expanded, setExpanded] = useState(defaultExpanded);

	const isRight = collapseDirection === 'right';

	const collapse = useCallback(() => {
		setExpanded((e) => (e ? false : e));
	}, []);

	const shellRef = useClickOutside(collapse);

	const toggle = useCallback(() => setExpanded((e) => !e), []);

	const panelMaxWidth = isNarrow ? `calc(100vw - ${PEEK_W}px)` : isCompact ? 380 : 480;
	const maxH = `min(88vh, calc(100vh - ${topOffset + 16}px))`;

	const panelPaper = (
		<Paper
			shadow='md'
			p={{ base: 'sm', sm: 'md' }}
			bg='light-dark(rgb(255 255 255 / 96%), var(--mantine-color-dark-7))'
			style={{
				border: `1px solid ${theme.colors.gray[3]}`,
				borderRadius: isRight
					? `${theme.radius.md}px 0 0 ${theme.radius.md}px`
					: `0 ${theme.radius.md}px ${theme.radius.md}px 0`,
				maxWidth: panelMaxWidth,
				width: panelMaxWidth,
				boxSizing: 'border-box',
				transform: expanded ? 'translateX(0)' : isRight ? 'translateX(100%)' : 'translateX(-100%)',
				transition: 'transform 240ms ease, box-shadow 240ms ease, opacity 200ms ease',
				opacity: expanded ? 1 : 0,
				pointerEvents: expanded ? 'auto' : 'none',
				willChange: 'transform',
				boxShadow: expanded ? theme.shadows.md : 'none',
			}}
		>
			<ReportFilterFields
				isNarrow={!!isNarrow}
				maxH={maxH}
				kioskOptions={kioskOptions}
				kioskValue={kioskValue}
				onKioskChange={onKioskChange}
				dateRange={dateRange}
				onDateRangeChange={onDateRangeChange}
				reportSections={reportSections}
				sectionVisibility={sectionVisibility}
				onSectionVisibilityChange={onSectionVisibilityChange}
			/>
		</Paper>
	);

	return (
		<Box
			style={{
				position: 'fixed',
				zIndex: 200,
				top: topOffset,
				...(isRight ? { right: 0 } : { left: 0 }),
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'stretch',
				maxHeight: maxH,
				pointerEvents: 'none',
			}}
		>
			<Box
				ref={shellRef}
				style={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'stretch',
					pointerEvents: 'auto',
				}}
			>
				{!isRight && (
					<ToggleEdgeButton
						expanded={expanded}
						onClick={toggle}
						expandLabel={translate('reports.filter_bar.expand')}
						collapseLabel={translate('reports.filter_bar.collapse')}
						collapseDirection={collapseDirection}
					/>
				)}
				{panelPaper}
				{isRight && (
					<ToggleEdgeButton
						expanded={expanded}
						onClick={toggle}
						expandLabel={translate('reports.filter_bar.expand')}
						collapseLabel={translate('reports.filter_bar.collapse')}
						collapseDirection={collapseDirection}
					/>
				)}
			</Box>
		</Box>
	);
};
