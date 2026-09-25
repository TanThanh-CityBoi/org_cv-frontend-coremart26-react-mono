import { Text, TextProps } from '@mantine/core';
import React from 'react';


export type KioskStateMetricProps = TextProps & {
	value: string | null | undefined,
	emptyPlaceholder?: string,
};

export const KioskStateMetric: React.FC<KioskStateMetricProps> = ({
	value,
	emptyPlaceholder = '—',
	size = 'sm',
	fw = 500,
	...rest
}) => (
	<Text size={size} fw={fw} {...rest}>
		{value ?? emptyPlaceholder}
	</Text>
);
