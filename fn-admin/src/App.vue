<template>
  <NConfigProvider abstract :theme-overrides="themeOverrides">
    <NLoadingBarProvider>
      <NMessageProvider>
        <NDialogProvider>
          <RouterView />
        </NDialogProvider>
      </NMessageProvider>
    </NLoadingBarProvider>
  </NConfigProvider>
</template>

<script setup lang="ts">
import {
  NConfigProvider,
  NDialogProvider,
  NLoadingBarProvider,
  NMessageProvider,
} from "naive-ui";

import type { RequestFailEvent } from "./apis/http";

const themeOverrides = {
  common: {
    primaryColor: "#008eff",
    primaryColorHover: "#037DE0",
    primaryColorPressed: "#2EA1FF",
    primaryColorSuppl: "#008eff",
  },
};

window.addEventListener("request-fail", (e) => {
  const { status } = (e as RequestFailEvent).detail;

  if (status === 401) {
    location.replace(
      `/login?redirect=${encodeURIComponent(location.pathname)}`
    );
  }
});
</script>
