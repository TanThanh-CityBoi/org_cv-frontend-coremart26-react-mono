export function formatFileSize(size: number): string {
	const units = ['B', 'KB', 'MB', 'GB'];
	const index = Math.floor(Math.log(size) / Math.log(1024));
	return `${(size / Math.pow(1024, index)).toFixed(1)} ${units[index]}`;
}