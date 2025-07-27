<script>
	let { entry, removeItem } = $props();
</script>

<div class="flex items-center justify-between p-3 mb-2 bg-gray-100 rounded-md">
	<div class="flex-1 flex items-center space-x-3">
		<!-- Name input -->
		<input
			type="text"
			bind:value={entry.name}
			placeholder="Enter food name"
			class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
		/>
		
		<!-- Carb count input -->
		<div class="flex items-center space-x-2">
			<input
				type="number"
				bind:value={entry.carbCount}
				placeholder="0"
				step="0.1"
				min="0"
				class="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			/>
			<span class="text-gray-600 font-medium">g carbs</span>
		</div>
	</div>
	
	<!-- Remove button -->
	<button
                onclick={removeItem}
                class="text-red-500 hover:text-red-700 bg-red-100 rounded-md p-1 no-print ml-2"
            >
                ⛔️
            </button>
</div> 