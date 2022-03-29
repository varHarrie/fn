import type { UserModel } from "./../store/models";
import { http } from "./http";

export type AddUserData = {
  username: string;
};

export const userApi = {
  async me(): Promise<UserModel> {
    const response = await http.get(`/api/me`);
    return response.data.user;
  },
  async list(): Promise<UserModel[]> {
    const response = await http.get(`/api/users`);
    return response.data.users;
  },
  async add(data: AddUserData): Promise<UserModel> {
    const response = await http.post("/api/users", data);
    return response.data.user;
  },
  async delete(id: string): Promise<void> {
    await http.delete(`/api/users/${id}`);
  },
};
