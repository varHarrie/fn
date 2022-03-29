<template>
  <NConfigProvider abstract :theme-overrides="themeOverrides" :locale="locale">
    <NLoadingBarProvider>
      <NMessageProvider>
        <NDialogProvider>
          <RequestErrorHandler>
            <RouterView />
          </RequestErrorHandler>
        </NDialogProvider>
      </NMessageProvider>
    </NLoadingBarProvider>
  </NConfigProvider>
</template>

<script setup lang="ts">
import {
  type GlobalThemeOverrides,
  createLocale,
  NConfigProvider,
  NDialogProvider,
  NLoadingBarProvider,
  NMessageProvider,
  zhCN,
} from "naive-ui";

import RequestErrorHandler from "./components/RequestErrorHandler/RequestErrorHandler.vue";

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: "#465FF9",
    primaryColorHover: "#576CF4",
    primaryColorPressed: "#374FEC",
    primaryColorSuppl: "#465FF9",
    infoColor: "#53A8FE", // #7393FF
    infoColorHover: "#65AFF8",
    infoColorPressed: "#3F92E6",
    infoColorSuppl: "#53A8FE",
    successColor: "#43D5B3", // #00DD8C
    successColorHover: "#4DDFBD",
    successColorPressed: "#38C7A5",
    successColorSuppl: "#43D5B3",
    errorColor: "#F25C50", // #FF737B
    errorColorHover: "#F25C50",
    errorColorPressed: "#F25C50",
    errorColorSuppl: "#F25C50",
    warningColor: "#FFB74D", // #F8AD39
    warningColorHover: "#FFB74D",
    warningColorPressed: "#FFB74D",
    warningColorSuppl: "#FFB74D",
  },
};

const locale = createLocale(
  {
    Input: { placeholder: "" },
  },
  zhCN
);
</script>
