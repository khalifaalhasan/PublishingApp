<script lang="ts">
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  import AppSidebar from '$lib/components/AppSidebar.svelte';
  import * as Sidebar from '@repo/components';
  import { Separator } from '@repo/components';
  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Dashboard Penulis — Penerbit Nusantara</title>
  <meta name="description" content="Portal penulis untuk mengajukan naskah buku dan esai ke Penerbit Nusantara." />
</svelte:head>

<Sidebar.Provider>
  <AppSidebar />

  <Sidebar.Inset>
    <!-- Mobile Header -->
    <header class="flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sticky top-0 z-10">
      <Sidebar.Trigger class="-ml-1" />
      <Separator orientation="vertical" class="mr-2 h-4" />
      <div class="flex flex-1 items-center justify-between">
        <span class="text-sm font-medium text-muted-foreground">
          Portal Penulis
        </span>
        <div class="flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
            P
          </div>
        </div>
      </div>
    </header>

    <!-- Page Content -->
    <main class="flex flex-1 flex-col">
      {@render children()}
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>
