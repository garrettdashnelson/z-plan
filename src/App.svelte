<script>
  import InsulinCalculator from "./lib/InsulinCalculator.svelte";
  import MealCalculator from "./lib/MealCalculator.svelte";

  import { appState } from "./lib/state.svelte";

</script>

<main>
    <!-- Title Banner -->
    <div class="mb-8 p-4 bg-gradient-to-bl from-lime-100 to-indigo-600 shadow-lg no-print">
      <h1 class="text-2xl font-bold text-white text-center">Zana Diabetes Tools</h1>
      <div class="flex justify-center mt-4">
        <select 
          bind:value={appState.activeFunction}
          class="bg-white text-gray-800 rounded-md px-4 py-2 shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="insulin">Insulin Calculator</option>
          <option value="meals">Meal Calculator</option>
        </select>
      </div>
    </div>
  <div class:hidden={appState.activeFunction !== "insulin"}>
    <InsulinCalculator />
  </div>
  <div class:hidden={appState.activeFunction !== "meals"}>
    <MealCalculator />
  </div>
</main>

