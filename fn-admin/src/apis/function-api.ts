import type { FunctionMethod, FunctionModel } from "./../store/models";
import { http } from "./http";

export type AddFunctionData = {
  method: FunctionMethod;
  url: string;
  code: string;
};

export type UpdateFunctionData = {
  method: FunctionMethod;
  url: string;
  code: string;
};

export const functionApi = {
  async get(functionId: string): Promise<FunctionModel> {
    const response = await http.get(`/api/functions/${functionId}`);
    return response.data.function;
  },
  async list(): Promise<FunctionModel[]> {
    const response = await http.get(`/api/functions`);
    return response.data.functions;
  },
  async add(data: AddFunctionData): Promise<FunctionModel> {
    const response = await http.post("/api/functions", data);
    return response.data.function;
  },
  async update(
    functionId: string,
    data: UpdateFunctionData
  ): Promise<FunctionModel> {
    const response = await http.put(`/api/functions/${functionId}`, data);
    return response.data.function;
  },
  async delete(functionId: string): Promise<void> {
    await http.delete(`/api/functions/${functionId}`);
  },
};
