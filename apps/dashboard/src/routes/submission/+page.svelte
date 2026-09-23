<script lang="ts">
  import * as Card from '@repo/components';
  import { Badge } from '@repo/components';
  import { Button } from '@repo/components';
  import { Input } from '@repo/components'

  type StatusKey = 'DRAFT' | 'AWAITING_REVIEW' | 'IN_REVIEW' | 'APPROVED' | 'ACTION_REQUIRED' | 'REJECTED' | 'RESUBMITTED';

  type Submission = {
    id: string;
    title: string;
    type: 'Buku' | 'Esai';
    status: StatusKey;
    genre?: string;
    updatedAt: string;
    createdAt: string;
  };

  const statusConfig: Record<StatusKey, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; class: string }> = {
    DRAFT:            { label: 'Draf',              variant: 'secondary',    class: 'bg-muted text-muted-foreground' },
    AWAITING_REVIEW:  { label: 'Menunggu Review',   variant: 'outline',      class: 'border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400' },
    IN_REVIEW:        { label: 'Sedang Direview',   variant: 'default',      class: 'bg-blue-600 text-white' },
    APPROVED:         { label: 'Disetujui',         variant: 'default',      class: 'bg-emerald-600 text-white' },
    ACTION_REQUIRED:  { label: 'Perlu Revisi',      variant: 'destructive',  class: 'bg-orange-500 text-white' },
    REJECTED:         { label: 'Ditolak',           variant: 'destructive',  class: '' },
    RESUBMITTED:      { label: 'Diajukan Ulang',    variant: 'outline',      class: 'border-purple-300 text-purple-600 dark:border-purple-700 dark:text-purple-400' },
  };

  const submissions: Submission[] = [
    { id: '1', title: 'Rindu yang Tertinggal di Pantai Selatan', type: 'Buku', status: 'IN_REVIEW', genre: 'Fiksi', updatedAt: '2 hari lalu', createdAt: '10 hari lalu' },
    { id: '2', title: 'Esai tentang Keberagaman Budaya Nusantara', type: 'Esai', status: 'ACTION_REQUIRED', genre: 'Non-fiksi', updatedAt: '5 hari lalu', createdAt: '20 hari lalu' },
    { id: '3', title: 'Perjalanan Panjang Menuju Cahaya', type: 'Buku', status: 'DRAFT', genre: 'Fiksi', updatedAt: '1 minggu lalu', createdAt: '1 minggu lalu' },
    { id: '4', title: 'Refleksi Sastra Modern Indonesia', type: 'Esai', status: 'APPROVED', genre: 'Kritik Sastra', updatedAt: '2 minggu lalu', createdAt: '1 bulan lalu' },
  ];

  let searchQuery = $state('');
  let activeFilter = $state<StatusKey | 'ALL'>('ALL');

  const filters: Array<{ label: string; value: StatusKey | 'ALL' }> = [
    { label: 'Semua', value: 'ALL' },
    { label: 'Draf', value: 'DRAFT' },
    { label: 'Review', value: 'IN_REVIEW' },
    { label: 'Perlu Revisi', value: 'ACTION_REQUIRED' },
    { label: 'Disetujui', value: 'APPROVED' },
  ];

  const filtered = $derived(
    submissions.filter(s => {
      const matchSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = activeFilter === 'ALL' || s.status === activeFilter;
      return matchSearch && matchFilter;
    })
  );
</script>

<svelte:head>
  <title>Submission Saya — Penerbit Nusantara</title>
</svelte:head>

<div class="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
  <!-- Page Header -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Submission Saya</h1>
      <p class="text-sm text-muted-foreground mt-0.5">Kelola semua pengajuan naskah Anda</p>
    </div>
    <Button href="/submission/new" class="rounded-full w-full sm:w-auto">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-4 mr-2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      Buat Submission
    </Button>
  </div>

  <!-- Search & Filter -->
  <div class="flex flex-col gap-3">
    <div class="relative">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <Input
        type="search"
        placeholder="Cari judul naskah..."
        class="pl-10 rounded-full border-muted"
        bind:value={searchQuery}
      />
    </div>
    <!-- Filter Pills -->
    <div class="flex gap-2 flex-wrap">
      {#each filters as f}
        <button
          onclick={() => activeFilter = f.value}
          class="rounded-full px-3 py-1 text-xs font-medium transition-all
            {activeFilter === f.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'}"
        >
          {f.label}
        </button>
      {/each}
    </div>
  </div>

  <!-- Submission List -->
  {#if filtered.length === 0}
    <Card.Root class="shadow-sm">
      <Card.Content class="flex flex-col items-center justify-center py-16 text-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8 text-muted-foreground">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <h3 class="font-semibold mb-1">Tidak ada submission ditemukan</h3>
        <p class="text-sm text-muted-foreground mb-4">Coba ubah filter atau mulai buat submission baru</p>
        <Button href="/submission/new" variant="outline" class="rounded-full">
          Buat Submission Pertama
        </Button>
      </Card.Content>
    </Card.Root>
  {:else}
    <div class="grid gap-3">
      {#each filtered as submission}
        {@const config = statusConfig[submission.status]}
        <Card.Root class="shadow-sm hover:shadow-md transition-shadow group">
          <Card.Content class="p-4 md:p-5">
            <div class="flex items-start gap-4">
              <!-- Type Icon -->
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {#if submission.type === 'Buku'}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.966 8.966 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                {:else}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                {/if}
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-start justify-between gap-2 mb-1">
                  <a href="/submission/{submission.id}" class="font-semibold text-sm hover:text-primary transition-colors line-clamp-2">
                    {submission.title}
                  </a>
                  <Badge class="rounded-full text-xs shrink-0 {config.class}">
                    {config.label}
                  </Badge>
                </div>
                <div class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                    </svg>
                    {submission.type}
                  </span>
                  {#if submission.genre}
                    <span>·</span>
                    <span>{submission.genre}</span>
                  {/if}
                  <span>·</span>
                  <span>Diperbarui {submission.updatedAt}</span>
                </div>
              </div>
            </div>

            <!-- Action Row (shown on ACTION_REQUIRED) -->
            {#if submission.status === 'ACTION_REQUIRED'}
              <div class="mt-3 pt-3 border-t border-orange-100 dark:border-orange-900/30 flex items-center justify-between">
                <p class="text-xs text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  Editor memberikan catatan — perlu tindakan
                </p>
                <Button href="/submission/{submission.id}" size="sm" class="rounded-full h-7 text-xs bg-orange-500 hover:bg-orange-600 text-white">
                  Lihat Catatan
                </Button>
              </div>
            {/if}
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  {/if}
</div>