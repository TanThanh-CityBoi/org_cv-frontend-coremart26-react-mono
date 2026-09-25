import { Box, Group } from '@mantine/core';
import React from 'react';

import classes from './ControlPanel.module.css';
import { ControlPanelAction, type ControlPanelActionItem } from './ControlPanelAction';
import { ControlPanelFilter } from './ControlPanelFilter';
import { ControlPanelViewMode, ControlPanelViewModeProps } from './ControlPanelViewMode';

import type { ControlPanelFilterConfig } from './types';


export type { ViewMode, ControlPanelFilterConfig } from './types';

export interface ControlPanelProps {
	actions?: ControlPanelActionItem[];
	viewMode?: ControlPanelViewModeProps;
	//
	filters?: ControlPanelFilterConfig[];
	filterClearable?: boolean;
	search?: {
		value?: string;
		onChange?: (value: string) => void;
		placeholder?: string;
	};
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
	actions = [],
	filters = [],
	search,
	viewMode,
	filterClearable = true,
}) => {
	const hasFilters = filters.length > 0 || search;
	const hasViewMode = viewMode && viewMode.segments.length > 1;

	return (

		<Box className={classes.scrollWrap} py={1}>
			<Group justify='space-between' align='flex-end' wrap='nowrap' miw='max-content'>
				<ControlPanelAction actions={actions} />
				<Group gap='md' wrap='nowrap' align='flex-end' w={'max-content'}>
					{hasFilters && <ControlPanelFilter filters={filters} search={search} clearable={filterClearable} />}
					{hasViewMode && <ControlPanelViewMode {...viewMode} />}
				</Group>
			</Group>
		</Box>
	);
};
