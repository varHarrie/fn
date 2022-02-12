export default class Container {
  execute(code: string, context: unknown) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL("./worker.ts", import.meta.url).href, {
        type: "module",
      });

      worker.postMessage({ type: "run", data: { code, context } });

      worker.addEventListener("message", (e) => {
        const payload = (e as MessageEvent).data;
        if (payload.type === "result") resolve(payload.data);
      });

      worker.addEventListener("error", (e) => {
        reject(e.error);
      });
    });
  }
}
