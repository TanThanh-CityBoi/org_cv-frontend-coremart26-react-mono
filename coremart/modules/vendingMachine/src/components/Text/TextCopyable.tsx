import { Button, Group, Skeleton, Text, type GroupProps, type TextProps } from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { useEffect, useState } from 'react';


interface TextCopyableProps extends TextProps {
	value?: string;
	copyable?: boolean;
	children?: React.ReactNode;
	wrapperStyle?: GroupProps;
}

export const TextCopyable: React.FC<TextCopyableProps> = ({ value, children, copyable, wrapperStyle, ...props }) => {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (copied) {
			setTimeout(() => setCopied(false), 1000);
		}
	}, [copied]);

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (copyable && value) {
			navigator.clipboard.writeText(value as string);
			setCopied(true);
			return;
		}
	};

	return (
		<Group
			justify='start' align='center' gap={4}
			{...wrapperStyle}
			style={{ cursor: copyable ? 'pointer' : 'default' }}
			onClick={handleClick}
		>
			<Text
				c={'light-dark(var(--mantine-color-gray-8), var(--mantine-color-dark))'}
				fw={500} w={'max-content'}
				style={{ cursor: copyable ? 'pointer' : 'default' }}
				{...props}
			>
				{children ?? <Skeleton height={18} width={100} />}
			</Text>
			{
				copyable && value && (
					<Button size='xs' variant='subtle' color={copied ? 'teal' : 'var(--mantine-color-gray-6)'}>
						{copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
					</Button>
				)
			}
		</Group>
	);
};