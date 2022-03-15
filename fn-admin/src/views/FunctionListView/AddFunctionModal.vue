<template>
  <NModal
    title="新增函数"
    preset="dialog"
    positive-text="确定"
    negative-text="取消"
    :show="show"
    :loading="loading"
    @positive-click="onOk"
    @negative-click="onCancel"
  >
    <NForm :ref="form.setRef" :model="form.model" :rules="form.rules">
      <NFormItem label="Method" path="method">
        <NSelect v-model:value="form.model.method" :options="methodOptions" />
      </NFormItem>
      <NFormItem label="URL" path="url">
        <NInput v-model:value="form.model.url" placeholder="your/new/url" />
      </NFormItem>
    </NForm>
  </NModal>
</template>

<script lang="ts" setup>
import {
  type FormInst,
  type FormRules,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NSelect,
  useMessage,
} from "naive-ui";
import { type Ref, reactive, ref, watch } from "vue";

import { functionApi } from "/@/apis/function-api";
import useHandling from "/@/compositions/use-handling";
import {
  type FunctionModel,
  FunctionMethod,
  methodOptions,
} from "/@/store/models";

const message = useMessage();

type AddFunctionModalProps = {
  show: boolean;
};

type AddFunctionModalEvents = {
  (e: "ok", fn: FunctionModel): void;
  (e: "update:show", show: boolean): void;
};

const props = defineProps<AddFunctionModalProps>();

const emit = defineEmits<AddFunctionModalEvents>();

const getDefaultModel = () => {
  return {
    method: FunctionMethod.Get,
    url: "",
  };
};

type FormProps = {
  ref: Ref<FormInst | undefined>;
  setRef: (el: unknown) => void;
  model: {
    method: FunctionMethod;
    url: string;
  };
  rules: FormRules;
};

const form = reactive<FormProps>({
  ref: ref<FormInst>(),
  setRef: (el) => {
    form.ref = el as FormInst;
  },
  model: getDefaultModel(),
  rules: {
    method: [{ required: true, message: "请选择Method" }],
    url: [
      { required: true, whitespace: true, message: "请填写URL" },
      {
        pattern: /^[0-9a-zA-Z-]+(\/[0-9a-zA-Z-]+)*(\.(js|ts))?$/,
        message: "URL格式不正确",
      },
    ],
  },
});

watch(
  () => props.show,
  () => {
    if (props.show) {
      form.model = getDefaultModel();
    }
  }
);

const [loading, onOk] = useHandling(async () => {
  if (!form.ref) return;

  try {
    await form.ref.validate();
  } catch {
    return;
  }

  try {
    const fn = await functionApi.save({
      ...form.model,
      code: decodeURIComponent(
        "export%20default%20function%20()%20%7B%0A%20%20%2F%2F%20YOUR%20CODE%0A%7D"
      ),
    });

    emit("update:show", false);
    emit("ok", fn);
  } catch (error) {
    if (error instanceof Error) message.error(error.message);
  }
});

const onCancel = () => {
  emit("update:show", false);
};
</script>
