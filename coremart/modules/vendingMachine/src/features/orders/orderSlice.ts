import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import { ActionReducerMapBuilder, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { SearchOperator, SearchOrder } from '@/types';
import { basePagedReduxState } from '@/types';
import { SortDirection } from '@/types/search-graph';

import { orderService, type OrderDetailLookupParams } from './orderService';
import { VdOrder, type VdRefundOrderItemsBody } from './types';

import type { PagedReduxState, PagedSearchResponse, SearchParams } from '@/types';


export const SLICE_NAME = 'vendingMachine.vendingOrder';
export const DEFAULT_PAGE_SIZE = 10;
export const CHAIN_GROUP_LIST_PAGE_SIZE = 10;

export type VendingOrderState = {
	detail: ReduxActionState<VdOrder>;
	list: PagedReduxState<VdOrder>;
	chainGroupList: PagedReduxState<VdOrder>;
	refund: ReduxActionState;
};

export const initialVendingOrderState: VendingOrderState = {
	detail: baseReduxActionState,
	list: basePagedReduxState(DEFAULT_PAGE_SIZE),
	chainGroupList: basePagedReduxState(CHAIN_GROUP_LIST_PAGE_SIZE),
	refund: baseReduxActionState,
};

export const listOrders = createAsyncThunk<
	PagedSearchResponse<VdOrder>,
	SearchParams<VdOrder> | undefined,
	{ rejectValue: string }
>(`${SLICE_NAME}/listOrders`, async (params, { rejectWithValue }) => {
	try {
		const order: SearchOrder[] = [['created_at', SortDirection.DESC]];
		return await orderService.searchOrders({
			...(params || {}),
			graph: { order, ...((params || {}).graph || {}) },
		});
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to list orders';
		return rejectWithValue(errorMessage);
	}
});

export const getOrder = createAsyncThunk<VdOrder, OrderDetailLookupParams, { rejectValue: string }>(
	`${SLICE_NAME}/getOrder`,
	async (params, { rejectWithValue }) => {
		try {
			return await orderService.getOrderDetail(params);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get order';
			return rejectWithValue(errorMessage);
		}
	},
);

export const refundOrderItems = createAsyncThunk<
	void,
	{ orderId: string; body: VdRefundOrderItemsBody },
	{ rejectValue: string }
>(`${SLICE_NAME}/refundOrderItems`, async ({ orderId, body }, { rejectWithValue }) => {
	try {
		await orderService.refundOrderItems(orderId, body);
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to refund order';
		return rejectWithValue(errorMessage);
	}
});

/** Danh sách đơn cùng nhóm (cùng `chain_key`) — dùng trên màn chi tiết đơn. */
export const listOrdersByChainKey = createAsyncThunk<
	PagedSearchResponse<VdOrder>,
	{ chainKey: string; page?: number; size?: number },
	{ rejectValue: string }
>(`${SLICE_NAME}/listOrdersByChainKey`, async (
	{ chainKey, page = 0, size = CHAIN_GROUP_LIST_PAGE_SIZE },
	{ rejectWithValue },
) => {
	try {
		return await orderService.searchOrders({
			page,
			size,
			graph: {
				and: [{ if: ['chain_key', SearchOperator.EQUAL, chainKey] }],
			},
		});
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to list orders by chain';
		return rejectWithValue(errorMessage);
	}
});

const vendingOrderSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialVendingOrderState,
	reducers: {
		clearOrderDetail: (state) => {
			state.detail = baseReduxActionState;
		},
		resetRefundOrderItems: (state) => {
			state.refund = baseReduxActionState;
		},
		clearChainGroupOrders: (state) => {
			state.chainGroupList = basePagedReduxState(CHAIN_GROUP_LIST_PAGE_SIZE);
		},
	},
	extraReducers: (builder) => {
		listOrdersReducers(builder);
		getOrderReducers(builder);
		refundOrderItemsReducers(builder);
		listOrdersByChainKeyReducers(builder);
	},
});

function listOrdersReducers(builder: ActionReducerMapBuilder<VendingOrderState>) {
	builder
		.addCase(listOrders.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
		})
		.addCase(listOrders.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.items = action.payload.items;
			state.list.error = null;
			state.list.total = action.payload.total;
			state.list.page = action.payload.page;
			state.list.size = action.payload.size;
		})
		.addCase(listOrders.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.error = action.payload || 'Failed to list orders';
			state.list.items = [];
		});
}

function getOrderReducers(builder: ActionReducerMapBuilder<VendingOrderState>) {
	builder
		.addCase(getOrder.pending, (state, action) => {
			state.detail.status = 'pending';
			state.detail.error = null;

			const reqArgs = action.meta.arg;
			const isNewRequest = ('id' in reqArgs && state.detail.data?.id !== reqArgs.id)
			|| ('orderCode' in reqArgs && state.detail.data?.orderCode !== reqArgs.orderCode);
			if (isNewRequest) {
				state.detail.data = undefined;
			}
		})
		.addCase(getOrder.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
		})
		.addCase(getOrder.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.error = action.payload || 'Failed to get order';
			state.detail.data = undefined;
		});
}

function refundOrderItemsReducers(builder: ActionReducerMapBuilder<VendingOrderState>) {
	builder
		.addCase(refundOrderItems.pending, (state, action) => {
			state.refund.status = 'pending';
			state.refund.error = null;
			state.refund.requestId = action.meta.requestId;
		})
		.addCase(refundOrderItems.fulfilled, (state, action) => {
			state.refund.status = 'success';
			state.refund.error = null;
			state.refund.requestId = action.meta.requestId;
		})
		.addCase(refundOrderItems.rejected, (state, action) => {
			state.refund.status = 'error';
			state.refund.error = action.payload || 'Failed to refund order';
			state.refund.requestId = action.meta.requestId;
		});
}

function listOrdersByChainKeyReducers(builder: ActionReducerMapBuilder<VendingOrderState>) {
	builder
		.addCase(listOrdersByChainKey.pending, (state) => {
			state.chainGroupList.status = 'pending';
			state.chainGroupList.error = null;
		})
		.addCase(listOrdersByChainKey.fulfilled, (state, action) => {
			state.chainGroupList.status = 'success';
			state.chainGroupList.items = action.payload.items;
			state.chainGroupList.error = null;
			state.chainGroupList.total = action.payload.total;
			state.chainGroupList.page = action.payload.page;
			state.chainGroupList.size = action.payload.size;
		})
		.addCase(listOrdersByChainKey.rejected, (state, action) => {
			state.chainGroupList.status = 'error';
			state.chainGroupList.error = action.payload || 'Failed to list orders by chain';
			state.chainGroupList.items = [];
		});
}

export const actions = { ...vendingOrderSlice.actions };
export const { reducer } = vendingOrderSlice;
