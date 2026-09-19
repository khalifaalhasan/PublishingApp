<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;

  const items = data.data?.data || [];
</script>

<div class="container mx-auto p-4">
  <h1 class="text-3xl font-bold mb-6">Catalog</h1>

  {#if data.error}
    <div class="bg-red-100 text-red-700 p-4 mb-4 rounded">
      {data.error}
    </div>
  {/if}

  {#if items.length === 0}
    <p class="text-gray-500">No catalog items found.</p>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {#each items as item}
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="p-4">
            <h2 class="text-xl font-semibold mb-2">{item.title}</h2>
            <p class="text-gray-600 mb-4 line-clamp-3">{item.synopsis || 'No synopsis available.'}</p>
            <a href="/catalog/{item.slug}" class="text-blue-500 hover:underline">View Details</a>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
