<script>
	let { onData } = $props();
	let data = $state(null);
	let error = $state(null);
	let loading = $state(true);

	import { onMount } from "svelte";

	async function fetchData() {
		try {
			const response = await fetch('.netlify/functions/dexcom');
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			data = await response.json();
			if (onData) onData(data);
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		fetchData();
		setInterval(fetchData, 5 * 60 * 1000);
	});
</script>

<div class="dex-reader font-mono bg-purple-100 my-4 p-4 rounded-md">
    <h1 class="text-md font-bold mb-2">Latest Dexcom Data</h1>
	{#if loading}
		<p>Loading...</p>
	{:else if error}
		<p class="error">Error: {error}</p>
	{:else if data}
		<div class="data flex flex-col gap-1">
			<div class="inline-flex items-center px-3 py-1 rounded-full bg-purple-300 border border-purple-700">
				<span class="text-lg font-semibold">{data.value}</span>
				<span class="ml-1">{@html data.trendDescription}</span>
			</div>
			<p class="text-sm text-gray-500">{new Date(data.timestamp).toLocaleString('en-US', {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'})}</p>
			{#if data && data.timestamp && (Date.now() - new Date(data.timestamp).getTime()) > 10 * 60 * 1000}
				<div class="inline-flex items-center px-3 py-1 rounded-sm bg-red-300 border border-yellow-700 text-sm">
					Reading is more than 10 minutes old
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.dex-reader {
		padding: 1rem;
	}

	.error {
		color: red;
	}

	.data {
		display: flex;
		gap: 1rem;
	}
</style>
