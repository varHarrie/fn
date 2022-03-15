<template>
  <div class="login-view">
    <div class="center">
      <div class="title">
        <div class="logo">fn</div>
      </div>
      <NForm ref="formRef" :model="formModel" :rules="formRules">
        <NFormItem path="username" label="用户名">
          <NInput
            v-model:value="formModel.username"
            :maxlength="30"
            placeholder=""
            @keypress.enter="onSubmit"
          />
        </NFormItem>
        <NFormItem path="password" label="密码">
          <NInput
            v-model:value="formModel.password"
            type="password"
            show-password-on="mousedown"
            placeholder=""
            :maxlength="50"
            @keypress.enter="onSubmit"
          />
        </NFormItem>
        <NFormItem>
          <NButton block type="primary" @click="onSubmit">登录</NButton>
        </NFormItem>
      </NForm>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  type FormInst,
  NButton,
  NForm,
  NFormItem,
  NInput,
  useMessage,
  useThemeVars,
} from "naive-ui";
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { authApi } from "/@/apis/auth-api";

const route = useRoute();
const router = useRouter();
const message = useMessage();
const theme = useThemeVars();

const formRef = ref<FormInst>();

const formModel = reactive({
  username: "",
  password: "",
});

const formRules = reactive({
  username: [{ required: true, whitespace: true, message: "用户名不能为空" }],
  password: [{ required: true, whitespace: true, message: "密码不能为空" }],
});

const onSubmit = async (e: Event) => {
  e.preventDefault();
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
  } catch {
    return;
  }

  try {
    const token = await authApi.login(formModel);
    localStorage.setItem("token", token);
    const redirect =
      decodeURIComponent((route.query.redirect ?? "") as string) || "/";
    router.push({ path: redirect });
  } catch (error) {
    message.error("用户名或密码错误");
  }
};
</script>

<style lang="less" scoped>
.login-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;

  .center {
    padding: 32px;
    background: #fff;
    width: 300px;
    box-shadow: v-bind("theme.boxShadow3");
    border-radius: v-bind("theme.borderRadius");

    .title {
      margin-bottom: 32px;
      text-align: center;

      .logo {
        display: inline-block;
        width: 64px;
        height: 64px;
        line-height: 64px;
        font-size: 36px;
        font-weight: bold;
        color: v-bind("theme.primaryColor");
        background: #cce7ff;
        border-radius: v-bind("theme.borderRadius");
      }
    }
  }
}
</style>
