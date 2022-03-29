<template>
  <div class="function-list-view">
    <div class="container">
      <div class="side">
        <div class="head">
          <NInput>
            <template #prefix>
              <NIcon :component="IconSearch" />
            </template>
          </NInput>
          <NButton secondary type="primary" :disabled="loading" @click="onAdd">
            <template #icon>
              <NIcon :component="IconAdd" />
            </template>
          </NButton>
        </div>
        <div class="list">
          <NSpin v-model:show="loading">
            <RouterLink
              v-for="fn of functions"
              :key="fn.id"
              :to="`/functions/${fn.id}`"
              class="item"
            >
              <span class="method" :class="fn.method">
                {{ fn.method.slice(0, 3) }}
              </span>
              <span class="url">{{ "/" + fn.url }}</span>
            </RouterLink>
          </NSpin>
        </div>
      </div>
      <div class="main">
        <Placeholder :icon="IconSelect" text="请选择函数">
          <RouterView v-if="route.name !== 'functions'" @refresh="onRefresh" />
        </Placeholder>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NButton, NIcon, NInput, NSpin, useThemeVars } from "naive-ui";
import { transparentize } from "polished";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { functionApi } from "/@/apis/function-api";
import Placeholder from "/@/components/Placeholder";
import useHandling from "/@/compositions/use-handling";
import type { FunctionModel } from "/@/store/models";
import IconSelect from "~icons/mdi/cursor-default-click-outline";
import IconSearch from "~icons/mdi/magnify";
import IconAdd from "~icons/mdi/plus";

const route = useRoute();
const router = useRouter();

const theme = useThemeVars();
const itemActiveBg = transparentize(0.9, theme.value.primaryColor);

const functions = ref<FunctionModel[]>([]);

const [loading, load] = useHandling(async () => {
  functions.value = await functionApi.list();
});

onMounted(() => load());
const onRefresh = () => load();

const onAdd = () => {
  router.push({ name: "function", params: { functionId: "new" } });
};
</script>

<style lang="less" scoped>
.function-list-view {
  padding: 20px 20px 0;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;

  .container {
    display: flex;
    flex: 1;
    min-height: 0;
    border: 1px solid v-bind("theme.borderColor");
    border-radius: v-bind("theme.borderRadius");
    background: #fff;
    overflow: hidden;

    .side {
      display: flex;
      flex-direction: column;
      width: 300px;

      .head {
        padding: 12px;
        display: flex;

        .n-input {
          margin-right: 8px;
          flex: 1;
          min-width: 0;
        }
      }

      .list {
        flex: 1;
        min-height: 0;
        border-top: 1px solid v-bind("theme.dividerColor");
        overflow-y: auto;

        .item {
          position: relative;
          padding: 0 12px;
          display: flex;
          align-items: center;
          height: 48px;
          cursor: pointer;

          &:hover {
            background: v-bind("theme.buttonColor2");
          }

          &.router-link-active {
            background: v-bind("itemActiveBg");

            &::after {
              position: absolute;
              top: 0;
              left: 0;
              display: block;
              width: 3px;
              height: 100%;
              content: "";
              background-color: v-bind("theme.primaryColorHover");
            }
          }

          .method {
            display: inline-block;
            color: #fff;
            font-size: 12px;
            font-weight: bold;

            &.GET {
              color: v-bind("theme.successColor");
            }

            &.POST {
              color: v-bind("theme.primaryColor");
            }

            &.PUT {
              color: v-bind("theme.warningColor");
            }

            &.PATCH {
              color: v-bind("theme.warningColor");
            }

            &.DELETE {
              color: v-bind("theme.errorColor");
            }
          }

          .url {
            margin-left: 8px;
            flex: 1;
            min-width: 0;
            color: v-bind("theme.textColor2");
            word-break: keep-all;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }

    .main {
      flex: 1;
      min-width: 0;

      .placeholder {
        box-shadow: v-bind("theme.boxShadow2"),
          0 0 0 1px v-bind("theme.dividerColor");
      }
    }
  }
}
</style>
