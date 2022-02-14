import { Context, Status } from "https://deno.land/x/oak@v10.2.0/mod.ts";
import { verifyJwt } from "../utils/jwt.ts";

export default function jwtAuthentication() {
  return async (ctx: Context, next: () => Promise<unknown>) => {
    const authorization = ctx.request.headers.get("Authorization");
    if (!authorization) {
      return ctx.throw(
        Status.Unauthorized,
        "Authorization header is not present"
      );
    }

    const [, token] = authorization.match(/Bearer\s(.*)/) || [];
    if (!token) {
      return ctx.throw(Status.Unauthorized, "Invalid Authorization header");
    }

    try {
      const payload = await verifyJwt(token);
      ctx.state.username = payload.username;
    } catch {
      return ctx.throw(Status.Unauthorized, "Authorization failed");
    }

    await next();
  };
}
