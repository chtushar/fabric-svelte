<script lang="ts">
	import { fabric } from 'fabric';
	import { onMount, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { normalizeWheel, updateCSSVariables } from './utils';
	import { PAN_SENSITIVITY, ZOOM_SENSITIVITY } from './constants';
	import Vec from '@tldraw/vec';

	export let c = writable<fabric.Canvas | null>(null);
	let canvas: HTMLCanvasElement;

	const mounted = writable(false);
	const clientHeight = writable(0);
	const clientWidth = writable(0);

	// Adding this to context so that child components can access it
	setContext('c', c);

	function resize() {
		if (canvas) {
			$c?.setWidth($clientWidth);
			$c?.setHeight($clientHeight);

			updateCSSVariables($c);
			$c?.renderAll();
		}
	}

	// Zoom function to handle zooming on the canvas and updating CSS variables
	// to reflect the current zoom level using the block.svg background
	const zoom = (e: fabric.IEvent<WheelEvent | TouchEvent>) => {
		if (e.e.ctrlKey || e.e.metaKey) {
			let zoom = $c?.getZoom() || 1;

			const [, , deltaZ] = normalizeWheel(e.e);
			const delta = deltaZ * ZOOM_SENSITIVITY;

			zoom = zoom - delta * zoom;
			zoom = Vec.clamp(zoom, 0.25, 2.5);

			if (e.e instanceof TouchEvent) {
				$c?.zoomToPoint({ x: e.e.touches[0].clientX, y: e.e.touches[0].clientY }, zoom);
			} else {
				$c?.zoomToPoint({ x: e.e.offsetX, y: e.e.offsetY }, zoom);
			}

			updateCSSVariables($c);

			// Prevent default scroll behavior
			e.e.preventDefault();
			e.e.stopPropagation();
		}
	};

	const pan = (e: fabric.IEvent<WheelEvent | TouchEvent>) => {
		if (!e.e.metaKey && !e.e.ctrlKey) {
			const [deltaX, deltaY] = normalizeWheel(e.e);
			const del = Vec.mul([deltaX, deltaY], PAN_SENSITIVITY);

			$c?.relativePan(new fabric.Point(del[0], del[1]));

			updateCSSVariables($c);

			// Prevent default scroll behavior
			if (e.e instanceof WheelEvent) {
				e.e.preventDefault();
				e.e.stopPropagation();
			}
		}
	};

	onMount(() => {
		if (typeof window !== 'undefined') {
			$c = new fabric.Canvas(canvas, {
				backgroundColor: 'transparent',
				allowTouchScrolling: true,
				enableRetinaScaling: true,
				selection: false
			});

			$c.on('mouse:wheel', (e) => {
				zoom(e);
				pan(e);
			});

			let touchStart: Array<number> | null = null;

			// // @ts-expect-error
			// $c.on('touchstart', (e: fabric.IEvent<TouchEvent>) => {
			// 	console.log('touchstart');
			// 	touchStart = [e.e.touches[0].clientX, e.e.touches[0].clientY];
			// });

			// // @ts-expect-error
			// $c.on('touchmove', (e: fabric.IEvent<TouchEvent>) => {
			// 	if (touchStart) {
			// 		const touchEnd = [e.e.touches[0].clientX, e.e.touches[0].clientY];
			// 		const delta = Vec.sub([touchStart[0], touchStart[1]], [touchEnd[0], touchEnd[1]]);

			// 		$c?.relativePan(new fabric.Point(delta[0], delta[1]));
			// 		touchStart = touchEnd;

			// 		updateCSSVariables($c);
			// 	}
			// });

			// $c.on('touchend', () => {
			// 	touchStart = null;
			// });

			let last = { x: 0, y: 0 };
			// @ts-ignore
			$c.on({
				'touch:drag': (
					e: fabric.IEvent<TouchEvent> & {
						self: { x: number; y: number; start: { x: number; y: number } };
					}
				) => {
					// Touchend
					if (typeof e.e.touches === 'undefined') {
						last = { x: 0, y: 0 };
						return;
					}

					// Touchmove
					if (e.e.touches.length === 1) {
						// Implement panning on touch devices
						if (last.x === 0 && last.y === 0) {
							last = { x: e.self.x, y: e.self.y };
						}
						const del = Vec.mul(Vec.sub([e.self.x, e.self.y], [last.x, last.y]), PAN_SENSITIVITY);

						last = { x: e.self.x, y: e.self.y };

						$c?.relativePan(new fabric.Point(del[0], del[1]));
						updateCSSVariables($c);
					}
				}
			});

			$mounted = true;
			window.addEventListener('resize', resize);

			resize();
		}
		return () => {
			window.removeEventListener('resize', resize);
		};
	});
</script>

<svelte:window bind:innerHeight={$clientHeight} bind:innerWidth={$clientWidth} />

<canvas bind:this={canvas}></canvas>
{#if $mounted}
	<!-- <input class="searchbox" type="text" /> -->
	<slot />
{/if}

<style>
	canvas {
		width: 100%;
		height: 100%;
	}

	:global(.canvas-container) {
		background: url('/block.svg') repeat;
		background-size: calc(16px * var(--zoom, 1));
		background-position: var(--posX, 0) var(--posY, 0);
	}
</style>
