<script>
    let { meal, removeItem, entry, printFormat, updateMultiplier } = $props();

    // Get the base serving amount from the meal properties
    let baseServingAmount = meal.properties["Serving unit amount"]?.number || 1;
    
    // Calculate current serving amount from multiplier
    let servingAmount = 
        baseServingAmount * entry.multiplier
    ;

    let carbCount = $derived(
        meal.properties["Carb Count"]?.number * entry.multiplier || 0,
    );

    // Function to update multiplier when servingAmount changes
    function handleServingAmountChange(newServingAmount) {
        if (baseServingAmount > 0) {
            const newMultiplier = newServingAmount / baseServingAmount;
            updateMultiplier(newMultiplier);
        }
    }
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
    <div class="flex flex-row justify-between items-center {printFormat ? 'text-4xl' : 'text-md'}">
        <div>
            <strong class="font-black">{carbCount.toFixed(1)}g</strong> carbs in
            <input
                class="bg-gray-200 rounded-md text-lg font-black p-1 w-18 mx-1 no-print"
                type="number"
                inputmode="decimal"
                pattern="[0-9]*"
                min="0"
                step="0.1"
                value={servingAmount}
                oninput={(e) => handleServingAmountChange(parseFloat(e.target.value) || 0)}
            />
            <strong
                >{meal.properties["Serving unit measure"]?.rich_text?.[0]
                    ?.plain_text || ""}</strong
            >
        </div>
    </div>
</div>

