import { Application } from "https://deno.land/x/oak@v10.2.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import requestLogger from "./middlewares/request-logger.ts";
import errorHandler from "./middlewares/error-handler.ts";
import authRouter from "./routers/auth-router.ts";
import privateRouter from "./routers/private-router.ts";
import publicRouter from "./routers/public-router.ts";
import schedulerManager from "./scheduler-manager.ts";
import config from "./config.ts";
import store from "./store.ts";
import logger from "./utils/logger.ts";

const STATIC_DIR = `${Deno.cwd()}/static`;
const app = new Application();

app.use(requestLogger());
app.use(errorHandler());
app.use(oakCors());

app.use(authRouter.routes());
app.use(authRouter.allowedMethods());

app.use(privateRouter.routes());
app.use(privateRouter.allowedMethods());

app.use(publicRouter.routes());
app.use(publicRouter.allowedMethods());

app.use(async (ctx, next) => {
  try {
    if (ctx.request.url.pathname.includes(".")) {
      await ctx.send({ root: STATIC_DIR });
    } else {
      await ctx.send({ root: STATIC_DIR, path: "index.html" });
    }
  } catch {
    await next();
  }
});

app.addEventListener("listen", ({ hostname, port, secure }) => {
  const origin = `${secure ? "https" : "http"}://${hostname}:${port}`;

  schedulerManager.bootstrap(origin);
  logger.info(`⚡Running at ${origin}`);
});

await store.load();

await app.listen(`${config.host}:${config.port}`);
