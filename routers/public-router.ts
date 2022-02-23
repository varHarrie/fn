import { Context, Router } from "https://deno.land/x/oak@v10.2.0/mod.ts";
import { getQuery } from "https://deno.land/x/oak@v10.2.0/helpers.ts";
import { Status } from "https://deno.land/std@0.123.0/http/http_status.ts";
import { resolvePath } from "../utils/fs.ts";
import { functionCache } from "../cache.ts";
import sandbox from "../utils/sandbox-instance.ts";
import config from "../config.ts";

const publicRouter = new Router();

async function createContext(ctx: Context) {
  const headers = Object.fromEntries(ctx.request.headers);
  const query = getQuery(ctx);

  const bodyData = await ctx.request.body();
  const body =
    bodyData.type === "json" || bodyData.type === "text"
      ? bodyData.value
      : undefined;

  return {
    body,
    query,
    headers,
    ip: ctx.request.ip,
    url: ctx.request.url.pathname,
    method: ctx.request.method,
  };
}

publicRouter.all("/f/:url+", async (ctx) => {
  const url = ctx.params["url"]!;
  const method = ctx.request.method;

  const filePath = resolvePath(config.functionDir, url, method + ".js");
  let code: string;
  let result: string | number | boolean | Record<string, unknown>;

  if (functionCache.has(filePath)) {
    code = functionCache.get(filePath)!;
  } else {
    try {
      code = await Deno.readTextFile(filePath);
      functionCache.set(filePath, code);
    } catch (error) {
      return ctx.throw(
        Status.InternalServerError,
        "Function read error: " + error.message
      );
    }
  }
  const context = await createContext(ctx);

  try {
    result = await sandbox.execute({
      code,
      context,
      timeout: config.functionTimeout,
    });
  } catch (error) {
    return ctx.throw(
      Status.InternalServerError,
      "Function execute error: " + error.message
    );
  }

  ctx.response.body = result;
});

export default publicRouter;
