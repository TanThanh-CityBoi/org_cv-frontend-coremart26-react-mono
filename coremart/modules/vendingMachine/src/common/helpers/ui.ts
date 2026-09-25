/** Resolve shell main scroll container (e.g. ScrollableContent), not `window`. */
export function getOutermostVerticalScrollParent(from: HTMLElement | null): HTMLElement | null {
	let outermost: HTMLElement | null = null;
	let el: HTMLElement | null = from;
	while (el) {
		const { overflowY } = getComputedStyle(el);
		if (
			(overflowY === 'auto' || overflowY === 'scroll') &&
			el.scrollHeight > el.clientHeight + 1
		) {
			outermost = el;
		}
		el = el.parentElement;
	}
	return outermost;
}
