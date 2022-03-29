<template>
  <Render />
</template>

<script lang="tsx" setup>
import { NIcon, useThemeVars } from "naive-ui";
import { type Component, useSlots } from "vue";

import { hasContent } from "/@/utils/vnode";

type PlaceholderProps = {
  icon?: Component;
  text?: string;
};

const props = defineProps<PlaceholderProps>();

const theme = useThemeVars();
const slots = useSlots();

const Render = () => {
  const defaultSlot = slots.default?.();
  if (hasContent(defaultSlot)) return defaultSlot;

  return (
    <div class="placeholder">
      <NIcon component={props.icon} size="32px" />
      <span class="text">{props.text}</span>
    </div>
  );
};
</script>

<style lang="less">
.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: v-bind("theme.textColor3");

  .text {
    margin-top: 12px;
  }
}
</style>
