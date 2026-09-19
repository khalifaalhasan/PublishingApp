<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<div class="container mx-auto p-4 max-w-4xl">
  <div class="mb-6">
    <a href="/catalog" class="text-blue-500 hover:underline">&larr; Back to Catalog</a>
  </div>
  
  <div class="bg-white rounded-lg shadow-md p-8">
    <h1 class="text-4xl font-bold mb-4">{data.catalog.title}</h1>
    
    <div class="flex flex-wrap gap-4 mb-6 text-sm text-gray-500">
      {#if data.catalog.isbn}
        <div><strong>ISBN:</strong> {data.catalog.isbn}</div>
      {/if}
      {#if data.catalog.publishedAt}
        <div><strong>Published:</strong> {new Date(data.catalog.publishedAt).toLocaleDateString()}</div>
      {/if}
    </div>

    <div class="prose max-w-none">
      <h3 class="text-xl font-semibold mb-2">Synopsis</h3>
      <p class="whitespace-pre-line">{data.catalog.synopsis || 'No synopsis provided.'}</p>
    </div>
  </div>
</div>
