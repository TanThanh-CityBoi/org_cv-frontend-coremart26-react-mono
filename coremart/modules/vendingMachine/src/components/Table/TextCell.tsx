import { Button, Group, Skeleton, Text, TextProps } from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { useEffect, useState } from 'react';


interface TextCellProps extends TextProps {
	content?: React.ReactNode;
	copyable?: boolean;
	onClick?: () => void;
	children?: string;
}

export const TextCell: React.FC<TextCellProps> = ({ content, copyable, onClick, children, ...restProps }) => {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (copied) {
			setTimeout(() => setCopied(false), 1000);
		}
	}, [copied]);

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (copyable && content) {
			navigator.clipboard.writeText(content as string);
			setCopied(true);
			return;
		}
		if (onClick) {
			onClick();
			return;
		}
	};

	return (
		<Group
			justify='space-between' align='center' gap={4}
			style={{ cursor: copyable ? 'pointer' : 'default' }}
			onClick={handleClick}
		>
			<Text
				c={'light-dark(var(--mantine-color-gray-8), var(--mantine-color-dark))'}
				fw={500} w={'max-content'}
				style={{ cursor: copyable ? 'pointer' : 'default' }}
				{...restProps}
			>
				{children ?? content ?? <Skeleton height={18} width={100} />}
			</Text>
			{
				copyable && content && (
					<Button size='xs' variant='subtle' color={copied ? 'teal' : 'var(--mantine-color-gray-6)'}>
						{copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
					</Button>
				)
			}
		</Group>
	);
};