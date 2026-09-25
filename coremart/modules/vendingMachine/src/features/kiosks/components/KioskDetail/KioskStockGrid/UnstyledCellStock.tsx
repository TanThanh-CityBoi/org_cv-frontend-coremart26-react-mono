/* eslint-disable max-lines-per-function */
import blankPicture from '@nikkierp/ui/assets/images/blank-picture.png';
import {
	IconCircleCheck, IconDeviceTabletExclamation,
	IconEdit, IconPlus, IconTrash, IconClipboardCheck, IconCopy,
	IconMinus,
} from '@tabler/icons-react';
import { useEffect, useState, FC, memo as reactMemo } from 'react';
import { useTranslation } from 'react-i18next';

import classes from './UnstyledCellStock.module.css';
import { getLocalizedName, LanguageCode } from '../../../../../common/helpers';


import type { CellStockItem } from './kioskStock.types';


type CellStockProps = {
	readOnly: boolean,
	row: string, // Grid row
	col: string, // Grid column
	cellData?: CellStockItem | null,
	handleCopyCell: (cell: CellStockItem) => void,
	handlePasteCell: (row: string, col: string) => void,
	handleDeleteCell: (row: string, col: string) => void,
	handleEditCell: (cell: CellStockItem) => void,
	onAssignStock: (row: string, col: string) => void,
	onEditDetail: (row: string, col: string) => void,
};



const ProductTitle = ({ name, sku }: { name: CellStockItem['name'], sku: string }) => {
	const { i18n } = useTranslation('vending_machine');
	const currentLanguage = i18n.language as LanguageCode;

	{/* <div className={classes.tooltip}>
		<p className={classes.productName}>
			{getLocalizedName(name, currentLanguage)}
		</p>
		<p className={classes.productCode}>
			SKU: {sku || '---'}
		</p>
		<span className={classes.tooltipText}>
			{getLocalizedName(name, currentLanguage)} <br />
			SKU: {sku || '---'}
		</span>
	</div> */}

	return (
		<div>
			<p className={classes.productName}>
				{getLocalizedName(name, currentLanguage)}
			</p>
			<p className={classes.productCode}>
				SKU: {sku || '---'}
			</p>
		</div>
	);
};


const CellStockComponent: FC<CellStockProps> = (props) => {
	const {
		readOnly,
		cellData,
		row: currentRow,
		col: currentCol,
		handleCopyCell,
		handlePasteCell,
		handleDeleteCell,
		handleEditCell,
		onAssignStock,
		onEditDetail,
	} = props;

	const [cell, setCell] = useState<CellStockItem | null>(cellData || null);
	const [internalQuantity, setInternalQuantity] = useState<number | string | undefined>(cell?.quantity || 0);

	const handleQuantityChange = (value: number) => {
		setCell({ ...cell, quantity: Number(value) || 0 } as CellStockItem);
		if ((value || value == 0) && cell && Number(value) <= cell.maxQuantity && Number(value) >= 0) {
			handleEditCell({
				...cell,
				quantity: Number(value) || 0,
			});
		}
	};

	const onQuantityInputChange = (targetValue: string | number | undefined) => {
		if (targetValue === '' || targetValue === undefined) {
			setInternalQuantity('');
			return;
		}

		const value = Number(targetValue);
		if (!Number.isNaN(value)) {
			if(value > (cell?.maxQuantity || 0)) {
				setInternalQuantity(String(cell?.maxQuantity || 1));
				handleQuantityChange(cell?.maxQuantity || 1);
				return;
			}
			if(value < 0) {
				setInternalQuantity(String(0));
				handleQuantityChange(0);
				return;
			}
			setInternalQuantity(String(value));
			handleQuantityChange(value);
		}
	};

	const onQuantityInputBlur = () => {
		if (!internalQuantity || Number.isNaN(Number(internalQuantity))) {
			setInternalQuantity(Number(cell?.quantity || 0));
		}
	};

	const quantityStr = `${cell?.quantity || 0} / ${cell?.maxQuantity || 0}`;

	const btnAssign = (
		<button
			type='button'
			className={classes.lightIconBtn}
			onClick={() => onAssignStock(currentRow, currentCol)}
		>
			<IconPlus size={19} />
		</button>
	);

	const btnCopy = (
		<button
			type='button'
			className={classes.lightIconBtn}
			onClick={() => cell && handleCopyCell(cell)}
		>
			<IconCopy size={19} />
		</button>
	);

	const btnPaste = (
		<button
			type='button'
			className={classes.lightIconBtn}
			onClick={() => handlePasteCell(currentRow, currentCol)}
		>
			<IconClipboardCheck size={19} />
		</button>
	);

	useEffect(() => {
		setCell(cellData || null);
		setInternalQuantity(cellData?.quantity || 0);
	}, [cellData]);

	const EmptyStock = () => {
		if (readOnly) {
			return (
				<div className={classes.stack}>
					<div className={classes.emptyIconBox}>
						<IconDeviceTabletExclamation stroke={1.5} size={52} color='#868e96'/>
					</div>
					<span className={classes.emptyText}>
						No stock
					</span>
				</div>
			);
		}
		return (
			<div className={classes.stack}>
				{btnAssign}
				{btnPaste}
			</div>
		);
	};

	if (!cell) {
		return (
			<div className={classes.root}>
				<EmptyStock />
			</div>
		);
	};

	return (
		<div className={classes.root}>
			<div className={classes.topRow}>
				<div className={classes.imageBox}>
					<img
						alt='stock'
						className={classes.image}
						onError={(e) => {
							(e.target as HTMLImageElement).src = blankPicture;
						}}
						loading='lazy'
						src={cell?.imageUrl ? cell.imageUrl : blankPicture}
					/>
				</div>
				{!readOnly && (
					<div className={classes.actionsColumn}>
						{btnCopy}
						{btnPaste}
					</div>
				)}
			</div>

			<ProductTitle name={cell?.name} sku={cell?.sku || '---'} />

			{/* Read Only Row */}
			{readOnly && (
				<div className={classes.readOnlyRow}>
					<IconCircleCheck
						size={19}
						color={cell?.isEnabled ? 'limegreen' : 'red'}
					/>
					<span style={{ whiteSpace: 'nowrap', lineHeight: '1' }}>{quantityStr}</span>
				</div>
			)}

			{/* Quantity */}
			{!readOnly && (
				<div className={classes.quantityRow}>
					<button
						type='button'
						className={`${classes.subtleIconBtn} ${classes.subtleIconBtn_quantity}`}
						onClick={() => onQuantityInputChange(Number(internalQuantity || 1) - 1)}
					>
						<IconMinus size={12} />
					</button>
					<input
						className={classes.quantityInput}
						value={internalQuantity}
						onBlur={() => onQuantityInputBlur()}
						onChange={(e) => onQuantityInputChange(e.target.value)}
					/>
					<div className={classes.maxBox}>
						{cell?.maxQuantity}
					</div>
					<button
						type='button'
						className={`${classes.subtleIconBtn} ${classes.subtleIconBtn_quantity}`}
						onClick={() => onQuantityInputChange(Number(internalQuantity || 1) + 1)}
					>
						<IconPlus size={12} />
					</button>
				</div>
			)}

			{/* Footer */}
			{!readOnly && (
				<div className={classes.footer}>
					<button
						type='button'
						className={`${classes.subtleIconBtn} ${classes.subtleIconBtn_danger}`}
						onClick={() => handleDeleteCell(currentRow, currentCol)}
						aria-label='Remove'
					>
						<IconTrash size={19} />
					</button>
					<label className={classes.switch}>
						<input
							type='checkbox'
							role='switch'
							aria-checked={cell.isEnabled}
							className={classes.switchInput}
							checked={cell.isEnabled}
							onChange={(event) => {
								const isChecked = event.currentTarget.checked;
								setCell({
									...cell,
									isEnabled: isChecked,
								});
								handleEditCell({
									...cell,
									isEnabled: isChecked,
								});
							}}
						/>
						<span className={classes.switchTrack} />
						<span className={classes.switchThumb} />
					</label>
					<button
						type='button'
						className={`${classes.subtleIconBtn} ${classes.subtleIconBtn_edit}`}
						onClick={() => onEditDetail(currentRow, currentCol)}
						aria-label='Edit'
					>
						<IconEdit size={19} />
					</button>
				</div>
			)}
		</div>
	);
};


export const UnstyledCellStock = reactMemo(CellStockComponent, (
	prevProps: CellStockProps,
	nextProps: CellStockProps,
) => {
	return (
		prevProps.readOnly === nextProps.readOnly &&
		prevProps.row === nextProps.row &&
		prevProps.col === nextProps.col &&
		prevProps.cellData?.stockId === nextProps.cellData?.stockId &&
		prevProps.cellData?.productRef === nextProps.cellData?.productRef &&
		prevProps.cellData?.row === nextProps.cellData?.row &&
		prevProps.cellData?.col === nextProps.cellData?.col &&
		prevProps.cellData?.name === nextProps.cellData?.name &&
		prevProps.cellData?.sku === nextProps.cellData?.sku &&
		prevProps.cellData?.imageUrl === nextProps.cellData?.imageUrl &&
		prevProps.cellData?.isEnabled === nextProps.cellData?.isEnabled &&
		prevProps.cellData?.quantity === nextProps.cellData?.quantity &&
		prevProps.cellData?.maxQuantity === nextProps.cellData?.maxQuantity
	);
});
