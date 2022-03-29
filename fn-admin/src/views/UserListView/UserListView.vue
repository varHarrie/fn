<template>
  <div class="user-list-view">
    <div class="container">
      <div class="header">
        <span class="title">团队</span>
        <NButton type="primary" @click="onShowAddModal">添加成员</NButton>
      </div>
      <NDataTable v-bind="table" />
    </div>
    <AddUserModal v-model:show="addModal.show" @ok="onAddModalOk" />
  </div>
</template>

<script lang="tsx" setup>
import {
  type DataTableColumn,
  NButton,
  NDataTable,
  useDialog,
  useMessage,
  useThemeVars,
} from "naive-ui";
import { type Ref, onMounted, reactive } from "vue";

import { userApi } from "/@/apis/user-api";
import useHandling from "/@/compositions/use-handling";
import type { UserModel } from "/@/store/models";

import AddUserModal from "./AddUserModal.vue";

const theme = useThemeVars();

type TableModel = {
  loading: Ref<boolean>;
  columns: DataTableColumn<UserModel>[];
  data: UserModel[];
};

const [loading, load] = useHandling(async () => {
  table.data = await userApi.list();
});

const table = reactive<TableModel>({
  loading,
  columns: [
    { title: "帐号", key: "username" },
    {
      title: "操作",
      key: "actions",
      width: 200,
      render(row) {
        return (
          <NButton secondary type="error" onClick={() => onDeleteUser(row)}>
            删除
          </NButton>
        );
      },
    },
  ],
  data: [],
});

onMounted(() => load());

type EditModalData = {
  show: boolean;
};

const addModal = reactive<EditModalData>({
  show: false,
});

const onShowAddModal = () => {
  addModal.show = true;
};

const onAddModalOk = async (user: UserModel) => {
  dialog.success({
    title: "提示",
    positiveText: "确认",
    content: `已成功添加用户：${user.username}，初始密码为：${user.password}`,
  });
  await load();
};

const dialog = useDialog();
const message = useMessage();

const onDeleteUser = (user: UserModel) => {
  const confirm = dialog.info({
    title: "确定",
    content: "确定要删除该用户？",
    positiveText: "确定",
    onPositiveClick: async () => {
      confirm.loading = true;
      await userApi.delete(user.id);

      message.success("删除成功");
      load();
    },
  });
};
</script>

<style lang="less" scoped>
.user-list-view {
  padding: 20px 0;
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  .container {
    margin: 0 auto;
    padding: 20px;
    width: 1000px;
    max-width: 100%;
    background: #fff;
    border: 1px solid v-bind("theme.borderColor");
    border-top-left-radius: v-bind("theme.borderRadius");
    border-top-right-radius: v-bind("theme.borderRadius");

    .header {
      margin-bottom: 16px;
      display: flex;
      align-items: center;

      .title {
        flex: 1;
        font-size: 16px;
        font-weight: bold;
      }
    }
  }
}
</style>
