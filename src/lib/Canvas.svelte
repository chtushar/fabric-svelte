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
				enableRetinaScaling: true
			});

			$c.on('mouse:wheel', (e) => {
				zoom(e);
				pan(e);
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
