import { Context, Router } from "https://deno.land/x/oak@v10.2.0/mod.ts";
import { getQuery } from "https://deno.land/x/oak@v10.2.0/helpers.ts";
import { Status } from "https://deno.land/std@0.123.0/http/http_status.ts";
import { resolvePath } from "../utils/path.ts";
import Container from "../utils/container/index.ts";
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

  try {
    code = await Deno.readTextFile(filePath);
  } catch (error) {
    return ctx.throw(
      Status.InternalServerError,
      "Function read error: " + error.message
    );
  }

  const container = new Container();
  const context = await createContext(ctx);
  const options = { timeout: config.functionTimeout };

  try {
    result = await container.execute(code, context, options);
  } catch (error) {
    return ctx.throw(
      Status.InternalServerError,
      "Function execute error: " + error.message
    );
  }

  ctx.response.body = result;
});

export default publicRouter;
