import { IconPlaylist } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { ControlPanel } from '@/components';
import { ArchivedStatusBadge } from '@/components/ArchivedStatusBadge';
import { DetailLayout } from '@/components/DetailLayout';
import { PageContainer } from '@/components/PageContainer';
import {
	MediaPlaylistDetailTabControlProvider,
	type MediaPlaylistDetailTabId,
	useMediaPlaylistDetailPageConfig,
} from '@/features/mediaPlaylist/components/MediaPlaylistDetail';
import { useMediaPlaylistDetail } from '@/features/mediaPlaylist/hooks';


export const MediaPlaylistDetailPage: React.FC = () => {
	return (
		<MediaPlaylistDetailTabControlProvider>
			<MediaPlaylistDetailPageContent />
		</MediaPlaylistDetailTabControlProvider>
	);
};

const MediaPlaylistDetailPageContent: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const { t: translate } = useTranslation();
	const { playlist, isLoading } = useMediaPlaylistDetail(id);
	const { breadcrumbs, actions, tabs, activeTab, onTabChange } = useMediaPlaylistDetailPageConfig({ playlist });

	return (
		<PageContainer
			documentTitle={playlist?.name ?? translate('coremart.vendingMachine.mediaPlaylist.detail.title')}
			breadcrumbs={breadcrumbs}
			sections={[<ControlPanel key='media-playlist-detail-actions' actions={actions} />]}
			isLoading={isLoading && !playlist}
			isNotFound={!playlist && !isLoading}
		>
			<DetailLayout
				header={{
					title: playlist?.name || '',
					subtitle: <ArchivedStatusBadge isArchived={!!playlist?.isArchived} />,
					avatar: <IconPlaylist size={40} stroke={1.5}/>,
				}}
				syncWithUrl
				tabs={tabs}
				activeTab={activeTab}
				onTabChange={(value) => onTabChange(value as MediaPlaylistDetailTabId)}
			/>
		</PageContainer>
	);
};
