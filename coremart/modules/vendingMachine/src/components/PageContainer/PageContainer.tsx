import { Box, Center, Container, Flex, Loader, Paper, Space, Stack, Text } from '@mantine/core';
import { useDocumentTitle } from '@nikkierp/ui/hooks';
import { IconAlertCircle } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { BreadCrumbs } from '@/components/BreadCrumbs';


export type PageContainerProps = {
	documentTitle?: string;
	breadcrumbs?: { title: string; href: string }[];
	actionBar?: React.ReactNode;
	sections?: React.ReactNode[];
	children?: React.ReactNode;
	isLoading?: boolean;
	isEmpty?: boolean;
	emptyContent?: React.ReactNode;
	isNotFound?: boolean;
	notFoundContent?: React.ReactNode;
	containerProps?: React.ComponentProps<typeof Container>;
	layoutProps?: React.ComponentProps<typeof Flex>;
	paperProps?: React.ComponentProps<typeof Paper>;
	unstyledPaper?: boolean;
};

const PageLoading: React.FC = () => {
	const { t: translate } = useTranslation();
	return (
		<Center mih={300}>
			<Stack align='center' gap='md'>
				<Loader size='lg' />
				<Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>
			</Stack>
		</Center>
	);
};

const EmptyContent: React.FC<{ message?: string }> = ({ message }) => {
	const { t: translate } = useTranslation();
	return (
		<Center h='100%' w='100%' p='xl' bg='light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))'>
			<Stack align='center' gap='md'>
				<IconAlertCircle size={52} color='light-dark(var(--mantine-color-gray-6), var(--mantine-color-gray-0))' />
				<Text c='light-dark(var(--mantine-color-gray-6), var(--mantine-color-gray-0))'>{message || translate('nikki.general.messages.no_data')}</Text>
			</Stack>
		</Center>
	);
};

const NotFound: React.FC = () => {
	const { t: translate } = useTranslation();
	return (
		<EmptyContent message={translate('nikki.general.messages.not_found')} />
	);
};

const NoData: React.FC = () => {
	const { t: translate } = useTranslation();
	return (
		<EmptyContent message={translate('nikki.general.messages.no_data')} />
	);
};

// const SectionBox: React.FC<{ children: React.ReactNode, active?: boolean }> = ({ children, active = true }) => {
// 	return active ? <Box px='sm' pt='sm'>{children}</Box> : null;
// };

export const PageContainer: React.FC<PageContainerProps> = ({
	documentTitle,
	breadcrumbs = [],
	actionBar,
	sections = [],
	children,
	isLoading = false,
	isNotFound = false,
	notFoundContent,
	isEmpty = false,
	emptyContent,
	containerProps,
	layoutProps,
	paperProps,
	unstyledPaper = false,
}) => {
	useDocumentTitle(documentTitle ?? '');

	const breadcrumbsSection = breadcrumbs.length > 0 ? <BreadCrumbs items={breadcrumbs} /> : null;
	const allSections = [breadcrumbsSection, actionBar, ...sections].filter(Boolean);
	const hasSections = allSections.length > 0;

	return (
		<Container fluid px={{ base: 0, xs: 'sm' }} {...containerProps}>
			<Flex
				direction='column' gap={0} mt={{ base: 0, xs: 6 }} bdrs='xs'
				bg='light-dark(rgb(255 255 255 / 80%), var(--mantine-color-dark-6))'
				{...layoutProps}
			>
				<Stack gap={'xs'} p='sm' display={hasSections ? 'flex' : 'none'}>
					{allSections.map((section, index) => <Box key={index}>{section}</Box>)}
				</Stack>

				{isLoading ? <PageLoading /> :
					(<Paper {...(unstyledPaper ? { bg: 'transparent', p: 0 } : { p: 'sm' })} {...paperProps}>
						{
							isNotFound ? notFoundContent || <NotFound />
								: isEmpty ? emptyContent || <NoData />
									: children
						}
						<Space h={{ base: 'md', md: 'lg' }} />
					</Paper>)
				}
			</Flex>
		</Container>
	);
};


