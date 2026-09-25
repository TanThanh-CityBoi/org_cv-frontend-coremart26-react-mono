import { Box, Button, Group, MultiSelect, Stack, Text } from '@mantine/core';
import { IconList } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { GroupByConfig } from './types';


export interface GroupBySectionProps {
	groupByConfigs: GroupByConfig[];
	selectedKeys: string[];
	onGroupByChange: (keys: string[]) => void;
}

export const GroupBySection: React.FC<GroupBySectionProps> = ({
	groupByConfigs,
	selectedKeys,
	onGroupByChange,
}) => {
	const { t: translate } = useTranslation('vending_machine');

	if (!groupByConfigs || groupByConfigs.length === 0) return null;

	return (
		<Box>
			<Group gap='xs' mb='xs'>
				<IconList size={16} style={{ color: '#51cf66' }} />
				<Text size='sm' fw={500}>
					{translate('search.groupBy')}
				</Text>
			</Group>
			<Stack gap='xs'>
				<Box onMouseDown={(e) => e.stopPropagation()}>
					<MultiSelect
						placeholder={translate('search.groupByPlaceholder')}
						data={groupByConfigs.map((g) => ({ value: g.key, label: g.label }))}
						value={selectedKeys}
						onChange={(values) => onGroupByChange(values)}
						size='sm'
						clearable
					/>
				</Box>
				<Button
					variant='subtle'
					size='xs'
					mt='xs'
					onClick={(e) => {
						e.stopPropagation();
						// TODO: Add custom group
						console.log('Add custom group');
					}}
				>
					{translate('search.addCustomGroupBy')}
				</Button>
			</Stack>
		</Box>
	);
};
