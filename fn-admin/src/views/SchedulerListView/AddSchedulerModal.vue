<template>
  <NModal
    title="创建定时器"
    preset="dialog"
    positive-text="确定"
    negative-text="取消"
    :show="show"
    :loading="loading"
    @positive-click="onOk"
    @negative-click="onCancel"
    @close="onCancel"
  >
    <NForm :ref="form.setRef" :model="form.model" :rules="form.rules">
      <NFormItem label="名称" path="name">
        <NInput v-model:value="form.model.name" placeholder="" />
      </NFormItem>
      <NFormItem label="频率" path="frequency">
        <NInput v-model:value="form.model.frequency" placeholder="Cron表达式" />
      </NFormItem>
      <NFormItem label="Method" path="method">
        <NSelect v-model:value="form.model.method" :options="methodOptions" />
      </NFormItem>
      <NFormItem label="URL" path="url">
        <NInput v-model:value="form.model.url" placeholder="" />
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
} from "naive-ui";
import { type Ref, reactive, ref, watch } from "vue";

import { schedulerApi } from "/@/apis/scheduler-api";
import useHandling from "/@/compositions/use-handling";
import {
  type SchedulerModel,
  FunctionMethod,
  methodOptions,
} from "/@/store/models";

type AddSchedulerModalProps = {
  show: boolean;
};

type AddSchedulerModalEvents = {
  (e: "ok", scheduler: SchedulerModel): void;
  (e: "cancel"): void;
};

const props = defineProps<AddSchedulerModalProps>();

const emit = defineEmits<AddSchedulerModalEvents>();

const getDefaultModel = () => {
  return {
    name: "",
    frequency: "",
    method: FunctionMethod.Get,
    url: "",
  };
};

type FormProps = {
  ref: Ref<FormInst | undefined>;
  setRef: (el: unknown) => void;
  model: {
    name: string;
    frequency: string;
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
    name: [{ required: true, message: "请填写名称" }],
    frequency: [{ required: true, message: "请填写频率" }],
    method: [{ required: true, message: "请选择Method" }],
    url: [
      { required: true, whitespace: true, message: "请填写URL" },
      {
        pattern: /^[0-9a-zA-Z-]+(\/[0-9a-zA-Z-]+)*$/,
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
  } catch (error) {
    return;
  }

  const scheduler = await schedulerApi.save(form.model);

  emit("ok", scheduler);
});

const onCancel = () => {
  emit("cancel");
};
</script>
