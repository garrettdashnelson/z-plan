<script>
	let { onData } = $props();
	let data = $state(null);
	let error = $state(null);
	let loading = $state(true);

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

	$effect(() => {
		fetchData();
	});
</script>

<div class="dex-reader font-mono bg-amber-50 my-4 p-4 rounded-md">
    <h1 class="text-md font-bold mb-2">Latest Dexcom Data</h1>
	{#if loading}
		<p>Loading...</p>
	{:else if error}
		<p class="error">Error: {error}</p>
	{:else if data}
		<div class="data flex flex-col gap-1">
			<div class="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 border border-amber-200">
				<span class="text-lg font-semibold">{data.value}</span>
				<span class="ml-1">{@html data.trendDescription}</span>
			</div>
			<p class="text-sm text-gray-500">{new Date(data.timestamp).toLocaleString('en-US', {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'})}</p>

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
