<script>
	import { onMount } from "svelte";

	// State for the component
	let meals = $state([]);
	let loading = $state(true);
	let error = $state(null);
	let computedMeal = $state([]);

	import ComboBox from "./ui/ComboBox.svelte";
	import MealComponentEntry from "./ui/MealComponentEntry.svelte";

	// Fetch meals from Notion function
	async function fetchMeals() {
		try {
			loading = true;
			error = null;

			const response = await fetch(".netlify/functions/notion");

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();

			if (result.success) {
				console.log("ok");
				console.log(result.data);
				meals = result.data.map((page) => ({
					id: page.id,
					// Extract title from properties - adjust based on your Notion database structure
					name:
						page.properties.Name?.title?.[0]?.plain_text ||
						page.properties.Title?.title?.[0]?.plain_text ||
						"Unnamed item",
					// Add other properties as needed
					properties: page.properties,
				}));
			} else {
				throw new Error(result.error || "Failed to fetch meals");
			}
		} catch (err) {
			error = err.message;
			console.error("Error fetching meals:", err);
		} finally {
			loading = false;
		}
	}

	// Handle meal selection
	function handleMealSelect(item) {
		computedMeal.push({ id: item.id, multiplier: 1 });
	}

	function removeItem(index) {
		computedMeal.splice(index, 1);
	}

	let totalCarbs = $derived(
		computedMeal.reduce(
			(sum, entry) =>
				sum +
				(meals.find((m) => m.id === entry.id)?.properties["Carb Count"]
					?.number || 0) *
					entry.multiplier,
			0,
		),
	);

	let textRenderedComputedMeal = $derived.by(() => {
		let text = computedMeal
			.map((entry) => {
				const meal = meals.find((m) => m.id === entry.id);
				const carbCount =
					(meal?.properties["Carb Count"]?.number || 0) *
					entry.multiplier;
				const servingAmount =
					(meal?.properties["Serving unit amount"]?.number || 0) *
					entry.multiplier;
				const servingUnit =
					meal?.properties["Serving unit measure"]?.rich_text?.[0]
						?.plain_text || "";
				return `• ${meal?.name}: ${carbCount}g carbs in ${servingAmount}${servingUnit}`;
			})
			.join("\n");
		text += `\n\nTotal carbs: ${totalCarbs}g`;
		return text;
	});

	// Load meals when component mounts
	onMount(() => {
		fetchMeals();
	});
</script>

<div class="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
	{#if loading}
		<div class="loading">
			<p>Loading data from Notion...</p>
		</div>
	{:else if error}
		<div class="error">
			<p>Error: {error}</p>
			<button onclick={fetchMeals}>Retry</button>
		</div>
	{:else}
		<div class="relative">
			<ComboBox items={meals} onSelect={handleMealSelect} />
		</div>

		{#if computedMeal && computedMeal.length > 0}
			{#each computedMeal as entry, index}
				<MealComponentEntry
					meal={meals.find((m) => m.id === entry.id)}
					{entry}
					removeItem={() => removeItem(index)}
				/>
			{/each}

			<div class="mt-8 p-4 bg-red-900 rounded-md">
				<div class="text-lg font-bold text-white">
					Total carbs: {totalCarbs}g
				</div>
			</div>
			<textarea id="rendered-meal-text" readonly class="hidden" bind:value={textRenderedComputedMeal} />
			<div>
			<button
				onclick={() => {
					const textarea = document.getElementById('rendered-meal-text');
					textarea.select();
					navigator.clipboard.writeText(textarea.value);
					window.alert("Copied to clipboard");
				}}
				class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded no-print"
			>
				Copy to clipboard
			</button>
			<button
				onclick={() => {
					if (navigator.share) {
						navigator.share({
							text: textRenderedComputedMeal
						}).catch(err => {
							console.error('Share failed:', err);
						});
					}
				}}
				class="mt-4 ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded no-print"
			>
				Share
			</button>

			</div>
		{/if}
	{/if}
</div>

<style>
</style>
