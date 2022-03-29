import { acceptHMRUpdate, defineStore } from "pinia";

import { userApi } from "./../apis/user-api";
import type { UserModel } from "./models";

export const useAppStore = defineStore("app", {
  state: () => ({
    loginUser: undefined as UserModel | undefined,
  }),
  actions: {
    async getLoginUser() {
      this.loginUser = await userApi.me();
    },
    logout() {
      this.loginUser = undefined;
      localStorage.removeItem("token");
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot));
}
