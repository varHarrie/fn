import { http } from "./http";

export type LoginData = {
  username: string;
  password: string;
};

export const authApi = {
  async login(data: LoginData): Promise<string> {
    const response = await http.post(`/api/login`, data);
    return response.data.token;
  },
};
