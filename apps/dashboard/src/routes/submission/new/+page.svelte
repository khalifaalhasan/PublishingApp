<script lang="ts">
import { Button, Input, Textarea, Label, Badge, Separator } from '@repo/components';

import * as Card from '@repo/components';
import * as Select from '@repo/components';

  type SubmissionType = 'buku' | 'esai' | null;

  // Multi-step state
  let currentStep = $state(1);
  let submissionType = $state<SubmissionType>(null);

  // Form data
  let form = $state({
    type: '' as SubmissionType,
    title: '',
    authorName: '',
    abstract: '',
    genre: '',
    wordCount: '',
    targetAudience: '',
    // Book specific
    synopsis: '',
    // Essay specific
    essayTopic: '',
    // File
    fileName: '',
  });

  let fileInput: HTMLInputElement;
  let dragOver = $state(false);

  const steps = [
    { num: 1, label: 'Tipe Naskah' },
    { num: 2, label: 'Detail Naskah' },
    { num: 3, label: 'Unggah File' },
  ];

  const genres = submissionType === 'esai'
    ? ['Kritik Sastra', 'Non-fiksi', 'Opini', 'Reportase', 'Budaya', 'Lainnya']
    : ['Fiksi', 'Non-fiksi', 'Puisi', 'Drama', 'Sains', 'Sejarah', 'Biografi', 'Lainnya'];

  function selectType(type: SubmissionType) {
    submissionType = type;
    form.type = type;
  }

  function nextStep() {
    if (currentStep < 3) currentStep++;
  }

  function prevStep() {
    if (currentStep > 1) currentStep--;
  }

  function handleFileDrop(e: DragEvent) {
    e.preventDefault();
    dragOver = false;
    const file = e.dataTransfer?.files[0];
    if (file) form.fileName = file.name;
  }

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files?.[0]) form.fileName = input.files[0].name;
  }

  function saveDraft() {
    alert('Draf disimpan! (Integrasi API belum tersedia)');
  }

  function submitForm() {
    alert('Submission berhasil diajukan! Status: AWAITING_REVIEW (Integrasi API belum tersedia)');
  }

  const canProceedStep1 = $derived(submissionType !== null);
  const canProceedStep2 = $derived(
    form.title.trim().length > 0 &&
    form.authorName.trim().length > 0 &&
    form.abstract.trim().length > 0 &&
    form.genre.length > 0
  );
</script>

<svelte:head>
  <title>Buat Submission Baru — Penerbit Nusantara</title>
</svelte:head>

<div class="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
  <!-- Page Header -->
  <div class="mb-6">
    <div class="flex items-center gap-2 text-sm text-muted-foreground mb-1">
      <a href="/submission" class="hover:text-foreground transition-colors">Submission Saya</a>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
      <span class="text-foreground font-medium">Buat Baru</span>
    </div>
    <h1 class="text-2xl font-bold tracking-tight">Pengajuan Naskah Baru</h1>
    <p class="text-sm text-muted-foreground mt-0.5">Isi formulir berikut untuk mengajukan naskah Anda kepada tim editor</p>
  </div>

  <!-- Step Indicator -->
  <div class="flex items-center gap-0 mb-8">
    {#each steps as step, i}
      <div class="flex items-center">
        <div class="flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all
            {currentStep > step.num
              ? 'bg-primary text-primary-foreground'
              : currentStep === step.num
                ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                : 'bg-muted text-muted-foreground'}">
            {#if currentStep > step.num}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            {:else}
              {step.num}
            {/if}
          </div>
          <span class="text-xs font-medium hidden sm:block
            {currentStep === step.num ? 'text-foreground' : 'text-muted-foreground'}">
            {step.label}
          </span>
        </div>
        {#if i < steps.length - 1}
          <div class="mx-3 h-px flex-1 w-8 sm:w-16 bg-muted {currentStep > step.num ? 'bg-primary' : ''}"></div>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Step Content -->
  <div class="max-w-2xl w-full">

    <!-- STEP 1: Pilih Tipe -->
    {#if currentStep === 1}
      <div class="space-y-4">
        <h2 class="text-lg font-semibold">Pilih Tipe Naskah</h2>
        <p class="text-sm text-muted-foreground">Pilih jenis karya yang ingin Anda ajukan</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <!-- Buku -->
          <button
            onclick={() => selectType('buku')}
            class="group relative flex flex-col items-start gap-3 rounded-2xl border-2 p-6 text-left transition-all hover:shadow-md
              {submissionType === 'buku'
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border hover:border-primary/50'}"
          >
            {#if submissionType === 'buku'}
              <div class="absolute top-4 right-4">
                <div class="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              </div>
            {/if}
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.966 8.966 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold mb-1">Naskah Buku</h3>
              <p class="text-xs text-muted-foreground leading-relaxed">
                Fiksi, non-fiksi, kumpulan cerpen, puisi, biografi, dan karya panjang lainnya
              </p>
            </div>
            <div class="flex gap-1 flex-wrap">
              {#each ['Fiksi', 'Non-fiksi', 'Puisi'] as tag}
                <Badge variant="secondary" class="rounded-full text-[10px] px-2 py-0">{tag}</Badge>
              {/each}
            </div>
          </button>

          <!-- Esai -->
          <button
            onclick={() => selectType('esai')}
            class="group relative flex flex-col items-start gap-3 rounded-2xl border-2 p-6 text-left transition-all hover:shadow-md
              {submissionType === 'esai'
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border hover:border-primary/50'}"
          >
            {#if submissionType === 'esai'}
              <div class="absolute top-4 right-4">
                <div class="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              </div>
            {/if}
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 transition-colors group-hover:bg-violet-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold mb-1">Esai</h3>
              <p class="text-xs text-muted-foreground leading-relaxed">
                Opini, kritik sastra, reportase, esai budaya, dan karya non-fiksi pendek
              </p>
            </div>
            <div class="flex gap-1 flex-wrap">
              {#each ['Opini', 'Kritik', 'Budaya'] as tag}
                <Badge variant="secondary" class="rounded-full text-[10px] px-2 py-0">{tag}</Badge>
              {/each}
            </div>
          </button>
        </div>

        <div class="flex justify-end pt-4">
          <Button onclick={nextStep} disabled={!canProceedStep1} class="rounded-full px-6">
            Lanjutkan
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-4 ml-2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Button>
        </div>
      </div>

    <!-- STEP 2: Detail Naskah -->
    {:else if currentStep === 2}
      <div class="space-y-5">
        <div class="flex items-center gap-2">
          <h2 class="text-lg font-semibold">Detail Naskah</h2>
          <Badge variant="outline" class="rounded-full text-xs capitalize">{submissionType}</Badge>
        </div>

        <div class="space-y-4">
          <!-- Judul -->
          <div class="space-y-2">
            <Label for="title">
              Judul Naskah <span class="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Masukkan judul naskah Anda"
              bind:value={form.title}
              class="rounded-lg"
            />
          </div>

          <!-- Nama Penulis -->
          <div class="space-y-2">
            <Label for="author">
              Nama Penulis <span class="text-destructive">*</span>
            </Label>
            <Input
              id="author"
              placeholder="Nama lengkap penulis"
              bind:value={form.authorName}
              class="rounded-lg"
            />
          </div>

          <!-- Genre -->
          <div class="space-y-2">
            <Label for="genre">
              Genre / Kategori <span class="text-destructive">*</span>
            </Label>
            <Select.Root type="single" bind:value={form.genre}>
              <Select.Trigger id="genre" class="w-full rounded-lg">
                {form.genre || 'Pilih genre...'}
              </Select.Trigger>
              <Select.Content>
                {#each (submissionType === 'esai' ? ['Kritik Sastra', 'Non-fiksi', 'Opini', 'Reportase', 'Budaya', 'Lainnya'] : ['Fiksi', 'Non-fiksi', 'Puisi', 'Drama', 'Sains', 'Sejarah', 'Biografi', 'Lainnya']) as g}
                  <Select.Item value={g}>{g}</Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </div>

          <!-- Abstract -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label for="abstract">
                Abstrak / Sinopsis Singkat <span class="text-destructive">*</span>
              </Label>
              <span class="text-xs text-muted-foreground">{form.abstract.length}/500</span>
            </div>
            <Textarea
              id="abstract"
              placeholder="Ceritakan secara singkat tentang naskah Anda, tema utama, dan apa yang membuat karya ini unik..."
              bind:value={form.abstract}
              class="rounded-lg resize-none min-h-[120px]"
              maxlength={500}
            />
          </div>

          <!-- Jumlah Kata & Target Pembaca (side by side) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="wordcount">Perkiraan Jumlah Kata</Label>
              <Input
                id="wordcount"
                type="number"
                placeholder="cth: 80000"
                bind:value={form.wordCount}
                class="rounded-lg"
              />
            </div>
            <div class="space-y-2">
              <Label for="audience">Target Pembaca</Label>
              <Input
                id="audience"
                placeholder="cth: Dewasa, Remaja, Anak"
                bind:value={form.targetAudience}
                class="rounded-lg"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div class="flex items-center justify-between pt-1">
          <Button onclick={prevStep} variant="outline" class="rounded-full px-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-4 mr-2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Kembali
          </Button>
          <div class="flex gap-2">
            <Button onclick={saveDraft} variant="outline" class="rounded-full px-6">
              Simpan Draf
            </Button>
            <Button onclick={nextStep} disabled={!canProceedStep2} class="rounded-full px-6">
              Lanjutkan
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-4 ml-2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

    <!-- STEP 3: Upload File -->
    {:else if currentStep === 3}
      <div class="space-y-5">
        <div>
          <h2 class="text-lg font-semibold">Unggah File Naskah</h2>
          <p class="text-sm text-muted-foreground mt-1">Format yang diterima: PDF, DOC, DOCX. Maksimal 50MB.</p>
        </div>

        <!-- Summary Card -->
        <Card.Root class="bg-muted/40 border-dashed">
          <Card.Content class="p-4">
            <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Ringkasan Naskah</h3>
            <div class="space-y-1.5 text-sm">
              <div class="flex items-center gap-2">
                <span class="text-muted-foreground min-w-[80px]">Tipe:</span>
                <Badge variant="outline" class="rounded-full text-xs capitalize">{form.type}</Badge>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-muted-foreground min-w-[80px]">Judul:</span>
                <span class="font-medium">{form.title || '—'}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-muted-foreground min-w-[80px]">Penulis:</span>
                <span>{form.authorName || '—'}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-muted-foreground min-w-[80px]">Genre:</span>
                <span>{form.genre || '—'}</span>
              </div>
            </div>
          </Card.Content>
        </Card.Root>

        <!-- File Drop Zone -->
        <div
          role="button"
          tabindex="0"
          class="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all cursor-pointer
            {dragOver
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : form.fileName
                ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'}"
          ondragover={(e) => { e.preventDefault(); dragOver = true; }}
          ondragleave={() => dragOver = false}
          ondrop={handleFileDrop}
          onclick={() => fileInput.click()}
          onkeydown={(e) => e.key === 'Enter' && fileInput.click()}
        >
          <input
            bind:this={fileInput}
            type="file"
            accept=".pdf,.doc,.docx"
            class="hidden"
            onchange={handleFileSelect}
          />

          {#if form.fileName}
            <div class="flex flex-col items-center gap-2">
              <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-7">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="font-semibold text-emerald-700 dark:text-emerald-400">{form.fileName}</p>
              <p class="text-xs text-muted-foreground">Klik untuk ganti file</p>
            </div>
          {:else}
            <div class="flex flex-col items-center gap-3">
              <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-7">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div>
                <p class="font-semibold">Seret & lepas file di sini</p>
                <p class="text-sm text-muted-foreground mt-1">atau <span class="text-primary underline underline-offset-2">klik untuk memilih file</span></p>
              </div>
              <p class="text-xs text-muted-foreground">PDF, DOC, DOCX · Maks. 50MB</p>
            </div>
          {/if}
        </div>

        <!-- Guidelines Note -->
        <div class="flex gap-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 p-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-blue-500 shrink-0 mt-0.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <div class="text-xs text-blue-700 dark:text-blue-300">
            <p class="font-semibold mb-0.5">Panduan Format Naskah</p>
            <p>Pastikan naskah menggunakan font Times New Roman 12pt, spasi 1.5, margin 3cm, dan format halaman A4 sebelum diunggah.</p>
          </div>
        </div>

        <Separator />

        <div class="flex items-center justify-between pt-1">
          <Button onclick={prevStep} variant="outline" class="rounded-full px-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-4 mr-2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Kembali
          </Button>
          <div class="flex gap-2">
            <Button onclick={saveDraft} variant="outline" class="rounded-full px-6">
              Simpan Draf
            </Button>
            <Button
              onclick={submitForm}
              disabled={!form.fileName}
              class="rounded-full px-6 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-4 mr-2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
              Ajukan Naskah
            </Button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
