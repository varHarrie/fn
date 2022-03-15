import type { FunctionMethod, FunctionModel } from "./../store/models";
import { http } from "./http";

export type SaveFunctionData = {
  method: FunctionMethod;
  url: string;
  code: string;
};

export type DeleteFunctionData = {
  method: FunctionMethod;
  url: string;
};

export const functionApi = {
  async get(method: FunctionMethod, url: string): Promise<FunctionModel> {
    const response = await http.get(`/api/functions`, {
      params: { method, url },
    });
    return response.data.function;
  },
  async list(): Promise<FunctionModel[]> {
    const response = await http.get(`/api/functions`);
    return response.data.functions;
  },
  async save(data: SaveFunctionData): Promise<FunctionModel> {
    const response = await http.post("/api/functions", data);
    return response.data.function;
  },
  async delete(data: DeleteFunctionData): Promise<void> {
    await http.delete("/api/functions", { params: data });
  },
};
