/// <reference no-default-lib="true" />
/// <reference lib="deno.worker" />

async function run(code: string, context: unknown) {
  const module = await import(
    `data:application/javascript,${encodeURIComponent(code)}`
  );

  if (!module.default) throw new Error("Missing default export");
  if (typeof module.default !== "function")
    throw new Error("Default export must be a function");

  return module.default(context);
}

self.addEventListener("message", async (e) => {
  const payload = (e as MessageEvent).data;

  if (payload.type === "run") {
    const { code, context } = payload.data;
    const data = await run(code, context);
    self.postMessage({ type: "result", data });
  }
});
