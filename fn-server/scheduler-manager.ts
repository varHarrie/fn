import {
  cron,
  ScheduledTask,
} from "https://deno.land/x/simple_cron@v0.1.0/mod.ts";
import store from "./store.ts";
import { Scheduler } from "./models.ts";

const tasks = new Map<string, ScheduledTask>();

const schedulerManager = {
  origin: "",
  add(scheduler: Scheduler) {
    if (!schedulerManager.origin) {
      throw new Error("Scheduler should start after server");
    }

    const { origin } = schedulerManager;
    const { id, frequency, url, method } = scheduler;

    const task = cron(frequency, () => {
      fetch(`${origin}/${url}`, { method }).catch(() => {});
    });

    tasks.set(id, task);
  },
  remove(id: string) {
    const task = tasks.get(id);

    if (task) {
      task.stop();
      tasks.delete(id);
    }
  },
  async bootstrap(origin: string) {
    schedulerManager.origin = origin;
    const schedulers = await store.schedulers.find();

    schedulers.forEach((scheduler) => {
      schedulerManager.add(scheduler);
    });
  },
};

export default schedulerManager;
