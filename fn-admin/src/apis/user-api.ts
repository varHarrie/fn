import type { UserModel } from "./../store/models";
import { http } from "./http";

export const userApi = {
  async me(): Promise<UserModel> {
    const response = await http.get(`/api/me`);
    return response.data.user;
  },
};
