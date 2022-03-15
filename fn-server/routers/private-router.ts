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
import { validateBody, validateQuery } from "../utils/validate.ts";
import { getFile, isFileExisted, listFiles, resolvePath } from "../utils/fs.ts";
import { FunctionMethod } from "./../models.ts";
import { functionCache } from "../cache.ts";
import store from "../store.ts";
import isAdmin from "../middlewares/is-admin.ts";
import jwtAuthentication from "../middlewares/jwt-authentication.ts";
import config from "../config.ts";
import schedulerManager from "../scheduler-manager.ts";

const privateRouter = new Router({ prefix: "/api" });
privateRouter.use(jwtAuthentication());

privateRouter.get("/me", (ctx) => {
  ctx.response.body = {
    user: { username: ctx.state.username },
  };
});

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
    await store.users.insert({
      username: body.username,
      password: passwordMd5,
    });
  } catch (error) {
    return ctx.throw(Status.BadRequest, error.message);
  }

  ctx.response.body = {
    user: {
      username: body.username,
      password,
    },
  };
});

privateRouter.get("/users", async (ctx) => {
  ctx.response.body = {
    users: await store.users.find(),
  };
});

privateRouter.delete("/users/:username", isAdmin(), async (ctx) => {
  const username = ctx.params["username"];
  await store.users.remove({ username });

  ctx.response.body = {};
});

type CreateFunctionBody = {
  method: FunctionMethod;
  url: string;
  code: string;
};

const createFunctionSchema = {
  method: [required, isIn(["GET", "POST", "PUT", "PATCH", "DELETE"])],
  url: [required, match(/^[0-9a-zA-Z-]+(\/[0-9a-zA-Z-]+)*(\.(js|ts))?$/)],
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
  functionCache.set(filePath, body.code);

  ctx.response.body = {
    function: { method: body.method, url: body.url },
  };
});

const deleteFunctionSchema = {
  method: [required, isIn(["GET", "POST", "PUT", "PATCH", "DELETE"])],
  url: [required, match(/^[0-9a-zA-Z-]+(\/[0-9a-zA-Z-]+)*$/)],
};

privateRouter.delete("/functions", async (ctx) => {
  const query = await validateQuery(ctx, deleteFunctionSchema);

  const filePath = resolvePath(
    config.functionDir,
    query.url,
    query.method + ".js"
  );

  functionCache.delete(filePath);

  if (await isFileExisted(filePath)) {
    await Deno.remove(filePath);
  }

  ctx.response.body = {};
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

    ctx.response.body = { functions };
  }
});

privateRouter.get("/schedulers", async (ctx) => {
  ctx.response.body = {
    schedulers: await store.schedulers.find(),
  };
});

type CreateSchedulerBody = {
  name: string;
  frequency: string;
  method: FunctionMethod;
  url: string;
};

const createSchedulerSchema = {
  name: [required, isString],
  frequency: [required, match(/^(((\*|\d+|\d+-\d+)(\/\d+)?,?)\s?){5}$/)],
  method: [required, isIn(["GET", "POST", "PUT", "PATCH", "DELETE"])],
  url: [required, match(/^[0-9a-zA-Z-]+(\/[0-9a-zA-Z-]+)*$/)],
};

privateRouter.post("/schedulers", async (ctx) => {
  const body: CreateSchedulerBody = await validateBody(
    ctx,
    createSchedulerSchema
  );

  const scheduler = { id: crypto.randomUUID(), ...body };

  try {
    await store.schedulers.insert(scheduler);
    schedulerManager.add(scheduler);
  } catch (error) {
    return ctx.throw(Status.BadRequest, error.message);
  }

  ctx.response.body = { scheduler };
});

privateRouter.delete("/schedulers", async (ctx) => {
  const id = getQuery(ctx)["id"];

  if (id) {
    await store.schedulers.removeOne({ id });
    schedulerManager.remove(id);
  }

  ctx.response.body = {};
});

export default privateRouter;
