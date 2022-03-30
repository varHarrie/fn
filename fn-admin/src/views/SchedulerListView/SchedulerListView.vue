<template>
  <div class="scheduler-list-view">
    <div class="container">
      <div class="header">
        <span class="title">定时器</span>
        <NButton type="primary" @click="addModal.show()">添加定时器</NButton>
      </div>
      <NDataTable v-bind="table" />
    </div>
    <AddSchedulerModal v-bind="addModal.props" />
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

import { schedulerApi } from "/@/apis/scheduler-api";
import useHandling from "/@/compositions/use-handling";
import useModal from "/@/compositions/use-modal";
import type { SchedulerModel } from "/@/store/models";

import AddSchedulerModal from "./AddSchedulerModal.vue";

const theme = useThemeVars();

type TableModel = {
  loading: Ref<boolean>;
  columns: DataTableColumn<SchedulerModel>[];
  data: SchedulerModel[];
};

const [loading, load] = useHandling(async () => {
  table.data = await schedulerApi.list();
});

const table = reactive<TableModel>({
  loading,
  columns: [
    { title: "名称", key: "name" },
    { title: "频率", key: "frequency" },
    { title: "Method", key: "method" },
    { title: "Url", key: "url" },
    {
      title: "操作",
      key: "actions",
      render(row) {
        return (
          <NButton
            secondary
            type="error"
            onClick={() => onDeleteScheduler(row)}
          >
            删除
          </NButton>
        );
      },
    },
  ],
  data: [],
});

onMounted(() => load());

const addModal = useModal({
  onOk: async () => {
    await load();
  },
});

const dialog = useDialog();
const message = useMessage();

const onDeleteScheduler = (scheduler: SchedulerModel) => {
  const confirm = dialog.info({
    title: "确定",
    content: "确定要删除该定时器？",
    positiveText: "确定",
    onPositiveClick: async () => {
      confirm.loading = true;
      await schedulerApi.delete(scheduler.id);

      message.success("删除成功");
      load();
    },
  });
};
</script>

<style lang="less" scoped>
.scheduler-list-view {
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
