import { Status } from "https://deno.land/x/oak@v10.2.0/mod.ts";
import { Router } from "https://deno.land/x/oak@v10.2.0/router.ts";
import { Md5 } from "https://deno.land/std@0.125.0/hash/md5.ts";
import {
  isString,
  required,
} from "https://deno.land/x/validasaur@v0.15.0/mod.ts";
import { validateBody } from "../utils/validate.ts";
import { generateJwt } from "../utils/jwt.ts";
import * as users from "../users.ts";
import config from "../config.ts";

const authRouter = new Router({ prefix: "/api" });

type LoginBody = {
  username: string;
  password: string;
};

const loginBOdySchema = {
  username: [required, isString],
  password: [required, isString],
};

authRouter.post("/login", async (ctx) => {
  const body: LoginBody = await validateBody(ctx, loginBOdySchema);
  const password =
    body.password &&
    new Md5().update(body.password + config.passwordSalt).toString();

  const user = await users.get(body.username);

  if (!user) {
    return ctx.throw(Status.BadRequest, "User not found");
  }

  if (user.password !== password) {
    return ctx.throw(Status.BadRequest, "Password is incorrect");
  }

  const token = generateJwt({ username: body.username }, config.jwtExpires);
  ctx.response.body = { status: "ok", token };
});

export default authRouter;
