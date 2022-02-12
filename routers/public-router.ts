import { Router, Request } from "https://deno.land/x/oak@v10.2.0/mod.ts";
import { Status } from "https://deno.land/std@0.123.0/http/http_status.ts";
import { resolvePath } from "../utils/path.ts";
import Container from "../utils/container/index.ts";
import config from "../config.ts";

const publicRouter = new Router();

async function createContext(request: Request) {
  const headers = Object.fromEntries(request.headers);

  const bodyData = await request.body();
  const body =
    bodyData.type === "json" || bodyData.type === "text"
      ? bodyData.value
      : undefined;

  return {
    body,
    headers,
    ip: request.ip,
    url: request.url.toString(),
    method: request.method,
  };
}

publicRouter.all("/f/:url+", async (ctx) => {
  const url = ctx.params["url"]!;
  const method = ctx.request.method;

  const filePath = resolvePath(config.functionDir, url, method + ".js");
  let code: string;
  let result: Record<string, unknown>;

  try {
    code = await Deno.readTextFile(filePath);
  } catch (error) {
    return ctx.throw(
      Status.InternalServerError,
      "Function read error: " + error.message
    );
  }

  const container = new Container();
  const context = await createContext(ctx.request);

  try {
    result = (await container.execute(code, context)) as Record<
      string,
      unknown
    >;
  } catch (error) {
    return ctx.throw(
      Status.InternalServerError,
      "Function execute error: " + error.message
    );
  }

  ctx.response.body = result;
});

export default publicRouter;
