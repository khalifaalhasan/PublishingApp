<script lang="ts">
  import * as Sidebar from "$components/components/ui/sidebar/index.js";
  import * as Tooltip from "$components/components/ui/tooltip/index.js";
  import { page } from "$app/state";

  type NavItem = {
    title: string;
    url: string;
    icon: string;
    badge?: string | number;
  };

  const navMain: NavItem[] = [
    {
      title: "Dashboard",
      url: "/",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      title: "Submission Saya",
      url: "/submission",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
    {
      title: "Buat Submission",
      url: "/submission/new",
      icon: "M12 4v16m8-8H4",
    },
  ];

  const isActive = (url: string) => {
    if (url === "/") return page.url.pathname === "/";
    return page.url.pathname.startsWith(url);
  };
</script>

<Sidebar.Root collapsible="icon">
  <Sidebar.Header>
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton size="lg" class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
          <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.966 8.966 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <div class="grid flex-1 text-left text-sm leading-tight">
            <span class="truncate font-semibold">Penerbit Nusantara</span>
            <span class="truncate text-xs text-muted-foreground">Portal Penulis</span>
          </div>
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>

  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.GroupLabel>Navigasi</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {#each navMain as item}
            <Sidebar.MenuItem>
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger>
                    {#snippet child({ props })}
                      <Sidebar.MenuButton
                        {...props}
                        isActive={isActive(item.url)}
                        class="w-full"
                      >
                        {#snippet child({ props: btnProps })}
                          <a href={item.url} {...btnProps} class="flex items-center gap-2 w-full">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 shrink-0">
                              <path stroke-linecap="round" stroke-linejoin="round" d={item.icon} />
                            </svg>
                            <span>{item.title}</span>
                            {#if item.badge}
                              <span class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground px-1">
                                {item.badge}
                              </span>
                            {/if}
                          </a>
                        {/snippet}
                      </Sidebar.MenuButton>
                    {/snippet}
                  </Tooltip.Trigger>
                  <Tooltip.Content side="right">
                    {item.title}
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
            </Sidebar.MenuItem>
          {/each}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>

  <Sidebar.Footer>
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton class="w-full text-left">
          {#snippet child({ props })}
            <a href="/auth/logout" {...props} class="flex items-center gap-2 w-full text-muted-foreground hover:text-destructive transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 shrink-0">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              <span>Keluar</span>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Footer>

  <Sidebar.Rail />
</Sidebar.Root>
