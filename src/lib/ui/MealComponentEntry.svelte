<script>
    let { meal, removeItem } = $props();
</script>

<div class="flex flex-col justify-between p-2 bg-gray-100 rounded-lg my-2">
    <h3 class="text-lg font-bold">{meal.name}</h3>
    <div class="flex flex-row justify-between text-sm">
        <div>
            <strong>{meal.properties["Carb Count"]?.number || 0}g</strong> carbs
            in serving
            <strong
                >{meal.properties["Serving unit amount"]?.number || 0}
                {meal.properties["Serving unit measure"]?.rich_text?.[0]
                    ?.plain_text || ""}</strong
            >
        </div>
        <button onclick={removeItem} class="text-red-500 hover:text-red-700">
            Remove
        </button>
    </div>
</div>
