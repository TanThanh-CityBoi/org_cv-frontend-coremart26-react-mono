import { MantineShadow, Stack, StackProps, Table } from '@mantine/core';
import React from 'react';


type MantineTableScrollProps = React.ComponentProps<typeof Table.ScrollContainer>;

export type TableContainerProps = StackProps & {
	/**
	 * The header of the table.
	 * @default null
	 */
	header?: React.ReactNode,

	/**
	 * The footer of the table.
	 * @default null
	 */
	footer?: React.ReactNode,

	/**
	 * The minimum width of the table.
	 * @default 300
	 */
	minWidth?: MantineTableScrollProps['minWidth'],

	/**
	 * The minimum height of the table.
	 * @default 200
	 */
	minHeight?: MantineTableScrollProps['mih'],

	/**
	 * The maximum height of the table.
	 * @default undefined
	 */
	maxHeight?: MantineTableScrollProps['maxHeight'],

	/**
	 * Whether to add a border to the table.
	 * @default false
	 */
	withBorder?: boolean,

	/**
	 * The shadow of the table.
	 * @default 'none'
	 */
	shadow?: MantineShadow,

	/**
	 * Whether to unstyle the table scroll container.
	 * @default false
	 */
	unstyledScrollContainer?: boolean,

	/**
	 * The props for the table scroll container.
	 * @default null
	 */
	scrollContainerProps?: Partial<MantineTableScrollProps>,
};

/**
 * Scroll wrapper for wide tables: border, radius, padding, light shadow.
 * Forwards all {@link Table.ScrollContainer} props; {@link minWidth} defaults to
 * `300` (e.g. use `1000` for dense order columns).
 */
export function TableContainer({
	scrollContainerProps = {},
	unstyledScrollContainer = false,
	minWidth = 300,
	minHeight = 200,
	maxHeight,
	header,
	footer,
	children,
	withBorder = false,
	style = {},
	shadow,
	...rest
}: TableContainerProps) {

	const borderStyles = {
		bd: 'solid 1px rgba(0, 0, 0, 0.1)',
		bdrs: 'sm',
	};

	return (
		<Stack
			gap='sm' justify='space-between'
			{...(withBorder ? {...borderStyles, p: 'md'} : {})}
			style={{ ...style, ...(shadow ? { boxShadow: `var(--mantine-shadow-${shadow})` } : {}) }}
			{...rest}
		>
			{header}
			<Table.ScrollContainer
				flex={1} w='100%'
				minWidth={minWidth} mih={minHeight} maxHeight={maxHeight}
				{...(unstyledScrollContainer ? {} : {...borderStyles, p: 'xs'})}
				{...scrollContainerProps}
			>
				{children}
			</Table.ScrollContainer>
			{footer}
		</Stack>
	);
}
