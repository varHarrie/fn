import {
  Context,
  isHttpError,
  Status,
} from "https://deno.land/x/oak@v10.2.0/mod.ts";

export default function errorHandler() {
  return async (ctx: Context, next: () => Promise<unknown>) => {
    try {
      await next();
    } catch (error) {
      console.log(error);

      if (isHttpError(error)) {
        throw error;
      } else if (Error instanceof Error) {
        ctx.throw(Status.InternalServerError, error.message);
      } else {
        ctx.throw(Status.InternalServerError, "Unknown");
      }
    }
  };
}
