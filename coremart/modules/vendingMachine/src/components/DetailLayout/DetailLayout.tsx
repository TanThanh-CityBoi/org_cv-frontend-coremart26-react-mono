import { Avatar, Box, Group, Stack, Tabs, Text } from '@mantine/core';
import { IconDeviceDesktop } from '@tabler/icons-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';


type DetailLayoutTab = {
	id: string;
	title: string;
	content: React.ReactNode | (() => React.ReactNode);
};

type DetailLayoutHeader = {
	title: React.ReactNode;
	subtitle?: React.ReactNode;
	avatar?: React.ReactNode;
};

export type DetailLayoutProps = React.ComponentProps<typeof Stack> & {
	header?: DetailLayoutHeader;
	sections?: React.ReactNode[];

	/**
	 * Tabs to display in the layout.
	 * If only one tab is provided, it will be displayed without the tabs component.
	 * The tab id is the value of the tab's `id` property.
	 */
	tabs?: DetailLayoutTab[];
	/**
	 * The id of the active tab.
	 * If not provided, the first tab will be used.
	 * The tab id is the value of the tab's `id` property.
	 */
	activeTab?: string;
	/**
	 * Callback to handle tab change.
	 * If not provided, the active tab will be updated internally.
	 * The tab id is the value of the tab's `id` property.
	 */
	onTabChange?: (value: string) => void;

	/**
	 * When true, keep the active tab in the URL as `?tab=<tabs[].id>` (react-router).
	 * Ignores `activeTab` for the selected tab; `onTabChange` still runs.
	 */
	syncWithUrl?: boolean;
};


const URL_TAB_PARAM = 'tab';

function tabIdFromSearchParam(raw: string | null): string | null {
	if (raw == null || raw === '') {
		return null;
	}
	return raw.replace(/^['"]+|['"]+$/g, '').trim() || null;
}

function useDetailLayoutTabSelection(
	tabs: DetailLayoutProps['tabs'],
	activeTab: string | undefined,
	onTabChange: ((value: string) => void) | undefined,
	syncWithUrl: boolean | undefined,
): {
	currentActiveTab: string;
	handleTabChange: (value: string | null) => void;
} {
	const defaultTabId = tabs?.[0]?.id ?? '0';
	const [searchParams, setSearchParams] = useSearchParams();
	const [internalActiveTab, setInternalActiveTab] = useState<string>(defaultTabId);

	const tabIdSet = useMemo(() => new Set(tabs?.map((t) => t.id) ?? []), [tabs]);
	const urlTabRaw = tabIdFromSearchParam(searchParams.get(URL_TAB_PARAM));
	const urlTab = urlTabRaw && tabIdSet.has(urlTabRaw) ? urlTabRaw : null;

	const handleTabChange = useCallback((value: string | null | undefined) => {
		if(!tabs || tabs.length <= 1) return;

		const newValue = value && tabIdSet.has(value) ? value : defaultTabId;
		if(newValue === internalActiveTab) return;

		setInternalActiveTab(newValue);
		onTabChange?.(newValue);
		if(syncWithUrl) {
			setSearchParams((prev) => {
				const next = new URLSearchParams(prev);
				next.set(URL_TAB_PARAM, newValue);
				return next;
			}, { replace: true });
		}
	}, [syncWithUrl, tabs, tabIdSet, defaultTabId, internalActiveTab, setSearchParams, onTabChange]);

	useEffect(() => {
		handleTabChange(activeTab);
	}, [activeTab]);

	useEffect(() => {
		if (syncWithUrl) {
			handleTabChange(urlTab);
			if(!urlTab){
				setSearchParams((prev) => {
					const next = new URLSearchParams(prev);
					next.set(URL_TAB_PARAM, defaultTabId);
					return next;
				}, { replace: true });
			}
		}
	}, []);

	return { currentActiveTab: internalActiveTab, handleTabChange };
}


const HeaderAvatar: React.FC<{ avatar?: DetailLayoutHeader['avatar'] }> = ({ avatar }) => {
	return (
		<Avatar
			src={typeof avatar === 'string' ? avatar : undefined}
			size={60} radius='md'
		>
			{
				avatar && typeof avatar !== 'string'
					? avatar
					: <IconDeviceDesktop size={46} />
			}
		</Avatar>
	);
};

const DetailLayoutHeader: React.FC<{ header?: DetailLayoutProps['header'] }> = ({ header }) => {
	if (!header?.title) return <></>;

	const renderTitle = () => {
		if(typeof header.title === 'string'){
			return <Text fw={600} size='lg' lh={1} mb={'xs'}>{header.title}</Text>;
		}
		return header.title;
	};

	const renderSubtitle = () => {
		if(typeof header.subtitle === 'string'){
			return <Text size='sm' c='dimmed'>{header.subtitle}</Text>;
		}
		return header.subtitle;
	};

	return (
		<Group gap='xs' align='start'>
			<HeaderAvatar avatar={header.avatar} />
			<Box flex={1} miw={0} py={3}>
				{renderTitle()}
				{renderSubtitle()}
			</Box>
		</Group>
	);
};

const DetailLayoutSections: React.FC<{ sections?: DetailLayoutProps['sections'] }> = ({ sections = [] }) => {
	return sections.map((section, index) => (
		<Box key={index}>
			{section}
		</Box>
	));
};


const DetailLayoutTabs: React.FC<{
	tabs?: DetailLayoutProps['tabs'];
	activeTab?: string;
	onTabChange?: (value: string) => void;
	syncWithUrl?: boolean;
}> = ({ tabs, activeTab, onTabChange, syncWithUrl }) => {

	const enableSyncWithUrl = syncWithUrl && tabs && tabs.length > 1;
	const { currentActiveTab, handleTabChange } = useDetailLayoutTabSelection(
		tabs,
		activeTab,
		onTabChange,
		enableSyncWithUrl,
	);

	const renderTabContent = (tab: DetailLayoutTab, activeTab: string) => {
		if(activeTab !== tab.id) return null;
		return typeof tab.content === 'function' ? tab.content() : tab.content;
	};

	if (!tabs?.length) return <></>;
	if (tabs.length === 1) {
		const indexTab = tabs[0];
		return (
			<Box>
				<Text fw={500} size='md' lh={1} mb={'xs'}>{indexTab.title}</Text>
				{renderTabContent(indexTab, currentActiveTab)}
			</Box>
		);
	}

	return (
		<Tabs value={currentActiveTab} onChange={handleTabChange}>
			<Tabs.List>
				{tabs.map((tab) => (
					<Tabs.Tab key={tab.id} value={tab.id}>
						{tab.title}
					</Tabs.Tab>
				))}
			</Tabs.List>

			{tabs.map((tab) => (
				<Tabs.Panel key={tab.id} value={tab.id} py='md'>
					{renderTabContent(tab, currentActiveTab)}
				</Tabs.Panel>
			))}
		</Tabs>
	);
};


export const DetailLayout: React.FC<DetailLayoutProps> = ({
	header,
	sections,
	tabs,
	activeTab,
	onTabChange,
	syncWithUrl,
	...rest
}) => {
	return (
		<Stack gap='sm' p={6} {...rest}>
			<DetailLayoutHeader header={header} />
			<DetailLayoutSections sections={sections} />
			<DetailLayoutTabs
				tabs={tabs}
				activeTab={activeTab}
				onTabChange={onTabChange}
				syncWithUrl={syncWithUrl}
			/>
		</Stack>
	);
};