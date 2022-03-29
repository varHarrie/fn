<template>
  <NModal
    title="添加成员"
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
      <NFormItem label="用户名" path="username">
        <NInput v-model:value="form.model.username" placeholder="" />
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
  useMessage,
} from "naive-ui";
import { type Ref, reactive, ref, watch } from "vue";

import { userApi } from "/@/apis/user-api";
import useHandling from "/@/compositions/use-handling";
import type { UserModel } from "/@/store/models";

const message = useMessage();

type AddUserModalProps = {
  show: boolean;
};

type AddUserModalEvents = {
  (e: "ok", user: UserModel): void;
  (e: "update:show", show: boolean): void;
};

const props = defineProps<AddUserModalProps>();

const emit = defineEmits<AddUserModalEvents>();

const getDefaultModel = () => {
  return {
    username: "",
  };
};

type FormProps = {
  ref: Ref<FormInst | undefined>;
  setRef: (el: unknown) => void;
  model: {
    username: string;
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
    username: [{ required: true, message: "请填写用户名" }],
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

  try {
    const user = await userApi.add(form.model);

    emit("update:show", false);
    emit("ok", user);
  } catch (error) {
    if (error instanceof Error) message.error(error.message);
  }
});

const onCancel = () => {
  emit("update:show", false);
};
</script>
