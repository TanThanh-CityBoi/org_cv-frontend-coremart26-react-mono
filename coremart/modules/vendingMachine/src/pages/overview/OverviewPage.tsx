import {
	Box,
	Center,
	Stack,
} from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/PageContainer';
import {
	mockOperationParameters,
	mockSupportRequests,
} from '@/features/kiosks/mocks';
import { CustomerSupportRequest, KioskAnalyticsChart, OverviewStats } from '@/features/reports/operations/components';
import { useKioskAnalytics, useKioskWarnings } from '@/features/reports/operations/hooks';
import { useKioskLowStocks } from '@/features/reports/operations/hooks/useKioskLowStocks';

import {
	KioskErrorAlert,
	KioskLowStockAlert,
} from '../../features/kiosks/components';
import { KioskHitMap } from '../../features/kiosks/components/KioskHitMap';
import { useKioskList } from '../../features/kiosks/hooks';



export default function OverviewPage(): React.ReactNode {
	const { t: translate } = useTranslation();
	const { kiosks = [] } = useKioskList();

	const { data: lowStockAlerts, pagination: lowStockPagination } = useKioskLowStocks();
	const { data: analyticsData } = useKioskAnalytics();
	const { data: kioskWarnings, pagination: warningPagination } = useKioskWarnings();

	return (
		<PageContainer
			documentTitle={translate('coremart.vendingMachine.overview.title')}
			layoutProps={{ p: 0, bg: 'transparent' }}
			unstyledPaper
		>
			<Stack gap='md'>
				<Box pos='relative' h='max-content' mih={800}>
					<Box
						pos='absolute' top={0} left={0} right={0} bottom={0} z-index={0}
						bg='light-dark(var(--nikki-color-white), var(--mantine-color-dark-6))'
						p={3} bdrs={'sm'}
						display={{ base: 'none', lg: 'block' }}
					>
						<KioskHitMap kiosks={kiosks} />
					</Box>
					<OverviewStats
						width={{ base: '100%', lg: '50%' }}
						miw={{ base: '100%', lg: 800 }}
						padding={{ base: 0, lg: 'md' }}
					/>
				</Box>

				<KioskAnalyticsChart analytics={analyticsData} />

				<KioskErrorAlert warnings={kioskWarnings} pagination={warningPagination} detailLink='../reports/error-analytics'/>

				<KioskLowStockAlert data={lowStockAlerts} pagination={lowStockPagination} detailLink='../reports/inventory' />


				{/* Mock data */}
				<CustomerSupportRequest requests={mockSupportRequests} detailLink='../customer-support' />
				<Box
					display={{ base: 'block', lg: 'none' }}
					h='400px' w='100%' p={'xs'} bdrs={'md'}
					bg='light-dark(var(--nikki-color-white), var(--mantine-color-dark-6))'
				>
					<KioskHitMap kiosks={kiosks} />
				</Box>

				<Center h='100px' bg='light-dark(var(--nikki-color-white), var(--mantine-color-dark-6))' mb='md'/>
			</Stack>
		</PageContainer>
	);
}
