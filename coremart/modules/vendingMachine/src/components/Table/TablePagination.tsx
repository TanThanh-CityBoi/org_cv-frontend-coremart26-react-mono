/* eslint-disable max-lines-per-function */
import { Group, Text, Select, Box, UnstyledButton, GroupProps } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconProps } from '@tabler/icons-react';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';


export type PageSizeOption = { value: string; label: string };

export interface TablePaginationProps extends GroupProps {
	totalItems?: number;
	page?: number;
	totalPages?: number;
	onPageChange?: (page: number) => void;
	pageSize?: number;
	pageSizeOptions?: PageSizeOption[];
	onPageSizeChange?: (value: string | null) => void;
}

const DEFAULT_PAGE_SIZE = '10';
const DEFAULT_TOTAL_PAGES = 1;


const PaginationButton = ({ page, type, icon, disabled, onPageChange }: {
	page: number;
	type: 'back' | 'forward';
	icon?: React.ComponentType<IconProps>;
	disabled?: boolean;
	onPageChange?: (page: number) => void;
}) => {
	const nextPage = type === 'back' ? page - 1 : page + 1;
	const handleClick = () => {
		if (disabled || !onPageChange) return;
		onPageChange(nextPage);
	};

	const IconComponent = icon || (type === 'back' ? IconChevronLeft : IconChevronRight);

	return (
		<UnstyledButton w={30} h={30} onClick={handleClick}>
			<IconComponent
				color={ disabled ? 'var(--mantine-color-gray-5)' : 'var(--mantine-color-gray-7)'}
				size={28} stroke={1.2}
			/>
		</UnstyledButton>
	);
};


const PageInput = ({ totalPages, value, onPageChange, onBlur }: {
	value: string | number | undefined;
	totalPages: number;
	onPageChange: (value: string | number | undefined) => void;
	onBlur?: () => void;
}) => {
	return (
		<Group
			gap={3} justify='center' align='center' h={30}
			style={{
				borderRadius: 'var(--mantine-radius-sm)',
				border: 'solid 1px var(--mantine-color-gray-4)',
			}}
		>
			<input
				value={value}
				onBlur={onBlur}
				onChange={(e) => onPageChange(e.target.value)}
				style={{
					borderRadius: 'var(--mantine-radius-sm)',
					width: 40, height: '100%', textAlign: 'center',
					fontSize: 'var(--mantine-font-size-sm)', border: 'none', outline: 'none',
				}}
			/>
			<span>/</span>
			<input
				value={totalPages}
				readOnly={true}
				style={{
					borderRadius: 'var(--mantine-radius-sm)',
					width: 40, height: '100%', cursor: 'default', textAlign: 'center',
					fontSize: 'var(--mantine-font-size-sm)', border: 'none', outline: 'none',
				}}
			/>
		</Group>
	);
};

export const TablePagination: React.FC<TablePaginationProps> = ({
	totalItems,
	page = 1,
	totalPages = DEFAULT_TOTAL_PAGES,
	onPageChange,
	pageSize = DEFAULT_PAGE_SIZE,
	pageSizeOptions,
	onPageSizeChange,
	...rest
}) => {
	const { t: translate } = useTranslation();
	const defaultPageSizeOptions = useMemo(() => [
		{ value: '5', label: translate('nikki.general.pagination.page_size', { count: 5 }) },
		{ value: '10', label: translate('nikki.general.pagination.page_size', { count: 10 }) },
		{ value: '20', label: translate('nikki.general.pagination.page_size', { count: 20 }) },
		{ value: '50', label: translate('nikki.general.pagination.page_size', { count: 50 }) },
	], []);

	const [pageInputValue, setPageInputValue] = React.useState<number | string | undefined>(page);

	const handlePageChange = (targetValue: string | number | undefined) => {
		if (targetValue === '' || targetValue === undefined) {
			setPageInputValue('');
			return;
		}

		const value = Number(targetValue);
		if ((value && !Number.isNaN(value))) {
			if(value > totalPages) {
				setPageInputValue(String(totalPages));
				onPageChange?.(totalPages);
				return;
			}
			if(value < 1) {
				setPageInputValue(String(1));
				onPageChange?.(1);
				return;
			}
			setPageInputValue(String(value));
			onPageChange?.(value);
		}
	};

	const handleInputBlur = () => {
		if (!pageInputValue) {
			setPageInputValue(String(page));
		}
	};

	useEffect(() => setPageInputValue(page), [page]);

	return (
		<Group align='center' justify='space-between' {...rest}>
			<Box>
				{(totalItems || totalItems === 0) && (
					<Text size='sm'
						c='light-dark(var(--mantine-color-gray-8), var(--mantine-color-gray-3))'
					>
						{translate('nikki.general.pagination.items_found', { count: totalItems })}
					</Text>
				)}
			</Box>
			<Group gap={'sm'}>
				<Group gap={2} align='center' justify='center'>
					<PaginationButton
						type='back' disabled={page === 1}
						page={page} onPageChange={handlePageChange}
					/>
					<PageInput
						value={pageInputValue}
						totalPages={totalPages}
						onPageChange={handlePageChange}
						onBlur={handleInputBlur}
					/>
					<PaginationButton
						type='forward' disabled={page === totalPages}
						page={page} onPageChange={handlePageChange}
					/>
				</Group>

				<Select
					w={100} size='xs'
					allowDeselect={false}
					data={pageSizeOptions || defaultPageSizeOptions}
					value={String(pageSize)}
					onChange={onPageSizeChange}
				/>
			</Group>
		</Group>
	);
};
