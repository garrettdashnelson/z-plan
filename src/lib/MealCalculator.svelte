<script>
	import { onMount } from "svelte";

	// State for the component
	let meals = $state([]);
	let loading = $state(true);
	let error = $state(null);
	let computedMeal = $state([]);
	let printFormat = $state(false);

	import ComboBox from "./ui/ComboBox.svelte";
	import MealComponentEntry from "./ui/MealComponentEntry.svelte";
	import CustomMealComponentEntry from "./ui/CustomMealComponentEntry.svelte";

	import { appState } from "./state.svelte";

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
		if (item.custom) {
			computedMeal.push({
				name: item.name,
				id: "custom-" + Date.now(),
				carbCount: 0,
				custom: true,
			});
		} else {
			computedMeal.push({ id: item.id, multiplier: 1 });
		}
	}

	function removeItem(index) {
		computedMeal.splice(index, 1);
	}

	let totalCarbs = $derived(
		computedMeal.reduce((sum, entry) => {
			if (entry.custom) {
				return sum + entry.carbCount;
			} else {
				return (
					sum +
					(meals.find((m) => m.id === entry.id)?.properties[
						"Carb Count"
					]?.number || 0) *
						entry.multiplier
				);
			}
		}, 0),
	);

	let textRenderedComputedMeal = $derived.by(() => {
		let text = computedMeal
			.map((entry) => {
				if (entry.custom) {
					return `• ${entry.name}: ${entry.carbCount.toFixed(2)}g carbs`;
				} else {
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
					return `• ${meal?.name}: ${carbCount.toFixed(2)}g carbs in ${servingAmount.toFixed(2)} ${servingUnit}`;
				}
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

<div
	class="{printFormat
		? 'max-w-full'
		: 'max-w-lg'} mx-auto p-4 sm:p-6 bg-white rounded-lg {printFormat
		? 'shadow-none'
		: 'shadow-md'}"
>
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
			<button
				onclick={() => (computedMeal = [])}
				class="mt-4 mb-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 sm:px-4 rounded no-print text-sm sm:text-base"
			>
				⛔️ Clear all
			</button>
			{#each computedMeal as entry, index}
				{#if !entry.custom}
					<MealComponentEntry
						meal={meals.find((m) => m.id === entry.id)}
						{entry}
						{printFormat}
						removeItem={() => removeItem(index)}
					/>
				{:else}
					<CustomMealComponentEntry
						{entry}
						removeItem={() => removeItem(index)}
					/>
				{/if}
			{/each}

			<div class="mt-8 p-4 {printFormat ? '' : 'bg-red-900 rounded-md'}">
				<div
					class="{printFormat
						? 'text-6xl text-black'
						: 'text-lg text-white'}  font-bold"
				>
					Total carbs: {totalCarbs.toFixed(2)}g
				</div>
			</div>
			<textarea
				id="rendered-meal-text"
				readonly
				class="hidden"
				bind:value={textRenderedComputedMeal}
			/>
			<div class="flex flex-wrap gap-2">
				<button
					onclick={() => {
						if (navigator.share) {
							navigator
								.share({
									text: textRenderedComputedMeal,
								})
								.catch((err) => {
									console.error("Share failed:", err);
								});
						}
					}}
					class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 sm:px-4 rounded no-print text-sm sm:text-base"
				>
					Share
				</button>
				<button
					onclick={() => {
						printFormat = true;
						setTimeout(() => {
							window.print();
						}, 100);
					}}
					class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 sm:px-4 rounded no-print text-sm sm:text-base"
				>
					Print
				</button>

				<button
					onclick={() => {
						appState.mealCalculatedCarbs = totalCarbs;
						appState.activeFunction = "insulin";
					}}
					class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 sm:px-4 rounded no-print text-sm sm:text-base"
				>
					Copy to insulin calculator
				</button>
				<button
					onclick={() => {
						const textarea =
							document.getElementById("rendered-meal-text");
						textarea.select();
						navigator.clipboard.writeText(textarea.value);
						window.alert("Copied to clipboard");
					}}
					class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 sm:px-4 rounded no-print text-sm sm:text-base"
				>
					Copy to clipboard
				</button>
			</div>
		{/if}
	{/if}
</div>

<style>
</style>
