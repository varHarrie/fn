import {
  Context,
  isHttpError,
  Status,
} from "https://deno.land/x/oak@v10.2.0/mod.ts";
import logger from "../utils/logger.ts";

export default function errorHandler() {
  return async (ctx: Context, next: () => Promise<unknown>) => {
    try {
      await next();
    } catch (error) {
      logger.error(error);

      if (isHttpError(error)) {
        ctx.response.status = error.status;
        ctx.response.body = { message: error.message };
      } else if (Error instanceof Error) {
        ctx.response.status = Status.InternalServerError;
        ctx.response.body = { message: error.message };
      } else {
        ctx.response.status = Status.InternalServerError;
        ctx.response.body = { message: "Unknown" };
      }
    }
  };
}
