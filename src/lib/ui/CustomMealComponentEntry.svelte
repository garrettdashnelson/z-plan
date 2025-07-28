<script>
	let { entry, removeItem } = $props();
</script>

<div class="flex flex-wrap items-center gap-2 p-3 mb-2 bg-gray-100 rounded-md">
	<!-- Name input -->
	<input
		type="text"
		bind:value={entry.name}
		placeholder="Enter food name"
		class="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
	/>
	
	<!-- Carb count input and label -->
	<div class="flex items-center gap-2 flex-shrink-0">
		<input
			type="number"
			bind:value={entry.carbCount}
			placeholder="0"
			step="0.1"
			min="0"
			class="w-16 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
		/>
		<span class="text-gray-600 font-medium text-sm whitespace-nowrap">g carbs</span>
	</div>
	
	<!-- Remove button -->
	<button
		onclick={removeItem}
		class="text-red-500 hover:text-red-700 bg-red-100 rounded-md p-1 no-print flex-shrink-0"
		title="Remove item"
	>
		⛔️
	</button>
</div> 