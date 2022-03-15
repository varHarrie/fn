<template>
  <div class="function-list-view">
    <div class="side">
      <NButton block type="primary" :disabled="loading" @click="onShowAddModal">
        <template #icon>
          <NIcon>
            <IconAdd />
          </NIcon>
        </template>
        新增函数
      </NButton>
      <div class="list">
        <NSpin v-model:show="loading">
          <RouterLink
            v-for="fn of functions"
            :key="fn.method + fn.url"
            :to="`/functions/${fn.method}/${fn.url}`"
            class="item"
          >
            <span class="method" :class="fn.method">{{
              fn.method.slice(0, 3)
            }}</span>
            <span class="url">{{ "/" + fn.url }}</span>
          </RouterLink>
        </NSpin>
      </div>
    </div>
    <div class="main">
      <NEmpty v-if="route.name === 'functions'" size="large">请选择函数</NEmpty>
      <RouterView v-else />
    </div>
    <AddFunctionModal v-model:show="addModal.show" @ok="onAddModalOk" />
  </div>
</template>

<script lang="ts" setup>
import { NButton, NEmpty, NIcon, NSpin, useThemeVars } from "naive-ui";
import { reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { functionApi } from "/@/apis/function-api";
import useHandling from "/@/compositions/use-handling";
import router from "/@/router";
import type { FunctionModel } from "/@/store/models";
import IconAdd from "~icons/ri/add-line";

import AddFunctionModal from "./AddFunctionModal.vue";

const route = useRoute();
const theme = useThemeVars();
const functions = ref<FunctionModel[]>([]);

const [loading, load] = useHandling(async () => {
  functions.value = await functionApi.list();
});

watch(
  () => route.name,
  (name, oldName) => {
    if (!oldName || name === "functions") {
      load();
    }
  },
  { immediate: true }
);

const addModal = reactive({
  show: false,
});

const onShowAddModal = () => {
  addModal.show = true;
};

const onAddModalOk = async (fn: FunctionModel) => {
  await load();
  router.push(`/functions/${fn.method}/${fn.url}`);
};
</script>

<style lang="less" scoped>
.function-list-view {
  padding-top: 20px;
  display: flex;
  flex: 1;
  overflow-y: auto;

  .side {
    display: flex;
    flex-direction: column;
    padding: 0 18px;
    width: 300px;

    .list {
      margin-top: 12px;
      padding: 12px 0;
      flex: 1;
      min-height: 0;
      border-top: 1px solid v-bind("theme.borderColor");
      overflow-y: auto;

      .item {
        padding: 0 12px;
        display: flex;
        align-items: center;
        height: 36px;
        cursor: pointer;
        border-radius: v-bind("theme.borderRadius");

        &:hover {
          background: v-bind("theme.buttonColor2");
        }

        &.router-link-active {
          background: rgba(32, 128, 240, 0.16);
        }

        .method {
          display: inline-block;
          color: #fff;
          font-size: 12px;

          &.GET {
            color: v-bind("theme.successColor");
          }

          &.POST {
            color: v-bind("theme.primaryColor");
          }

          &.PUT {
            color: v-bind("theme.warningColor");
          }

          &.PUT {
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
  }
}
</style>
