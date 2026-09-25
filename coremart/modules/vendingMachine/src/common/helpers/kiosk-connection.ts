import { ConnectionHistory, ConnectionStatus } from '../../features/kiosks';


export const CONNECTION_STATUS_THRESHOLD = 5;

export const getCurrentConnectionStatus = (
	lastConnection: ConnectionHistory | undefined,
	threshold: number = CONNECTION_STATUS_THRESHOLD,
): ConnectionStatus => {
	if (!lastConnection) return ConnectionStatus.LOST;
	const {createdAt, status} = lastConnection || {};
	if (!createdAt || isNaN(new Date(createdAt).getTime())) return ConnectionStatus.LOST;

	const now = new Date();
	const createdAtDate = new Date(createdAt);
	const diffTime = Math.abs(now.getTime() - createdAtDate.getTime());
	const diffMinutes = Math.ceil(diffTime / (1000 * 60));

	if (diffMinutes < threshold) {
		return status;
	}
	return ConnectionStatus.LOST;
};