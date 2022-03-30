<template>
  <NModal
    title="修改密码"
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
      <NFormItem label="旧密码" path="oldPassword">
        <NInput
          type="password"
          show-password-on="click"
          v-model:value="form.model.oldPassword"
        />
      </NFormItem>
      <NFormItem label="新密码" path="newPassword">
        <NInput
          type="password"
          show-password-on="click"
          v-model:value="form.model.newPassword"
        />
      </NFormItem>
      <NFormItem label="重复新密码" path="newPasswordRepeat">
        <NInput
          type="password"
          show-password-on="click"
          v-model:value="form.model.newPasswordRepeat"
        />
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
} from "naive-ui";
import { type Ref, reactive, ref, watch } from "vue";

import { userApi } from "/@/apis/user-api";
import useHandling from "/@/compositions/use-handling";

type AddSchedulerModalProps = {
  show: boolean;
};

type AddSchedulerModalEvents = {
  (e: "ok"): void;
  (e: "cancel"): void;
};

const props = defineProps<AddSchedulerModalProps>();

const emit = defineEmits<AddSchedulerModalEvents>();

const getDefaultModel = () => {
  return {
    oldPassword: "",
    newPassword: "",
    newPasswordRepeat: "",
  };
};

type FormProps = {
  ref: Ref<FormInst | undefined>;
  setRef: (el: unknown) => void;
  model: {
    oldPassword: string;
    newPassword: string;
    newPasswordRepeat: string;
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
    oldPassword: [{ required: true, message: "请填写旧密码" }],
    newPassword: [{ required: true, message: "请填写新密码" }],
    newPasswordRepeat: [
      { required: true, message: "请填写新密码" },
      {
        validator: (rule, value) => {
          if (value !== form.model.newPassword) {
            return Error("两次输入密码不一致");
          }
        },
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

  await userApi.changePassword({
    oldPassword: form.model.oldPassword,
    newPassword: form.model.newPassword,
  });

  emit("ok");
});

const onCancel = () => {
  emit("cancel");
};
</script>
