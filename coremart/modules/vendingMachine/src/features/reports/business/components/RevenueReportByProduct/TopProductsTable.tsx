/* eslint-disable max-lines-per-function */
import { Avatar, Badge, Card, Checkbox, Group, Pagination, ScrollArea, Stack, Table, Text, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import React, { useState } from 'react';



const mockProducts = [
	{ id: '1', name: 'Shanty Cotton Seat', vendors: ['V1', 'V2', 'V3'], margin: 45.50, sold: 234, stock: 'in_stock' as const },
	{ id: '2', name: 'Advanced Soft Couch', vendors: ['V1', 'V2'], margin: 427.00, sold: 189, stock: 'in_stock' as const },
	{ id: '3', name: 'Premium Wooden Table', vendors: ['V3', 'V4', 'V5'], margin: 289.99, sold: 156, stock: 'low_stock' as const },
	{ id: '4', name: 'Modern Glass Chair', vendors: ['V2'], margin: 125.00, sold: 298, stock: 'in_stock' as const },
	{ id: '5', name: 'Luxury Leather Sofa', vendors: ['V1', 'V3', 'V4', 'V5'], margin: 899.99, sold: 87, stock: 'in_stock' as const },
	{ id: '6', name: 'Classic Bookshelf', vendors: ['V2', 'V3'], margin: 199.50, sold: 201, stock: 'low_stock' as const },
	{ id: '7', name: 'Elegant Dining Set', vendors: ['V1', 'V4'], margin: 650.00, sold: 134, stock: 'in_stock' as const },
	{ id: '8', name: 'Comfortable Recliner', vendors: ['V3'], margin: 375.00, sold: 167, stock: 'in_stock' as const },
	{ id: '9', name: 'Stylish Coffee Table', vendors: ['V2', 'V5'], margin: 225.00, sold: 223, stock: 'in_stock' as const },
	{ id: '10', name: 'Minimalist Desk', vendors: ['V1', 'V2', 'V3'], margin: 299.99, sold: 145, stock: 'low_stock' as const },
	{ id: '11', name: 'Cozy Armchair', vendors: ['V4'], margin: 189.00, sold: 278, stock: 'in_stock' as const },
	{ id: '12', name: 'Executive Office Chair', vendors: ['V1', 'V5'], margin: 449.99, sold: 112, stock: 'in_stock' as const },
];


interface Product {
	id: string;
	name: string;
	vendors: string[];
	margin: number;
	sold: number;
	stock: 'in_stock' | 'low_stock';
}

interface TopProductsTableProps {
	products?: Product[];
}


/** @deprecated */
export function TopProductsTable({ products = mockProducts }: TopProductsTableProps): React.ReactElement {
	const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const isMobile = useMediaQuery('(max-width: 768px)');
	const itemsPerPage = isMobile ? 6 : 10;

	const filteredProducts = products;

	const paginatedProducts = filteredProducts.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	const toggleProduct = (productId: string) => {
		setSelectedProducts((prev) =>
			prev.includes(productId)
				? prev.filter((id) => id !== productId)
				: [...prev, productId],
		);
	};

	const toggleAll = () => {
		if (selectedProducts.length === paginatedProducts.length) {
			setSelectedProducts([]);
		}
		else {
			setSelectedProducts(paginatedProducts.map((p) => p.id));
		}
	};


	const startItems = (currentPage - 1) * itemsPerPage + 1;
	const endItems = Math.min(currentPage * itemsPerPage, filteredProducts.length);
	const totalItems = filteredProducts.length;
	const paginationLabel = `Showing ${startItems}-${endItems} out of ${totalItems} items`;


	return (
		<Card shadow='sm' padding='md' radius='md' withBorder h='100%'>
			<Stack gap='md' h='100%'>
				<Group justify='space-between' align='flex-start'>
					<Stack gap={4}>
						<Title order={4} fw={600}>
							Top products
						</Title>
						<Text size='xs' c='dimmed'>
							Detailed information about the products
						</Text>
					</Stack>
				</Group>
				{/* <TextInput
					placeholder='Search'
					leftSection={<IconSearch size={16} />}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.currentTarget.value)}
					size='sm'
				/> */}
				<ScrollArea>
					<Table>
						<Table.Thead>
							<Table.Tr>
								<Table.Th style={{ width: 40 }}>
									<Checkbox
										checked={selectedProducts.length === paginatedProducts.length &&
											paginatedProducts.length > 0}
										indeterminate={selectedProducts.length > 0 &&
											selectedProducts.length < paginatedProducts.length}
										onChange={toggleAll}
									/>
								</Table.Th>
								<Table.Th>Product</Table.Th>
								<Table.Th>Vendors</Table.Th>
								<Table.Th>Margin</Table.Th>
								<Table.Th>Sold</Table.Th>
								<Table.Th>Stock</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{paginatedProducts.map((product) => (
								<Table.Tr key={product.id}>
									<Table.Td>
										<Checkbox
											checked={selectedProducts.includes(product.id)}
											onChange={() => toggleProduct(product.id)}
										/>
									</Table.Td>
									<Table.Td>
										<Group gap='xs'>
											<Avatar size='sm' radius='sm' color='blue' />
											<Text size='sm'>{product.name}</Text>
										</Group>
									</Table.Td>
									<Table.Td>
										<Group gap={4}>
											{product.vendors.slice(0, 3).map((vendor, idx) => (
												<Avatar key={idx} size='xs' radius='xl' color='gray' />
											))}
											{product.vendors.length > 3 && (
												<Text size='xs' c='dimmed'>
													+{product.vendors.length - 3}
												</Text>
											)}
										</Group>
									</Table.Td>
									<Table.Td>
										<Text size='sm' fw={500}>
											${product.margin.toFixed(2)}
										</Text>
									</Table.Td>
									<Table.Td>
										<Text size='sm'>{product.sold}</Text>
									</Table.Td>
									<Table.Td>
										<Badge
											color={product.stock === 'in_stock' ? 'green' : 'orange'}
											variant='light'
											size='sm'
										>
											{product.stock === 'in_stock' ? 'In Stock' : 'Low Stock'}
										</Badge>
									</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				</ScrollArea>
				<Group justify='space-between' align='center'>
					<Text size='sm' c='dimmed'>
						{paginationLabel}
					</Text>
					<Pagination
						total={Math.ceil(filteredProducts.length / itemsPerPage)}
						value={currentPage}
						onChange={setCurrentPage}
						size='sm'
					/>
				</Group>
			</Stack>
		</Card>
	);
}
