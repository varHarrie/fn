<template>
  <div class="function-detail-view">
    <div class="editor">
      <Placeholder :icon="IconFunction" text="找不到该函数">
        <NForm class="head">
          <NInputGroup class="inputs">
            <NSelect
              v-model:value="fnEditing.method"
              :options="methodOptions"
            />
            <NInputGroupLabel>/f/</NInputGroupLabel>
            <NInput v-model:value="fnEditing.url">
              <template #suffix>
                <NIcon
                  class="clickable"
                  :component="IconCopy"
                  @click="onCopyUrl"
                />
              </template>
            </NInput>
          </NInputGroup>
          <NSpace class="actions">
            <NButton type="primary" :disabled="!savable" @click="onSave">
              <template #icon>
                <NIcon :component="IconSave" />
              </template>
              保存
            </NButton>
            <NButton v-if="fnOriginal" secondary type="error" @click="onDelete">
              <template #icon>
                <NIcon size="16px" :component="IconTrash" />
              </template>
            </NButton>
          </NSpace>
        </NForm>
        <div class="body">
          <CodeEditor v-model:value="fnEditing.code" />
        </div>
      </Placeholder>
    </div>
    <div v-if="fnOriginal" class="details">
      <div class="title">详细信息</div>
      <div class="item">
        <div class="title">创建时间</div>
        <div class="content">
          {{ day(fnOriginal.createdAt).format("YYYY-MM-DD HH:mm:ss") }}
        </div>
      </div>
      <div class="item">
        <div class="title">修改时间</div>
        <div class="content">
          {{ day(fnOriginal.modifiedAt).format("YYYY-MM-DD HH:mm:ss") }}
        </div>
      </div>
      <div class="item">
        <div class="title">文件大小</div>
        <div class="content">{{ fnOriginal.size + "bytes" }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import copy from "copy-text-to-clipboard";
import day from "dayjs";
import {
  NButton,
  NForm,
  NIcon,
  NInput,
  NInputGroup,
  NInputGroupLabel,
  NSelect,
  NSpace,
  useDialog,
  useMessage,
  useThemeVars,
} from "naive-ui";
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { functionApi } from "/@/apis/function-api";
import CodeEditor from "/@/components/CodeEditor";
import Placeholder from "/@/components/Placeholder/Placeholder.vue";
import useHandling from "/@/compositions/use-handling";
import {
  type FunctionModel,
  FunctionMethod,
  methodOptions,
} from "/@/store/models";
import IconSave from "~icons/mdi/check";
import IconCopy from "~icons/mdi/content-copy";
import IconTrash from "~icons/mdi/delete-outline";
import IconFunction from "~icons/mdi/function-variant";

type FunctionDetailViewEvents = {
  (type: "refresh"): void;
};

const emit = defineEmits<FunctionDetailViewEvents>();

const route = useRoute();
const router = useRouter();
const theme = useThemeVars();
const dialog = useDialog();
const message = useMessage();

type FunctionDetail = {
  method: FunctionMethod;
  url: string;
  code: string;
};

const createFunctionDetail = (ori?: FunctionModel) => {
  return {
    method: ori?.method ?? FunctionMethod.Get,
    url: ori?.url ?? "",
    code: ori?.code ?? "",
  };
};

const fnOriginal = ref<FunctionModel | undefined>();
const fnEditing = ref<FunctionDetail>(createFunctionDetail());

const [loading, load] = useHandling(async (functionId: string) => {
  const fn = await functionApi.get(functionId);

  if (!fn) {
    router.replace({ name: "functions" });
    return;
  }

  fnOriginal.value = fn;
  fnEditing.value = createFunctionDetail(fn);
});

watch(
  () => route.params.functionId,
  (functionId) => {
    if (functionId === "new") {
      fnOriginal.value = undefined;
      fnEditing.value = createFunctionDetail();
    } else {
      load(functionId as string);
    }
  },
  { immediate: true, flush: "post" }
);

const savable = computed(() => {
  return (
    !loading.value && (fnOriginal.value || route.params.functionId === "new")
  );
});

const onSave = () => {
  const confirm = dialog.info({
    title: "确定",
    content: "确定保存？",
    positiveText: "确定",
    onPositiveClick: async () => {
      confirm.loading = true;

      try {
        const result = fnOriginal.value
          ? await functionApi.update(fnOriginal.value.id, fnEditing.value)
          : await functionApi.add(fnEditing.value);

        router.replace({
          name: "function",
          params: { functionId: result.id },
        });
      } catch {
        confirm.loading = false;
        return;
      }

      message.success("保存成功");
      emit("refresh");
    },
  });
};

const onDelete = async () => {
  const confirm = dialog.info({
    title: "确定",
    content: "确定删除？",
    positiveText: "确定",
    onPositiveClick: async () => {
      if (!fnOriginal.value) return;
      confirm.loading = true;

      await functionApi.delete(fnOriginal.value.id);

      message.success("删除成功");
      router.replace({ name: "functions" });
      emit("refresh");
    },
  });
};

const onCopyUrl = () => {
  const originalUrl = fnEditing.value.url;

  const url =
    originalUrl && !originalUrl.startsWith("/")
      ? location.origin + "/f/" + originalUrl
      : location.origin + "/f" + originalUrl;

  copy(url);
  message.success("URL复制成功");
};
</script>

<style lang="less" scoped>
.function-detail-view {
  display: flex;
  align-items: flex-start;
  height: 100%;

  .editor {
    display: flex;
    flex-direction: column;
    flex: 1;
    background: #fff;
    box-shadow: v-bind("theme.boxShadow2"),
      0 0 0 1px v-bind("theme.dividerColor");
    height: 100%;
    min-width: 0;
    box-sizing: border-box;

    .head {
      padding: 12px;
      display: flex;

      .inputs {
        flex: 1;
        min-width: 500px;

        .clickable {
          cursor: pointer;
        }

        .n-select {
          width: 200px;
        }
      }

      .actions {
        margin-left: 12px;
        width: auto;
      }
    }

    .body {
      flex: 1;
      min-height: 0;
      border-top: 1px solid v-bind("theme.dividerColor");

      .code-editor {
        height: 100%;
      }
    }
  }

  .details {
    margin: 0 18px;
    padding: 12px;
    width: 300px;
    background: #fff;

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
