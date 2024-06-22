<script lang="ts">
	let showHints = true;
	let opacity = 1;
</script>

{#if showHints}
	<div class="hints" style="opacity: {opacity};">
		<ul>
			<li>
				Use the <strong>ctrl/cmd + mouse wheel</strong> to zoom in and out.
			</li>
			<li>
				Use the <strong>mouse wheel</strong> to pan.
			</li>
			<li>
				User <strong>alt/opt + drag</strong> to move the name cards.
			</li>
			<li>Use <strong>ctrl/cmd + s</strong> to export the name cards.</li>
			<li>Use the search bar to filter members.</li>
			<li>Click on a member to view their profile.</li>
		</ul>

		<button
			class="close"
			on:click={() => {
				opacity = 0;
				setTimeout(() => {
					showHints = false;
				}, 300);
			}}>˟</button
		>
	</div>
{/if}

<style>
	.hints {
		position: fixed;
		left: 24px;
		bottom: 24px;
		padding: 32px 32px 16px 32px;
		background-color: rgba(255, 255, 255, 0.5);
		border-radius: 16px;

		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
		font-family: 'system-ui', sans-serif;
		border: 1px solid #eee;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: opacity 0.2s cubic-bezier(0.01, 0.05, 0.16, 0.97);
	}

	.hints ul {
		padding: 0;
		margin: 0;

		line-height: 24px;
		font-size: 14px;
		color: #555;
	}

	.hints .close {
		position: absolute;
		top: 6px;
		right: 16px;
		background: none;
		border: none;
		font-size: 32px;
		cursor: pointer;
		color: rgb(255, 125, 125);
	}
</style>
