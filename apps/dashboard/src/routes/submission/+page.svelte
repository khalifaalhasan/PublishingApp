<script lang="ts">
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<h1>Daftar Submissions</h1>

{#if data.submissions.length === 0}
  <p>Tidak ada submission</p>
{:else}
  <ul>
    {#each data.submissions as submission}
      <li>
        <a href={`/submission/${submission.id}`}>
          {submission.title} - {submission.status}
        </a>
      </li>
    {/each}
  </ul>
{/if}