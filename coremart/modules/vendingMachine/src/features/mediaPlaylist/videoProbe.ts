/**
 * Reads `HTMLVideoElement.duration` after metadata loads (seconds).
 * Fails silently if CORS blocks metadata or the URL is not a video.
 */
export function probeVideoDurationSec(streamUrl: string): Promise<number | undefined> {
	return new Promise((resolve) => {
		const video = document.createElement('video');
		video.preload = 'metadata';
		video.muted = true;
		video.crossOrigin = 'anonymous';
		const finish = (sec?: number) => {
			video.removeAttribute('src');
			video.load();
			resolve(sec);
		};
		const timer = window.setTimeout(() => finish(undefined), 15_000);
		video.onloadedmetadata = () => {
			window.clearTimeout(timer);
			const d = video.duration;
			finish(Number.isFinite(d) && d > 0 ? Math.round(d * 1000) / 1000 : undefined);
		};
		video.onerror = () => {
			window.clearTimeout(timer);
			finish(undefined);
		};
		video.src = streamUrl;
	});
}
