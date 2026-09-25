import { Box, Button, Flex, Stack, Title } from '@mantine/core';
import { throttle } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanelFilter, ControlPanelFilterConfig } from '@/components';

import classes from './StickyFilterBar.module.css';


const APPLY_THROTTLE_MS = 1000;

export interface StickyFilterBarProps {
	title?: React.ReactNode;
	filters?: ControlPanelFilterConfig[];
	handleApply?: () => void;
}

// eslint-disable-next-line max-lines-per-function
export const StickyFilterBar: React.FC<StickyFilterBarProps> = ({ title, filters, handleApply }) => {
	const { t: translate } = useTranslation();
	const [loading, setLoading] = useState(false);
	const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const throttledApply = useMemo(
		() =>
			throttle(
				() => {
					if (!handleApply) return;

					setLoading(true);
					handleApply();

					if(loadingTimerRef.current) {
						clearTimeout(loadingTimerRef.current);
					}
					loadingTimerRef.current = setTimeout(() => {
						setLoading(false);
					}, APPLY_THROTTLE_MS);
				},
				APPLY_THROTTLE_MS,
				{ leading: true, trailing: false },
			),
		[handleApply],
	);

	useEffect(() => {
		return () => {
			throttledApply.cancel();
			if(loadingTimerRef.current) {
				setLoading(false);
				clearTimeout(loadingTimerRef.current);
			}
		};
	}, [throttledApply]);

	return (
		<Stack
			key='revenue-report-toolbar'
			gap='xs'
			bg={'white'}
			bdrs={'sm'}
			p={'sm'}
			bd={'1px solid #e0e0e0'}
			style={{
				boxShadow: '0 0 3px 0 rgba(0, 0, 0, 0.05)',
				zIndex: 20,
			}}
			pos={'sticky'}
			top={1} left={0} right={0}
		>
			{title && typeof title === 'string' ? (
				<Title fz={'xl'} fw={700} textWrap='nowrap'>
					{title}
				</Title>
			) : title}

			<Flex
				gap='sm'
				wrap='nowrap'
				align='flex-end'
				justify='flex-start'
				w={'100%'}
			>
				<Box className={classes.scrollWrap}>
					<ControlPanelFilter
						clearable={false}
						filters={filters}
					/>
				</Box>
				{handleApply && (
					<Button
						variant='filled'
						size='sm'
						w='max-content'
						miw='max-content'
						loading={loading}
						onClick={throttledApply}
					>
						{translate('coremart.vendingMachine.common.actions.view')}
					</Button>
				)}
			</Flex>
		</Stack>
	);
};