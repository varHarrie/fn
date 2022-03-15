import { Context, HTTPMethods } from "https://deno.land/x/oak@v10.2.0/mod.ts";
import * as colors from "https://deno.land/std@0.125.0/fmt/colors.ts";
import { format } from "https://deno.land/std@0.125.0/datetime/mod.ts";

function getStatusColor(status: number) {
  if (status >= 500) return colors.red;
  if (status >= 300) return colors.yellow;
  return colors.blue;
}

const methodColors: Record<HTTPMethods, (text: string) => string> = {
  HEAD: colors.white,
  OPTIONS: colors.white,
  GET: colors.green,
  PUT: colors.magenta,
  PATCH: colors.yellow,
  POST: colors.blue,
  DELETE: colors.red,
};

export default function requestLogger() {
  return async (ctx: Context, next: () => Promise<unknown>) => {
    const start = performance.now();
    await next();
    const ms = performance.now() - start;

    const { status } = ctx.response;
    const { method, url } = ctx.request;

    console.log(
      [
        format(new Date(), "[yyyy-MM-dd HH:mm:ss]"),
        getStatusColor(ctx.response.status)(status.toString()),
        colors.gray(ms + "ms"),
        colors.bold(methodColors[method](method)),
        url,
      ].join(" ")
    );
  };
}
