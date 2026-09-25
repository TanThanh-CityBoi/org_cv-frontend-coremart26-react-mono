/** Formatting helpers for media gallery UI (duration, file size). */

export function formatGalleryDuration(seconds?: number): string {
	if (seconds === undefined || seconds === null) return '-';
	const s = Math.round(seconds);
	const mins = Math.floor(s / 60);
	const secs = s % 60;
	return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatGalleryFileSize(bytes?: number): string {
	if (!bytes) return '-';
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
