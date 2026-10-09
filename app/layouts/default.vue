<script setup lang="ts">
import { startNewChat } from "~/composables/chat/navigation";
import { useThreadList } from "~/composables/chat/useThreads";
import { workspaceNavigation, isWorkspaceItemActive } from "~/utils/workspace-navigation";

const sidebarOpen = ref(false);
const searchOpen = useState("workspace-search-open", () => false);
const route = useRoute();
const { threads, pending, error, refresh } = useThreadList();

function newChat() {
  sidebarOpen.value = false;
  void startNewChat();
}

watch(() => route.fullPath, () => { sidebarOpen.value = false; });
watch(searchOpen, (open) => { if (open) sidebarOpen.value = false; });

const searchGroups = computed(() => [
  {
    id: "pages", label: "Pages",
    items: workspaceNavigation.filter(item => !!item.to).map(item => ({
      label: item.label, to: item.to, icon: item.icon,
    })),
  },
  {
    id: "actions", label: "Actions",
    items: [{ label: "New chat", icon: "i-lucide-circle-plus", kbds: ["meta", "o"], onSelect: newChat }],
  },
  ...(threads.value.length ? [{
    id: "threads", label: "Recent chats",
    items: threads.value.map(thread => ({ label: thread.title, to: `/chat/${thread.id}`, icon: "i-lucide-message-square" })),
  }] : []),
]);

defineShortcuts({
  meta_o: newChat,
  meta_k: () => { searchOpen.value = true; },
});
</script>

<template>
  <UDashboardGroup unit="rem">
    <a href="#workspace-main" class="vm-skip-link">Skip to main content</a>
    <UDashboardSidebar
      id="default"
      v-model:open="sidebarOpen"
      :min-size="15"
      :default-size="17"
      :collapsed-size="4.5"
      collapsible
      resizable
      :menu="{ inset: false }"
      class="vm-sidebar"
      :ui="{ header: 'gap-2 px-4', body: 'gap-2 px-3 overflow-y-auto', footer: 'border-t border-default px-3 vm-safe-footer', content: 'bg-[var(--vm-sidebar)]' }"
    >
      <template #header="{ collapsed }">
        <NuxtLink to="/" class="vm-brand-link flex min-w-0 items-center gap-2.5" :class="collapsed ? 'mx-auto' : ''" aria-label="VisaMOTion home">
          <AppLogo class="h-6 w-auto shrink-0 text-primary" />
          <span v-if="!collapsed" class="truncate text-lg font-semibold tracking-tight text-highlighted">VisaMOTion</span>
        </NuxtLink>
        <UDashboardSidebarCollapse v-if="!collapsed" class="ms-auto hidden size-11 lg:inline-flex" aria-label="Collapse sidebar" />
      </template>
      <template #default="{ collapsed }">
        <UDashboardSidebarCollapse v-if="collapsed" class="mx-auto mb-2 size-11" aria-label="Expand sidebar" />
        <nav aria-label="Main navigation" class="shrink-0 space-y-1">
          <template v-for="item in workspaceNavigation" :key="item.label">
            <NuxtLink
              v-if="item.to"
              :to="item.to"
              class="vm-nav-item"
              :data-active="isWorkspaceItemActive(item, route.path)"
              :data-collapsed="collapsed"
              :aria-current="isWorkspaceItemActive(item, route.path) ? 'page' : undefined"
              :aria-label="item.label"
              :title="collapsed ? item.label : undefined"
            >
              <UIcon :name="item.icon" class="size-5 shrink-0" />
              <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
            </NuxtLink>
            <button
              v-else-if="item.action === 'new-chat'"
              type="button"
              class="vm-nav-item"
              :data-active="isWorkspaceItemActive(item, route.path)"
              :data-collapsed="collapsed"
              :aria-label="item.label"
              :title="collapsed ? item.label : undefined"
              @click="newChat"
            >
              <UIcon :name="item.icon" class="size-5 shrink-0" />
              <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
            </button>
            <div
              v-else
              class="vm-nav-item"
              aria-disabled="true"
              :data-collapsed="collapsed"
              :aria-label="`${item.label}: not available in this repository`"
              :title="`${item.label} — not available in this repository`"
            >
              <UIcon :name="item.icon" class="size-5 shrink-0" />
              <span v-if="!collapsed" class="min-w-0 flex-1 truncate">{{ item.label }}</span>
              <UIcon v-if="!collapsed" name="i-lucide-lock-keyhole" class="size-3.5 shrink-0" />
            </div>
          </template>
        </nav>
        <p v-if="!collapsed" class="shrink-0 px-3 py-2 text-xs leading-relaxed text-muted">Locked sections are not implemented in this repository.</p>
        <USeparator class="shrink-0" />
        <UButton
          :label="collapsed ? undefined : 'Search chats'"
          icon="i-lucide-search"
          color="neutral"
          variant="ghost"
          class="min-h-11 shrink-0"
          :class="collapsed ? 'mx-auto' : 'justify-start'"
          aria-label="Search chats"
          @click="searchOpen = true"
        />
        <template v-if="!collapsed">
          <p class="shrink-0 px-3 pt-2 text-xs font-medium text-muted">Recent chats</p>
          <div v-if="error" class="px-3 text-sm text-error" role="alert">
            Unable to load chats.
            <UButton label="Retry" variant="link" @click="refresh()" />
          </div>
          <ChatThreadList v-else class="min-h-40 flex-1 shrink-0" :threads="threads" :pending="pending" @refresh="refresh()" />
        </template>
      </template>
      <template #footer="{ collapsed }">
        <span v-if="!collapsed" class="text-xs text-muted">VisaMOTion workspace</span>
        <UserMenu class="ms-auto" />
      </template>
    </UDashboardSidebar>
    <UDashboardSearch v-model:open="searchOpen" placeholder="Search pages, chats and actions…" :groups="searchGroups" />
    <main id="workspace-main" tabindex="-1" class="vm-workspace flex min-h-0 flex-1">
      <slot />
    </main>
  </UDashboardGroup>
</template>
