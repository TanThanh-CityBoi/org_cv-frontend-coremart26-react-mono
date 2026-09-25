/* eslint-disable max-lines-per-function */
import { Box, Center, Flex, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useCallback, useMemo, useRef, useState, FC, useEffect } from 'react';

import { useKioskPositionEdit, useKioskStock } from '@/features/kiosks/hooks';
import { Kiosk } from '@/features/kiosks/types';

import { AssignStockPositionModal } from './AssignStockPositionModal';
import { EditStockPositionModal } from './EditStockPositionModal';
import {
	computeKioskStockToGrid,
	computeUpdatePosition,
	getCellKey,
	ROW_LETTERS,
} from './kioskStock.helpers';
import { UnstyledCellStock } from './UnstyledCellStock';
import { useKioskStockGridTab } from '../hooks/useKioskStockGridTab';

import type { CellStockItem, KioskStockCol, KioskStockGridMap, KioskStockRow } from './kioskStock.types';


interface KioskStockGridProps {
	kiosk: Kiosk;
}

const ROW_NUMBER = 10;
const COL_NUMBER = 10;

export const KioskStockGrid: FC<KioskStockGridProps> = (props) => {
	const { kiosk } = props;
	const rowNumber = kiosk?.model?.shelvesNumber ?? ROW_NUMBER;
	const BASE_COLS = useMemo(() => Array.from({ length: COL_NUMBER }, (_, index) => index + 1), []);
	const BASE_ROWS = useMemo(() => ROW_LETTERS.slice(0, rowNumber), [rowNumber]);

	const cellClipboardRef = useRef<CellStockItem | null>(null);
	const kioskStockGridRef = useRef<KioskStockGridMap>(new Map());
	/** Cell keys (`row-col`) touched in edit mode; used for [PUT] …/positions. */
	const updateRef = useRef<string[]>([]);

	const [_updatedCount, setUpdatedCount] = useState(0);
	const refreshUIState = useCallback(() => {
		setUpdatedCount((prev) => prev + 1);
	}, [setUpdatedCount]);

	const { stocks: kioskStocks, isLoading: isLoadingStocks, refetch: refetchKioskStocks } = useKioskStock(kiosk.id);

	const clearUpdatedCellKeys = useCallback(() => {
		updateRef.current = [];
	}, [updateRef]);

	const onUpdateSuccess = useCallback(() => {
		notifications.show({
			title: 'Success',
			message: 'Kiosk positions updated',
			color: 'green',
		});
		clearUpdatedCellKeys();
		refetchKioskStocks();
	}, [refetchKioskStocks, notifications, clearUpdatedCellKeys]);

	const onUpdateFailure = useCallback(() => {
		notifications.show({
			title: 'Error',
			message: 'Failed to update kiosk positions',
			color: 'red',
		});
	}, [notifications]);

	const { handleSubmitPositions, isSubmitting } = useKioskPositionEdit({
		kioskId: kiosk.id,
		onUpdateSuccess,
		onUpdateFailure,
	});

	const [cellDetailOpen, setCellDetailOpen] = useState(false);
	const [cellDetailContext, setCellDetailContext] = useState<{
		row: string;
		col: string;
		cell: CellStockItem | null;
	} | null>(null);

	const [assignOpen, setAssignOpen] = useState(false);
	const [assignSlot, setAssignSlot] = useState<{ row: string; col: string } | null>(null);

	const addUpdatedCellKey = useCallback((cellKey: string) => {
		if (updateRef.current.includes(cellKey)) {
			return;
		}
		updateRef.current = [...updateRef.current, cellKey];
	}, []);

	/** Cập nhật từng position đã sửa — [PUT] …/positions. */
	const handleSaveGrid = useCallback(async () => {
		const keys = [...updateRef.current];
		const positions = computeUpdatePosition(keys, kioskStockGridRef.current);
		handleSubmitPositions(positions);
	}, [handleSubmitPositions]);

	const handleResetGrid = useCallback(() => {
		if (!isLoadingStocks) {
			kioskStockGridRef.current = computeKioskStockToGrid(kioskStocks);
			clearUpdatedCellKeys();
			refreshUIState();
		}
	}, [kioskStocks, isLoadingStocks, kioskStockGridRef, clearUpdatedCellKeys, refreshUIState]);

	const handleFillAllGrid = useCallback(() => {
		const prev = kioskStockGridRef.current;
		const next = new Map(prev);

		prev.forEach((cell: CellStockItem | null, key: string) => {
			if (cell && cell.quantity < cell.maxQuantity) {
				next.set(key, { ...cell, quantity: cell.maxQuantity });
				addUpdatedCellKey(key);
			}
		});

		kioskStockGridRef.current = next;
		refreshUIState();
	}, [kioskStockGridRef, addUpdatedCellKey, refreshUIState]);

	const { isEditing, isPending } = useKioskStockGridTab({
		handleResetGrid,
		handleFillAllGrid,
		handleSaveGrid,
	});

	useEffect(() => {
		if (!isLoadingStocks) {
			kioskStockGridRef.current = computeKioskStockToGrid(kioskStocks);
			clearUpdatedCellKeys();
			refreshUIState();
		}
	}, [kioskStocks, isLoadingStocks, clearUpdatedCellKeys, refreshUIState]);


	const handleCopyCell = useCallback((cell: CellStockItem) => {
		// notifications.show({
		// 	title: 'COPY',
		// 	message: `Copy cell at ${cell.row}${cell.col}`,
		// 	color: 'blue',
		// });

		cellClipboardRef.current = cell;
	}, [cellClipboardRef]);

	const handlePasteCell = useCallback((row: string, col: string) => {
		if (!cellClipboardRef.current) {
			// notifications.show({
			// 	title: 'Error',
			// 	message: 'No cell copied',
			// 	color: 'red',
			// });
			return;
		}

		// notifications.show({
		// 	title: 'PASTE',
		// 	message: `Paste cell to ${row}${col}`,
		// 	color: 'green',
		// });

		const key = getCellKey(row, col);
		const newCell = {
			...cellClipboardRef.current,
			row: row as KioskStockRow,
			col: Number(col) as KioskStockCol,
		};
		kioskStockGridRef.current.set(key, newCell);
		addUpdatedCellKey(key);
		refreshUIState();
	}, [kioskStockGridRef, cellClipboardRef, addUpdatedCellKey, refreshUIState]);

	const handleDeleteCell = useCallback((row: string, col: string) => {
		const key = getCellKey(row, col);
		addUpdatedCellKey(key);
		kioskStockGridRef.current.delete(key);
		refreshUIState();
	}, [kioskStockGridRef, addUpdatedCellKey, refreshUIState]);

	const handleEditCell = useCallback((cell: CellStockItem) => {
		const key = getCellKey(cell.row, cell.col);
		kioskStockGridRef.current.set(key, cell);
		addUpdatedCellKey(key);
		refreshUIState();
	}, [kioskStockGridRef, addUpdatedCellKey, refreshUIState]);

	const onAssignStock = useCallback((row: string, col: string) => {
		setAssignSlot({ row, col });
		setAssignOpen(true);
	}, []);

	const onCloseAssign = useCallback(() => {
		setAssignOpen(false);
		setAssignSlot(null);
	}, []);

	const onConfirmAssign = useCallback(
		(cell: CellStockItem) => {
			handleEditCell(cell);
		},
		[handleEditCell],
	);

	const onEditCellDetail = useCallback((row: string, col: string) => {
		const key = getCellKey(row, col);
		const cell = kioskStockGridRef.current.get(key) ?? null;
		setCellDetailContext({ row, col, cell });
		setCellDetailOpen(true);
	}, [kioskStockGridRef]);

	const onCloseCellDetail = useCallback(() => {
		setCellDetailOpen(false);
		setCellDetailContext(null);
	}, []);

	const onCellDetailSave = useCallback(
		(updated: CellStockItem) => {
			handleEditCell(updated);
		},
		[handleEditCell],
	);

	return (
		<Box h='calc(100vh - 200px)' mih={500} pos='relative' style={{ overflow: 'auto' }}>
			<AssignStockPositionModal
				opened={assignOpen}
				onClose={onCloseAssign}
				row={assignSlot?.row as KioskStockRow}
				col={assignSlot?.col ?? '1'}
				stocks={kioskStocks}
				onAssign={onConfirmAssign}
			/>
			<EditStockPositionModal
				opened={cellDetailOpen}
				onClose={onCloseCellDetail}
				canEditPosition={isEditing}
				row={cellDetailContext?.row ?? ''}
				col={cellDetailContext?.col ?? ''}
				cell={cellDetailContext?.cell ?? null}
				onSave={onCellDetailSave}
			/>
			{(isPending || isSubmitting) && (
				<Box
					pos='absolute' top={0} left={0} right={0} bottom={0}
					bg='rgba(255,255,255,0.5)' style={{ zIndex: 20, pointerEvents: 'none' }}
				/>
			)}
			<Box w='100%'>
				<Flex
					pos='sticky' top={0} h={30} miw='100%' w='fit-content'
					gap='xs' align='center' mb='xs' style={{ zIndex: 10 }}
				>
					<Box pos='sticky' left={0} w={30} miw={30} h='100%' bg='gray.1'/>
					<Flex justify='center' align='center' gap={'xs'} w='100%'>
						{BASE_COLS.map((_, index) => (
							<Center
								key={index}
								flex={1} w='100%' miw={160} h={30} fz='sm' bd='1px solid rgba(0, 0, 0, 0.1)'
								p={5} ta='center' bg='white'
							>
								{index + 1}
							</Center>
						))}
					</Flex>
				</Flex>
				<Flex justify='center' align='start' gap={'xs'} miw='100%' w='fit-content'>
					<Stack pos='sticky' left={0} w={30} miw={30} h='100%' gap='xs' style={{ zIndex: 10 }}>
						{BASE_ROWS.map((rowStr, index) => (
							<Center key={index} w={30} h={200} bg='gray.1'>
								{rowStr}
							</Center>
						))}
					</Stack>
					<Stack w='100%' h='100%' gap='xs'>
						{BASE_ROWS.map((rowStr, index) => (
							<Flex key={index} w='100%' gap='xs'>
								{BASE_COLS.map((colNumber) => {
									const cellKey = getCellKey(rowStr, colNumber);
									const cellData = kioskStockGridRef.current.get(cellKey);
									return (
										<UnstyledCellStock
											key={cellKey}
											readOnly={!isEditing}
											row={rowStr}
											col={String(colNumber)}
											cellData={cellData}
											handleCopyCell={handleCopyCell}
											handlePasteCell={handlePasteCell}
											handleDeleteCell={handleDeleteCell}
											handleEditCell={handleEditCell}
											onAssignStock={onAssignStock}
											onEditDetail={onEditCellDetail}
										/>
									);
								})}
							</Flex>
						))}
					</Stack>
				</Flex>
			</Box>
		</Box>
	);
};


