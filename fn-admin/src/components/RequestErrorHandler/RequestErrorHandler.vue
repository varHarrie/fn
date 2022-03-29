<template>
  <slot />
</template>

<script lang="ts" setup>
import { useMessage } from "naive-ui";

import type { RequestFailEvent } from "/@/apis/http";

const message = useMessage();

window.addEventListener("request-fail", (e) => {
  const { detail } = e as RequestFailEvent;

  switch (detail.status) {
    case 400: {
      message.error(detail.message);
      break;
    }

    case 401: {
      location.replace(
        `/login?redirect=${encodeURIComponent(location.pathname)}`
      );
      break;
    }
  }
});
</script>
