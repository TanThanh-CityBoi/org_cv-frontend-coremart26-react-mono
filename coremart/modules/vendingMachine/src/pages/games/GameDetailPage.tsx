/* eslint-disable max-lines-per-function */
import {
	Badge, Box, Button, Divider, FileButton, Group, Select, Stack, Table, Tabs, Text, Textarea, TextInput,
} from '@mantine/core';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { IconDeviceGamepad, IconPlus, IconTrash, IconUpload } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { DetailControlPanel } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { GamePreview } from '../../features/games/components/GamePreview';
import { gameCrudService } from '../../features/games/gameService';
import { useGameDetail, useGameVersions } from '../../features/games/hooks';
import { Game, GameStatus, GameVersion } from '../../features/games/types';


export const GameDetailPage: React.FC = () => {
	const { t: translate } = useTranslation('vending_machine');
	const { id } = useParams<{ id: string }>();
	const { game, isLoading } = useGameDetail(id);
	const { dispatchMethod: updateGame } = useServiceLayer(gameCrudService.update);
	const { addVersion, deleteVersion } = useGameVersions();

	const [isEditing, setIsEditing] = useState(false);
	const [editedGame, setEditedGame] = useState<Partial<Game>>({});
	const [selectedVersion, setSelectedVersion] = useState<GameVersion | undefined>(undefined);
	const [newVersionCode, setNewVersionCode] = useState('');
	const [newVersionDescription, setNewVersionDescription] = useState('');
	const [newVersionSource, setNewVersionSource] = useState('');
	const [isAddingVersion, setIsAddingVersion] = useState(false);

	React.useEffect(() => {
		if (game) {
			setEditedGame({
				code: game.code,
				name: game.name,
				description: game.description,
				status: game.status,
				minAppVersion: game.minAppVersion,
			});
			setSelectedVersion(game.versions.find(
				(v: GameVersion) => v.code === game.latestVersion)
			|| game.versions[0]);
		}
	}, [game]);

	const getStatusBadge = (status: GameStatus) => {
		const statusMap: Record<string, { color: string, label: string }> = {
			active: { color: 'green', label: translate('status.active') },
			inactive: { color: 'gray', label: translate('status.inactive') },
		};
		const statusInfo = statusMap[status] || { color: 'gray', label: status };
		return <Badge color={statusInfo.color}>{statusInfo.label}</Badge>;
	};

	const handleSave = async () => {
		if (!game) return;
		await updateGame({ id: game.id, etag: game.etag, ...editedGame });
		setIsEditing(false);
	};

	const handleCancel = () => {
		if (game) {
			setEditedGame({
				code: game.code,
				name: game.name,
				description: game.description,
				status: game.status,
				minAppVersion: game.minAppVersion,
			});
		}
		setIsEditing(false);
	};

	const handleAddVersion = async () => {
		if (!game || !newVersionCode.trim() || !newVersionSource.trim()) return;

		const newVersion: GameVersion = {
			code: newVersionCode.trim(),
			description: newVersionDescription.trim() || '',
			source: newVersionSource,
			uploadDate: new Date().toISOString(),
		};

		await addVersion(game, newVersion);

		setNewVersionCode('');
		setNewVersionDescription('');
		setNewVersionSource('');
		setIsAddingVersion(false);
	};

	const handleDeleteVersion = async (versionCode: string) => {
		if (!game) return;
		if (window.confirm(translate('games.messages.delete_version_confirm'))) {
			await deleteVersion(game, versionCode);
		}
	};

	const handleFileUpload = (file: File | null) => {
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			const content = e.target?.result as string;
			setNewVersionSource(content);
		};
		reader.readAsText(file);
	};

	const breadcrumbs = [
		{ title: translate('title'), href: '../overview' },
		{ title: translate('menu.mini_game'), href: '../games' },
		{ title: game?.name || translate('games.detail.title'), href: '#' },
	];

	if (isLoading || !game) {
		return (
			<PageContainer
				breadcrumbs={breadcrumbs}
				actionBar={<div />}
			>
				<Text c='dimmed'>{translate('messages.loading')}</Text>
			</PageContainer>
		);
	}

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			actionBar={<DetailControlPanel
				onSave={() => {}}
				onGoBack={() => {}}
				onDelete={() => {}}
			/>}
		>
			<Group gap='xs' mb='md'>
				<IconDeviceGamepad size={26} stroke={1.5} />
				<Text fw={600} size='lg'>{game.name}</Text>
			</Group>

			<Tabs defaultValue='info'>
				<Tabs.List>
					<Tabs.Tab value='info'>{translate('games.tabs.info')}</Tabs.Tab>
					<Tabs.Tab value='versions'>{translate('games.tabs.versions')}</Tabs.Tab>
					<Tabs.Tab value='preview'>{translate('games.tabs.preview')}</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value='info' pt='md'>
					<Stack gap='md'>
						<Group justify='space-between'>
							<Text fw={500} size='lg'>{translate('games.detail.info')}</Text>
							{!isEditing ? (
								<Button size='xs' onClick={() => setIsEditing(true)}>
									{translate('action.edit')}
								</Button>
							) : (
								<Group gap='xs'>
									<Button size='xs' onClick={handleSave}>
										{translate('action.save')}
									</Button>
									<Button size='xs' variant='subtle' onClick={handleCancel}>
										{translate('action.cancel')}
									</Button>
								</Group>
							)}
						</Group>

						<Divider />

						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('games.fields.code')}
							</Text>
							{isEditing ? (
								<TextInput
									value={editedGame.code || ''}
									onChange={(e) => setEditedGame({ ...editedGame, code: e.currentTarget.value })}
								/>
							) : (
								<Text size='sm' fw={500}>{game.code}</Text>
							)}
						</div>

						<Divider />

						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('games.fields.name')}
							</Text>
							{isEditing ? (
								<TextInput
									value={editedGame.name || ''}
									onChange={(e) => setEditedGame({ ...editedGame, name: e.currentTarget.value })}
								/>
							) : (
								<Text size='sm'>{game.name}</Text>
							)}
						</div>

						<Divider />

						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('games.fields.description')}
							</Text>
							{isEditing ? (
								<Textarea
									value={editedGame.description || ''}
									onChange={(e) =>
										setEditedGame({ ...editedGame, description: e.currentTarget.value })}
									rows={4}
								/>
							) : (
								<Text size='sm'>{game.description}</Text>
							)}
						</div>

						<Divider />

						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('games.fields.status')}
							</Text>
							{isEditing ? (
								<Select
									value={editedGame.status}
									onChange={(value) => setEditedGame({ ...editedGame, status: value as GameStatus })}
									data={[
										{ value: 'active', label: translate('status.active') },
										{ value: 'inactive', label: translate('status.inactive') },
									]}
								/>
							) : (
								getStatusBadge(game.status)
							)}
						</div>

						<Divider />

						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('games.fields.latest_version')}
							</Text>
							<Text size='sm'>{game.latestVersion || '-'}</Text>
						</div>

						<Divider />

						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('games.fields.min_app_version')}
							</Text>
							{isEditing ? (
								<TextInput
									value={editedGame.minAppVersion || ''}
									onChange={(e) =>
										setEditedGame({ ...editedGame, minAppVersion: e.currentTarget.value })}
									placeholder='1.0.0'
								/>
							) : (
								<Text size='sm'>{game.minAppVersion || '-'}</Text>
							)}
						</div>

						<Divider />

						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('games.fields.created_at')}
							</Text>
							<Text size='sm'>{new Date(game.createdAt).toLocaleString()}</Text>
						</div>

						<Divider />

						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('games.fields.upload_date')}
							</Text>
							<Text size='sm'>{new Date(game.uploadDate).toLocaleString()}</Text>
						</div>
					</Stack>
				</Tabs.Panel>

				<Tabs.Panel value='versions' pt='md'>
					<Stack gap='md'>
						<Group justify='space-between'>
							<Text fw={500} size='lg'>{translate('games.detail.versions')}</Text>
							<Button
								size='xs'
								leftSection={<IconPlus size={14} />}
								onClick={() => setIsAddingVersion(true)}
							>
								{translate('games.actions.add_version')}
							</Button>
						</Group>

						<Divider />

						{isAddingVersion && (
							<Box p='md' style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: '4px' }}>
								<Stack gap='sm'>
									<TextInput
										label={translate('games.fields.version_code')}
										placeholder='v1.0.0'
										value={newVersionCode}
										onChange={(e) => setNewVersionCode(e.currentTarget.value)}
									/>
									<Textarea
										label={translate('games.fields.version_description')}
										placeholder={translate('games.fields.version_description')}
										value={newVersionDescription}
										onChange={(e) => setNewVersionDescription(e.currentTarget.value)}
										rows={3}
									/>
									<FileButton onChange={handleFileUpload} accept='.html,.htm'>
										{(props) => (
											<Button {...props} leftSection={<IconUpload size={14} />} variant='light'>
												{translate('games.actions.upload_source')}
											</Button>
										)}
									</FileButton>
									{newVersionSource && (
										<Text size='xs' c='green'>
											{translate('games.messages.source_loaded')}
										</Text>
									)}
									<Textarea
										label={translate('games.fields.source')}
										placeholder={translate('games.fields.source_placeholder')}
										value={newVersionSource}
										onChange={(e) => setNewVersionSource(e.currentTarget.value)}
										rows={10}
									/>
									<Group>
										<Button size='xs' onClick={handleAddVersion} disabled={!newVersionCode.trim() || !newVersionSource.trim()}>
											{translate('action.add')}
										</Button>
										<Button size='xs' variant='subtle' onClick={() => {
											setIsAddingVersion(false);
											setNewVersionCode('');
											setNewVersionDescription('');
											setNewVersionSource('');
										}}>
											{translate('action.cancel')}
										</Button>
									</Group>
								</Stack>
							</Box>
						)}

						{game.versions.length > 0 ? (
							<Table striped highlightOnHover>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>{translate('games.fields.version_code')}</Table.Th>
										<Table.Th>{translate('games.fields.version_description')}</Table.Th>
										<Table.Th>{translate('games.fields.upload_date')}</Table.Th>
										<Table.Th style={{ width: 100 }}></Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{game.versions.map((version: GameVersion) => (
										<Table.Tr key={version.code}>
											<Table.Td>
												<Group gap='xs'>
													<Text fw={version.code === game.latestVersion ? 600 : 400}>
														{version.code}
													</Text>
													{version.code === game.latestVersion && (
														<Badge size='xs' color='blue'>
															{translate('games.fields.latest')}
														</Badge>
													)}
												</Group>
											</Table.Td>
											<Table.Td>
												<Text size='sm'>{version.description || '-'}</Text>
											</Table.Td>
											<Table.Td>
												<Text size='sm'>{new Date(version.uploadDate).toLocaleString()}</Text>
											</Table.Td>
											<Table.Td>
												<Group gap='xs'>
													<Button
														variant='subtle'
														color='red'
														size='xs'
														onClick={() => handleDeleteVersion(version.code)}
														disabled={
															version.code === game.latestVersion &&
															game.versions.length === 1
														}
													>
														<IconTrash size={14} />
													</Button>
												</Group>
											</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						) : (
							<Text c='dimmed'>{translate('games.messages.no_versions')}</Text>
						)}
					</Stack>
				</Tabs.Panel>

				<Tabs.Panel value='preview' pt='md'>
					<Stack gap='md'>
						<Text fw={500} size='lg'>{translate('games.detail.preview')}</Text>
						<Divider />
						{game.versions.length > 0 ? (
							<>
								<Select
									label={translate('games.fields.select_version')}
									value={selectedVersion?.code || game.versions[0]?.code}
									onChange={(value) => {
										const version = game.versions.find((v: GameVersion) => v.code === value);
										if (version) {
											setSelectedVersion(version);
										}
									}}
									data={game.versions.map((v: GameVersion) => ({ value: v.code, label: v.code }))}
								/>
								<GamePreview game={game} version={selectedVersion || game.versions[0]} />
							</>
						) : (
							<Text c='dimmed'>{translate('games.messages.no_versions')}</Text>
						)}
					</Stack>
				</Tabs.Panel>
			</Tabs>
		</PageContainer>
	);
};
