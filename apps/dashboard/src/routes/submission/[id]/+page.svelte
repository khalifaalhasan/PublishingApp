<script lang="ts">
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  const sub = data.submission;
</script>

<div class="container mx-auto p-4 max-w-4xl">
  <div class="mb-6">
    <a href="/submission" class="text-blue-500 hover:underline">&larr; Back to Submissions</a>
  </div>
  
  <div class="bg-white rounded-lg shadow-md p-8">
    <h1 class="text-3xl font-bold mb-4">Submission Details</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <span class="text-gray-500 font-semibold block">Type</span>
        <span class="inline-block bg-gray-200 rounded px-2 py-1 text-sm">{sub.type}</span>
      </div>
      <div>
        <span class="text-gray-500 font-semibold block">Status</span>
        <span class="inline-block bg-blue-100 text-blue-800 rounded px-2 py-1 text-sm font-semibold">{sub.status}</span>
      </div>
      <div>
        <span class="text-gray-500 font-semibold block">Created At</span>
        <span>{new Date(sub.createdAt).toLocaleString()}</span>
      </div>
      {#if sub.updatedAt}
        <div>
          <span class="text-gray-500 font-semibold block">Last Updated</span>
          <span>{new Date(sub.updatedAt).toLocaleString()}</span>
        </div>
      {/if}
    </div>

    <!-- Depending on type, display book or essay details -->
    {#if sub.bookDetails}
      <div class="border-t pt-4 mt-4">
        <h3 class="text-xl font-bold mb-2">Book Info</h3>
        <p><strong>Title:</strong> {sub.bookDetails.title}</p>
        <p><strong>Synopsis:</strong> {sub.bookDetails.synopsis || 'N/A'}</p>
      </div>
    {/if}

    {#if sub.essayDetails}
      <div class="border-t pt-4 mt-4">
        <h3 class="text-xl font-bold mb-2">Essay Info</h3>
        <p><strong>Title:</strong> {sub.essayDetails.title}</p>
        <p><strong>Synopsis:</strong> {sub.essayDetails.synopsis || 'N/A'}</p>
      </div>
    {/if}

    {#if form?.error}
      <div class="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
        {form.error}
      </div>
    {/if}

    {#if form?.success}
      <div class="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
        Successfully published to catalog!
      </div>
    {/if}

    {#if sub.status === 'APPROVED'}
      <div class="mt-8 border-t pt-6 flex justify-end">
        <form method="POST" action="?/publish">
          <input type="hidden" name="submissionId" value={sub.id} />
          <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow-md transition-colors">
            Publish to Catalog
          </button>
        </form>
      </div>
    {/if}
  </div>
</div>
