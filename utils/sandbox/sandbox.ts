import { ScriptWorker, WorkerState } from "./script-worker.ts";
import { Script, ScriptOptions } from "./script.ts";

export type SandboxOptions = {
  maxWorkerCount?: number;
};

export class Sandbox {
  #queue: Script[] = [];
  #workers: ScriptWorker[] = [];
  maxWorkerCount: number;

  constructor(options: SandboxOptions = {}) {
    this.maxWorkerCount =
      options.maxWorkerCount ?? navigator.hardwareConcurrency;
  }

  #arrangeWorkers() {
    this.#workers = this.#workers.filter((w) => w.state !== WorkerState.Closed);
  }

  #getIdleWorker() {
    const idle = this.#workers.find((w) => w.state === WorkerState.Idle);
    if (idle) return idle;

    if (this.#workers.length < this.maxWorkerCount) {
      const worker = new ScriptWorker(
        new URL("./worker.ts", import.meta.url).href,
        {
          type: "module",
        }
      );

      this.#workers.push(worker);
      return worker;
    }

    return undefined;
  }

  #run() {
    this.#arrangeWorkers();

    const worker = this.#getIdleWorker();
    if (!worker) return;

    const script = this.#queue.shift();
    if (!script) return;

    worker.execute(script);
  }

  execute(options: ScriptOptions) {
    const script = new Script(options);

    this.#queue.push(script);
    this.#run();

    return script.defer;
  }
}
