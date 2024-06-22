<script lang="ts">
	import type { Writable } from 'svelte/store';

	export let exportImages: Writable<Array<string>>;

	$: showSidebar = $exportImages.length > 0;
</script>

<div class="exports-sidebar {showSidebar ? 'show' : ''}">
	<div class="top-bar">
		<h3>Exports</h3>
		<button
			on:click={() => {
				exportImages.set([]);
			}}>˟</button
		>
	</div>
	<!-- <div class="flex justify-between items-center p-4 border-b">
			<h2 class="text-xl font-bold">Export</h2>
		</div> -->
	<div class="image-list">
		{#each $exportImages as image}
			<img src={image} alt="Export" class="w-full mb-4" />
		{/each}
	</div>
</div>

<style>
	.exports-sidebar {
		position: fixed;
		top: 24px;
		right: 24px;
		bottom: 24px;
		width: 320px;
		background-color: rgba(255, 255, 255, 0.5);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		z-index: 1000;
		overflow-y: auto;
		border-radius: 16px;
		transform: translate3d(345px, 0, 0);
		transition: transform 0.2s cubic-bezier(0.01, 0.05, 0.16, 0.97);
	}

	.exports-sidebar .top-bar {
		font-family: 'system-ui', sans-serif;
		width: 100%;
		display: flex;
		justify-content: space-between;
		padding: 1rem;
	}

	.exports-sidebar .top-bar button {
		font-size: 32px;
		cursor: pointer;
		color: rgb(255, 125, 125);
		background-color: transparent;
		border: none;
		user-select: none;
	}

	.exports-sidebar.show {
		transform: translate3d(0, 0, 0);
	}

	.exports-sidebar::-webkit-scrollbar {
		display: none;
	}

	.exports-sidebar .image-list {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;

		overflow-y: auto;
	}
</style>
