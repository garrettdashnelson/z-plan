<script>
    let { meal, removeItem, entry } = $props();

    let carbCount = $derived(
        meal.properties["Carb Count"]?.number * entry.multiplier || 0,
    );
    let servingAmount = $derived(
        meal.properties["Serving unit amount"]?.number * entry.multiplier || 0,
    );

</script>

<div class="flex flex-col justify-between p-2 bg-gray-100 rounded-lg my-2">
    <div class="flex flex-row justify-between mb-2">
        <div class="text-lg font-bold">{meal.name}</div>
        <div class="flex-row">
            <button
                onclick={removeItem}
                class="text-red-500 hover:text-red-700 bg-red-100 rounded-md p-1 no-print"
            >
                ⛔️
            </button>
        </div>
    </div>
    <div class="flex flex-row justify-between items-center text-sm">
        <div>
            <strong>{carbCount}g</strong> carbs in serving
            <strong
                >{servingAmount}
                {meal.properties["Serving unit measure"]?.rich_text?.[0]
                    ?.plain_text || ""}</strong
            >
        </div>
        <div class="no-print">✖️  
            <input
                class="bg-gray-200 rounded-md text-lg p-1 w-12"
                type="number"
                bind:value={entry.multiplier}
            />
        </div>
    </div>
</div>
