<script lang="ts">
	import { fabric } from 'fabric';
	import { onMount, onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
	import Canvas from '$lib/Canvas.svelte';
	import type { Member } from '$lib/types';
	import MemberCard from '$lib/MemberCard';
	import { CARD_HEIGHT, CARD_WIDTH } from '$lib/constants';
	import Hints from '$lib/Hints.svelte';
	import ExportSideBar from '$lib/ExportSideBar.svelte';

	let searchValue = '';

	// Storing in store to avoid reactivity issues
	const c = writable<fabric.Canvas | null>(null);
	const members = writable<Array<MemberCard>>([]);
	const exportImages = writable<Array<string>>([]);

	// Function to filter members based on search query
	function filter(member: Member, query: string) {
		const shouldShow =
			query === '' ||
			member.name?.toLowerCase().includes(query) ||
			member.login.toLowerCase().includes(query);

		return shouldShow;
	}

	// Function to fetch all members from the API
	const getAllMembers = async () => {
		const res = await fetch(`/api/members`);
		const data = await res.json();
		return data;
	};

	// Function to update CSS variables based on canvas state, these are used for zooming and panning
	const updateCSSVariables = () => {
		document.body.style.setProperty('--zoom', $c?.getZoom().toFixed(3) || '1');
		document.body.style.setProperty('--posX', `${$c?.viewportTransform?.[4]}px`);
		document.body.style.setProperty('--posY', `${$c?.viewportTransform?.[5]}px`);
	};

	// Runs when searchValue changes
	$: {
		const query = searchValue.toLowerCase();

		if ($c) {
			let i = 0;

			// Loop through the members and update their position based on the search query
			$c.forEachObject((obj) => {
				if (obj instanceof MemberCard) {
					if (obj.member && filter(obj.member, query)) {
						obj.set('left', ($c?.width || CARD_WIDTH) / 2 - CARD_WIDTH / 2);
						obj.set('top', 128 + i * CARD_HEIGHT + i * 16);
						obj.set('visible', true);

						i++;
					} else {
						obj.set('visible', false);
					}
				}
			});

			// Reset zoom and pan when search query changes
			$c.setZoom(1);
			$c.setViewportTransform([1, 0, 0, 1, 0, 0]);

			updateCSSVariables();
		}
	}

	function handleKeyup(event: KeyboardEvent) {
		// Quick reset when pressing escape
		if (event.key === 'Escape') {
			searchValue = '';
		}

		// Save canvas as PNG when pressing CMD/CTRL + S
		if ((event.metaKey || event.ctrlKey) && event.key === 's') {
			$members.forEach((member) => {
				if (member.visible) {
					exportImages.update((images) => {
						images.push(
							member.toDataURL({
								format: 'png',
								quality: 1,
								multiplier: 3
							})
						);
						return images;
					});
				}
			});
		}
	}

	// This is custom logic to allow dragging the cards when holding alt
	// We check if the primary mouse button and the alt key is pressed
	// If so, we move the card based on the movement of the mouse
	// Otherwise, we just set the cursor to pointer or grab
	function handleCanvasMousemove(e: fabric.IEvent<MouseEvent>) {
		if (e.target instanceof MemberCard) {
			if (e.e.altKey && e.e.buttons === 1) {
				const card = e.target as MemberCard;

				$c?.setCursor('grabbing');
				card.set('left', (card?.left || 0) + e.e.movementX);
				card.set('top', (card?.top || 0) + e.e.movementY);
			} else if (e.e.altKey) {
				$c?.setCursor('grab');
			} else {
				$c?.setCursor('pointer');
			}
			$c?.renderAll();
		}
	}

	onMount(async () => {
		const data = await getAllMembers();

		// Create cards for each member using the MemberCard component
		$members = data.map((member: Member, index: number) => {
			const card = new MemberCard({
				member,
				hasControls: false,
				borderColor: 'transparent',
				left: ($c?.width || CARD_WIDTH) / 2 - CARD_WIDTH / 2,
				top: 128 + index * CARD_HEIGHT + index * 16,
				lockMovementX: true,
				lockMovementY: true
			});
			return card;
		});

		// Add all cards to the canvas
		$members.forEach((member) => {
			$c?.add(member);
		});

		if (typeof document !== 'undefined') {
			$c?.on('mouse:move', handleCanvasMousemove);
			document.addEventListener('keyup', handleKeyup);
		}
	});

	onDestroy(() => {
		// Need to add the check since optional chaining isn't working 🧐
		if (typeof document !== 'undefined') {
			$c?.dispose();
			document.removeEventListener('keyup', handleKeyup);
		}
	});
</script>

<main>
	<div class="canvas-wrapper">
		<input
			bind:value={searchValue}
			class="searchbox"
			name="search-members"
			type="text"
			placeholder="Search all Mozilla members..."
		/>
		{#if c}
			<Canvas {c} />
		{/if}
		<Hints />
		<ExportSideBar {exportImages} />
	</div>
</main>

<style>
	main {
		width: 100%;
		height: 100vh;
		height: 100svh;

		display: flex;
		flex-direction: row;
	}

	.canvas-wrapper {
		position: relative;
	}

	.canvas-wrapper .searchbox {
		position: absolute;
		top: 48px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1;

		width: 100%;
		max-width: 304px;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		border: none;
		background-color: #eee;

		outline: 1px solid #eee;
		font-size: 14px;
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.1),
			inset 0 1px 2px rgba(0, 0, 0, 0.1);

		transition: all 0.2s;
	}

	.canvas-wrapper .searchbox:focus {
		outline: 1px solid #4196f8;
		box-shadow: 0 2px 4px rgba(0, 100, 200, 0.1);
	}
</style>
