<script>
  import DexReader from './DexReader.svelte';

  let currentBG = $state(150);
  let targetMode = $state('day');
  let customTarget = $state(150);
  let correctionMode = $state('default');
  let customCorrection = $state(250);
  let newCarbs = $state(10);
  let carbRatioMode = $state('default');
  let customCarbRatio = $state(65);

  let targetBG = $derived(
    targetMode === 'day' ? 150 :
    targetMode === 'night' ? 180 :
    customTarget
  );

  let correctionFactor = $derived(
    correctionMode === 'default' ? 250 : customCorrection
  );

  let carbRatio = $derived(
    carbRatioMode === 'default' ? 65 : customCarbRatio
  );

  let correctionDose = $derived(
    ((currentBG - targetBG) / correctionFactor).toPrecision(4)
  );

  let roundedCorrectionDose = $derived(
    Math.floor(((currentBG - targetBG) / correctionFactor) * 10) / 10
  );

  let carbDose = $derived(
    (newCarbs / carbRatio).toPrecision(4)
  );

  let roundedCarbDose = $derived(
    Math.floor((newCarbs / carbRatio) * 10) / 10
  );

  let totalDose = $derived(
    Math.round((roundedCorrectionDose + roundedCarbDose) * 10) / 10
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


  <form class="space-y-6">
    <!-- Current BG Input -->
    <div>
      <label for="currentBG" class="block text-sm font-medium text-gray-700">
        Current blood glucose level
      </label>
      <input
        type="number"
        id="currentBG"
        bind:value={currentBG}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg bg-green-50 text-black px-4 py-2"
      />

      <DexReader />
    </div>

    <!-- Target BG Section -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Target blood glucose level
      </label>
      <div class="flex gap-4 mb-2">
        <button
          type="button"
          class="px-4 py-2 rounded-md {targetMode === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}"
          onclick={() => targetMode = 'day'}
        >
          Day <span class="ml-2 px-2 py-0.5 rounded-full text-sm {targetMode === 'day' ? 'bg-blue-600' : 'bg-gray-300'}">150</span>
        </button>
        <button
          type="button"
          class="px-4 py-2 rounded-md {targetMode === 'night' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}"
          onclick={() => targetMode = 'night'}
        >
          Night <span class="ml-2 px-2 py-0.5 rounded-full text-sm {targetMode === 'night' ? 'bg-blue-600' : 'bg-gray-300'}">180</span>
        </button>
        <button
          type="button"
          class="px-4 py-2 rounded-md {targetMode === 'custom' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}"
          onclick={() => targetMode = 'custom'}
        >
          Custom
        </button>
      </div>
      {#if targetMode === 'custom'}
        <input
          type="number"
          bind:value={customTarget}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg bg-green-50 text-black px-4 py-2"
        />
      {/if}
    </div>

    <!-- Correction Factor Section -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Correction factor
      </label>
      <div class="flex gap-4 mb-2">
        <button
          type="button"
          class="px-4 py-2 rounded-md {correctionMode === 'default' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}"
          onclick={() => correctionMode = 'default'}
        >
          Default <span class="ml-2 px-2 py-0.5 rounded-full text-sm {correctionMode === 'default' ? 'bg-blue-600' : 'bg-gray-300'}">250</span>
        </button>
        <button
          type="button"
          class="px-4 py-2 rounded-md {correctionMode === 'custom' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}"
          onclick={() => correctionMode = 'custom'}
        >
          Custom
        </button>
      </div>
      {#if correctionMode === 'custom'}
        <input
          type="number"
          bind:value={customCorrection}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg bg-green-50 text-black px-4 py-2"
        />
      {/if}
    </div>

    <!-- Correction Dose Display -->
    <div class="mt-6 p-4 bg-gray-50 rounded-md">
      <div class="text-lg font-medium text-gray-700">Correction dose: {correctionDose} units</div>
      <div class="text-lg font-bold text-red-800 mt-2">Rounded correction dose: {roundedCorrectionDose} units</div>
    </div>
  </form>

  <!-- Carbohydrate Calculator Block -->
  <form class="space-y-6 mt-8">
    <!-- Carbs Input -->
    <div>
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
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Carbohydrate ratio
      </label>
      <div class="flex gap-4 mb-2">
        <button
          type="button"
          class="px-4 py-2 rounded-md {carbRatioMode === 'default' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}"
          onclick={() => carbRatioMode = 'default'}
        >
          Default <span class="ml-2 px-2 py-0.5 rounded-full text-sm {carbRatioMode === 'default' ? 'bg-blue-600' : 'bg-gray-300'}">65</span>
        </button>
        <button
          type="button"
          class="px-4 py-2 rounded-md {carbRatioMode === 'custom' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}"
          onclick={() => carbRatioMode = 'custom'}
        >
          Custom
        </button>
      </div>
      {#if carbRatioMode === 'custom'}
        <input
          type="number"
          bind:value={customCarbRatio}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg bg-green-50 text-black px-4 py-2"
        />
      {/if}
    </div>

    <!-- Carb Dose Display -->
    <div class="mt-6 p-4 bg-gray-50 rounded-md">
      <div class="text-lg font-medium text-gray-700">Carbohydrate dose: {carbDose} units</div>
      <div class="text-lg font-bold text-red-800 mt-2">Rounded carbohydrate dose: {roundedCarbDose} units</div>
    </div>
  </form>


  <!-- Total Dose Display -->
  <div class="mt-8 p-4 bg-red-900 rounded-md">
    <div class="text-lg font-normal text-white">Total amount: {totalDose} insulin units</div>
    <div class="text-xl font-bold text-white mt-2">Administer: {roundedTotalDose} insulin units</div>
  </div>
</div>
