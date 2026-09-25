import { Breadcrumbs, Button } from '@mantine/core';
import { FC, useMemo } from 'react';
import { Link } from 'react-router';


export type BreadcrumbItem = { title: string; href: string };
export interface BreadCrumbsProps {
	items: BreadcrumbItem[];
}
export const BreadCrumbs: FC<BreadCrumbsProps> = ({ items }) => {
	const breadcrumbs = useMemo(() => items?.map((item, index) => {
		return (
			<Button
				key={index} variant='transparent' size='compact-xs'
				p={0} fw={500}
				component={Link}
				to={item.href}
				fz={{ base: 'sm', xs: 'md' }}
			>
				{item.title}
			</Button>
		);
	}), [items]);

	return <Breadcrumbs>{breadcrumbs}</Breadcrumbs>;
};