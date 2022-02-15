import { Context, Status } from "https://deno.land/x/oak@v10.2.0/mod.ts";

export default function isAdmin() {
  return async (ctx: Context, next: () => Promise<unknown>) => {
    if (ctx.state.username !== "admin") {
      return ctx.throw(Status.Forbidden, "No permission");
    }

    await next();
  };
}
