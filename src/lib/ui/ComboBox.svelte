<script>
  let searchTerm = $state("");
  let selectedItem = $state(null);
  let isOpen = $state(false);
  let { onSelect, items } = $props();
  let highlightedIndex = $state(-1);

  let filteredItems = $derived(
    items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  function handleKeyDown(event) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (highlightedIndex < filteredItems.length - 1) {
          highlightedIndex++;
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (highlightedIndex > 0) {
          highlightedIndex--;
        }
        break;
      case "Enter":
        event.preventDefault();
        if (highlightedIndex >= 0) {
          selectItem(filteredItems[highlightedIndex]);
        }
        break;
      case "Escape":
        isOpen = false;
        break;
    }
  }

  function selectItem(item) {
    selectedItem = item;
    searchTerm = "";
    isOpen = false;
    highlightedIndex = -1;
    if (onSelect) onSelect(item);
  }

  function handleInput(event) {
    searchTerm = event.target.value;
    isOpen = true;
    highlightedIndex = -1;
  }

  function handleFocus() {
    isOpen = true;
  }

  function handleBlur() {
    // Small delay to allow click events to fire
    // setTimeout(() => {
    //   isOpen = false;
    //   highlightedIndex = -1;
    // }, 200);
  }
</script>

<div class="relative w-full">
  <input
    type="text"
    value={searchTerm}
    oninput={handleInput}
    onfocus={handleFocus}
    onblur={handleBlur}
    onkeydown={handleKeyDown}
    class="w-full px-4 py-2 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent no-print"
    placeholder="Add from Notion database…"
  />

  {#if isOpen && filteredItems.length > 0}
    <ul
      class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
    >
      {#each filteredItems.sort( (a, b) => a.name.localeCompare(b.name), ) as item, i}
        <li
          class="px-4 py-2 text-left hover:bg-gray-200 cursor-pointer {i ===
          highlightedIndex
            ? 'bg-blue-100'
            : ''}"
          onclick={() => selectItem(item)}
        >
          {item.name}
        </li>
      {/each}
    </ul>
  {/if}
</div>
