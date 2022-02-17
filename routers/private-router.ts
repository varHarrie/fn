import { getQuery } from "https://deno.land/x/oak@v10.2.0/helpers.ts";
import { Router, Status } from "https://deno.land/x/oak@v10.2.0/mod.ts";
import { ensureDir } from "https://deno.land/std@0.125.0/fs/mod.ts";
import {
  dirname,
  basename,
  relative,
} from "https://deno.land/std@0.125.0/path/mod.ts";
import { Md5 } from "https://deno.land/std@0.125.0/hash/md5.ts";
import {
  match,
  isString,
  isIn,
  required,
} from "https://deno.land/x/validasaur@v0.15.0/mod.ts";
import { validateBody } from "../utils/validate.ts";
import { getFile, isFileExisted, listFiles, resolvePath } from "../utils/fs.ts";
import { FunctionMethod } from "./../models.ts";
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
  method: FunctionMethod;
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

  await ensureDir(dirPath);
  await Deno.writeTextFile(filePath, body.code);

  ctx.response.body = { status: "ok", method: body.method, url: body.url };
});

type DeleteFunctionBody = {
  method: FunctionMethod;
  url: string;
};

const deleteFunctionSchema = {
  method: [required, isIn(["GET", "POST", "PUT", "PATCH", "DELETE"])],
  url: [required, match(/^[0-9a-zA-Z-]+(\/[0-9a-zA-Z-]+)*$/)],
};

privateRouter.delete("/functions", async (ctx) => {
  const body: DeleteFunctionBody = await validateBody(
    ctx,
    deleteFunctionSchema
  );

  const filePath = resolvePath(
    config.functionDir,
    body.url,
    body.method + ".js"
  );

  if (await isFileExisted(filePath)) {
    await Deno.remove(filePath);
  }

  ctx.response.body = { status: "ok", method: body.method, url: body.url };
});

privateRouter.get("/functions", async (ctx) => {
  const { method, url } = getQuery(ctx);

  if (method !== undefined && url !== undefined) {
    const filePath = resolvePath(config.functionDir, url, method + ".js");
    const existed = await isFileExisted(filePath);

    if (!existed) {
      return ctx.throw(Status.NotFound, "Function not found");
    }

    const [file, code] = await Promise.all([
      getFile(filePath),
      Deno.readTextFile(filePath),
    ]);

    ctx.response.body = {
      status: "ok",
      function: {
        method,
        url,
        code,
        createdAt: file?.createdAt,
        modifiedAt: file?.modifiedAt,
        size: file?.size,
      },
    };
  } else {
    const files = await listFiles(resolvePath(config.functionDir), (filePath) =>
      /\/(GET|POST|PUT|PATCH|DELETE).js$/.test(filePath)
    );

    const functions = files.map((file) => {
      return {
        method: basename(file.path).replace(/.js$/, ""),
        url: dirname(relative(config.functionDir, file.path)),
        createdAt: file.createdAt,
        modifiedAt: file.modifiedAt,
        size: file.size,
      };
    });

    ctx.response.body = { status: "ok", functions };
  }
});

export default privateRouter;
