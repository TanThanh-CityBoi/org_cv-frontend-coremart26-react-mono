import { Skeleton, Text, TextProps } from '@mantine/core';
import clsx from 'clsx';
import React from 'react';
import { Link, LinkProps, To } from 'react-router-dom';

import classes from './TextLink.module.css';


export type TextLinkProps =
	| React.PropsWithChildren<TextProps & LinkProps>
	| React.PropsWithChildren<TextProps & { to?: undefined }>;

const textLinkVisualProps = (to: To | undefined) => ({
	className: clsx({ [classes.textLink]: !!to }),
	c: to ? 'var(--nikki-color-primary)' : undefined,
	display: 'inline-block',
	w: 'max-content',
	fw: 500,
});

export function TextLink(props: TextLinkProps): React.ReactElement {
	const { to, children, ...rest } = props;
	const body = children ?? <Skeleton height={18} width={100} />;
	const visual = textLinkVisualProps(to);
	if (to) {
		return (
			<Text component={Link} to={to} {...visual} {...rest}>
				{body}
			</Text>
		);
	}
	return (
		<Text {...visual} {...(rest as TextProps)}>
			{body}
		</Text>
	);
}