export interface Setting {
	id: string;
	code: string;
	name: string;
	description?: string;
	config?: Record<string, unknown> | null;
	orgId?: string | null;
	isArchived: boolean;
	createdAt: string;
	updatedAt?: string | null;
	etag: string;
}

export type SettingListViewMode = 'list' | 'grid';
