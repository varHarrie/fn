import { HTTPMethods } from "https://deno.land/x/oak@v10.2.0/mod.ts";
import { Router } from "https://deno.land/x/oak@v10.2.0/router.ts";
import * as fs from "https://deno.land/std@0.125.0/fs/mod.ts";
import {
  match,
  isString,
  isIn,
  required,
} from "https://deno.land/x/validasaur@v0.15.0/mod.ts";
import { validateBody } from "../utils/validate.ts";
import { resolvePath } from "../utils/path.ts";
import config from "../config.ts";

const privateRouter = new Router({ prefix: "/api" });

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

privateRouter.post("/f/", async (ctx) => {
  const body: CreateFunctionBody = await validateBody(
    ctx,
    createFunctionSchema
  );

  const dirPath = resolvePath(config.functionDir, body.url);
  const filePath = dirPath + "/" + body.method + ".js";

  await fs.ensureDir(dirPath);
  await Deno.writeTextFile(filePath, body.code);

  ctx.response.body = { status: "ok" };
});

export default privateRouter;
