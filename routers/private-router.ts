import { HTTPMethods, Status } from "https://deno.land/x/oak@v10.2.0/mod.ts";
import { Router } from "https://deno.land/x/oak@v10.2.0/router.ts";
import * as fs from "https://deno.land/std@0.125.0/fs/mod.ts";
import { Md5 } from "https://deno.land/std@0.125.0/hash/md5.ts";
import {
  match,
  isString,
  isIn,
  required,
} from "https://deno.land/x/validasaur@v0.15.0/mod.ts";
import { validateBody } from "../utils/validate.ts";
import { resolvePath } from "../utils/path.ts";
import * as users from "../users.ts";
import isAdmin from "../middlewares/is-admin.ts";
import jwtAuthentication from "../middlewares/jwt-authentication.ts";
import config from "../config.ts";

const privateRouter = new Router({ prefix: "/api" });
privateRouter.use(jwtAuthentication());

type CreateUserBody = {
  username: string;
};

const createUserSchema = {
  username: [required, match(/^[0-9a-z]{3,36}$/)],
};

privateRouter.post("/users", isAdmin(), async (ctx) => {
  const body: CreateUserBody = await validateBody(ctx, createUserSchema);

  const password = Math.random().toString(36).slice(2);
  const passwordMd5 = new Md5()
    .update(password + config.passwordSalt)
    .toString();

  try {
    await users.add({ username: body.username, password: passwordMd5 });
  } catch (error) {
    return ctx.throw(Status.BadRequest, error.message);
  }

  ctx.response.body = {
    status: "ok",
    password,
  };
});

privateRouter.get("/users", async (ctx) => {
  ctx.response.body = {
    status: "ok",
    users: await users.list(),
  };
});

privateRouter.delete("/users/:username", isAdmin(), async (ctx) => {
  await users.remove(ctx.params["username"]);

  ctx.response.body = { status: "ok" };
});

type CreateFunctionBody = {
  method: HTTPMethods;
  url: string;
  code: string;
};

const createFunctionSchema = {
  method: [required, isIn(["GET", "POST", "PUT", "PATCH", "DELETE"])],
  url: [required, match(/^[0-9a-zA-Z-]+(\/[0-9a-zA-Z-]+)*$/)],
  code: [required, isString],
};

privateRouter.post("/functions", async (ctx) => {
  const body: CreateFunctionBody = await validateBody(
    ctx,
    createFunctionSchema
  );

  const dirPath = resolvePath(config.functionDir, body.url);
  const filePath = dirPath + "/" + body.method + ".js";

  await fs.ensureDir(dirPath);
  await Deno.writeTextFile(filePath, body.code);

  ctx.response.body = { status: "ok", method: body.method, url: body.url };
});

export default privateRouter;
