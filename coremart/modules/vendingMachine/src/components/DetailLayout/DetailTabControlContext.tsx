import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ControlPanelProps } from '@/components/ControlPanel';

/** Một reference cố định cho tab không có action — tránh effect chạy lại mỗi render khi gọi `[]`. */
const STABLE_EMPTY_ACTIONS: NonNullable<ControlPanelProps['actions']> = [];

/** Kiểm tra xem hai danh sách action có giống nhau không. Sử dụng để tránh effect chạy lại mỗi render khi gọi `[]`. */
function sameActionLists(
	a: ControlPanelProps['actions'],
	b: ControlPanelProps['actions'],
): boolean {
	if (a === b) return true;
	const lenA = a?.length ?? 0;
	const lenB = b?.length ?? 0;
	if (lenA === 0 && lenB === 0) return true;
	if (!a || !b || lenA !== lenB) return false;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

export type DetailTabControlEntry = {
	actions: ControlPanelProps['actions'];
};

/**
 * Tạo Provider + hooks gắn với tập id tab cụ thể (union từ feature), ví dụ `createDetailTabControl<TabId>()`.
 */
export function createDetailTabControl<T extends string>() {
	type Registry = Partial<Record<T, DetailTabControlEntry>>;

	type DetailTabControlContextValue = {
		registry: Registry;
		registerTab: (tabId: T, entry: DetailTabControlEntry) => void;
		unregisterTab: (tabId: T) => void;
	};

	const DetailTabControlContext = React.createContext<DetailTabControlContextValue | null>(null);

	const DetailTabControlProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
		const [registry, setRegistry] = useState<Registry>({});

		const registerTab = useCallback((tabId: T, entry: DetailTabControlEntry) => {
			setRegistry((prev) => {
				const prevEntry = prev[tabId];
				if (prevEntry && sameActionLists(prevEntry.actions, entry.actions)) return prev;
				return { ...prev, [tabId]: entry };
			});
		}, []);

		const unregisterTab = useCallback((tabId: T) => {
			setRegistry((prev) => {
				const next = { ...prev };
				delete next[tabId];
				return next;
			});
		}, []);

		const value = useMemo(
			() => ({ registry, registerTab, unregisterTab }),
			[registry, registerTab, unregisterTab],
		);

		return (
			<DetailTabControlContext.Provider value={value}>
				{children}
			</DetailTabControlContext.Provider>
		);
	};

	function useDetailTabControl(): DetailTabControlContextValue {
		const ctx = React.useContext(DetailTabControlContext);
		if (!ctx) {
			throw new Error('useDetailTabControl must be used within DetailTabControlProvider');
		}
		return ctx;
	}

	function useRegisterDetailTab(tabId: T, actions: ControlPanelProps['actions']) {
		const { registerTab, unregisterTab } = useDetailTabControl();
		const normalizedActions = !actions?.length ? STABLE_EMPTY_ACTIONS : actions;
		useEffect(() => {
			registerTab(tabId, { actions: normalizedActions });
			return () => unregisterTab(tabId);
		}, [tabId, normalizedActions, registerTab, unregisterTab]);
	}

	return {
		DetailTabControlProvider,
		useDetailTabControl,
		useRegisterDetailTab,
	};
}

/** Mặc định không ràng buộc id tab (string). */
export const {
	DetailTabControlProvider,
	useDetailTabControl,
	useRegisterDetailTab,
} = createDetailTabControl<string>();
