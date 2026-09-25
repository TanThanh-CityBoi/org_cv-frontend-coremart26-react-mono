import { Skeleton, Text, TextProps } from '@mantine/core';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

import classes from './NameCell.module.css';


interface NameCellProps extends TextProps {
	content?: React.ReactNode;
	link?: string;
	onClick?: () => void;
	children?: string;
}

export const NameCell: React.FC<NameCellProps> = ({ content, link, onClick, children, ...restProps }) => {
	const text = children ?? content;
	const isHrefLink = !!link && !!text && !onClick;
	const active = !!onClick || isHrefLink;

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onClick?.();
	};

	const textProps = {
		className: clsx({ [classes.nameLink]: active }),
		c: active ? 'light-dark(var(--mantine-color-blue-8), var(--mantine-color-blue-2))' : 'var(--mantine-color-gray-7)',
		fw: 500 as const,
		w: 'max-content' as const,
		children: text ?? <Skeleton height={18} width={100} />,
		...restProps,
	};

	/** Thật `<a href>` (qua React Router) thì chuột phải mới có Open link / Open in new tab. */
	if (isHrefLink) {
		return (
			<Text
				component={Link}
				to={link}
				display='inline-block'
				{...textProps}
			/>
		);
	}

	return (
		<Text {...textProps} onClick={onClick ? handleClick : undefined} />
	);
};