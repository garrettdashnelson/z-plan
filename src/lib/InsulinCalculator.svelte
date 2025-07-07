<script>
  import DexReader from "./DexReader.svelte";
  import settings from "./settings.json";

  import { appState } from "./state.svelte";

  let currentBG = $state(150);
  let dexcomData = $state(null);
  let targetMode = $state("day");
  let customTarget = $state(settings.dayTarget);
  let correctionMode = $state("default");
  let customCorrection = $state(settings.defaultCorrection);
  let newCarbs = $derived(appState.mealCalculatedCarbs);
  let carbRatioMode = $state("default");
  let customCarbRatio = $state(settings.defaultCarbRatio);
  let doCalculateCorrection = $state(true);
  let doCarbDose = $state(true);


  function handleDexcomData(data) {
    dexcomData = data;
    currentBG = data.value;
  }

  let targetBG = $derived(
    targetMode === "day"
      ? settings.dayTarget
      : targetMode === "night"
        ? settings.nightTarget
        : customTarget,
  );

  let correctionFactor = $derived(
    correctionMode === "default"
      ? settings.defaultCorrection
      : customCorrection,
  );

  let carbRatio = $derived(
    carbRatioMode === "default" ? settings.defaultCarbRatio : customCarbRatio,
  );

  let correctionDose = $derived(
    Math.max(0, (currentBG - targetBG) / correctionFactor).toPrecision(4),
  );

  let roundedCorrectionDose = $derived(
    Math.max(
      0,
      Math.floor(((currentBG - targetBG) / correctionFactor) * 10) / 10,
    ),
  );

  let carbDose = $derived(Math.max(0, newCarbs / carbRatio).toPrecision(4));

  let roundedCarbDose = $derived(
    Math.max(0, Math.floor((newCarbs / carbRatio) * 10) / 10),
  );

  let totalDose = $derived(
    Math.round(
      ((doCalculateCorrection ? roundedCorrectionDose : 0) +
        (doCarbDose ? roundedCarbDose : 0)) *
        10,
    ) / 10,
  );

  let roundedTotalDose = $derived.by(() => {
    const decimal = totalDose % 1;
    const whole = Math.floor(totalDose);

    if (decimal < 0.3) return whole;
    if (decimal < 0.8) return whole + 0.5;
    return whole + 1;
  });


</script>

<div class="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
  <DexReader onData={handleDexcomData} />

  <!-- Correction Calculator Block -->
  <div class="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-700">Correction Calculator</h2>
      <label class="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          class="sr-only peer"
          bind:checked={doCalculateCorrection}
        />
        <div
          class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
        ></div>
      </label>
    </div>
    <div
      class="w-full+6 -mx-6 mt-2 p-3 bg-yellow-50 border-b border-yellow-300 flex items-center gap-2 mb-4"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-10 w-10 text-yellow-600 ml-6"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      <span class="text-sm text-yellow-700"
        >Turn off correction calculator if it has been less than three hours
        since the last fast-acting dose</span
      >
    </div>

    {#if doCalculateCorrection}
      <!-- Current BG Input -->
      <div class="mb-6">
        <label for="currentBG" class="block text-sm font-medium text-gray-700">
          Current blood glucose level
        </label>
        <input
          type="number"
          id="currentBG"
          bind:value={currentBG}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg bg-green-50 text-black px-4 py-2"
        />
      </div>
      <!-- Target BG Section -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Target blood glucose level
        </label>
        <div class="flex gap-4 mb-2">
          <button
            type="button"
            class="px-4 py-2 rounded-md {targetMode === 'day'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-400'}"
            onclick={() => (targetMode = "day")}
          >
            Day <span
              class="ml-2 px-2 py-0.5 rounded-full text-sm {targetMode === 'day'
                ? 'bg-blue-600'
                : 'bg-gray-300'}">{settings.dayTarget}</span
            >
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-md {targetMode === 'night'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-400'}"
            onclick={() => (targetMode = "night")}
          >
            Night <span
              class="ml-2 px-2 py-0.5 rounded-full text-sm {targetMode ===
              'night'
                ? 'bg-blue-600'
                : 'bg-gray-300'}">{settings.nightTarget}</span
            >
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-md {targetMode === 'custom'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-400'}"
            onclick={() => (targetMode = "custom")}
          >
            Custom
          </button>
        </div>
        {#if targetMode === "custom"}
          <input
            type="number"
            bind:value={customTarget}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg bg-green-50 text-black px-4 py-2"
          />
        {/if}
      </div>

      <!-- Correction Factor Section -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Correction factor
        </label>
        <div class="flex gap-4 mb-2">
          <button
            type="button"
            class="px-4 py-2 rounded-md {correctionMode === 'default'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-400'}"
            onclick={() => (correctionMode = "default")}
          >
            Default <span
              class="ml-2 px-2 py-0.5 rounded-full text-sm {correctionMode ===
              'default'
                ? 'bg-blue-600'
                : 'bg-gray-300'}">{settings.defaultCorrection}</span
            >
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-md {correctionMode === 'custom'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-400'}"
            onclick={() => (correctionMode = "custom")}
          >
            Custom
          </button>
        </div>
        {#if correctionMode === "custom"}
          <input
            type="number"
            bind:value={customCorrection}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg bg-green-50 text-black px-4 py-2"
          />
        {/if}
      </div>

      <!-- Correction Dose Display -->
      <div class="mt-6 p-4 bg-white rounded-md border border-gray-200">
        <div class="text-lg font-medium text-gray-700">
          Correction dose: {correctionDose} units &rarr;
          <span class="font-black text-red-800"
            >{roundedCorrectionDose} units</span
          >
        </div>
      </div>
    {/if}
  </div>

  <!-- Carbohydrate Calculator Block -->
  <div class="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-700">
        Carbohydrate Calculator
      </h2>
      <label class="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" class="sr-only peer" bind:checked={doCarbDose} />
        <div
          class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
        ></div>
      </label>
    </div>

    {#if doCarbDose}
      <!-- Carbs Input -->
      <div class="mb-6">
        <label for="newCarbs" class="block text-sm font-medium text-gray-700">
          Total new carbohydrates (g)
        </label>
        <input
          type="number"
          id="newCarbs"
          bind:value={newCarbs}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg bg-green-50 text-black px-4 py-2"
        />
      </div>

      <!-- Carb Ratio Section -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Carbohydrate ratio
        </label>
        <div class="flex gap-4 mb-2">
          <button
            type="button"
            class="px-4 py-2 rounded-md {carbRatioMode === 'default'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-400'}"
            onclick={() => (carbRatioMode = "default")}
          >
            Default <span
              class="ml-2 px-2 py-0.5 rounded-full text-sm {carbRatioMode ===
              'default'
                ? 'bg-blue-600'
                : 'bg-gray-300'}">{settings.defaultCarbRatio}</span
            >
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-md {carbRatioMode === 'custom'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-400'}"
            onclick={() => (carbRatioMode = "custom")}
          >
            Custom
          </button>
        </div>
        {#if carbRatioMode === "custom"}
          <input
            type="number"
            bind:value={customCarbRatio}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg bg-green-50 text-black px-4 py-2"
          />
        {/if}
      </div>

      <!-- Carb Dose Display -->
      <div class="mt-6 p-4 bg-white rounded-md border border-gray-200">
        <div class="text-lg font-medium text-gray-700">
          Carbohydrate dose: {carbDose} units &rarr;
          <span class="font-black text-red-800">{roundedCarbDose} units</span>
        </div>
      </div>
    {/if}
  </div>

  <!-- Total Dose Display -->
  <div class="mt-8 p-4 bg-red-900 rounded-md">
    <div class="text-lg font-normal text-white">
      Total amount: {totalDose} insulin units
    </div>
    <div class="text-xl font-bold text-white mt-2">
      Administer: {roundedTotalDose.toFixed(1)} insulin units
    </div>
  </div>
</div>
