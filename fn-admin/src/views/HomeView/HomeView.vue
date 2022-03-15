<template>
  <div v-if="appStore.loginUser" class="home-view">
    <div class="system-bar">
      <div class="left">
        <div class="logo">fn</div>
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
        <div class="info">
          <div class="avatar"><IconUser /></div>
          <span class="title">{{ appStore.loginUser.username }}</span>
        </div>
      </div>
    </div>
    <RouterView />
  </div>
</template>

<script lang="ts" setup>
import { useLoadingBar, useMessage, useThemeVars } from "naive-ui";
import { onMounted } from "vue";
import { useRouter } from "vue-router";

import { useAppStore } from "/@/store";
import IconTeam from "~icons/ri/group-line";
import IconFunction from "~icons/ri/stack-line";
import IconScheduler from "~icons/ri/timer-line";
import IconUser from "~icons/ri/user-6-line";

const router = useRouter();
const appStore = useAppStore();
const loader = useLoadingBar();
const message = useMessage();
const theme = useThemeVars();

onMounted(async () => {
  try {
    loader.start();
    await appStore.getLoginUser();
    loader.finish();
  } catch (error) {
    if (error instanceof Error) message.error(error.message);
    router.replace("/");
  }
});
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
    box-shadow: v-bind("theme.boxShadow1");
    z-index: 1;

    .left {
      position: absolute;
      top: 50%;
      left: 18px;
      transform: translateY(-50%);

      .logo {
        display: inline-block;
        width: 48px;
        height: 48px;
        line-height: 48px;
        font-size: 24px;
        font-weight: bold;
        color: v-bind("theme.primaryColor");
        background: #cce7ff;
        border-radius: v-bind("theme.borderRadius");
        text-align: center;
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
