<script>
    let { meal, removeItem, entry, printFormat } = $props();

    let carbCount = $derived(
        meal.properties["Carb Count"]?.number * entry.multiplier || 0,
    );
    let servingAmount = $derived(
        meal.properties["Serving unit amount"]?.number * entry.multiplier || 0,
    );
</script>

<div class="flex flex-col justify-between {printFormat ? 'text-3xl' : 'bg-gray-100 rounded-lg p-2'} rounded-lg my-2">
    <div class="flex flex-row justify-between mb-2">
        <div class="{printFormat ? 'text-5xl' : 'text-lg'} font-bold">{meal.name}</div>
        <div class="flex-row">
            <button
                onclick={removeItem}
                class="text-red-500 hover:text-red-700 bg-red-100 rounded-md p-1 no-print {printFormat ? 'hidden' : ''}"
            >
                ⛔️
            </button>
        </div>
    </div>
    <div class="flex flex-row justify-between items-center {printFormat ? 'text-4xl' : 'text-sm'}">
        <div>
            <strong>{carbCount.toFixed(1)}g</strong> carbs in serving
            <strong
                >{servingAmount.toFixed(1)}
                {meal.properties["Serving unit measure"]?.rich_text?.[0]
                    ?.plain_text || ""}</strong
            >
        </div>
        <div class="no-print">
            ✖️
            <input
                class="bg-gray-200 rounded-md text-lg p-1 w-12"
                type="number"
                inputmode="decimal"
                pattern="[0-9]*"
                min="0"
                bind:value={entry.multiplier}
            />
        </div>
    </div>
</div>
