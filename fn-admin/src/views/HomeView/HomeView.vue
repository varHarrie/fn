<template>
  <div v-if="appStore.loginUser" class="home-view">
    <div class="system-bar">
      <div class="left">
        <img class="logo" src="/@/assets/images/logo.png" />
      </div>
      <div class="center">
        <div class="tabs">
          <RouterLink class="item" :to="{ name: 'functions' }">
            <IconFunction class="icon" />
            <span class="title">函数</span>
          </RouterLink>
          <RouterLink class="item" :to="{ name: 'schedulers' }">
            <IconScheduler class="icon" />
            <span class="title">定时器</span>
          </RouterLink>
          <RouterLink class="item" :to="{ name: 'users' }">
            <IconTeam class="icon" />
            <span class="title">团队</span>
          </RouterLink>
        </div>
      </div>
      <div class="right">
        <NDropdown
          trigger="click"
          :options="userMenu"
          @select="onUserMenuSelect"
        >
          <div class="info">
            <span class="title">{{ appStore.loginUser.username }}</span>
            <IconDown />
          </div>
        </NDropdown>
      </div>
    </div>
    <RouterView />
  </div>
</template>

<script lang="ts" setup>
import {
  NDropdown,
  useDialog,
  useLoadingBar,
  useMessage,
  useThemeVars,
} from "naive-ui";
import { transparentize } from "polished";
import { onMounted } from "vue";
import { useRouter } from "vue-router";

import { useAppStore } from "/@/store";
import IconTeam from "~icons/mdi/account-group-outline";
import IconDown from "~icons/mdi/chevron-down";
import IconScheduler from "~icons/mdi/clock-outline";
import IconFunction from "~icons/mdi/function-variant";

const router = useRouter();
const appStore = useAppStore();
const loader = useLoadingBar();
const message = useMessage();
const dialog = useDialog();
const theme = useThemeVars();

const logoBg = transparentize(0.8, theme.value.primaryColor);

onMounted(async () => {
  try {
    loader.start();
    await appStore.getLoginUser();
    loader.finish();
  } catch {
    router.replace("/");
  }
});

const userMenu = [
  {
    label: "退出登录",
    key: "logout",
  },
];

const onUserMenuSelect = (key: string) => {
  if (key === "logout") {
    dialog.info({
      title: "确定",
      content: "确定退出登录？",
      positiveText: "确定",
      onPositiveClick: async () => {
        appStore.logout();
        message.success("已退出登录");
        router.replace({ name: "login" });
      },
    });
  }
};
</script>

<style lang="less" scoped>
.home-view {
  display: flex;
  flex-direction: column;
  height: 100%;

  .system-bar {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 68px;
    background: #fff;
    border: 1px solid v-bind("theme.borderColor");
    z-index: 1;

    .left {
      position: absolute;
      top: 50%;
      left: 18px;
      transform: translateY(-50%);

      .logo {
        display: block;
        width: 48px;
        height: 48px;
      }
    }

    .center {
      height: 100%;

      .tabs {
        display: inline-flex;
        height: 100%;

        .item {
          position: relative;
          padding: 4px 28px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          color: v-bind("theme.textColor3");
          cursor: pointer;
          transition: color 0.3s;

          &:hover {
            color: v-bind("theme.textColor2");
          }

          &.router-link-active {
            color: v-bind("theme.primaryColor");

            &::after {
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              height: 2px;
              background: v-bind("theme.primaryColor");
              content: "";
            }
          }

          .icon {
            font-size: 16px;
          }

          .title {
            margin-top: 4px;
            white-space: nowrap;
            word-break: keep-all;
          }
        }
      }
    }

    .right {
      position: absolute;
      top: 50%;
      right: 18px;
      transform: translateY(-50%);

      .info {
        display: flex;
        align-items: center;
        cursor: pointer;

        .avatar {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 100%;
          background: #eee;
          font-size: 16px;
          color: v-bind("theme.textColor3");
        }

        .title {
          margin-left: 12px;
          color: v-bind("theme.textColor2");
        }
      }
    }
  }
}
</style>
