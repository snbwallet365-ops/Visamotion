<script setup lang="ts">
const colorMode = useColorMode();
colorMode.preference = "light";
useHead({ meta: [{ key: "theme-color", name: "theme-color", content: "#FFFFFF" }] });

useSiteSeo();
</script>

<template>
  <UApp :toaster="{ position: 'top-right' }" :tooltip="{ delayDuration: 200 }">
    <NuxtLoadingIndicator color="var(--ui-primary)" />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
