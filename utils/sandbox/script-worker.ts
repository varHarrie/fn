import { Script, ScriptResult } from "./script.ts";

export enum WorkerState {
  Idle = 0,
  Busy = 1,
  Closed = 2,
}

export class ScriptWorker {
  state: WorkerState;
  #worker: Worker;
  #runningScript: Script | undefined;

  constructor(specifier: string | URL, options?: WorkerOptions) {
    this.state = WorkerState.Idle;
    this.#worker = new Worker(specifier, options);

    this.#worker.addEventListener("message", (e) => {
      const payload = (e as MessageEvent).data;

      if (payload.type === "result") {
        this.#handleResolve(payload.data);
      }
    });

    this.#worker.addEventListener("error", (e) => {
      this.#handleReject(e.error);
    });
  }

  #handleResolve(value: ScriptResult) {
    if (this.#runningScript) {
      this.#runningScript.stop();
      this.#runningScript.resolve(value);
      this.#runningScript = undefined;
      this.state = WorkerState.Idle;
    }
  }

  #handleReject(reason: Error) {
    if (this.#runningScript) {
      this.#runningScript.stop();
      this.#runningScript.reject(reason);
      this.#runningScript = undefined;
      this.state = WorkerState.Idle;
    }
  }

  execute(script: Script) {
    this.state = WorkerState.Busy;
    this.#runningScript = script;

    script.start(() => {
      this.#handleReject(new Error("Script execution timed out."));
      this.#worker.terminate();
      this.state = WorkerState.Closed;
    });

    this.#worker.postMessage({
      type: "run",
      data: { code: script.code, context: script.context },
    });
  }
}
