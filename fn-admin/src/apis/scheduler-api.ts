import type { FunctionMethod, SchedulerModel } from "./../store/models";
import { http } from "./http";

export type SaveSchedulerData = {
  name: string;
  frequency: string;
  method: FunctionMethod;
  url: string;
};

export const schedulerApi = {
  async list(): Promise<SchedulerModel[]> {
    const response = await http.get(`/api/schedulers`);
    return response.data.schedulers;
  },
  async save(data: SaveSchedulerData): Promise<SchedulerModel> {
    const response = await http.post("/api/schedulers", data);
    return response.data.scheduler;
  },
  async delete(id: string): Promise<void> {
    await http.delete("/api/schedulers", { params: { id } });
  },
};
