export type ExecuteOptions = {
  timeout: number;
};

export type ExecuteResult = string | number | boolean | Record<string, unknown>;

export default class Container {
  execute(code: string, context: unknown, options: ExecuteOptions) {
    return new Promise<ExecuteResult>((resolve, reject) => {
      const worker = new Worker(new URL("./worker.ts", import.meta.url).href, {
        type: "module",
      });

      const timer = setTimeout(() => {
        worker.terminate();
      }, options.timeout);

      worker.postMessage({ type: "run", data: { code, context } });

      worker.addEventListener("message", (e) => {
        const payload = (e as MessageEvent).data;

        if (payload.type === "result") {
          clearTimeout(timer);
          resolve(payload.data);
        }
      });

      worker.addEventListener("error", (e) => {
        clearTimeout(timer);
        reject(e.error);
      });
    });
  }
}
