<template>
  <div class="function-detail-view">
    <div class="editor">
      <CodeEditor v-if="fn" v-model:value="code" />
      <NEmpty v-else />
    </div>
    <div v-if="fn" class="details">
      <NSpace vertical>
        <NButton
          block
          type="primary"
          :disabled="fn.code === code"
          @click="onSave"
          >保存</NButton
        >
        <NButton block type="error" @click="onDelete">删除</NButton>
        <NDivider />
      </NSpace>
      <div class="title">详细信息</div>
      <div class="item">
        <div class="title">METHOD</div>
        <div class="content">{{ fn.method }}</div>
      </div>
      <div class="item">
        <div class="title">URL</div>
        <div class="content">{{ "/" + fn.url }}</div>
      </div>
      <div class="item">
        <div class="title">创建时间</div>
        <div class="content">
          {{ day(fn.createdAt).format("YYYY-MM-DD HH:mm:ss") }}
        </div>
      </div>
      <div class="item">
        <div class="title">修改时间</div>
        <div class="content">
          {{ day(fn.modifiedAt).format("YYYY-MM-DD HH:mm:ss") }}
        </div>
      </div>
      <div class="item">
        <div class="title">文件大小</div>
        <div class="content">{{ fn.size + "bytes" }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import day from "dayjs";
import {
  NButton,
  NDivider,
  NEmpty,
  NSpace,
  useDialog,
  useMessage,
  useThemeVars,
} from "naive-ui";
import { ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";

import { functionApi } from "/@/apis/function-api";
import CodeEditor from "/@/components/CodeEditor";
import type { FunctionMethod, FunctionModel } from "/@/store/models";

const route = useRoute();
const router = useRouter();
const theme = useThemeVars();
const dialog = useDialog();
const message = useMessage();

const fn = ref<FunctionModel | undefined>();
const code = ref<string>("");

const load = async (method: FunctionMethod, url: string) => {
  fn.value = await functionApi.get(method, url);
  code.value = fn.value.code;
};

watchEffect(() => {
  const { method, url } = route.params;
  if (method && url)
    load(method as FunctionMethod, Array.isArray(url) ? url.join("/") : url);
}, {});

const onSave = () => {
  const confirm = dialog.info({
    title: "确定",
    content: "确定保存？",
    positiveText: "确定",
    onPositiveClick: async () => {
      if (!fn.value) return;

      confirm.loading = true;

      await functionApi.save({
        method: fn.value.method,
        url: fn.value.url,
        code: code.value,
      });

      message.success("保存成功");
    },
  });
};

const onDelete = async () => {
  const confirm = dialog.info({
    title: "确定",
    content: "确定删除？",
    positiveText: "确定",
    onPositiveClick: async () => {
      if (!fn.value) return;

      confirm.loading = true;

      await functionApi.delete({
        method: fn.value.method,
        url: fn.value.url,
      });

      message.success("删除成功");
      router.replace({ name: "functions" });
    },
  });
};
</script>

<style lang="less" scoped>
.function-detail-view {
  display: flex;
  align-items: flex-start;
  height: 100%;

  .editor {
    padding: 12px;
    flex: 1;
    background: #fff;
    box-shadow: v-bind("theme.boxShadow1");
    border-radius: v-bind("theme.borderRadius");
    height: 100%;
    min-width: 0;
    box-sizing: border-box;

    .code-editor {
      height: 100%;
    }
  }

  .details {
    margin: 0 18px;
    padding: 12px;
    width: 300px;
    background: #fff;
    box-shadow: v-bind("theme.boxShadow1");
    border-radius: v-bind("theme.borderRadius");

    & > .title {
      font-weight: 500;
    }

    .item {
      .title {
        margin-top: 12px;
        font-size: 12px;
        color: v-bind("theme.textColor3");
      }

      .content {
        margin-top: 4px;
      }
    }
  }
}
</style>
