<script setup lang="ts">
import { startNewChat } from "~/composables/chat/navigation";
import { useAuthorizationChallenges } from "~/composables/chat/useAuthorizationChallenges";
import { workspacePageTitle } from "~/utils/workspace-navigation";

const route = useRoute();
const searchOpen = useState("workspace-search-open", () => false);
const { pendingChallenges, failedChallenges } = useAuthorizationChallenges();
const challenges = computed(() => [...pendingChallenges.value, ...failedChallenges.value]);
const pageTitle = computed(() => workspacePageTitle(route.path));
</script>

<template>
  <UDashboardNavbar :toggle="{ class: 'size-11' }" class="vm-navbar" :ui="{ left: 'min-w-0 gap-2', right: 'shrink-0 gap-1 sm:gap-2' }">
    <template #left>
      <slot name="title">
        <h1 class="truncate text-base font-semibold text-highlighted">{{ pageTitle }}</h1>
      </slot>
    </template>
    <template #right>
      <UButton
        label="Search"
        icon="i-lucide-search"
        variant="outline"
        color="neutral"
        class="vm-search hidden w-48 justify-start text-muted md:flex lg:w-56"
        aria-label="Search pages and chats"
        @click="searchOpen = true"
      >
        <template #trailing><UKbd value="meta" /><UKbd value="k" /></template>
      </UButton>
      <UButton icon="i-lucide-search" color="neutral" variant="ghost" class="size-11 md:hidden" aria-label="Search pages and chats" @click="searchOpen = true" />
      <UPopover :content="{ align: 'end', collisionPadding: 12 }">
        <UButton icon="i-lucide-bell" color="neutral" variant="ghost" class="relative size-11" :aria-label="challenges.length ? `${challenges.length} authorization notifications` : 'Notifications'">
          <span v-if="challenges.length" class="absolute right-1 top-1 size-2 rounded-full bg-warning" />
        </UButton>
        <template #content>
          <section class="max-h-96 w-80 max-w-[calc(100vw-2rem)] space-y-3 overflow-y-auto p-4" aria-label="Notifications">
            <h2 class="text-sm font-semibold text-highlighted">Notifications</h2>
            <p v-if="!challenges.length" class="text-sm text-muted">No authorization alerts in the current session.</p>
            <AgentAuthorizationRequest v-for="challenge in challenges" :key="challenge.name" :challenge="challenge" />
          </section>
        </template>
      </UPopover>
      <slot />
      <UserMenu />
      <UButton color="primary" variant="soft" icon="i-lucide-circle-plus" class="hidden size-11 md:flex lg:hidden" aria-label="New chat" @click="startNewChat()" />
    </template>
  </UDashboardNavbar>
</template>
