// import { Button, Group, Modal, Stack } from '@mantine/core';
// import { useActiveOrgDetail } from '@nikkierp/shell/userContext';
// import React, { useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next';

// import { useKioskProductFilter, useKioskProductList } from '../../hooks/useKioskProductList';
// import { KioskProduct } from '../../type';
// import { KioskProductList } from '../KioskProductList/KioskProductList';




// export type KioskProductSelectModalProps = {
// 	opened: boolean;
// 	onClose: () => void;
// 	onConfirm: (product: KioskProduct) => void;
// 	orgId?: string;
// 	title?: string;
// };

// export const KioskProductSelectModal: React.FC<KioskProductSelectModalProps> = ({
// 	opened,
// 	onClose,
// 	onConfirm,
// 	orgId: orgIdProp,
// 	title,
// }) => {
// 	const { t } = useTranslation();
// 	const activeOrg = useActiveOrgDetail();
// 	const orgId = orgIdProp ?? activeOrg?.id;
// 	const [selected, setSelected] = useState<KioskProduct[]>([]);
// 	const filter = useKioskProductFilter();
// 	const { products, pagination, handleRefresh, listError } = useKioskProductList(orgId, filter.graph);

// 	useEffect(() => {
// 		if (opened) {
// 			setSelected([]);
// 		}
// 	}, [opened]);

// 	return (
// 		<Modal
// 			opened={opened}
// 			onClose={onClose}
// 			title={title ?? t('coremart.vendingMachine.kioskProducts.modal.title')}
// 			centered
// 			size='xl'
// 			overlayProps={{ opacity: 0.5, blur: 4 }}
// 		>
// 			<Stack gap='md'>
// 				<KioskProductList
// 					products={products}
// 					pagination={pagination}
// 					filters={filter.filters}
// 					handleRefresh={handleRefresh}
// 					error={listError}
// 					showToolbar
// 					selectedProducts={selected}
// 					onSelectProductsChange={setSelected}
// 					scrollAreaHeight={480}
// 				/>

// 				<Group justify='flex-end' mt='md'>
// 					<Button variant='default' onClick={onClose}>
// 						{t('nikki.general.actions.cancel')}
// 					</Button>
// 					<Button
// 						disabled={selected.length === 0}
// 						onClick={() => selected[0] != null && onConfirm(selected[0])}
// 					>
// 						{t('coremart.vendingMachine.kioskProducts.modal.confirm')}
// 					</Button>
// 				</Group>
// 			</Stack>
// 		</Modal>
// 	);
// };
