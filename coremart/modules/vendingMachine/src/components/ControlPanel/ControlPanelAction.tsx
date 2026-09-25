import { Button, ButtonProps, Group } from '@mantine/core';
import React, { ButtonHTMLAttributes } from 'react';


export type ControlPanelActionItem = ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps & { label: string } | null;

export interface ControlPanelActionProps {
	actions: ControlPanelActionItem[];
}

export const ControlPanelAction: React.FC<ControlPanelActionProps> = ({ actions = [] }) => {
	return (
		<Group gap='sm' wrap='nowrap' align='flex-end' justify='flex-start'>
			{actions.filter((a): a is NonNullable<typeof a> => a != null).map((action, index) => (
				<Button
					key={index}
					fz='sm'
					fw={500}
					{...action}
					style={{ flexShrink: 0, ...action.style }}
				>
					{action.label ?? ''}
				</Button>
			))}
		</Group>
	);
};
