/**
 * Mock product master rows used by product picker UI (not a kiosk_event_stock row).
 */
export interface EventCatalogOffer {
	id: string;
	code: string;
	name: string;
	image: string;
	badgeImage?: string;
	/** Typical sell price during event (`kiosk_event_stock.sell_price` scale). */
	suggestedSellPrice: string;
}


export const mockProducts: EventCatalogOffer[] = [
	{
		id: 'prod-1',
		code: 'SP-001',
		name: 'Coca Cola 330ml',
		image: 'https://via.placeholder.com/150?text=Coca+Cola',
		badgeImage: 'https://via.placeholder.com/50?text=NEW',
		suggestedSellPrice: '12000',
	},
	{
		id: 'prod-2',
		code: 'SP-002',
		name: 'Pepsi 330ml',
		image: 'https://via.placeholder.com/150?text=Pepsi',
		badgeImage: 'https://via.placeholder.com/50?text=SALE',
		suggestedSellPrice: '13000',
	},
	{
		id: 'prod-3',
		code: 'SP-003',
		name: '7Up 330ml',
		image: 'https://via.placeholder.com/150?text=7Up',
		suggestedSellPrice: '11000',
	},
	{
		id: 'prod-4',
		code: 'SP-004',
		name: 'Snack Khoai Tây',
		image: 'https://via.placeholder.com/150?text=Snack',
		badgeImage: 'https://via.placeholder.com/50?text=HOT',
		suggestedSellPrice: '15000',
	},
	{
		id: 'prod-5',
		code: 'SP-005',
		name: 'Bánh Quy Socola',
		image: 'https://via.placeholder.com/150?text=Cookie',
		suggestedSellPrice: '20000',
	},
	{
		id: 'prod-6',
		code: 'SP-006',
		name: 'Nước Suối 500ml',
		image: 'https://via.placeholder.com/150?text=Water',
		suggestedSellPrice: '8000',
	},
	{
		id: 'prod-7',
		code: 'SP-007',
		name: 'Kẹo Socola',
		image: 'https://via.placeholder.com/150?text=Candy',
		badgeImage: 'https://via.placeholder.com/50?text=NEW',
		suggestedSellPrice: '10000',
	},
	{
		id: 'prod-8',
		code: 'SP-008',
		name: 'Bánh Mì Sandwich',
		image: 'https://via.placeholder.com/150?text=Sandwich',
		suggestedSellPrice: '25000',
	},
];
