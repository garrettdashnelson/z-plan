<script>
	let data = $state(null);
	let error = $state(null);
	let loading = $state(true);

	async function fetchData() {
		try {
			const response = await fetch('https://raw.githubusercontent.com/garrettdashnelson/dex-data-worker/refs/heads/main/data-exports/latest.json');
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			data = await response.json();
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
    <h1 class="text-md font-bold mb-2">Live Dexcom Data</h1>
	{#if loading}
		<p>Loading...</p>
	{:else if error}
		<p class="error">Error: {error}</p>
	{:else if data}
		<div class="data flex flex-col gap-1">
            <p>Time: {new Date(data.timestamp).toLocaleString('en-US', {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'})}</p>
			<p>Value: {data.value}</p>
			<p>Trend: {data.trend}</p>
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
