import { Container } from '@mantine/core';
import { Outlet } from 'react-router';


//! @deprecated Use <PageContainer /> instead
export const VendingMachineLayout: React.FC = () => {
	return (
		<Container fluid px={{ base: 0, xs: 'sm' }}>
			<Outlet />
		</Container>
	);
};
